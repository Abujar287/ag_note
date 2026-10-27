import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, X, ChevronDown, RotateCcw } from 'lucide-react';
import { NoteColor, NOTE_COLORS } from '../types/note';

export const COLOR_SWATCHES: { id: NoteColor; hex: string }[] = [
  { id: 'blue', hex: '#3B82F6' },
  { id: 'emerald', hex: '#10B981' },
  { id: 'amber', hex: '#F59E0B' },
  { id: 'rose', hex: '#F43F5E' },
  { id: 'purple', hex: '#A855F7' },
  { id: 'cyan', hex: '#06B6D4' },
  { id: 'slate', hex: '#64748B' },
];

interface ColorFilterPickerProps {
  activeColor: string | null;
  onColorChange: (color: string | null) => void;
  isMobile?: boolean;
}

export const ColorFilterPicker: React.FC<ColorFilterPickerProps> = ({
  activeColor,
  onColorChange,
  isMobile = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const activeSwatch = COLOR_SWATCHES.find((c) => c.id === activeColor);

  return (
    <div className="relative shrink-0" ref={containerRef}>
      {/* Trigger Button */}
      {activeColor && activeSwatch ? (
        // When a color is actively selected: Show the active color dot + clear button
        <div className="flex items-center bg-[#12211A] border border-[#D4AF37]/70 rounded-xl p-0.5 shadow-xs">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 ${
              isMobile ? 'py-1 px-2 text-xs' : 'py-1.5 px-2.5 text-xs'
            } font-bold text-[#F0F7F4] hover:bg-[#1C3527] rounded-lg transition-colors cursor-pointer`}
            title="রঙ ফিল্টার পরিবর্তন করুন"
          >
            {/* Visual Color Dot */}
            <span
              className="w-4 h-4 rounded-full shadow-xs shrink-0 ring-1 ring-white/50 flex items-center justify-center"
              style={{ backgroundColor: activeSwatch.hex }}
            >
              <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
            </span>
            <ChevronDown className="w-3 h-3 text-[#D4AF37]" />
          </button>

          {/* Quick Clear Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onColorChange(null);
            }}
            className="p-1 hover:bg-[#2D4A3D] text-[#8DA89B] hover:text-[#F0F7F4] rounded-lg transition-colors cursor-pointer mr-0.5"
            title="ফিল্টার মুছে ফেলুন (সব নোট দেখান)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        // When no color is selected: Show Palette Icon + 3 preview dots
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex items-center gap-1.5 ${
            isMobile ? 'py-1.5 px-2.5 text-xs' : 'py-2 px-3 text-xs'
          } bg-[#12211A] border border-[#2D4A3D] hover:border-[#D4AF37] text-[#8DA89B] hover:text-[#F0F7F4] rounded-xl transition-all cursor-pointer shadow-xs active:scale-95`}
          title="রঙ দিয়ে নোট ফিল্টার করুন"
        >
          <Palette className="w-4 h-4 text-[#D4AF37] shrink-0" />
          {/* Mini preview dots */}
          <span className="flex items-center gap-1 shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="w-2 h-2 rounded-full bg-[#F43F5E]" />
          </span>
          <ChevronDown className="w-3 h-3 text-[#8DA89B]" />
        </button>
      )}

      {/* Floating Visual Color Swatches Popover */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-64 bg-[#162920] border border-[#2D4A3D] rounded-2xl shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#2D4A3D]/70 text-[11px] font-bold text-[#8DA89B]">
            <span className="flex items-center gap-1 text-[#F0F7F4]">
              <Palette className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>রঙ নির্বাচন করুন</span>
            </span>
            {activeColor && (
              <button
                type="button"
                onClick={() => {
                  onColorChange(null);
                  setIsOpen(false);
                }}
                className="text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>সব দেখান</span>
              </button>
            )}
          </div>

          {/* Reset / All Button */}
          <button
            type="button"
            onClick={() => {
              onColorChange(null);
              setIsOpen(false);
            }}
            className={`w-full mb-3 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer border ${
              activeColor === null
                ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]'
                : 'bg-[#12211A] border-[#2D4A3D] text-[#8DA89B] hover:text-[#F0F7F4] hover:bg-[#1C3527]'
            }`}
          >
            <span className="flex items-center gap-2">
              {/* Rainbow multi-dot icon */}
              <span className="flex items-center -space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] ring-1 ring-[#162920]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] ring-1 ring-[#162920]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] ring-1 ring-[#162920]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E] ring-1 ring-[#162920]" />
              </span>
              <span>সকল রঙ (All Notes)</span>
            </span>
            {activeColor === null && <Check className="w-3.5 h-3.5 text-[#D4AF37]" />}
          </button>

          {/* Direct Visual Color Dots (No English text names) */}
          <div className="grid grid-cols-4 gap-2.5 justify-items-center p-1 bg-[#12211A] rounded-xl border border-[#2D4A3D]">
            {COLOR_SWATCHES.map((swatch) => {
              const isSelected = activeColor === swatch.id;
              return (
                <button
                  key={swatch.id}
                  type="button"
                  onClick={() => {
                    // Toggle: If already selected, clear filter; otherwise select this color
                    onColorChange(isSelected ? null : swatch.id);
                    setIsOpen(false);
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-115 active:scale-90 cursor-pointer shadow-md ${
                    isSelected
                      ? 'ring-3 ring-white ring-offset-2 ring-offset-[#12211A] scale-110 shadow-lg'
                      : 'hover:opacity-100 opacity-90'
                  }`}
                  style={{ backgroundColor: swatch.hex }}
                  title={isSelected ? 'ফিল্টার বন্ধ করতে ক্লিক করুন' : 'এই রঙের নোটগুলো দেখুন'}
                >
                  {isSelected && <Check className="w-5 h-5 text-white stroke-[3] drop-shadow-md" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
