import React from 'react';
import { Folder, Trash2, X, CheckSquare, Palette } from 'lucide-react';
import { NoteColor, NOTE_COLORS } from '../types/note';

interface FloatingBatchBarProps {
  selectedCount: number;
  onClear: () => void;
  onAssignCategory: () => void;
  onAssignColor: (color: NoteColor) => void;
  onDelete: () => void;
}

export const FloatingBatchBar: React.FC<FloatingBatchBarProps> = ({
  selectedCount,
  onClear,
  onAssignCategory,
  onAssignColor,
  onDelete,
}) => {
  const [showColorPicker, setShowColorPicker] = React.useState(false);

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-xl animate-in slide-in-from-bottom-8 duration-300">
      <div className="bg-[#14241D] text-[#F0F7F4] rounded-2xl shadow-2xl p-3 sm:p-4 border border-[#2D4A3D] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37] text-[#14241D] flex items-center justify-center font-black shrink-0">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#F0F7F4]">
                {selectedCount}টি সিলেক্ট করা হয়েছে
              </div>
              <button 
                onClick={onClear}
                className="text-[10px] uppercase tracking-wider font-bold text-[#8DA89B] hover:text-[#F0F7F4] cursor-pointer transition-colors"
              >
                সব বাদ দিন (Deselect)
              </button>
            </div>
          </div>

          <button
            onClick={onClear}
            className="p-2 rounded-full hover:bg-[#244234] transition-colors cursor-pointer sm:hidden text-[#8DA89B]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-center relative">
          {/* Color Picker Popover */}
          {showColorPicker && (
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#162920] border border-[#2D4A3D] p-2.5 rounded-2xl shadow-2xl flex items-center gap-2 z-50 animate-in zoom-in-95 duration-150">
              {NOTE_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    onAssignColor(c.id);
                    setShowColorPicker(false);
                  }}
                  className={`w-6 h-6 rounded-full ${c.bgClass} hover:scale-125 transition-all cursor-pointer ring-2 ring-white/20`}
                  title={c.label}
                />
              ))}
            </div>
          )}

          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#162920] hover:bg-[#244234] border border-[#2D4A3D] rounded-xl text-xs font-bold text-[#D4AF37] transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Palette className="w-4 h-4 text-[#D4AF37]" />
            <span>রঙ দিন (Color)</span>
          </button>

          <button
            onClick={onAssignCategory}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#162920] hover:bg-[#244234] border border-[#2D4A3D] rounded-xl text-xs font-bold text-[#10B981] transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Folder className="w-4 h-4 text-[#10B981]" />
            <span>ক্যাটাগরি দিন</span>
          </button>
          
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800 text-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>মুছে ফেলুন</span>
          </button>

          <button
            onClick={onClear}
            className="hidden sm:flex p-2 rounded-xl hover:bg-[#244234] transition-colors cursor-pointer text-[#8DA89B]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
