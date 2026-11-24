import React from 'react';
import { Folder, Trash2, X, CheckSquare } from 'lucide-react';

interface FloatingBatchBarProps {
  selectedCount: number;
  onClear: () => void;
  onAssignCategory: () => void;
  onDelete: () => void;
  // Optional legacy props
  onAssignColor?: (color: any) => void;
}

export const FloatingBatchBar: React.FC<FloatingBatchBarProps> = ({
  selectedCount,
  onClear,
  onAssignCategory,
  onDelete,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-lg animate-in slide-in-from-bottom-6 duration-200">
      <div className="bg-[var(--bg-card)]/95 backdrop-blur-md text-[var(--text-primary)] rounded-2xl shadow-2xl p-3 sm:p-3.5 border border-[var(--accent-gold)]/50 flex items-center justify-between gap-3">
        {/* Left: Selected count display */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[var(--accent-gold)] text-[var(--accent-contrast)] flex items-center justify-center font-black shrink-0 shadow-xs">
            <CheckSquare className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate">
              {selectedCount} selected
            </div>
          </div>
        </div>

        {/* Right: Exactly the 3 requested actions: Assign Category, Delete, Cancel */}
        <div className="flex items-center gap-2 shrink-0">
          {/* 1. Assign Category */}
          <button
            type="button"
            onClick={onAssignCategory}
            className="flex items-center gap-1.5 px-3 py-2 bg-[var(--bg-elevated)] hover:border-[var(--accent-gold)] border border-[var(--border)] rounded-xl text-xs font-bold text-[var(--accent-gold)] transition-all cursor-pointer shadow-xs active:scale-95"
            title="Assign Category"
          >
            <Folder className="w-4 h-4" />
            <span className="hidden xs:inline sm:inline">Category</span>
          </button>

          {/* 2. Delete all selected */}
          <button
            type="button"
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-500 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
            title="Delete all selected notes"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden xs:inline sm:inline">Delete</span>
          </button>

          {/* 3. Cancel selection mode */}
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 px-2.5 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-xl text-xs font-bold transition-all cursor-pointer"
            title="Cancel selection mode"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Cancel</span>
          </button>
        </div>
      </div>
    </div>
  );
};
