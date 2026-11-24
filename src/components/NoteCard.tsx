import React, { useState, useRef } from 'react';
import { Edit3, Trash2, Copy, Check } from 'lucide-react';
import { Note, NOTE_COLORS, ViewMode } from '../types/note';
import { formatDate, getFirstLine } from '../utils/banglaUtils';

interface NoteCardProps {
  note: Note;
  viewMode: ViewMode;
  isSelected?: boolean;
  isSelectionActive?: boolean;
  onSelect?: (id: string) => void;
  onLongPress?: (id: string) => void;
  onView: (note: Note) => void;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  onShowToast: (msg: string) => void;
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
  const displayTitle = note.title && note.title.trim() ? note.title.trim() : 'Unknown Title';
  const displayCategory = note.category && note.category.trim() ? note.category.trim() : 'General';
  const displayDateTime = formatDate(note.createdAt || note.rawDate || note.updatedAt, true);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);

  const startPressTimer = (e: React.PointerEvent) => {
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
    if (isSelectionActive && onSelect) {
      onSelect(note.id);
      return;
    }
    onView(note);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const fullText = note.title && note.title.trim() ? `${note.title}\n\n${note.content}` : note.content;
    navigator.clipboard
      .writeText(fullText)
      .then(() => {
        setCopied(true);
        onShowToast('Note copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
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
        className={`group relative flex flex-col gap-1.5 px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer select-none ${
          isSelected
            ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/15 ring-1 ring-[var(--accent-gold)]'
            : 'border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent-gold)]/60'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
            {onSelect && (isSelectionActive || isSelected) && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  onSelect(note.id);
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-4 h-4 rounded cursor-pointer shrink-0 accent-[var(--accent-gold)]"
              />
            )}

            <div className={`w-2 h-2 rounded-full shrink-0 ${colorConfig.dotClass}`} />

            <span className="font-bold text-[10px] text-[var(--accent-gold)] uppercase tracking-wider bg-[var(--bg-elevated)] px-2 py-0.5 rounded border border-[var(--border)] break-words">
              {displayCategory}
            </span>

            <span className="font-mono tabular-nums text-[10px] font-medium text-[var(--text-muted)] shrink-0">
              {displayDateTime}
            </span>
          </div>

          {/* ONLY 3 BUTTONS: Copy, Edit, Remove */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleCopy}
              title="Copy"
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-lg transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={handleEdit}
              title="Edit"
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent-gold)] hover:bg-[var(--bg-elevated)] rounded-lg transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleDelete}
              title="Remove"
              className="p-1.5 text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-baseline gap-2 min-w-0">
          <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-gold)] transition-colors">
            {displayTitle}
          </h3>
          {firstLine && (
            <span className="text-[11px] text-[var(--text-muted)] truncate hidden sm:inline-block flex-1 min-w-0 font-normal">
              {firstLine}
            </span>
          )}
        </div>
      </div>
    );
  }

  // ==================== Grid View ====================
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
      className={`group relative flex flex-col justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none hover:shadow-md ${
        isSelected
          ? 'border-[var(--accent-gold)] bg-[var(--bg-card)] ring-1 ring-[var(--accent-gold)] shadow-md'
          : 'border-[var(--border)] hover:border-[var(--accent-gold)]/60 bg-[var(--bg-card)]'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0 flex-1">
            {onSelect && (isSelectionActive || isSelected) && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  onSelect(note.id);
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-3.5 h-3.5 rounded cursor-pointer shrink-0 accent-[var(--accent-gold)]"
              />
            )}
            <div className={`w-2 h-2 rounded-full shrink-0 ${colorConfig.dotClass}`} />
            <span className="text-[10px] font-bold text-[var(--accent-gold)] uppercase tracking-wider bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded border border-[var(--border)] break-words">
              {displayCategory}
            </span>
            <span className="font-mono tabular-nums text-[10px] text-[var(--text-muted)] shrink-0">
              {displayDateTime}
            </span>
          </div>

          {/* ONLY 3 BUTTONS: Copy, Edit, Remove */}
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={handleCopy}
              title="Copy"
              className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-md transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={handleEdit}
              title="Edit"
              className="p-1 text-[var(--text-muted)] hover:text-[var(--accent-gold)] hover:bg-[var(--bg-elevated)] rounded-md transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleDelete}
              title="Remove"
              className="p-1 text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="font-bold text-[var(--text-primary)] text-sm mb-1 truncate group-hover:text-[var(--accent-gold)] transition-colors">
            {displayTitle}
          </h3>
          <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed font-normal">
            {firstLine || 'No content'}
          </p>
        </div>
      </div>
    </div>
  );
};
