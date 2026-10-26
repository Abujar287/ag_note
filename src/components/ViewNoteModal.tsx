import React, { useState } from 'react';
import {
  X,
  Edit3,
  Trash2,
  Copy,
  Check,
  Download,
  Pin,
  Calendar,
  Clock,
  Lock,
  Unlock,
} from 'lucide-react';
import { Note, NOTE_COLORS } from '../types/note';
import { formatDate, countWordsAndChars } from '../utils/banglaUtils';

interface ViewNoteModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  onTogglePin: (id: string) => void;
  onToggleLockNote?: (note: Note) => void;
  onRelockNote?: (id: string) => void;
  onShowToast: (msg: string) => void;
}

export const ViewNoteModal: React.FC<ViewNoteModalProps> = ({
  note,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleLockNote,
  onRelockNote,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !note) return null;

  const colorConfig = NOTE_COLORS.find((c) => c.id === note.color) || NOTE_COLORS[0];
  const { words, chars } = countWordsAndChars(note.content);

  const handleCopy = () => {
    const fullText = `${note.title}\n\n${note.content}`;
    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      onShowToast('Note copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadTxt = () => {
    const fullText = `Title: ${note.title}\nCategory: ${note.category || 'Uncategorized'}\nDate: ${formatDate(
      note.createdAt,
      true
    )}\n\n${note.content}`;
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${note.title.slice(0, 30).replace(/[^\w\u0980-\u09FF]/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast('Note file downloaded');
  };

  const handleRelock = () => {
    if (onRelockNote) {
      onRelockNote(note.id);
      onShowToast('Note re-locked');
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle accent line */}
        <div className={`h-1.5 w-full ${colorConfig.bgClass}`} />

        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {note.category || 'Uncategorized'}
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1 font-mono tabular-nums">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formatDate(note.createdAt)}
                </span>
                {note.updatedAt && note.updatedAt !== note.createdAt && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 font-mono tabular-nums text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      Updated: {formatDate(note.updatedAt)}
                    </span>
                  </>
                )}
                {note.isLocked && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                      <Lock className="w-3 h-3" /> Password Protected
                    </span>
                  </>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 leading-tight">
                {note.title}
              </h2>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {note.isLocked && (
                <button
                  type="button"
                  onClick={handleRelock}
                  title="Lock note immediately"
                  className="p-2 text-amber-600 hover:text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 rounded-xl hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => onTogglePin(note.id)}
                title={note.isPinned ? 'Unpin' : 'Pin'}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  note.isPinned
                    ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-amber-500' : ''}`} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          <div className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-normal selection:bg-blue-500/20">
            {note.content}
          </div>
        </div>

        {/* Footer & Actions */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400 font-mono tabular-nums">
            {words} words · {chars} chars
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadTxt}
              title="Download as TXT file"
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>

            {onToggleLockNote && (
              <button
                type="button"
                onClick={() => onToggleLockNote(note)}
                title={note.isLocked ? 'Remove Password Protection' : 'Lock Note with Password'}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 rounded-xl border border-amber-200 dark:border-amber-900/40 transition-colors cursor-pointer"
              >
                {note.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                <span>{note.isLocked ? 'Remove Lock' : 'Lock'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(note);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onDelete(note);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
