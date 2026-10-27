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
  Settings,
  Smartphone,
  RefreshCw,
} from 'lucide-react';
import { SortMode } from '../types/note';
import { usePWAInstall } from '../utils/usePWAInstall';

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
  onExportNotes,
  onImportNotes,
  isMobileOpen,
  onCloseMobile,
  onOpenSettings,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isInstallable, isInstalled, install } = usePWAInstall();

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
        className={`fixed md:sticky md:top-[76px] md:self-start md:max-h-[calc(100vh-88px)] inset-y-0 left-0 z-40 w-64 max-w-[80vw] shrink-0 bg-[var(--bg-card)] border-r border-[var(--border)] md:border-r-0 md:bg-transparent p-4 md:p-0 flex flex-col gap-4 overflow-y-auto transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex md:hidden items-center justify-between pb-3 border-b border-[var(--border)]">
          <span className="font-bold text-sm text-[var(--text-primary)]">Menu & Filters</span>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-[var(--text-primary)]/70 hover:text-[var(--text-primary)] cursor-pointer"
          >
            <X className="w-5 h-5" />
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
              onCloseMobile();
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
              onCloseMobile();
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
              onCloseMobile();
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
              onCloseMobile();
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
              onCloseMobile();
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
                onCloseMobile();
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
                    onCloseMobile();
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

        {/* Mobile PWA Install Button (If not installed) */}
        {!isInstalled && (
          <button
            type="button"
            onClick={async () => {
              if (isInstallable) {
                await install();
              } else {
                window.dispatchEvent(new CustomEvent('open-pwa-guide'));
              }
              onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-[#162920] hover:bg-[#1f3b2d] border border-[#D4AF37]/50 rounded-2xl text-xs font-bold text-[#D4AF37] transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <span className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#D4AF37]" />
              <span>মোবাইলে অ্যাপ ইনস্টল করুন</span>
            </span>
            <span className="text-[10px] text-[#10B981] font-bold bg-[#10B981]/15 px-2 py-0.5 rounded-full">
              PWA
            </span>
          </button>
        )}

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

        {/* Mobile Backup & Restore Section */}
        {onExportNotes && onImportNotes && (
          <div className="md:hidden bg-[#162920] p-3 rounded-2xl border border-[#2D4A3D] shadow-xs space-y-2">
            <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em] px-1">
              Backup & Restore
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onExportNotes();
                  onCloseMobile();
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#12211A] hover:bg-[#1a3327] border border-[#2D4A3D] text-[#F0F7F4] rounded-xl text-xs font-medium transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Backup</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#12211A] hover:bg-[#1a3327] border border-[#2D4A3D] text-[#F0F7F4] rounded-xl text-xs font-medium transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-[#10B981]" />
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
        <div className="bg-[#12211A] text-[#F0F7F4] p-3.5 rounded-2xl shadow-xs text-xs space-y-2 border border-[#2D4A3D]">
          <div className="flex items-center justify-between">
            <span className="text-[#8DA89B] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#D4AF37]" /> Total Notes
            </span>
            <span className="font-bold text-sm font-mono tabular-nums text-[#F0F7F4]">
              {totalNotesCount}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#8DA89B] flex items-center gap-1.5">
              <Pin className="w-3.5 h-3.5 text-[#D4AF37]" /> Pinned
            </span>
            <span className="font-bold text-sm font-mono tabular-nums text-[#D4AF37]">
              {pinnedNotesCount}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#8DA89B] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#D4AF37]" /> Locked
            </span>
            <span className="font-bold text-sm font-mono tabular-nums text-[#D4AF37]">
              {lockedNotesCount}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#8DA89B] flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5 text-rose-400" /> In Trash
            </span>
            <span className="font-bold text-sm font-mono tabular-nums text-rose-300">
              {trashNotesCount}
            </span>
          </div>
          <div className="pt-2 border-t border-[#2D4A3D] mt-2 flex items-center justify-between text-[11px] text-[#8DA89B]">
            <span className="flex items-center gap-1.5 text-[#10B981] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>Auto-Update Active</span>
            </span>
            <span className="font-mono text-[10px] text-[#D4AF37] bg-[#162920] px-2 py-0.5 rounded border border-[#2D4A3D]">
              GitHub Auto-Sync
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
