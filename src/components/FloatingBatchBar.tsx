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
      <div className="bg-black text-white rounded-2xl shadow-2xl p-3 sm:p-4 border border-white/10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-black shrink-0">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-black uppercase tracking-wider leading-none">
              {selectedCount} Selected
            </div>
            <button 
              onClick={onClear}
              className="text-[10px] uppercase tracking-[0.2em] font-black text-white/50 hover:text-white cursor-pointer mt-1.5 transition-colors"
            >
              Deselect All
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAssignCategory}
            className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group"
          >
            <Folder className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest mt-1">Category</span>
          </button>
          
          <button
            onClick={onDelete}
            className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group"
          >
            <Trash2 className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest mt-1">Delete</span>
          </button>

          <div className="w-px h-8 bg-white/20 mx-1" />

          <button
            onClick={onClear}
            className="p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-white/40" />
          </button>
        </div>
      </div>
    </div>
  );
};
