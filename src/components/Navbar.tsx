import React, { useRef } from 'react';
import {
  Search,
  Download,
  Upload,
  Sun,
  Moon,
  LayoutGrid,
  List as ListIcon,
  Menu,
  X,
  Lock,
} from 'lucide-react';
import { ViewMode } from '../types/note';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  viewMode: ViewMode;
  onToggleViewMode: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenNewNote: () => void;
  onExportNotes: () => void;
  onImportNotes: (file: File) => void;
  onToggleMobileMenu: () => void;
  unlockedCount?: number;
  onLockAll?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onToggleViewMode,
  isDarkMode,
  onToggleDarkMode,
  onExportNotes,
  onImportNotes,
  onToggleMobileMenu,
  unlockedCount = 0,
  onLockAll,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportNotes(file);
      e.target.value = '';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Mobile Menu trigger & "AG Note" Circular App Icon */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="p-1.5 md:hidden text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            {/* The Logo: Circular badge with text "AG Note" inside as explicitly requested */}
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 text-white flex flex-col items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm ring-2 ring-blue-500/20 shrink-0 select-none cursor-default"
              title="AG Note"
            >
              <span className="text-[11px] font-black tracking-tight leading-none text-white font-sans">
                AG
              </span>
              <span className="text-[8px] font-bold tracking-wider leading-none text-blue-200 uppercase mt-0.5">
                Note
              </span>
            </div>

            <div className="leading-tight min-w-0">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate">
                AG Note
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block truncate">
                Smart & Secure Notepad
              </p>
            </div>
          </div>
        </div>

        {/* Zone 2: Desktop Search Bar */}
        <div className="flex-1 max-w-sm hidden sm:block mx-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-9 pr-7 py-1.5 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Zone 3: Actions (No + button in header as requested) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Quick Lock All button if any notes are unlocked */}
          {unlockedCount > 0 && onLockAll && (
            <button
              type="button"
              onClick={onLockAll}
              title={`Lock ${unlockedCount} unlocked note${unlockedCount > 1 ? 's' : ''}`}
              className="px-2.5 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 rounded-lg sm:rounded-xl border border-amber-200 dark:border-amber-900/40 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lock All</span>
              <span className="text-[10px] bg-amber-200/80 dark:bg-amber-900/80 px-1.5 py-0.2 rounded-full font-mono">
                {unlockedCount}
              </span>
            </button>
          )}

          {/* View Mode Toggle */}
          <button
            type="button"
            onClick={onToggleViewMode}
            title={viewMode === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}
            className="p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
          >
            {viewMode === 'grid' ? (
              <ListIcon className="w-4 h-4" />
            ) : (
              <LayoutGrid className="w-4 h-4" />
            )}
          </button>

          {/* Backup Button (Desktop/Tablet) */}
          <button
            type="button"
            onClick={onExportNotes}
            title="Download JSON Backup"
            className="hidden md:flex p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-500" />
            <span className="hidden lg:inline">Backup</span>
          </button>

          {/* Restore Button (Desktop/Tablet) */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Import JSON Backup file"
            className="hidden md:flex p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <Upload className="w-4 h-4 text-emerald-500" />
            <span className="hidden lg:inline">Restore</span>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </button>

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar Row */}
      <div className="px-3 pb-2 sm:hidden">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-8 pr-7 py-1.5 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-lg text-xs focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
