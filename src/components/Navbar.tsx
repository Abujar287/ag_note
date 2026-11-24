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
} from 'lucide-react';
import { ViewMode } from '../types/note';

interface NavbarProps {
  viewMode: ViewMode;
  onToggleViewMode: () => void;
  isTrashView: boolean;
  trashNotesCount: number;
  onToggleTrashView: (showTrash: boolean) => void;
  onOpenCategoryModal: () => void;
  onExportNotes: () => void;
  onImportNotes: (file: File) => void;
  onOpenSettings: () => void;
  onSyncSheets?: () => void;
  isSyncingSheets?: boolean;
  onCheckUpdate: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  onToggleViewMode,
  isTrashView,
  trashNotesCount,
  onToggleTrashView,
  onOpenCategoryModal,
  onExportNotes,
  onImportNotes,
  onOpenSettings,
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
    <header className="sticky top-0 z-40 w-full bg-[#162920]/95 backdrop-blur-md border-b border-[#2D4A3D] shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="h-14 sm:h-16 flex items-center justify-between gap-3">
          {/* Left: 1. 3-dot menu, 2. App logo, 3. App name */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* 1. 3-dot menu */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="p-2 rounded-xl text-[#8DA89B] hover:text-[#F0F7F4] hover:bg-[#244234] transition-colors cursor-pointer flex items-center justify-center"
                title="Menu"
                aria-label="Open menu"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {isMenuOpen && (
                <div className="absolute left-0 top-full mt-2 w-56 bg-[#162920] border border-[#2D4A3D] rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      onToggleTrashView(false);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                      !isTrashView
                        ? 'text-[#D4AF37] bg-[#244234]/60'
                        : 'text-[#F0F7F4] hover:bg-[#244234]'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Layers className="w-4 h-4 text-[#10B981]" />
                      <span>All Notes</span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onToggleTrashView(true);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                      isTrashView
                        ? 'text-rose-300 bg-rose-950/50'
                        : 'text-[#F0F7F4] hover:bg-[#244234]'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Trash2 className="w-4 h-4 text-rose-400" />
                      <span>Trash Bin</span>
                    </span>
                    <span className="text-[10px] font-mono bg-[#14241D] px-1.5 py-0.5 rounded border border-[#2D4A3D] text-[#8DA89B]">
                      {trashNotesCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onOpenCategoryModal();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-[#F0F7F4] hover:bg-[#244234] transition-colors cursor-pointer"
                  >
                    <FolderCog className="w-4 h-4 text-[#D4AF37]" />
                    <span>Manage Categories</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onToggleViewMode();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-[#F0F7F4] hover:bg-[#244234] transition-colors cursor-pointer"
                  >
                    {viewMode === 'grid' ? (
                      <ListIcon className="w-4 h-4 text-[#8DA89B]" />
                    ) : (
                      <LayoutGrid className="w-4 h-4 text-[#8DA89B]" />
                    )}
                    <span>{viewMode === 'grid' ? 'List View' : 'Grid View'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onExportNotes();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-[#F0F7F4] hover:bg-[#244234] transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[#D4AF37]" />
                    <span>Export Backup</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      fileInputRef.current?.click();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-[#F0F7F4] hover:bg-[#244234] transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-[#10B981]" />
                    <span>Restore Backup</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onOpenSettings();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-[#F0F7F4] hover:bg-[#244234] transition-colors cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-[#8DA89B]" />
                    <span>Settings</span>
                  </button>

                  <div className="my-1.5 border-t border-[#2D4A3D]" />

                  {/* Check Update at the VERY BOTTOM of the 3-dot menu */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onCheckUpdate();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-[#D4AF37] hover:bg-[#244234] transition-colors cursor-pointer"
                  >
                    <DownloadCloud className="w-4 h-4 text-[#D4AF37]" />
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
            <div className="w-9 h-9 rounded-full bg-[#D4AF37] text-[#14241D] font-black text-sm flex items-center justify-center select-none shadow-md shrink-0">
              AG
            </div>

            {/* 3. App name */}
            <span className="text-sm sm:text-base font-black tracking-tight text-[#F0F7F4] uppercase select-none truncate">
              AG NOTEPAD
            </span>
          </div>

          {/* Right: 4. Sync button */}
          {onSyncSheets && (
            <button
              type="button"
              onClick={onSyncSheets}
              disabled={isSyncingSheets}
              title="Sync"
              className="px-3 py-1.5 bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#D4AF37] rounded-xl border border-[#D4AF37]/40 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer disabled:opacity-50 select-none shadow-xs shrink-0"
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
