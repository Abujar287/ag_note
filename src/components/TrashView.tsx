import React from 'react';
import { Trash2, RotateCcw, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Note } from '../types/note';
import { formatDate, getFirstLine } from '../utils/banglaUtils';

interface TrashViewProps {
  trashNotes: Note[];
  onRestoreNote: (id: string) => void;
  onRestoreAll: () => void;
  onRequestPermanentDelete: (note: Note) => void;
  onRequestEmptyTrash: () => void;
  onBackToNotes: () => void;
}

export const TrashView: React.FC<TrashViewProps> = ({
  trashNotes,
  onRestoreNote,
  onRestoreAll,
  onRequestPermanentDelete,
  onRequestEmptyTrash,
  onBackToNotes,
}) => {
  return (
    <div className="space-y-4">
      {/* Top Header of Trash View */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToNotes}
            className="p-1.5 text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-xl transition-colors cursor-pointer"
            title="Back to active notes"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-500" />
              <span>Trash / Recycle Bin</span>
            </h2>
            <p className="text-[11px] text-[var(--text-muted)]">
              Deleted notes stay here. You can restore or permanently delete them.
            </p>
          </div>
        </div>

        {trashNotes.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRestoreAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] bg-[var(--bg-elevated)] hover:border-[var(--accent-gold)] border border-[var(--border)] rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-500" />
              <span>Restore All</span>
            </button>

            <button
              type="button"
              onClick={onRequestEmptyTrash}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Empty Trash</span>
            </button>
          </div>
        )}
      </div>

      {/* Empty State */}
      {trashNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-8">
          <div className="w-14 h-14 rounded-2xl bg-[var(--bg-elevated)] text-[var(--text-muted)] flex items-center justify-center mb-3 border border-[var(--border)]">
            <Trash2 className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            Trash is empty
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm">
            No deleted notes here. When you delete a note, it will be placed here safely.
          </p>
          <button
            type="button"
            onClick={onBackToNotes}
            className="mt-4 px-4 py-2 text-xs font-bold text-[#14241D] bg-[var(--accent-gold)] rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            Back to All Notes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {trashNotes.map((note) => {
            const firstLine = getFirstLine(note.content);
            return (
              <div
                key={note.id}
                className="flex flex-col justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5 text-[10px] text-[var(--text-muted)]">
                    <span className="font-bold text-[var(--accent-gold)] uppercase tracking-tighter truncate max-w-[90px]">
                      {note.category || 'General'}
                    </span>
                    <span className="font-mono tabular-nums">
                      {note.deletedAt ? formatDate(note.deletedAt) : 'Deleted'}
                    </span>
                  </div>

                  <h3 className="font-bold text-[var(--text-primary)] text-xs mb-0.5 truncate">
                    {note.title}
                  </h3>

                  <p className="text-[11px] text-[var(--text-muted)] truncate leading-tight mb-2.5">
                    {firstLine || 'No content'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                  <button
                    type="button"
                    onClick={() => onRestoreNote(note.id)}
                    className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 hover:bg-emerald-500/10 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restore</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onRequestPermanentDelete(note)}
                    className="flex items-center gap-1 text-[10px] font-bold text-rose-500 hover:bg-rose-500/10 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
