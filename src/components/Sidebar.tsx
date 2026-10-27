import React from 'react';
import {
  Layers,
  Folder,
  Plus,
  Trash2,
  Pin,
  X,
  Edit2,
  HelpCircle,
  Lock,
  Settings,
} from 'lucide-react';
import { SortMode } from '../types/note';

interface SidebarProps {
  categories: string[];
  activeCategory: string;
  isTrashView: boolean;
  totalNotesCount: number;
  pinnedNotesCount: number;
  uncategorizedCount: number;
  lockedNotesCount: number;
  trashNotesCount: number;
  categoryCounts: Record<string, number>;
  sortMode: SortMode;
  onSelectCategory: (cat: string) => void;
  onOpenCategoryModal: () => void;
  onDeleteCategory: (name: string) => void;
  onToggleTrashView: (showTrash: boolean) => void;
  onChangeSort: (mode: SortMode) => void;
  onExportNotes?: () => void;
  onImportNotes?: (file: File) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  onOpenSettings?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  categories,
  activeCategory,
  isTrashView,
  totalNotesCount,
  pinnedNotesCount,
  uncategorizedCount,
  lockedNotesCount,
  trashNotesCount,
  categoryCounts,
  sortMode,
  onSelectCategory,
  onOpenCategoryModal,
  onDeleteCategory,
  onToggleTrashView,
  onChangeSort,
  isMobileOpen,
  onCloseMobile,
  isOpen,
  onClose,
  onOpenSettings,
}) => {
  const isMenuOpen = isOpen !== undefined ? isOpen : (isMobileOpen ?? true);
  const handleClose = () => {
    if (onClose) onClose();
    else if (onCloseMobile) onCloseMobile();
  };

  const closeIfMobile = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      handleClose();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden backdrop-blur-xs transition-opacity"
          onClick={handleClose}
        />
      )}

      {/* Sidebar container - Collapsible on ALL screens */}
      <aside
        className={`fixed md:sticky md:top-20 md:self-start md:max-h-[calc(100vh-96px)] inset-y-0 left-0 z-40 w-64 max-w-[85vw] md:max-w-none shrink-0 bg-[#14241D] md:bg-transparent border-r border-[#2D4A3D] md:border-r-0 p-4 md:p-0 flex flex-col gap-4 overflow-y-auto transition-all duration-200 ease-in-out shadow-2xl md:shadow-none ${
          isMenuOpen ? 'translate-x-0 md:block md:w-64' : '-translate-x-full md:hidden'
        }`}
      >
        {/* Sidebar Header with Close / Hide Menu button for ALL screens */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2D4A3D]">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#D4AF37]" />
            <span className="font-bold text-xs uppercase tracking-wider text-[#F0F7F4]">Menu & Categories</span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-lg text-[#8DA89B] hover:text-[#F0F7F4] hover:bg-[#244234] transition-colors cursor-pointer"
            title="মেনু লুকান (Hide Menu)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Views */}
        <div className="bg-[var(--bg-card)] p-3 rounded-2xl border border-[var(--border)] shadow-xs space-y-1">
          {/* All Notes */}
          <button
            type="button"
            onClick={() => {
              onToggleTrashView(false);
              onSelectCategory('all');
              closeIfMobile();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              !isTrashView && activeCategory === 'all'
                ? 'bg-[var(--accent-gold)] text-[var(--bg-main)]'
                : 'text-[var(--text-primary)] hover:bg-[var(--border)]'
            }`}
          >
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#10B981]" />
              <span>All Notes</span>
            </span>
            <span className="font-mono tabular-nums text-[11px] text-[var(--text-primary)]/70">
              {totalNotesCount}
            </span>
          </button>


          {/* Pinned Notes */}
          <button
            type="button"
            onClick={() => {
              onToggleTrashView(false);
              onSelectCategory('pinned');
              closeIfMobile();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              !isTrashView && activeCategory === 'pinned'
                ? 'bg-[var(--accent-gold)] text-[var(--bg-main)]'
                : 'text-[var(--text-primary)] hover:bg-[var(--border)]'
            }`}
          >
            <span className="flex items-center gap-2">
              <Pin className="w-4 h-4 text-[var(--accent-gold)] fill-[var(--accent-gold)]" />
              <span>Pinned Notes</span>
            </span>
            <span className="font-mono tabular-nums text-[11px] text-[var(--text-primary)]/70">
              {pinnedNotesCount}
            </span>
          </button>

          {/* Uncategorized Notes Filter */}
          <button
            type="button"
            onClick={() => {
              onToggleTrashView(false);
              onSelectCategory('uncategorized');
              closeIfMobile();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              !isTrashView && activeCategory === 'uncategorized'
                ? 'bg-[var(--accent-gold)] text-[var(--bg-main)]'
                : 'text-[var(--text-primary)] hover:bg-[var(--border)]'
            }`}
          >
            <span className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[var(--accent-gold)]" />
              <span>Uncategorized</span>
            </span>
            <span className="font-mono tabular-nums text-[11px] text-[var(--text-primary)]/70">
              {uncategorizedCount}
            </span>
          </button>

          {/* Locked Notes Filter */}
          <button
            type="button"
            onClick={() => {
              onToggleTrashView(false);
              onSelectCategory('locked');
              closeIfMobile();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              !isTrashView && activeCategory === 'locked'
                ? 'bg-[var(--accent-gold)] text-[var(--bg-main)]'
                : 'text-[var(--text-primary)] hover:bg-[var(--border)]'
            }`}
          >
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[var(--accent-gold)]" />
              <span>Locked Notes</span>
            </span>
            <span className="font-mono tabular-nums text-[11px] text-[var(--text-primary)]/70">
              {lockedNotesCount}
            </span>
          </button>

          {/* Trash Bin */}
          <button
            type="button"
            onClick={() => {
              onToggleTrashView(true);
              closeIfMobile();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              isTrashView
                ? 'bg-rose-800 text-[var(--text-primary)]'
                : 'text-[var(--text-primary)] hover:bg-[var(--border)]'
            }`}
          >
            <span className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-500" />
              <span>Trash Bin</span>
            </span>
            <span className="font-mono tabular-nums text-[11px] text-[var(--text-primary)]/70">
              {trashNotesCount}
            </span>
          </button>

          {/* Settings button directly below the Menu Tabs */}
          <div className="pt-2 border-t border-[#2D4A3D]/80 mt-1">
            <button
              type="button"
              onClick={() => {
                if (onOpenSettings) {
                  onOpenSettings();
                } else {
                  window.dispatchEvent(new CustomEvent('openSettings'));
                }
                closeIfMobile();
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-[#D4AF37] hover:bg-[#D4AF37]/15 active:scale-98"
            >
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#D4AF37]" />
                <span>Settings (সেটিংস)</span>
              </span>
              <span className="text-[10px] text-[#8DA89B] font-medium">কনফিগ</span>
            </button>
          </div>
        </div>

        {/* Categories List */}
        <div className="bg-[var(--bg-card)] p-3 rounded-2xl border border-[var(--border)] shadow-xs space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em]">
              Categories
            </span>
            <button
              type="button"
              onClick={onOpenCategoryModal}
              title="Add or Manage Categories"
              className="text-xs text-[var(--accent-gold)] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Manage</span>
            </button>
          </div>

          <div className="space-y-0.5">
            {categories.map((cat) => {
              const count = categoryCounts[cat] || 0;
              const isActive = !isTrashView && activeCategory === cat;
              return (
                <div
                  key={cat}
                  onClick={() => {
                    onToggleTrashView(false);
                    onSelectCategory(cat);
                    closeIfMobile();
                  }}
                  className={`group/cat w-full flex items-center justify-between px-2.5 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[var(--accent-gold)] text-[var(--bg-main)]'
                      : 'text-[var(--text-primary)] hover:bg-[var(--border)]'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate flex-1 min-w-0 mr-1">
                    <Folder className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[var(--bg-main)]' : 'text-[var(--text-primary)]/40'}`} />
                    <span className="truncate">{cat}</span>
                  </span>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="font-mono tabular-nums text-[11px] text-[var(--text-primary)]/70 group-hover/cat:hidden">
                      {count}
                    </span>
                    <div className="hidden group-hover/cat:flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenCategoryModal();
                        }}
                        title="Edit / Rename"
                        className="p-1 text-[var(--text-primary)]/50 hover:text-[var(--accent-gold)] hover:bg-[var(--border)] rounded-md transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCategory(cat);
                        }}
                        title="Delete category"
                        className="p-1 text-[var(--text-primary)]/50 hover:text-rose-500 hover:bg-rose-950/30 rounded-md transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sort Controls */}
        <div className="bg-[#162920] p-3 rounded-2xl border border-[#2D4A3D] shadow-xs space-y-1.5">
          <label className="block text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em] px-1">
            Sort By
          </label>
          <select
            value={sortMode}
            onChange={(e) => onChangeSort(e.target.value as SortMode)}
            className="w-full px-2.5 py-1.5 bg-[#12211A] border border-[#2D4A3D] rounded-xl text-xs font-medium text-[#F0F7F4] focus:outline-none focus:border-[#D4AF37] cursor-pointer"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="updated">Recently updated</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>

        {/* GitHub Auto-Sync & Version Status Footer */}
        <div className="bg-[#12211A] text-[#8DA89B] p-2.5 rounded-xl text-[11px] border border-[#2D4A3D] flex items-center justify-between mt-auto">
          <span className="flex items-center gap-1.5 text-[#10B981] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span>Auto-Update Active</span>
          </span>
          <span className="font-mono text-[10px] text-[#D4AF37] bg-[#162920] px-2 py-0.5 rounded border border-[#2D4A3D]">
            GitHub Sync
          </span>
        </div>
      </aside>
    </>
  );
};
