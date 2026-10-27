import React, { useRef } from 'react';
import {
  Download,
  Upload,
  LayoutGrid,
  List as ListIcon,
  Menu,
  Lock,
  Plus,
} from 'lucide-react';
import { ViewMode } from '../types/note';
import { PWAInstallHeaderButton } from './PWAInstallBanner';
import { SearchWithColorFilter } from './SearchWithColorFilter';

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
  onToggleMobileMenu?: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  unlockedCount?: number;
  onLockAll?: () => void;
  activeColorFilter: string | null;
  onColorFilterChange: (color: string | null) => void;
  onOpenSettings?: () => void;
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
  isSidebarOpen = true,
  onToggleSidebar,
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

  const handleToggleMenu = () => {
    if (onToggleSidebar) onToggleSidebar();
    else if (onToggleMobileMenu) onToggleMobileMenu();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#162920]/95 backdrop-blur-md border-b border-[#2D4A3D] shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        {/* Main Header Bar */}
        <div className="h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Menu Toggle for ALL Screens, AG Logo & App Title */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Sidebar Toggle for ALL Screens (Desktop, Tablet & Mobile) */}
            <button
              type="button"
              onClick={handleToggleMenu}
              className={`p-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center ${
                isSidebarOpen
                  ? 'text-[#D4AF37] bg-[#244234] hover:bg-[#2d5240] ring-1 ring-[#D4AF37]/30'
                  : 'text-[#8DA89B] hover:text-[#F0F7F4] hover:bg-[#244234]'
              }`}
              title={isSidebarOpen ? "মেনু লুকান (Hide Menu)" : "মেনু দেখান (Show Menu)"}
              aria-label={isSidebarOpen ? "Hide Menu" : "Show Menu"}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo Badge */}
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#D4AF37] text-[#14241D] font-black text-sm sm:text-base flex items-center justify-center select-none shadow-md"
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

          {/* Center: Search & Direct Color Filter (Desktop/Tablet) */}
          <div className="hidden sm:flex flex-1 max-w-md items-center mx-2">
            <SearchWithColorFilter
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              activeColor={activeColorFilter}
              onColorChange={onColorFilterChange}
              isMobile={false}
            />
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
          </div>
        </div>

        {/* Mobile Search & Color Filter Row */}
        <div className="pb-2.5 sm:hidden">
          <SearchWithColorFilter
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            activeColor={activeColorFilter}
            onColorChange={onColorFilterChange}
            isMobile={true}
          />
        </div>
      </div>
    </header>
  );
};
