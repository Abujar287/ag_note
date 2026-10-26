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
        className={`group relative flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border bg-white transition-all cursor-pointer hover:shadow-xs ${
          isLockedActive
            ? 'border-amber-400 bg-amber-50/20'
            : isSelected
            ? 'border-black bg-black/5 ring-1 ring-black'
            : 'border-black/10 hover:border-black/30'
        }`}
      >
        {/* Left Side: Checkbox, Color dot, Title & preview */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {onSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  onSelect(note.id);
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500/20 cursor-pointer shrink-0"
              />
          )}

          <div
            className={`w-2 h-2 rounded-full shrink-0 ${
              isLockedActive ? 'bg-amber-500' : colorConfig.dotClass
            }`}
          />

          {/* Title / Locked state */}
          {isLockedActive ? (
            <div className="flex items-center gap-1.5 min-w-0">
              <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-400">
                Locked
              </span>
              <span className="text-xs text-slate-400 font-mono hidden lg:inline-block">
                — Enter password to view
              </span>
            </div>
          ) : (
            <>
              <h3 className="text-xs sm:text-sm font-bold text-black truncate group-hover:text-blue-600 transition-colors min-w-0 max-w-[130px] sm:max-w-[240px]">
                {note.title}
              </h3>

              {/* 1st Line preview only */}
              {firstLine && (
                <span className="text-xs text-black/60 truncate hidden lg:inline-block flex-1 min-w-0">
                  — {firstLine}
                </span>
              )}
            </>
          )}

          {note.isPinned && (
            <Pin className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
          )}
        </div>

        {/* Right side: datetime pin , copy, edit, remove, lock */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Optional Category tag if not Uncategorized */}
          {note.category && note.category !== 'Uncategorized' && (
            <span className="font-bold text-[10px] text-black/60 uppercase tracking-widest hidden xl:inline bg-black/5 px-2 py-0.5 rounded">
              {note.category}
            </span>
          )}

          {/* Datetime */}
          <span className="font-mono tabular-nums text-[10px] font-bold text-black/40 shrink-0">
            {formatDate(note.createdAt)}
          </span>

          {/* Action buttons in exact requested order: pin, copy, edit, remove, lock */}
          <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
            {/* 1. PIN */}
            <button
              type="button"
              onClick={handlePin}
              title={note.isPinned ? 'Unpin note' : 'Pin note'}
              className="p-1 text-black/30 hover:text-amber-500 rounded-md hover:bg-black/5 transition-colors cursor-pointer"
            >
              <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'text-amber-500 fill-amber-500' : ''}`} />
            </button>

            {/* 2. COPY */}
            <button
              type="button"
              onClick={handleCopy}
              title="Copy note"
              className="p-1 text-black/30 hover:text-black rounded-md hover:bg-black/5 transition-colors cursor-pointer"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>

            {/* 3. EDIT */}
            <button
              type="button"
              onClick={handleEdit}
              title="Edit note"
              className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            {/* 4. REMOVE (Trash) */}
            <button
              type="button"
              onClick={handleDelete}
              title="Remove note"
              className="p-1 text-black/30 hover:text-rose-600 rounded-md hover:bg-black/5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* 5. LOCK */}
            <button
              type="button"
              onClick={handleLockClick}
              title={
                !note.isLocked
                  ? 'Lock this note'
                  : isLockedActive
                  ? 'Unlock note'
                  : 'Re-lock note'
              }
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                note.isLocked
                  ? 'text-amber-500 hover:text-amber-600 hover:bg-black/5'
                  : 'text-black/30 hover:text-amber-500 hover:bg-black/5'
              }`}
            >
              {note.isLocked && !isLockedActive ? (
                <Unlock className="w-3.5 h-3.5" />
              ) : (
                <Lock className={`w-3.5 h-3.5 ${note.isLocked ? 'fill-amber-500/20' : ''}`} />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== Grid View: Compact card ====================
  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex flex-col justify-between p-3.5 rounded-xl border bg-white transition-all cursor-pointer hover:shadow-md ${
        isLockedActive
          ? 'border-amber-400 bg-amber-50/15'
          : isSelected
          ? 'border-black bg-black/5 ring-1 ring-black'
          : 'border-black/10 hover:border-black/30'
      }`}
    >
      <div>
        {/* Top meta row: Checkbox, Color dot, Category, Badges */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            {onSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  onSelect(note.id);
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500/20 cursor-pointer"
              />
            )}
            <div
              className={`w-2 h-2 rounded-full shrink-0 ${
                isLockedActive ? 'bg-amber-500' : colorConfig.dotClass
              }`}
            />
            <span className="text-[10px] font-black text-black/60 uppercase tracking-widest truncate">
              {note.category || 'Uncategorized'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {note.isPinned && (
              <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            )}
            {note.isLocked && (
              <Lock
                className={`w-3.5 h-3.5 ${
                  isLockedActive ? 'text-amber-500' : 'text-black/30'
                }`}
              />
            )}
          </div>
        </div>

        {/* Title & 1st Line content */}
        {isLockedActive ? (
          <div className="py-2.5 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1.5 shadow-2xs">
              <Lock className="w-4 h-4 stroke-[2.2]" />
            </div>
            <h3 className="font-bold text-amber-700 dark:text-amber-400 text-sm mb-0.5">
              Locked
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
              ••••••••••••••••
            </p>
          </div>
        ) : (
          <>
            <h3 className="font-bold text-black text-sm mb-1 truncate group-hover:text-blue-600 transition-colors">
              {note.title}
            </h3>

            {/* Content: ONLY 1st line of the note */}
            <p className="text-xs text-black/60 truncate leading-snug mb-2 font-normal">
              {firstLine || 'No content'}
            </p>
          </>
        )}
      </div>

      {/* Footer: datetime, pin, copy, edit, remove, lock */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
        <span className="font-mono tabular-nums">{formatDate(note.createdAt)}</span>

        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          {/* 1. PIN */}
          <button
            type="button"
            onClick={handlePin}
            title={note.isPinned ? 'Unpin note' : 'Pin note'}
            className="p-1 text-slate-400 hover:text-amber-500 rounded transition-colors cursor-pointer"
          >
            <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'text-amber-500 fill-amber-500' : ''}`} />
          </button>

          {/* 2. COPY */}
          <button
            type="button"
            onClick={handleCopy}
            title="Copy note"
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors cursor-pointer"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          {/* 3. EDIT */}
          <button
            type="button"
            onClick={handleEdit}
            title="Edit note"
            className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          {/* 4. REMOVE (Trash) */}
          <button
            type="button"
            onClick={handleDelete}
            title="Remove note"
            className="p-1 text-black/30 hover:text-rose-600 rounded transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* 5. LOCK */}
          <button
            type="button"
            onClick={handleLockClick}
            title={
              !note.isLocked
                ? 'Lock this note'
                : isLockedActive
                ? 'Unlock note'
                : 'Re-lock note'
            }
            className={`p-1 rounded transition-colors cursor-pointer ${
              note.isLocked
                ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {note.isLocked && !isLockedActive ? (
              <Unlock className="w-3.5 h-3.5" />
            ) : (
              <Lock className={`w-3.5 h-3.5 ${note.isLocked ? 'fill-amber-500/20' : ''}`} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
