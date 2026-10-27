import React, { useState } from 'react';
import { Pin, Edit3, Trash2, Copy, Check, Lock, Unlock } from 'lucide-react';
import { Note, NOTE_COLORS, ViewMode } from '../types/note';
import { formatDate, getFirstLine } from '../utils/banglaUtils';

interface NoteCardProps {
  note: Note;
  viewMode: ViewMode;
  isSelected?: boolean;
  isUnlocked?: boolean;
  onSelect?: (id: string) => void;
  onView: (note: Note) => void;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  onTogglePin: (id: string) => void;
  onToggleLockNote?: (note: Note) => void;
  onUnlockRequest: (note: Note, action?: 'view' | 'edit') => void;
  onRelockNote?: (id: string) => void;
  onShowToast: (msg: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  viewMode,
  isSelected = false,
  isUnlocked = false,
  onSelect,
  onView,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleLockNote,
  onUnlockRequest,
  onRelockNote,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);
  const colorConfig = NOTE_COLORS.find((c) => c.id === note.color) || NOTE_COLORS[0];
  const firstLine = getFirstLine(note.content);

  const isLockedActive = Boolean(note.isLocked && !isUnlocked);

  const handleCardClick = () => {
    if (isLockedActive) {
      onUnlockRequest(note, 'view');
    } else {
      onView(note);
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLockedActive) {
      onUnlockRequest(note, 'view');
      return;
    }
    const fullText = `${note.title}\n\n${note.content}`;
    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      onShowToast('Note copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTogglePin(note.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLockedActive) {
      onUnlockRequest(note, 'edit');
    } else {
      onEdit(note);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(note);
  };

  const handleLockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!note.isLocked) {
      // Not locked -> lock it with password
      if (onToggleLockNote) {
        onToggleLockNote(note);
      }
    } else if (isLockedActive) {
      // Locked and active -> prompt password dialog
      onUnlockRequest(note, 'view');
    } else {
      // Unlocked in current session -> re-lock it immediately
      if (onRelockNote) {
        onRelockNote(note.id);
        onShowToast('Note locked');
      }
    }
  };

  // ==================== List View (Ultra compact row) ====================
  // Format requested: [checkbox] [dot] [title]   [datetime] [pin] [copy] [edit] [remove] [lock]
  if (viewMode === 'list') {
    return (
      <div
        onClick={handleCardClick}
        className={`group relative flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg border transition-all cursor-pointer hover:shadow-xs ${
          isLockedActive
            ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/10'
            : isSelected
            ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/20 ring-1 ring-[var(--accent-gold)]'
            : 'border-[var(--border)] hover:border-[var(--accent-gold)]'
        }`}
      >
        {/* Left Side: Checkbox, Color dot, Title & preview */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {onSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  onSelect(note.id);
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-3.5 h-3.5 rounded text-[var(--accent-gold)] focus:ring-[var(--accent-gold)]/20 cursor-pointer shrink-0"
              />
          )}

          <div
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              isLockedActive ? 'bg-[var(--accent-gold)]' : colorConfig.dotClass
            }`}
          />

          {/* Title / Locked state */}
          {isLockedActive ? (
            <div className="flex items-center gap-1 min-w-0">
              <Lock className="w-3 h-3 text-[var(--accent-gold)] shrink-0" />
              <span className="text-[11px] sm:text-xs font-bold text-[var(--accent-gold)]">
                Locked
              </span>
            </div>
          ) : (
            <div className="flex items-baseline gap-1.5 min-w-0 overflow-hidden">
              <h3 className="text-[11px] sm:text-xs font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-gold)] transition-colors shrink-0 max-w-[100px] sm:max-w-[200px]">
                {note.title}
              </h3>

              {/* 1st Line preview only */}
              {firstLine && (
                <span className="text-[10px] text-[var(--text-primary)]/50 truncate hidden md:inline-block flex-1 min-w-0">
                  {firstLine}
                </span>
              )}
            </div>
          )}

          {note.isPinned && (
            <Pin className="w-2.5 h-2.5 text-[var(--accent-gold)] fill-[var(--accent-gold)] shrink-0" />
          )}
        </div>

        {/* Right side: category, datetime, pin, copy, edit, remove, lock */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Category tag */}
          <span className="font-bold text-[9px] text-[var(--accent-gold)] uppercase tracking-tight bg-[var(--border)] px-1 py-0.5 rounded max-w-[60px] truncate">
            {note.category || 'General'}
          </span>

          {/* Datetime (oct-26 format) */}
          <span className="font-mono tabular-nums text-[9px] font-medium text-[var(--text-primary)]/40 shrink-0">
            {formatDate(note.createdAt)}
          </span>

          {/* Action buttons in exact requested order: pin, copy, edit, remove, lock */}
          <div className="flex items-center gap-0.5 shrink-0">
            {/* 1. PIN */}
            <button
              type="button"
              onClick={handlePin}
              title={note.isPinned ? 'Unpin' : 'Pin'}
              className="p-1 text-[var(--text-primary)]/50 hover:text-[var(--accent-gold)] transition-colors cursor-pointer"
            >
              <Pin className={`w-3 h-3 ${note.isPinned ? 'text-[var(--accent-gold)] fill-[var(--accent-gold)]' : ''}`} />
            </button>

            {/* 2. COPY */}
            <button
              type="button"
              onClick={handleCopy}
              title="Copy"
              className="p-1 text-[var(--text-primary)]/50 hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              {copied ? (
                <Check className="w-3 h-3 text-emerald-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>

            {/* 3. EDIT */}
            <button
              type="button"
              onClick={handleEdit}
              title="Edit"
              className="p-1 text-[var(--text-primary)]/50 hover:text-[var(--accent-gold)] transition-colors cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
            </button>

            {/* 4. REMOVE (Trash) */}
            <button
              type="button"
              onClick={handleDelete}
              title="Remove"
              className="p-1 text-[var(--text-primary)]/50 hover:text-rose-500 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
            </button>

            {/* 5. LOCK */}
            <button
              type="button"
              onClick={handleLockClick}
              title={
                !note.isLocked
                  ? 'Lock'
                  : isLockedActive
                  ? 'Unlock'
                  : 'Re-lock'
              }
              className={`p-1 transition-colors cursor-pointer ${
                note.isLocked
                  ? 'text-[var(--accent-gold)] hover:text-[var(--accent-gold)]/80'
                  : 'text-[var(--text-primary)]/50 hover:text-[var(--accent-gold)]'
              }`}
            >
              {note.isLocked && !isLockedActive ? (
                <Unlock className="w-3 h-3" />
              ) : (
                <Lock className={`w-3 h-3 ${note.isLocked ? 'fill-[var(--accent-gold)]/20' : ''}`} />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== Grid View: Ultra Compact card ====================
  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex flex-col justify-between p-2.5 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
        isLockedActive
          ? 'border-[var(--border)] bg-[var(--bg-card)]'
          : isSelected
          ? 'border-[var(--accent-gold)] bg-[var(--bg-card)] ring-1 ring-[var(--accent-gold)]'
          : 'border-[var(--border)] hover:border-[var(--accent-gold)] bg-[var(--bg-card)]'
      }`}
    >
      <div>
        {/* Top Header Row: EVERYTHING TOGETHER AS REQUESTED (Category, Date, Actions) */}
        <div className="flex items-center justify-between gap-1 mb-2">
          <div className="flex items-center gap-1 min-w-0 flex-1">
            {onSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  onSelect(note.id);
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-3 h-3 rounded text-[#C5A059] focus:ring-[#C5A059]/20 cursor-pointer shrink-0"
              />
            )}
            <div
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                isLockedActive ? 'bg-[#C5A059]' : colorConfig.dotClass
              }`}
            />
            <span className="text-[9px] font-black text-[#8DA89B] uppercase tracking-tighter truncate max-w-[40px]">
              {note.category || 'Uncat'}
            </span>
            <span className="font-mono tabular-nums text-[8px] text-[#8DA89B]/50 shrink-0">
              {formatDate(note.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <button type="button" onClick={handlePin} className="p-0.5 text-[#8DA89B] hover:text-[#C5A059] transition-colors">
              <Pin className={`w-2.5 h-2.5 ${note.isPinned ? 'text-[#C5A059] fill-[#C5A059]' : ''}`} />
            </button>
            <button type="button" onClick={handleCopy} className="p-0.5 text-[#8DA89B] hover:text-[#E0D6C5] transition-colors">
              {copied ? <Check className="w-2.5 h-2.5 text-[#C5A059]" /> : <Copy className="w-2.5 h-2.5" />}
            </button>
            <button type="button" onClick={handleEdit} className="p-0.5 text-[#8DA89B] hover:text-[#C5A059] transition-colors">
              <Edit3 className="w-2.5 h-2.5" />
            </button>
            <button type="button" onClick={handleDelete} className="p-0.5 text-[#8DA89B] hover:text-rose-600 transition-colors">
              <Trash2 className="w-2.5 h-2.5" />
            </button>
            <button type="button" onClick={handleLockClick} className="p-0.5 text-[#8DA89B] hover:text-[#C5A059] transition-colors">
              {note.isLocked && !isLockedActive ? <Unlock className="w-2.5 h-2.5" /> : <Lock className={`w-2.5 h-2.5 ${note.isLocked ? 'fill-[#C5A059]/20' : ''}`} />}
            </button>
          </div>
        </div>

        {/* Title & 1st Line content */}
        {isLockedActive ? (
          <div className="py-1 flex flex-col items-center justify-center text-center">
            <Lock className="w-3.5 h-3.5 text-[#C5A059] mb-1" />
            <h3 className="font-bold text-[#E0D6C5] text-[11px]">Locked</h3>
          </div>
        ) : (
          <div className="min-w-0">
            <h3 className="font-bold text-[#E0D6C5] text-xs mb-0.5 truncate group-hover:text-[#C5A059] transition-colors">
              {note.title}
            </h3>
            <p className="text-[10px] text-[#8DA89B] truncate font-normal">
              {firstLine || 'No content'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
