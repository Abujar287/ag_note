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
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 rounded-2xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToNotes}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-rose-100/60 dark:hover:bg-rose-900/40 rounded-xl transition-colors cursor-pointer"
            title="Back to active notes"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-500" />
              <span>Trash / Recycle Bin</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Deleted notes stay here. You can restore them or permanently delete them.
            </p>
          </div>
        </div>

        {trashNotes.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRestoreAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-500" />
              <span>Restore All</span>
            </button>

            <button
              type="button"
              onClick={onRequestEmptyTrash}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-100/60 dark:bg-rose-950/40 hover:bg-rose-200/60 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/50 rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Empty Trash</span>
            </button>
          </div>
        )}
      </div>

      {/* Empty State */}
      {trashNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
            <Trash2 className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Trash is empty
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            No deleted notes here. When you delete a note, it will be placed here safely.
          </p>
          <button
            type="button"
            onClick={onBackToNotes}
            className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            Back to All Notes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {trashNotes.map((note) => {
            const firstLine = getFirstLine(note.content);
            return (
              <div
                key={note.id}
                className="flex flex-col justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">
                      {note.category}
                    </span>
                    <span className="font-mono tabular-nums">
                      {note.deletedAt ? formatDate(note.deletedAt) : 'Deleted'}
                    </span>
                  </div>

                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-1 truncate">
                    {note.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate leading-snug mb-3">
                    {firstLine || 'No content'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => onRestoreNote(note.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-900/50 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onRequestPermanentDelete(note)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-900/50 transition-colors cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Delete Forever</span>
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
