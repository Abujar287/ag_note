import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X, Undo2 } from 'lucide-react';

export interface ToastData {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  onUndo?: () => void;
}

interface ToastProps {
  toast: ToastData | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success' || !toast.type;
  const isError = toast.type === 'error';

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-22 right-4 sm:bottom-24 sm:right-6 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 text-slate-100 dark:bg-slate-800 dark:text-slate-100 rounded-xl shadow-2xl border border-slate-700/60 transition-all transform animate-in fade-in slide-in-from-bottom-3 duration-200 max-w-md text-xs sm:text-sm"
    >
      <div className="shrink-0">
        {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
        {isError && <AlertCircle className="w-4 h-4 text-rose-400" />}
        {!isSuccess && !isError && <Info className="w-4 h-4 text-blue-400" />}
      </div>

      <p className="font-medium leading-snug flex-1 pr-1">{toast.message}</p>

      {toast.onUndo && (
        <button
          onClick={() => {
            toast.onUndo?.();
            onClose();
          }}
          className="shrink-0 flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-xs active:scale-95 cursor-pointer"
        >
          <Undo2 className="w-3.5 h-3.5" />
          <span>Undo</span>
        </button>
      )}

      <button
        onClick={onClose}
        className="shrink-0 text-slate-400 hover:text-slate-200 p-1 rounded-md transition-colors cursor-pointer"
        aria-label="Close"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
