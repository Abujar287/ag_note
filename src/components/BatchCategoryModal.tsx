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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#162920] rounded-2xl shadow-2xl border border-[#2D4A3D] overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2D4A3D] bg-[#14241D] shrink-0">
          <div>
            <h2 className="text-base font-bold text-[#F0F7F4] flex items-center gap-2">
              <Folder className="w-5 h-5 text-[#D4AF37]" />
              <span>Assign Category (ক্যাটাগরি নির্ধারণ)</span>
            </h2>
            <p className="text-xs text-[#8DA89B] mt-0.5">
              Move <span className="font-bold text-[#D4AF37]">{selectedCount}</span> selected {selectedCount === 1 ? 'note' : 'notes'} to category
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#8DA89B] hover:text-[#F0F7F4] hover:bg-[#244234] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-2 flex-1">
          <div className="text-[10px] font-black text-[#8DA89B] uppercase tracking-wider mb-2">
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
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-[#2D4A3D] hover:border-[#D4AF37] bg-[#14241D]/60 hover:bg-[#244234] text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Folder className="w-4 h-4 text-[#D4AF37] group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-semibold text-[#F0F7F4] group-hover:text-[#D4AF37]">
                      {cat}
                    </span>
                  </div>
                  <span className="text-xs text-[#8DA89B] font-mono px-2 py-0.5 rounded-md bg-[#162920] border border-[#2D4A3D] group-hover:border-[#D4AF37]/50 group-hover:text-[#D4AF37]">
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
                  className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl border border-[#D4AF37] bg-[#14241D] text-[#F0F7F4] placeholder-[#8DA89B] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!newCatName.trim()}
                  className="px-3 py-2 text-xs font-bold rounded-xl bg-[#D4AF37] text-[#14241D] hover:bg-[#D4AF37]/90 disabled:opacity-50 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Assign</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewInput(false)}
                  className="px-2.5 py-2 text-xs text-[#8DA89B] hover:bg-[#244234] rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowNewInput(true)}
              className="w-full mt-2 py-2.5 px-3 border border-dashed border-[#2D4A3D] hover:border-[#D4AF37] rounded-xl text-xs font-bold text-[#8DA89B] hover:text-[#D4AF37] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>+ Create New Category & Assign</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#14241D] border-t border-[#2D4A3D] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-[#8DA89B] hover:text-[#F0F7F4] hover:bg-[#244234] rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
