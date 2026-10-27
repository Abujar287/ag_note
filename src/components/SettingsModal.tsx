import React, { useState, useEffect } from 'react';
import { X, Settings, Link as LinkIcon, Save } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sheetUrl: string) => void;
  initialUrl: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, initialUrl }) => {
  const [sheetUrl, setSheetUrl] = useState(initialUrl);

  useEffect(() => {
    setSheetUrl(initialUrl);
  }, [initialUrl, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#14241D]/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-lg bg-[#162920] rounded-2xl shadow-2xl border border-[#244234] p-6 animate-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-[#F0F7F4] text-lg flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#D4AF37]" /> Settings
          </h3>
          <button onClick={onClose} className="text-[#8DA89B] hover:text-[#F0F7F4] p-1 rounded-full hover:bg-[#244234]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#8DA89B] uppercase tracking-wider mb-2">
              Google Sheet URL for Sync
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 absolute left-3 top-3 text-[#8DA89B]" />
              <input
                type="url"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#12211A] border border-[#244234] rounded-xl text-sm text-[#F0F7F4] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <p className="text-[10px] text-[#8DA89B] mt-2 italic">
              All notes will be synced to this sheet automatically.
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-[#8DA89B] hover:text-[#F0F7F4] rounded-xl">
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(sheetUrl);
              onClose();
            }}
            className="px-6 py-2 text-xs font-black uppercase tracking-wider text-[#14241D] bg-[#D4AF37] hover:bg-[#D4AF37]/90 rounded-xl shadow-lg flex items-center gap-2"
          >
            <Save className="w-3.5 h-3.5" /> Save
          </button>
        </div>
      </div>
    </div>
  );
};
