import React, { useState, useRef, useEffect } from 'react';
import {
  MoreVertical,
  Trash2,
  FolderCog,
  LayoutGrid,
  List as ListIcon,
  DownloadCloud,
  Layers,
  BarChart3,
  Palette,
  ChevronRight,
} from 'lucide-react';
import { ViewMode } from '../types/note';

import {
  ColorThemeId,
  CLASSIC_THEMES,
  CLASSIC_THEMES as APP_THEMES,
} from '../config/themes';

export type { ColorThemeId };
export { APP_THEMES, CLASSIC_THEMES };

interface NavbarProps {
  viewMode: ViewMode;
  onToggleViewMode: () => void;
  isDarkMode: boolean;
  colorTheme: ColorThemeId;
  onOpenThemeModal: () => void;
  isTrashView: boolean;
  trashNotesCount: number;
  onToggleTrashView: (showTrash: boolean) => void;
  onOpenCategoryModal: () => void;
  onOpenStats: () => void;
  onCheckUpdate: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  onToggleViewMode,
  isDarkMode,
  colorTheme,
  onOpenThemeModal,
  isTrashView,
  trashNotesCount,
  onToggleTrashView,
  onOpenCategoryModal,
  onOpenStats,
  onCheckUpdate,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const activeThemeMeta = APP_THEMES.find((t) => t.id === colorTheme) || APP_THEMES[0];

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
                <div className="absolute left-0 top-full mt-2 w-64 max-h-[82vh] overflow-y-auto bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* Section 1: Workspace */}
                  <div className="px-4 pt-1 pb-1 text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">
                    Notes &amp; View
                  </div>

                  {isTrashView && (
                    <button
                      type="button"
                      onClick={() => {
                        onToggleTrashView(false);
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-[var(--accent-gold)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                    >
                      <Layers className="w-4 h-4 text-[#10B981] shrink-0" />
                      <span>All Notes</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      onToggleViewMode();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      {viewMode === 'grid' ? (
                        <ListIcon className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                      ) : (
                        <LayoutGrid className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                      )}
                      <span>{viewMode === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}</span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onOpenCategoryModal();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                  >
                    <FolderCog className="w-4 h-4 text-[var(--accent-gold)] shrink-0" />
                    <span>Manage Categories</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onToggleTrashView(!isTrashView);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2 text-xs font-bold transition-colors cursor-pointer ${
                      isTrashView
                        ? 'text-rose-500 bg-rose-500/10'
                        : 'text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Trash2 className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>Trash / Recycle Bin</span>
                    </span>
                    <span className="text-[10px] font-mono bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded border border-[var(--border)] text-[var(--text-muted)]">
                      {trashNotesCount}
                    </span>
                  </button>

                  {/* Section 2: Preferences & Stats */}
                  <div className="my-1.5 border-t border-[var(--border)]" />
                  <div className="px-4 pt-1 pb-1 text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">
                    Preferences
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenThemeModal();
                    }}
                    className="w-full flex items-center justify-between px-4 py-2 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <Palette className="w-4 h-4 text-[var(--accent-gold)] shrink-0" />
                      <span>Theme</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[var(--text-muted)]">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/15"
                        style={{ backgroundColor: activeThemeMeta.swatch }}
                      />
                      <span>{isDarkMode ? 'Dark' : 'Light'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onOpenStats();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                  >
                    <BarChart3 className="w-4 h-4 text-[#10B981] shrink-0" />
                    <span>Note Statistics</span>
                  </button>

                  {/* Very Bottom: Check Update */}
                  <div className="my-1.5 border-t border-[var(--border)]" />
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onCheckUpdate();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-[var(--accent-gold)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                  >
                    <DownloadCloud className="w-4 h-4 text-[var(--accent-gold)] shrink-0" />
                    <span>Check Update</span>
                  </button>
                </div>
              )}

            </div>

            {/* 2. App logo */}
            <img
              src="/app-logo.png"
              alt="AG Notepad Logo"
              className="w-9 h-9 rounded-full object-cover select-none shadow-sm shrink-0"
            />

            {/* 3. App name */}
            <span className="text-sm sm:text-base font-black tracking-tight text-[var(--text-primary)] select-none truncate">
              AG Notepad
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
