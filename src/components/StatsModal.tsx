import React from 'react';
import { X, BarChart3, FileText, Type, Folder, Trash2 } from 'lucide-react';
import { Note } from '../types/note';
import { countWordsAndChars } from '../utils/banglaUtils';

interface StatsModalProps {
  isOpen: boolean;
  notes: Note[];
  trashCount: number;
  categoriesCount: number;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  notes,
  trashCount,
  categoriesCount,
  onClose,
}) => {
  if (!isOpen) return null;

  const totals = notes.reduce(
    (acc, note) => {
      const { words, chars } = countWordsAndChars(`${note.title || ''} ${note.content || ''}`);
      acc.words += words;
      acc.chars += chars;
      return acc;
    },
    { words: 0, chars: 0 }
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[var(--accent-gold)]" />
            <h3 className="font-bold text-sm text-[var(--text-primary)]">Note Statistics</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--border)]/40 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
            <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-[11px] font-bold mb-1">
              <FileText className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
              <span>Total Notes</span>
            </div>
            <div className="text-xl font-black font-mono text-[var(--text-primary)]">
              {notes.length}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
            <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-[11px] font-bold mb-1">
              <Type className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Total Words</span>
            </div>
            <div className="text-xl font-black font-mono text-[var(--text-primary)]">
              {totals.words.toLocaleString()}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
            <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-[11px] font-bold mb-1">
              <Folder className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
              <span>Categories</span>
            </div>
            <div className="text-xl font-black font-mono text-[var(--text-primary)]">
              {categoriesCount}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
            <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-[11px] font-bold mb-1">
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>In Trash</span>
            </div>
            <div className="text-xl font-black font-mono text-[var(--text-primary)]">
              {trashCount}
            </div>
          </div>
        </div>

        <div className="px-5 pb-4 text-center text-[11px] font-mono text-[var(--text-muted)]">
          Total Characters: {totals.chars.toLocaleString()}
        </div>
      </div>
    </div>
  );
};
