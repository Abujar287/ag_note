import React, { useState, useEffect } from 'react';
import { X, Settings, Link as LinkIcon, Save } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sheetUrl: string) => void;
  initialUrl: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, initialUrl }) => {
  const [url, setUrl] = useState(initialUrl);

  useEffect(() => {
    setUrl(initialUrl);
  }, [initialUrl]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(url);
    onClose();
  };

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
          <div className="p-4 bg-[#12211A] border border-[#244234] rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                <LinkIcon className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <label className="text-xs font-bold text-[#8DA89B] uppercase tracking-wider">
                Sync Status
              </label>
            </div>
            
            <div className="bg-[#0d1a14] p-4 rounded-lg border border-[#244234]">
                <p className="text-xs text-[#F0F7F4] mb-2">Connected to official sync sheet:</p>
                <code className="block text-[10px] text-[#D4AF37] break-all bg-[#14241D] p-2 rounded border border-[#D4AF37]/20">
                    {initialUrl}
                </code>
            </div>
            
            <p className="text-[10px] text-[#8DA89B] mt-4 italic leading-relaxed">
              Sync is <strong>automatic</strong>. Your notes are securely backed up to this Google Sheet.
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-2.5 text-xs font-black uppercase tracking-wider text-[#14241D] bg-[#D4AF37] hover:bg-[#D4AF37]/90 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};
