import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Check, Palette, RotateCcw } from 'lucide-react';
import { NoteColor } from '../types/note';

export const COLOR_SWATCHES: { id: NoteColor; hex: string }[] = [
  { id: 'blue', hex: '#3B82F6' },
  { id: 'emerald', hex: '#10B981' },
  { id: 'amber', hex: '#F59E0B' },
  { id: 'rose', hex: '#F43F5E' },
  { id: 'purple', hex: '#A855F7' },
  { id: 'cyan', hex: '#06B6D4' },
  { id: 'slate', hex: '#64748B' },
];

interface SearchWithColorFilterProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeColor: string | null;
  onColorChange: (color: string | null) => void;
  isMobile?: boolean;
  placeholder?: string;
}

export const SearchWithColorFilter: React.FC<SearchWithColorFilterProps> = ({
  searchQuery,
  onSearchChange,
  activeColor,
  onColorChange,
  isMobile = false,
  placeholder = 'Search notes...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const activeSwatch = COLOR_SWATCHES.find((c) => c.id === activeColor);

  const handleSelectColor = (colorId: string | null) => {
    onColorChange(colorId);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Search Bar Container - Clicking anywhere on this bar opens the color options underneath */}
      <div
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
        className={`relative flex items-center w-full bg-[#12211A] border transition-all rounded-xl cursor-text ${
          isOpen
            ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/50 shadow-lg'
            : activeColor
            ? 'border-[#D4AF37]/80 shadow-xs'
            : 'border-[#2D4A3D] hover:border-[#8DA89B]/50'
        }`}
      >
        {/* Left: Search Icon or Active Color Indicator */}
        <div className="pl-3 pr-2 flex items-center shrink-0">
          {activeSwatch ? (
            // Active color dot showing the currently filtered color
            <span
              className="w-4 h-4 rounded-full shadow-xs shrink-0 ring-2 ring-white/80 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
              style={{ backgroundColor: activeSwatch.hex }}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen((prev) => !prev);
              }}
              title="রঙ ফিল্টার পরিবর্তন করুন"
            >
              <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
            </span>
          ) : (
            <Search className="w-4 h-4 text-[#8DA89B]" />
          )}
        </div>

        {/* Input Field: Clicking or focusing reveals the color swatches below */}
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          placeholder={activeSwatch ? 'Search notes in selected color...' : placeholder}
          className={`w-full py-2 bg-transparent text-xs text-[#F0F7F4] placeholder-[#8DA89B] focus:outline-none ${
            isMobile ? 'text-[13px] py-1.5' : ''
          }`}
        />

        {/* Right Action Icons: Clear Text, Clear Color, and Palette Toggle */}
        <div className="pr-2 flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Clear text query */}
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                inputRef.current?.focus();
              }}
              className="p-1 text-[#8DA89B] hover:text-[#F0F7F4] rounded-md transition-colors cursor-pointer"
              title="সার্চ মুছুন"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Quick Clear Color filter if active */}
          {activeColor && (
            <button
              type="button"
              onClick={() => {
                onColorChange(null);
              }}
              className="p-1 text-[#D4AF37] hover:text-[#F0F7F4] hover:bg-[#1C3527] rounded-md transition-colors cursor-pointer"
              title="রঙ ফিল্টার বাতিল করুন (সব নোট দেখান)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Palette Icon Button to toggle color tray */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setIsOpen((prev) => !prev)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isOpen || activeColor
                ? 'text-[#D4AF37] bg-[#D4AF37]/15 ring-1 ring-[#D4AF37]/30'
                : 'text-[#8DA89B] hover:text-[#F0F7F4] hover:bg-[#1C3527]'
            }`}
            title="রঙ নির্বাচন করুন"
          >
            <Palette className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Dropdown Tray: Direct Visual Colors Right Underneath the Search Bar */}
      {isOpen && (
        <div
          className="absolute left-0 right-0 top-full mt-2 z-50 bg-[#162920] border border-[#2D4A3D] rounded-2xl shadow-2xl p-2.5 sm:p-3 animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {/* Header Row */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2D4A3D]/70 text-[11px] font-bold text-[#8DA89B]">
            <span className="flex items-center gap-1.5 text-[#F0F7F4]">
              <Palette className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>রঙ দিয়ে ফিল্টার করুন</span>
            </span>

            {activeColor && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelectColor(null)}
                className="text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer font-semibold text-[11px]"
              >
                <RotateCcw className="w-3 h-3" />
                <span>সব দেখান (All)</span>
              </button>
            )}
          </div>

          {/* Direct Visual Color Swatches Row (No English names!) */}
          <div className="flex items-center justify-between gap-1.5 sm:gap-2 px-1 py-1 overflow-x-auto no-scrollbar">
            {/* "All Notes" (সকল নোট) circle */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelectColor(null)}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleSelectColor(null);
              }}
              title="সকল নোট (All Notes)"
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md shrink-0 border ${
                activeColor === null
                  ? 'bg-[#D4AF37]/20 border-[#D4AF37] ring-2 ring-[#D4AF37] scale-105'
                  : 'bg-[#12211A] border-[#2D4A3D] hover:border-[#8DA89B] opacity-80 hover:opacity-100'
              }`}
            >
              {/* Rainbow multi-dot icon representing all colors */}
              <div className="flex flex-col items-center justify-center gap-0.5">
                <div className="flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                </div>
                <div className="flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F43F5E]" />
                </div>
              </div>
            </button>

            {/* 7 Direct Visual Color Circles: Blue, Emerald, Amber, Rose, Purple, Cyan, Slate */}
            {COLOR_SWATCHES.map((swatch) => {
              const isSelected = activeColor === swatch.id;
              return (
                <button
                  key={swatch.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    handleSelectColor(isSelected ? null : swatch.id);
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    handleSelectColor(isSelected ? null : swatch.id);
                  }}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md shrink-0 ${
                    isSelected
                      ? 'ring-3 ring-white ring-offset-2 ring-offset-[#162920] scale-110 shadow-lg'
                      : 'hover:scale-110 opacity-90 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: swatch.hex }}
                  title={isSelected ? 'ফিল্টার বন্ধ করতে ক্লিক করুন' : 'এই রঙের নোট ফিল্টার করুন'}
                >
                  {isSelected && (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[3] drop-shadow-md" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
