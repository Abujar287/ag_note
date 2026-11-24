import React, { useState, useEffect } from 'react';
import {
  FolderPlus,
  Folder,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  existingCategories: string[];
  categoryCounts: Record<string, number>;
  onAddCategory: (name: string) => void;
  onRenameCategory: (oldName: string, newName: string) => void;
  onDeleteCategory: (name: string) => void;
  onClose: () => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  existingCategories,
  categoryCounts,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
  onClose,
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [error, setError] = useState('');
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editInputName, setEditInputName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNewCatName('');
      setError('');
      setEditingCat(null);
      setEditInputName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) {
      setError('Please enter a category name');
      return;
    }
    if (existingCategories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setError('This category already exists');
      return;
    }
    onAddCategory(trimmed);
    setNewCatName('');
    setError('');
  };

  const startEditing = (cat: string) => {
    setEditingCat(cat);
    setEditInputName(cat);
    setError('');
  };

  const handleSaveRename = (oldName: string) => {
    const trimmed = editInputName.trim();
    if (!trimmed) {
      setError('Category name cannot be empty');
      return;
    }
    if (
      trimmed.toLowerCase() !== oldName.toLowerCase() &&
      existingCategories.some((c) => c.toLowerCase() === trimmed.toLowerCase())
    ) {
      setError('Another category with this name already exists');
      return;
    }
    onRenameCategory(oldName, trimmed);
    setEditingCat(null);
    setEditInputName('');
    setError('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border)] p-5 sm:p-6 space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] rounded-xl">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--text-primary)] text-base">
                Manage Categories
              </h3>
              <p className="text-xs text-[var(--text-muted)]">Add, rename, or delete note categories</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add New Category Input */}
        <form onSubmit={handleAddSubmit} className="space-y-2">
          <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Add New Category
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => {
                setNewCatName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Finance, Health, Projects..."
              className="flex-1 px-3.5 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[var(--accent-gold)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/70 transition-colors"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-[var(--accent-contrast)] bg-[var(--accent-gold)] hover:opacity-90 rounded-xl transition-colors shadow-xs cursor-pointer shrink-0"
            >
              Add
            </button>
          </div>
          {error && (
            <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </p>
          )}
        </form>

        {/* Categories List with Edit and Delete */}
        <div className="flex-1 overflow-y-auto space-y-2 min-h-[140px] max-h-[300px] pr-1">
          <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
            Existing Categories ({existingCategories.length})
          </label>

          <div className="space-y-1.5">
            {existingCategories.map((cat) => {
              const count = categoryCounts[cat] || 0;
              const isEditing = editingCat === cat;

              return (
                <div
                  key={cat}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] transition-colors"
                >
                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1 mr-2">
                      <input
                        type="text"
                        autoFocus
                        value={editInputName}
                        onChange={(e) => setEditInputName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(cat);
                          if (e.key === 'Escape') setEditingCat(null);
                        }}
                        className="flex-1 px-2.5 py-1 bg-[var(--bg-card)] border border-[var(--accent-gold)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveRename(cat)}
                        className="p-1.5 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
                        title="Save name"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCat(null)}
                        className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg transition-colors cursor-pointer"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Folder className="w-4 h-4 text-[var(--accent-gold)] shrink-0" />
                      <span className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] break-words">
                        {cat}
                      </span>
                      <span className="text-[11px] font-mono tabular-nums text-[var(--text-muted)] bg-[var(--bg-card)] px-1.5 py-0.5 rounded-md border border-[var(--border)] shrink-0">
                        {count} {count === 1 ? 'note' : 'notes'}
                      </span>
                    </div>
                  )}

                  {!isEditing && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEditing(cat)}
                        title="Rename category"
                        className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent-gold)] hover:bg-[var(--bg-card)] rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteCategory(cat)}
                        title={
                          existingCategories.length <= 1
                            ? 'Cannot delete the only category'
                            : 'Delete category'
                        }
                        disabled={existingCategories.length <= 1}
                        className={`p-1.5 rounded-lg transition-colors ${
                          existingCategories.length <= 1
                            ? 'text-[var(--text-muted)]/30 cursor-not-allowed'
                            : 'text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
