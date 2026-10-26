import React from 'react';
import { FileText, Folder, Search, Trash2, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';

interface MobileBottomNavProps {
  activeCategory: string;
  isTrashView: boolean;
  onSelectAllNotes: () => void;
  onOpenCategories: () => void;
  onFocusSearch: () => void;
  onSelectTrash: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeCategory,
  isTrashView,
  onSelectAllNotes,
  onOpenCategories,
  onFocusSearch,
  onSelectTrash,
}) => {
  const { isInstalled, isInstallable, install } = usePWAInstall();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-lg safe-area-bottom">
      {/* 1. All Notes */}
      <button
        type="button"
        onClick={onSelectAllNotes}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors cursor-pointer ${
          !isTrashView && activeCategory === 'all'
            ? 'text-blue-600 dark:text-blue-400 font-bold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
        }`}
      >
        <FileText className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] leading-none">নোটস</span>
      </button>

      {/* 2. Categories */}
      <button
        type="button"
        onClick={onOpenCategories}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors cursor-pointer ${
          !isTrashView && activeCategory !== 'all'
            ? 'text-blue-600 dark:text-blue-400 font-bold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
        }`}
      >
        <Folder className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] leading-none">ক্যাটাগরি</span>
      </button>

      {/* 3. Search */}
      <button
        type="button"
        onClick={onFocusSearch}
        className="flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
      >
        <Search className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] leading-none">খুঁজুন</span>
      </button>

      {/* 4. Trash */}
      <button
        type="button"
        onClick={onSelectTrash}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors cursor-pointer ${
          isTrashView
            ? 'text-red-600 dark:text-red-400 font-bold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
        }`}
      >
        <Trash2 className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] leading-none">ট্র্যাশ</span>
      </button>

      {/* 5. Install App (If not running in standalone mode) */}
      {!isInstalled && (
        <button
          type="button"
          onClick={async () => {
            if (isInstallable) {
              await install();
            } else {
              // Dispatch click to open install modal
              const event = new CustomEvent('open-pwa-guide');
              window.dispatchEvent(event);
            }
          }}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 cursor-pointer"
        >
          <div className="relative">
            <Smartphone className="w-5 h-5 mb-0.5 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-500" />
          </div>
          <span className="text-[10px] leading-none font-semibold">অ্যাপ ইনস্টল</span>
        </button>
      )}
    </nav>
  );
};
