import React, { useState, useRef } from 'react';
import { Edit3, Trash2, Copy, Check } from 'lucide-react';
import { Note, NOTE_COLORS, ViewMode } from '../types/note';
import { formatDate, getFirstLine } from '../utils/banglaUtils';

interface NoteCardProps {
  note: Note;
  viewMode: ViewMode;
  isSelected?: boolean;
  isUnlocked?: boolean;
  isSelectionActive?: boolean;
  onSelect?: (id: string) => void;
  onLongPress?: (id: string) => void;
  onView: (note: Note) => void;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  onShowToast: (msg: string) => void;
  // Optional legacy props kept for type compatibility
  onTogglePin?: (id: string) => void;
  onToggleLockNote?: (note: Note) => void;
  onUnlockRequest?: (note: Note, action?: 'view' | 'edit') => void;
  onRelockNote?: (id: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  viewMode,
  isSelected = false,
  isSelectionActive = false,
  onSelect,
  onLongPress,
  onView,
  onEdit,
  onDelete,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);
  const colorConfig = NOTE_COLORS.find((c) => c.id === note.color) || NOTE_COLORS[0];
  const firstLine = getFirstLine(note.content);

  const timerRef = useRef<any>(null);
  const isLongPressRef = useRef(false);

  const startPressTimer = (e: React.PointerEvent) => {
    // If click originated from button or checkbox, don't trigger long press
    if ((e.target as HTMLElement).closest('button, input')) return;
    isLongPressRef.current = false;
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      if (onLongPress) {
        onLongPress(note.id);
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(40);
        }
      } else if (onSelect) {
        onSelect(note.id);
      }
    }, 450);
  };

  const cancelPressTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleCardClick = () => {
    if (isLongPressRef.current) {
      isLongPressRef.current = false;
      return;
    }
    // In multi-selection mode, tapping any note toggles its selection
    if (isSelectionActive && onSelect) {
      onSelect(note.id);
      return;
    }
    onView(note);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const fullText = note.title ? `${note.title}\n\n${note.content}` : note.content;
    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      onShowToast('Note copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      onShowToast('Could not copy note');
    });
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(note);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(note);
  };

  // ==================== List View ====================
  // Buttons ONLY: Copy, Edit, Remove
  if (viewMode === 'list') {
    return (
      <div
        onPointerDown={startPressTimer}
        onPointerUp={cancelPressTimer}
        onPointerCancel={cancelPressTimer}
        onPointerLeave={cancelPressTimer}
        onContextMenu={(e) => {
          e.preventDefault();
          if (onLongPress) onLongPress(note.id);
          else if (onSelect) onSelect(note.id);
        }}
        onClick={handleCardClick}
        className={`group relative flex items-center justify-between gap-2 px-3 py-2 rounded-xl border transition-all cursor-pointer select-none ${
          isSelected
            ? 'border-[#D4AF37] bg-[#D4AF37]/15 ring-1 ring-[#D4AF37]'
            : 'border-[#2D4A3D] bg-[#162920] hover:border-[#D4AF37]/60'
        }`}
      >
        {/* Left Side: Checkbox (visible when selection active or selected), Color dot, Title & preview */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {onSelect && (isSelectionActive || isSelected) && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onSelect(note.id);
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 rounded text-[#D4AF37] focus:ring-[#D4AF37]/20 cursor-pointer shrink-0 accent-[#D4AF37]"
            />
          )}

          <div className={`w-2 h-2 rounded-full shrink-0 ${colorConfig.dotClass}`} />

          <div className="flex items-baseline gap-2 min-w-0 overflow-hidden">
            <h3 className="text-xs sm:text-sm font-bold text-[#F0F7F4] truncate group-hover:text-[#D4AF37] transition-colors shrink-0 max-w-[120px] sm:max-w-[220px]">
              {note.title || 'Untitled Note'}
            </h3>

            {firstLine && (
              <span className="text-[11px] text-[#8DA89B] truncate hidden md:inline-block flex-1 min-w-0 font-normal">
                {firstLine}
              </span>
            )}
          </div>
        </div>

        {/* Right side: Category, Datetime, and EXACTLY 3 ACTIONS: Copy, Edit, Remove */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="font-bold text-[9.5px] text-[#D4AF37] uppercase tracking-wider bg-[#14241D] px-1.5 py-0.5 rounded border border-[#2D4A3D] max-w-[75px] truncate">
            {note.category || 'General'}
          </span>

          <span className="font-mono tabular-nums text-[10px] font-medium text-[#8DA89B] shrink-0 hidden sm:inline">
            {formatDate(note.updatedAt || note.createdAt || note.rawDate)}
          </span>

          {/* EXACTLY 3 BUTTONS: Copy, Edit, Remove */}
          <div className="flex items-center gap-1 shrink-0">
            {/* 1. Copy */}
            <button
              type="button"
              onClick={handleCopy}
              title="Copy"
              className="p-1.5 text-[#8DA89B] hover:text-[#F0F7F4] hover:bg-[#244234] rounded-lg transition-colors cursor-pointer"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>

            {/* 2. Edit */}
            <button
              type="button"
              onClick={handleEdit}
              title="Edit"
              className="p-1.5 text-[#8DA89B] hover:text-[#D4AF37] hover:bg-[#244234] rounded-lg transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            {/* 3. Remove */}
            <button
              type="button"
              onClick={handleDelete}
              title="Remove"
              className="p-1.5 text-[#8DA89B] hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== Grid View ====================
  // Buttons ONLY: Copy, Edit, Remove
  return (
    <div
      onPointerDown={startPressTimer}
      onPointerUp={cancelPressTimer}
      onPointerCancel={cancelPressTimer}
      onPointerLeave={cancelPressTimer}
      onContextMenu={(e) => {
        e.preventDefault();
        if (onLongPress) onLongPress(note.id);
        else if (onSelect) onSelect(note.id);
      }}
      onClick={handleCardClick}
      className={`group relative flex flex-col justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none hover:shadow-lg ${
        isSelected
          ? 'border-[#D4AF37] bg-[#162920] ring-1 ring-[#D4AF37] shadow-md'
          : 'border-[#2D4A3D] hover:border-[#D4AF37]/60 bg-[#162920]'
      }`}
    >
      <div>
        {/* Top Header Row: Category, Date, Actions (Copy, Edit, Remove) */}
        <div className="flex items-center justify-between gap-1 mb-2.5">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {onSelect && (isSelectionActive || isSelected) && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  onSelect(note.id);
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-3.5 h-3.5 rounded text-[#D4AF37] focus:ring-[#D4AF37]/20 cursor-pointer shrink-0 accent-[#D4AF37]"
              />
            )}
            <div className={`w-2 h-2 rounded-full shrink-0 ${colorConfig.dotClass}`} />
            <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider truncate max-w-[70px]">
              {note.category || 'General'}
            </span>
            <span className="font-mono tabular-nums text-[9.5px] text-[#8DA89B] shrink-0">
              {formatDate(note.updatedAt || note.createdAt || note.rawDate)}
            </span>
          </div>

          {/* EXACTLY 3 BUTTONS: Copy, Edit, Remove */}
          <div className="flex items-center gap-0.5 shrink-0">
            {/* 1. Copy */}
            <button
              type="button"
              onClick={handleCopy}
              title="Copy"
              className="p-1 text-[#8DA89B] hover:text-[#F0F7F4] hover:bg-[#244234] rounded-md transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {/* 2. Edit */}
            <button
              type="button"
              onClick={handleEdit}
              title="Edit"
              className="p-1 text-[#8DA89B] hover:text-[#D4AF37] hover:bg-[#244234] rounded-md transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            {/* 3. Remove */}
            <button
              type="button"
              onClick={handleDelete}
              title="Remove"
              className="p-1 text-[#8DA89B] hover:text-rose-400 hover:bg-rose-950/40 rounded-md transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Note Title & Content preview */}
        <div className="min-w-0">
          <h3 className="font-bold text-[#F0F7F4] text-sm mb-1 truncate group-hover:text-[#D4AF37] transition-colors">
            {note.title || 'Untitled Note'}
          </h3>
          <p className="text-xs text-[#8DA89B] line-clamp-2 leading-relaxed font-normal">
            {firstLine || 'No content'}
          </p>
        </div>
      </div>
    </div>
  );
};
