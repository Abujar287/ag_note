import React from 'react';
import { X, Palette, Sun, Moon, Check } from 'lucide-react';
import { APP_THEMES, ColorThemeId } from './Navbar';

interface ThemeModalProps {
  isOpen: boolean;
  isDarkMode: boolean;
  colorTheme: ColorThemeId;
  onSetDarkMode: (dark: boolean) => void;
  onSelectColorTheme: (theme: ColorThemeId) => void;
  onClose: () => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  isDarkMode,
  colorTheme,
  onSetDarkMode,
  onSelectColorTheme,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/30 flex items-center justify-center">
              <Palette className="w-4 h-4 text-[var(--accent-gold)]" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--text-primary)] text-sm sm:text-base leading-tight">
                Theme & Display
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                Customize display mode &amp; color palette
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1.5 rounded-lg hover:bg-[var(--border)]/40 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-5">
          {/* Part 1: Display Mode (Light / Dark) */}
          <div className="space-y-2">
            <span className="block text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">
              Display Mode
            </span>
            <div className="grid grid-cols-2 gap-2 bg-[var(--bg-elevated)] p-1.5 rounded-xl border border-[var(--border)]">
              <button
                type="button"
                onClick={() => onSetDarkMode(false)}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !isDarkMode
                    ? 'bg-[var(--accent-gold)] text-[var(--accent-contrast)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Light Mode</span>
              </button>
              <button
                type="button"
                onClick={() => onSetDarkMode(true)}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isDarkMode
                    ? 'bg-[var(--accent-gold)] text-[var(--accent-contrast)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Dark Mode</span>
              </button>
            </div>
          </div>

          {/* Part 2: Color Theme Palette */}
          <div className="space-y-2">
            <span className="block text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">
              Color Theme
            </span>
            <div className="space-y-1.5">
              {APP_THEMES.map((theme) => {
                const active = colorTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => onSelectColorTheme(theme.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      active
                        ? 'bg-[var(--bg-elevated)] border-[var(--accent-gold)] text-[var(--accent-gold)] shadow-xs'
                        : 'bg-[var(--bg-elevated)]/60 border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--accent-gold)]/50'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className="w-5 h-5 rounded-full border border-black/15 shadow-xs shrink-0"
                        style={{ backgroundColor: theme.swatch }}
                      />
                      <span>{theme.label}</span>
                    </span>
                    {active && <Check className="w-4 h-4 text-[var(--accent-gold)] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[var(--bg-elevated)] border-t border-[var(--border)] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-black uppercase tracking-wider text-[var(--accent-contrast)] bg-[var(--accent-gold)] rounded-xl shadow-sm transition-transform active:scale-95 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
