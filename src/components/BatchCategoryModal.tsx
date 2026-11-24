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

  const allCategoryOptions = [
    'General',
    'Uncategorized',
    ...categories.filter((c) => c !== 'General' && c !== 'Uncategorized'),
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)] shrink-0">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Folder className="w-5 h-5 text-[var(--accent-gold)]" />
              <span>Assign Category (ক্যাটাগরি নির্ধারণ)</span>
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Move <span className="font-bold text-[var(--accent-gold)]">{selectedCount}</span> selected {selectedCount === 1 ? 'note' : 'notes'} to category
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border)]/40 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-2 flex-1">
          <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider mb-2">
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
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-[var(--border)] hover:border-[var(--accent-gold)] bg-[var(--bg-elevated)] text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Folder className="w-4 h-4 text-[var(--accent-gold)] group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-gold)]">
                      {cat}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--text-muted)] font-mono px-2 py-0.5 rounded-md bg-[var(--bg-card)] border border-[var(--border)] group-hover:border-[var(--accent-gold)]/50 group-hover:text-[var(--accent-gold)]">
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
                  className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl border border-[var(--accent-gold)] bg-[var(--bg-elevated)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!newCatName.trim()}
                  className="px-3 py-2 text-xs font-bold rounded-xl bg-[var(--accent-gold)] text-[var(--accent-contrast)] hover:opacity-90 disabled:opacity-50 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Assign</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewInput(false)}
                  className="px-2.5 py-2 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowNewInput(true)}
              className="w-full mt-2 py-2.5 px-3 border border-dashed border-[var(--border)] hover:border-[var(--accent-gold)] rounded-xl text-xs font-bold text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>+ Create New Category & Assign</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[var(--bg-elevated)] border-t border-[var(--border)] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border)]/40 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
