import React, { useState } from 'react';
import { X, FolderPlus, Check, Folder } from 'lucide-react';

interface BatchCategoryModalProps {
  isOpen: boolean;
  selectedCount: number;
  categories: string[];
  categoryCounts: Record<string, number>;
  onAssignCategory: (categoryName: string) => void;
  onCreateAndAssign: (categoryName: string) => void;
  onClose: () => void;
}

export const BatchCategoryModal: React.FC<BatchCategoryModalProps> = ({
  isOpen,
  selectedCount,
  categories,
  categoryCounts,
  onAssignCategory,
  onCreateAndAssign,
  onClose,
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [showNewInput, setShowNewInput] = useState(false);

  if (!isOpen) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (trimmed) {
      onCreateAndAssign(trimmed);
      setNewCatName('');
      setShowNewInput(false);
    }
  };

  const allCategoryOptions = ['Uncategorized', ...categories.filter((c) => c !== 'Uncategorized')];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Folder className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Assign Category</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Move <span className="font-bold text-blue-600 dark:text-blue-400">{selectedCount}</span> selected {selectedCount === 1 ? 'note' : 'notes'} to a category
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Categories List */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Choose Destination Category
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {allCategoryOptions.map((cat) => {
              const count = categoryCounts[cat] || 0;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onAssignCategory(cat)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/60 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Folder className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {cat}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 group-hover:text-blue-600">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Create New Category Form */}
          {showNewInput ? (
            <form onSubmit={handleCreateSubmit} className="pt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="New category name..."
                  autoFocus
                  className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl border border-blue-400 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="submit"
                  disabled={!newCatName.trim()}
                  className="px-3 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Assign</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewInput(false)}
                  className="px-2.5 py-2 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowNewInput(true)}
              className="w-full mt-2 py-2 px-3 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>+ Create New Category & Assign</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200/80 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
