import React from 'react';
import { X, Palette, Sun, Moon, Check } from 'lucide-react';
import { CLASSIC_THEMES, ColorThemeId, findClassicTheme } from '../config/themes';

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

  const activeTheme = findClassicTheme(colorTheme);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/30 flex items-center justify-center">
              <Palette className="w-4 h-4 text-[var(--accent-gold)]" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--text-primary)] text-sm sm:text-base leading-tight">
                Theme &amp; Display
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                Customize display mode &amp; classic color themes
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
        <div className="p-4 sm:p-5 space-y-5 overflow-y-auto">
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

          {/* Part 2: Classic Themes Swatch Grid (31 swatches) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="block text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">
                Classic Themes
              </span>
              {activeTheme && (
                <span className="text-[11px] font-semibold text-[var(--text-primary)] truncate">
                  {activeTheme.label}
                </span>
              )}
            </div>

            <div
              className="grid grid-cols-5 min-[380px]:grid-cols-6 gap-2.5 p-2.5 rounded-2xl bg-[var(--bg-elevated)]/60 border border-[var(--border)]"
              role="radiogroup"
              aria-label="Classic Themes"
            >
              {CLASSIC_THEMES.map((theme) => {
                const active = colorTheme === theme.id;
                const isLightNeutral = theme.id === 'cool-mist';

                return (
                  <button
                    key={theme.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    aria-label={theme.label}
                    title={theme.label}
                    onClick={() => onSelectColorTheme(theme.id)}
                    className={`group relative aspect-square w-full rounded-xl overflow-hidden transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)] ${
                      active
                        ? 'ring-2 ring-[var(--accent-gold)] ring-offset-2 ring-offset-[var(--bg-card)] scale-[1.04] shadow-md'
                        : 'hover:scale-[1.04] active:scale-95 ring-1 ring-inset ring-black/15 dark:ring-white/15'
                    }`}
                  >
                    {theme.type === 'solid' ? (
                      <span
                        className="block w-full h-full"
                        style={{ backgroundColor: theme.topColor }}
                      />
                    ) : (
                      <span className="flex flex-col w-full h-full">
                        <span
                          className="w-full h-1/2"
                          style={{ backgroundColor: theme.topColor }}
                        />
                        <span
                          className="w-full h-1/2"
                          style={{ backgroundColor: theme.bottomColor }}
                        />
                      </span>
                    )}

                    {/* Inner subtle border for light neutral Cool Mist swatch */}
                    {isLightNeutral && (
                      <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-black/15" />
                    )}

                    {/* Active checkmark badge */}
                    {active && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/15">
                        <span className="w-5 h-5 rounded-full bg-white text-slate-900 shadow-sm flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[var(--bg-elevated)] border-t border-[var(--border)] flex justify-end shrink-0">
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
