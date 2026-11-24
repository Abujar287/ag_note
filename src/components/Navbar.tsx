import React, { useState, useRef, useEffect } from 'react';
import {
  MoreVertical,
  RefreshCw,
  Trash2,
  FolderCog,
  LayoutGrid,
  List as ListIcon,
  Download,
  Upload,
  Settings,
  DownloadCloud,
  Layers,
  Sun,
  Moon,
  BarChart3,
} from 'lucide-react';
import { ViewMode } from '../types/note';

interface NavbarProps {
  viewMode: ViewMode;
  onToggleViewMode: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isTrashView: boolean;
  trashNotesCount: number;
  onToggleTrashView: (showTrash: boolean) => void;
  onOpenCategoryModal: () => void;
  onExportNotes: () => void;
  onImportNotes: (file: File) => void;
  onOpenSettings: () => void;
  onOpenStats: () => void;
  onSyncSheets?: () => void;
  isSyncingSheets?: boolean;
  onCheckUpdate: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  onToggleViewMode,
  isDarkMode,
  onToggleDarkMode,
  isTrashView,
  trashNotesCount,
  onToggleTrashView,
  onOpenCategoryModal,
  onExportNotes,
  onImportNotes,
  onOpenSettings,
  onOpenStats,
  onSyncSheets,
  isSyncingSheets,
  onCheckUpdate,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportNotes(file);
      e.target.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--bg-card)]/95 backdrop-blur-md border-b border-[var(--border)] shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="h-14 sm:h-15 flex items-center justify-between gap-3">
          {/* Left: 1. 3-dot menu, 2. App logo, 3. App name */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* 1. 3-dot menu */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer flex items-center justify-center"
                title="Menu"
                aria-label="Open menu"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {isMenuOpen && (
                <div className="absolute left-0 top-full mt-2 w-60 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {isTrashView && (
                    <button
                      type="button"
                      onClick={() => {
                        onToggleTrashView(false);
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-[var(--accent-gold)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                    >
                      <Layers className="w-4 h-4 text-[#10B981]" />
                      <span>All Notes</span>
                    </button>
                  )}

                  {/* 1. Manage Categories */}
                  <button
                    type="button"
                    onClick={() => {
                      onOpenCategoryModal();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                  >
                    <FolderCog className="w-4 h-4 text-[var(--accent-gold)]" />
                    <span>Manage Categories</span>
                  </button>

                  {/* 2. Trash / Recycle Bin */}
                  <button
                    type="button"
                    onClick={() => {
                      onToggleTrashView(!isTrashView);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                      isTrashView
                        ? 'text-rose-500 bg-rose-500/10'
                        : 'text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Trash2 className="w-4 h-4 text-rose-500" />
                      <span>Trash / Recycle Bin</span>
                    </span>
                    <span className="text-[10px] font-mono bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded border border-[var(--border)] text-[var(--text-muted)]">
                      {trashNotesCount}
                    </span>
                  </button>

                  {/* View Mode Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      onToggleViewMode();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                  >
                    {viewMode === 'grid' ? (
                      <ListIcon className="w-4 h-4 text-[var(--text-muted)]" />
                    ) : (
                      <LayoutGrid className="w-4 h-4 text-[var(--text-muted)]" />
                    )}
                    <span>{viewMode === 'grid' ? 'List View' : 'Grid View'}</span>
                  </button>

                  {/* 3. Export / Backup Notes */}
                  <button
                    type="button"
                    onClick={() => {
                      onExportNotes();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[var(--accent-gold)]" />
                    <span>Export / Backup Notes</span>
                  </button>

                  {/* 4. Import / Restore Notes */}
                  <button
                    type="button"
                    onClick={() => {
                      fileInputRef.current?.click();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-[#10B981]" />
                    <span>Import / Restore Notes</span>
                  </button>

                  {/* 5. Google Sheet Setup / Sync Settings */}
                  <button
                    type="button"
                    onClick={() => {
                      onOpenSettings();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-[var(--text-muted)]" />
                    <span>Google Sheet / Sync Settings</span>
                  </button>

                  {/* 6. Theme (Light / Dark Mode) */}
                  <button
                    type="button"
                    onClick={() => {
                      onToggleDarkMode();
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      {isDarkMode ? (
                        <Sun className="w-4 h-4 text-[var(--accent-gold)]" />
                      ) : (
                        <Moon className="w-4 h-4 text-[var(--accent-gold)]" />
                      )}
                      <span>Theme</span>
                    </span>
                    <span className="text-[10px] font-semibold text-[var(--text-muted)] bg-[var(--bg-elevated)] px-2 py-0.5 rounded border border-[var(--border)]">
                      {isDarkMode ? 'Dark' : 'Light'}
                    </span>
                  </button>

                  {/* 7. Note Statistics */}
                  <button
                    type="button"
                    onClick={() => {
                      onOpenStats();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                  >
                    <BarChart3 className="w-4 h-4 text-[#10B981]" />
                    <span>Note Statistics</span>
                  </button>

                  <div className="my-1.5 border-t border-[var(--border)]" />

                  {/* 8. Check Update at the VERY BOTTOM of the 3-dot menu */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onCheckUpdate();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-[var(--accent-gold)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                  >
                    <DownloadCloud className="w-4 h-4 text-[var(--accent-gold)]" />
                    <span>Check Update</span>
                  </button>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* 2. App logo */}
            <div className="w-9 h-9 rounded-full bg-[#D4AF37] text-[#14241D] font-black text-sm flex items-center justify-center select-none shadow-sm shrink-0">
              AG
            </div>

            {/* 3. App name */}
            <span className="text-sm sm:text-base font-black tracking-tight text-[var(--text-primary)] select-none truncate">
              AG Notepad
            </span>
          </div>

          {/* Right: 4. Sync button */}
          {onSyncSheets && (
            <button
              type="button"
              onClick={onSyncSheets}
              disabled={isSyncingSheets}
              title="Sync with Google Sheets"
              className="px-3 py-1.5 bg-[var(--accent-gold)]/15 hover:bg-[var(--accent-gold)]/25 text-[var(--accent-gold)] rounded-xl border border-[var(--accent-gold)]/40 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer disabled:opacity-50 select-none shadow-xs shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#10B981] ${isSyncingSheets ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
