import React, { useRef } from 'react';
import {
  Search,
  Download,
  Upload,
  LayoutGrid,
  List as ListIcon,
  Menu,
  Lock,
  X,
  Settings,
  Plus,
} from 'lucide-react';
import { ViewMode, NOTE_COLORS } from '../types/note';
import { PWAInstallHeaderButton } from './PWAInstallBanner';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  viewMode: ViewMode;
  onToggleViewMode: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenNewNote?: () => void;
  onExportNotes: () => void;
  onImportNotes: (file: File) => void;
  onToggleMobileMenu: () => void;
  unlockedCount?: number;
  onLockAll?: () => void;
  activeColorFilter: string | null;
  onColorFilterChange: (color: string | null) => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onToggleViewMode,
  onOpenNewNote,
  onExportNotes,
  onImportNotes,
  onToggleMobileMenu,
  unlockedCount = 0,
  onLockAll,
  activeColorFilter,
  onColorFilterChange,
  onOpenSettings,
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
    <header className="fixed top-0 left-0 right-0 z-40 w-full bg-[#162920]/95 backdrop-blur-md border-b border-[#2D4A3D] shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        {/* Main Header Bar */}
        <div className="h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Mobile Menu Toggle, AG Logo & App Title */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Mobile Sidebar Hamburger */}
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className="p-2 md:hidden text-[#8DA89B] hover:text-[#F0F7F4] hover:bg-[#244234] rounded-xl transition-colors cursor-pointer"
              aria-label="Open Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo Badge */}
            <div
              onClick={onOpenSettings}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#D4AF37] text-[#14241D] font-black text-sm sm:text-base flex items-center justify-center select-none shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Settings"
            >
              AG
            </div>

            {/* Brand Title */}
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-black tracking-tight text-[#F0F7F4] uppercase select-none">
                AG NOTEPAD
              </span>
              <span className="text-[10px] text-[#D4AF37] font-semibold tracking-wider">
                Smart Offline Notepad
              </span>
            </div>
          </div>

          {/* Center: Search & Filter (Desktop/Tablet) */}
          <div className="hidden sm:flex flex-1 max-w-md items-center gap-2 mx-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8DA89B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search notes..."
                className="w-full pl-9 pr-7 py-2 bg-[#12211A] border border-[#2D4A3D] focus:border-[#D4AF37] rounded-xl text-xs text-[#F0F7F4] placeholder-[#8DA89B] focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8DA89B] hover:text-[#F0F7F4] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Color Filter */}
            <select
              value={activeColorFilter || ''}
              onChange={(e) => onColorFilterChange((e.target.value as any) || null)}
              className="py-2 px-2.5 bg-[#12211A] border border-[#2D4A3D] rounded-xl text-xs text-[#F0F7F4] focus:outline-none focus:border-[#D4AF37] cursor-pointer shrink-0"
              title="Filter by color"
            >
              <option value="">All Colors</option>
              {NOTE_COLORS.map((c) => (
                <option key={c.id} value={c.id}>
                  ● {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick New Note Button (Desktop) */}
            {onOpenNewNote && (
              <button
                type="button"
                onClick={onOpenNewNote}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#14241D] rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>New Note</span>
              </button>
            )}

            {/* Lock All button if any notes are unlocked */}
            {unlockedCount > 0 && onLockAll && (
              <button
                type="button"
                onClick={onLockAll}
                title={`Lock ${unlockedCount} unlocked note${unlockedCount > 1 ? 's' : ''}`}
                className="px-2.5 py-1.5 text-xs font-semibold text-[#D4AF37] bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 rounded-xl border border-[#D4AF37]/40 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lock All</span>
                <span className="text-[10px] bg-[#D4AF37]/30 px-1.5 py-0.2 rounded-full font-mono">
                  {unlockedCount}
                </span>
              </button>
            )}

            {/* View Mode Toggle */}
            <button
              type="button"
              onClick={onToggleViewMode}
              title={viewMode === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}
              className="p-2 text-[#8DA89B] hover:text-[#F0F7F4] hover:bg-[#244234] rounded-xl border border-[#2D4A3D] transition-colors cursor-pointer"
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
              className="hidden md:flex p-2 text-[#8DA89B] hover:text-[#F0F7F4] hover:bg-[#244234] rounded-xl border border-[#2D4A3D] transition-colors items-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#D4AF37]" />
              <span className="hidden lg:inline">Backup</span>
            </button>

            {/* Restore Button (Desktop/Tablet) */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Import JSON Backup file"
              className="hidden md:flex p-2 text-[#8DA89B] hover:text-[#F0F7F4] hover:bg-[#244234] rounded-xl border border-[#2D4A3D] transition-colors items-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#10B981]" />
              <span className="hidden lg:inline">Restore</span>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </button>

            {/* PWA Install Button (shows if not yet installed) */}
            <PWAInstallHeaderButton />

            {/* Settings Button */}
            <button
              type="button"
              onClick={onOpenSettings}
              title="Settings"
              className="p-2 text-[#8DA89B] hover:text-[#D4AF37] hover:bg-[#244234] rounded-xl border border-[#2D4A3D] hover:border-[#D4AF37]/40 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Search & Color Filter Row */}
        <div className="pb-2.5 sm:hidden flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8DA89B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-8 pr-7 py-1.5 bg-[#12211A] border border-[#2D4A3D] rounded-lg text-xs text-[#F0F7F4] placeholder-[#8DA89B] focus:outline-none focus:border-[#D4AF37]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8DA89B] cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <select
            value={activeColorFilter || ''}
            onChange={(e) => onColorFilterChange((e.target.value as any) || null)}
            className="p-1.5 bg-[#12211A] border border-[#2D4A3D] rounded-lg text-xs text-[#F0F7F4] focus:outline-none cursor-pointer shrink-0"
            title="Filter by color"
          >
            <option value="">All</option>
            {NOTE_COLORS.map((c) => (
              <option key={c.id} value={c.id}>
                ● {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};
