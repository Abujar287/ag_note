import React, { useRef } from 'react';
import {
  Layers,
  Folder,
  Plus,
  Trash2,
  Pin,
  X,
  FileText,
  Download,
  Upload,
  Edit2,
  HelpCircle,
  Lock,
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
  isMobileOpen: boolean;
  onCloseMobile: () => void;
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
  onExportNotes,
  onImportNotes,
  isMobileOpen,
  onCloseMobile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportNotes) {
      onImportNotes(file);
      e.target.value = '';
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:sticky md:top-[76px] md:self-start md:max-h-[calc(100vh-88px)] inset-y-0 left-0 z-40 w-64 max-w-[80vw] shrink-0 bg-white dark:bg-slate-900 border-r md:border-r-0 md:bg-transparent md:dark:bg-transparent p-4 md:p-0 flex flex-col gap-4 overflow-y-auto transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex md:hidden items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <span className="font-bold text-sm text-black">Menu & Filters</span>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Views (All Notes, Pinned, Uncategorized, Locked, Trash) */}
        <div className="bg-white p-3 rounded-2xl border border-black/10 shadow-sm space-y-1">
          {/* All Notes */}
          <button
            type="button"
            onClick={() => {
              onToggleTrashView(false);
              onSelectCategory('all');
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              !isTrashView && activeCategory === 'all'
                ? 'bg-black text-white'
                : 'text-black hover:bg-black/5'
            }`}
          >
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-500" />
              <span>All Notes</span>
            </span>
            <span className="font-mono tabular-nums text-[11px] text-slate-500 dark:text-slate-400">
              {totalNotesCount}
            </span>
          </button>

          {/* Pinned Notes */}
          <button
            type="button"
            onClick={() => {
              onToggleTrashView(false);
              onSelectCategory('pinned');
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              !isTrashView && activeCategory === 'pinned'
                ? 'bg-black text-white'
                : 'text-black hover:bg-black/5'
            }`}
          >
            <span className="flex items-center gap-2">
              <Pin className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Pinned Notes</span>
            </span>
            <span className="font-mono tabular-nums text-[11px] text-slate-500 dark:text-slate-400">
              {pinnedNotesCount}
            </span>
          </button>

          {/* Uncategorized Notes Filter ("je note category assigned nai seitao ami caile filter kore dekhte parbo") */}
          <button
            type="button"
            onClick={() => {
              onToggleTrashView(false);
              onSelectCategory('uncategorized');
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              !isTrashView && activeCategory === 'uncategorized'
                ? 'bg-black text-white'
                : 'text-black hover:bg-black/5'
            }`}
          >
            <span className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-500" />
              <span>Uncategorized</span>
            </span>
            <span className="font-mono tabular-nums text-[11px] text-slate-500 dark:text-slate-400">
              {uncategorizedCount}
            </span>
          </button>

          {/* Locked Notes Filter */}
          <button
            type="button"
            onClick={() => {
              onToggleTrashView(false);
              onSelectCategory('locked');
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              !isTrashView && activeCategory === 'locked'
                ? 'bg-black text-white'
                : 'text-black hover:bg-black/5'
            }`}
          >
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500" />
              <span>Locked Notes</span>
            </span>
            <span className="font-mono tabular-nums text-[11px] text-slate-500 dark:text-slate-400">
              {lockedNotesCount}
            </span>
          </button>

          {/* Trash Bin */}
          <button
            type="button"
            onClick={() => {
              onToggleTrashView(true);
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              isTrashView
                ? 'bg-rose-600 text-white'
                : 'text-black hover:bg-black/5'
            }`}
          >
            <span className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-500" />
              <span>Trash Bin</span>
            </span>
            <span className="font-mono tabular-nums text-[11px] text-slate-500 dark:text-slate-400">
              {trashNotesCount}
            </span>
          </button>
        </div>

        {/* Categories List */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black text-black uppercase tracking-[0.2em]">
              Categories
            </span>
            <button
              type="button"
              onClick={onOpenCategoryModal}
              title="Add or Manage Categories"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
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
                    onCloseMobile();
                  }}
                  className={`group/cat w-full flex items-center justify-between px-2.5 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-black text-white'
                      : 'text-black hover:bg-black/5'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate flex-1 min-w-0 mr-1">
                    <Folder className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-black/40'}`} />
                    <span className="truncate">{cat}</span>
                  </span>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="font-mono tabular-nums text-[11px] text-slate-500 dark:text-slate-400 group-hover/cat:hidden">
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
                        className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
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
                        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors cursor-pointer"
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
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1.5">
          <label className="block text-[10px] font-black text-black uppercase tracking-[0.2em] px-1">
            Sort By
          </label>
          <select
            value={sortMode}
            onChange={(e) => onChangeSort(e.target.value as SortMode)}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="updated">Recently updated</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>

        {/* Mobile Backup & Restore Section */}
        {onExportNotes && onImportNotes && (
          <div className="md:hidden bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
            <span className="text-[10px] font-black text-black uppercase tracking-[0.2em] px-1">
              Backup & Restore
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onExportNotes();
                  onCloseMobile();
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-medium transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-500" />
                <span>Backup</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-medium transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-500" />
                <span>Restore</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </button>
            </div>
          </div>
        )}

        {/* Quick App Stats */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-3.5 rounded-2xl shadow-xs text-xs space-y-2 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-400" /> Total Notes
            </span>
            <span className="font-bold text-sm font-mono tabular-nums text-blue-300">
              {totalNotesCount}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Pin className="w-3.5 h-3.5 text-amber-400" /> Pinned
            </span>
            <span className="font-bold text-sm font-mono tabular-nums text-amber-300">
              {pinnedNotesCount}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" /> Locked
            </span>
            <span className="font-bold text-sm font-mono tabular-nums text-amber-300">
              {lockedNotesCount}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5 text-rose-400" /> In Trash
            </span>
            <span className="font-bold text-sm font-mono tabular-nums text-rose-300">
              {trashNotesCount}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
