import React from 'react';
import { Folder, Trash2, X, CheckSquare } from 'lucide-react';

interface FloatingBatchBarProps {
  selectedCount: number;
  onClear: () => void;
  onAssignCategory: () => void;
  onDelete: () => void;
}

export const FloatingBatchBar: React.FC<FloatingBatchBarProps> = ({
  selectedCount,
  onClear,
  onAssignCategory,
  onDelete,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-lg animate-in slide-in-from-bottom-8 duration-300">
      <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-2xl p-3 sm:p-4 border border-slate-700 dark:border-slate-200 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold leading-none">
              {selectedCount} Selected
            </div>
            <button 
              onClick={onClear}
              className="text-[10px] uppercase tracking-wider font-black text-blue-400 dark:text-blue-600 hover:underline cursor-pointer mt-1"
            >
              Deselect All
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAssignCategory}
            className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer group"
          >
            <Folder className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold mt-1">Category</span>
          </button>
          
          <button
            onClick={onDelete}
            className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer group"
          >
            <Trash2 className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold mt-1">Delete</span>
          </button>

          <div className="w-px h-8 bg-slate-700 dark:bg-slate-200 mx-1" />

          <button
            onClick={onClear}
            className="p-2 rounded-full hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
