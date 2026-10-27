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
  Lock,
  X,
} from 'lucide-react';
import { ViewMode, NOTE_COLORS } from '../types/note';
import { PWAInstallHeaderButton, PWAInstallBanner } from './PWAInstallBanner';

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
  activeColorFilter: string | null;
  onColorFilterChange: (color: string | null) => void;
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
  activeColorFilter,
  onColorFilterChange,
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
      <header className="fixed top-0 left-0 right-0 z-30 w-full bg-[var(--bg-card)]/90 backdrop-blur-md border-b border-[var(--border)]">
      {/* PWA Mobile App Install Top Banner */}
      <PWAInstallBanner />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Mobile Menu trigger & "AG Note" Circular App Icon */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="p-1.5 md:hidden text-[var(--text-primary)] hover:bg-[var(--border)] rounded-lg transition-colors cursor-pointer shrink-0"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            {/* The Logo: Circular badge */}
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[var(--accent-gold)] text-[var(--bg-main)] flex flex-col items-center justify-center shrink-0 select-none cursor-default shadow-md"
              title="AG Note"
            >
              <span className="text-[14px] font-black tracking-tight leading-none font-sans">
                AG
              </span>
            </div>

            <div className="leading-tight min-w-0">
              <h1 className="text-sm sm:text-base font-black tracking-tight text-[var(--text-primary)] truncate uppercase">
                NOTE
              </h1>
              <p className="text-[9px] sm:text-[10px] font-bold text-[var(--text-primary)]/70 hidden sm:block truncate uppercase tracking-wider">
                Smart & Secure Notepad
              </p>
            </div>
          </div>
        </div>

        {/* Zone 2: Desktop Search Bar with Color Filter */}
        <div className="flex-1 max-w-sm hidden sm:flex items-center gap-2 mx-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-primary)]/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-9 pr-7 py-2 bg-[var(--bg-main)] border border-[var(--border)] focus:border-[var(--accent-gold)] rounded-xl text-sm focus:outline-none text-[var(--text-primary)] placeholder-[var(--text-primary)]/70 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-primary)]/70 hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {/* Color Filter Dropdown */}
          <select
            value={activeColorFilter || ''}
            onChange={(e) => onColorFilterChange(e.target.value as any || null)}
            className="p-2 bg-[var(--bg-main)] border border-[var(--border)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)] cursor-pointer"
            title="Filter by color"
          >
            <option value="">All</option>
            {NOTE_COLORS.map(c => (
                <option key={c.id} value={c.id}>● {c.label}</option>
            ))}
          </select>
        </div>

        {/* Zone 3: Actions (No + button in header as requested) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* PWA App Install Button */}
          <PWAInstallHeaderButton />

          {/* Quick Lock All button if any notes are unlocked */}
          {unlockedCount > 0 && onLockAll && (
            <button
              type="button"
              onClick={onLockAll}
              title={`Lock ${unlockedCount} unlocked note${unlockedCount > 1 ? 's' : ''}`}
              className="px-2.5 py-1.5 text-xs font-semibold text-[var(--accent-gold)] bg-[var(--accent-gold)]/20 hover:bg-[var(--accent-gold)]/30 rounded-lg sm:rounded-xl border border-[var(--accent-gold)]/50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lock All</span>
              <span className="text-[10px] bg-[var(--accent-gold)]/50 px-1.5 py-0.2 rounded-full font-mono">
                {unlockedCount}
              </span>
            </button>
          )}

          {/* View Mode Toggle */}
          <button
            type="button"
            onClick={onToggleViewMode}
            title={viewMode === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}
            className="p-1.5 sm:p-2 text-[var(--text-primary)] hover:bg-[var(--border)] rounded-lg sm:rounded-xl border border-[var(--border)] transition-colors cursor-pointer"
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
            className="hidden md:flex p-2 text-[var(--text-primary)] hover:bg-[var(--border)] rounded-xl border border-[var(--border)] transition-colors items-center gap-1.5 text-xs font-black uppercase tracking-widest cursor-pointer"
          >
            <Download className="w-4 h-4 text-[var(--text-primary)]" />
            <span className="hidden lg:inline">Backup</span>
          </button>

          {/* Restore Button (Desktop/Tablet) */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Import JSON Backup file"
            className="hidden md:flex p-2 text-[var(--text-primary)] hover:bg-[var(--border)] rounded-xl border border-[var(--border)] transition-colors items-center gap-1.5 text-xs font-black uppercase tracking-widest cursor-pointer"
          >
            <Upload className="w-4 h-4 text-[var(--text-primary)]" />
            <span className="hidden lg:inline">Restore</span>
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
      
      {/* Mobile Search Bar Row - updated to use variables */}
      <div className="px-3 pb-2 sm:hidden flex gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-primary)]/70" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-8 pr-7 py-1.5 bg-[var(--bg-main)] border border-[var(--border)] rounded-lg text-xs focus:outline-none text-[var(--text-primary)] placeholder-[var(--text-primary)]/70"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-primary)]/70 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        {/* Mobile Color Filter Dropdown */}
        <select
          value={activeColorFilter || ''}
          onChange={(e) => onColorFilterChange(e.target.value as any || null)}
          className="p-1.5 bg-[var(--bg-main)] border border-[var(--border)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none cursor-pointer"
          title="Filter by color"
        >
          <option value="">All</option>
          {NOTE_COLORS.map(c => (
              <option key={c.id} value={c.id}>● {c.label}</option>
          ))}
        </select>
      </div>
    </header>
  );
};
