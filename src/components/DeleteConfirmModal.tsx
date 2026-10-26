import React, { useEffect } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  noteTitle?: string;
  count?: number;
  isPermanent?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  noteTitle,
  count = 1,
  isPermanent = false,
  onConfirm,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200/50 dark:border-rose-900/50">
            {isPermanent ? (
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            ) : (
              <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {isPermanent
                ? count > 1
                  ? `Permanently delete ${count} notes?`
                  : 'Permanently delete note?'
                : count > 1
                ? `Move ${count} notes to Trash?`
                : 'Move note to Trash?'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {isPermanent ? (
                <>
                  {noteTitle ? (
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      &quot;{noteTitle}&quot;
                    </span>
                  ) : null}{' '}
                  will be deleted forever. This action cannot be undone.
                </>
              ) : (
                <>
                  {noteTitle ? (
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      &quot;{noteTitle}&quot;
                    </span>
                  ) : null}{' '}
                  will be moved to Trash. You can restore it anytime from the Trash bin.
                </>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isPermanent ? 'Delete Forever' : 'Move to Trash'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
