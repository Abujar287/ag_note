import React, { useState, useEffect } from 'react';
import { X, Settings, Link as LinkIcon, Save } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sheetUrl: string) => void;
  initialUrl: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, initialUrl }) => {
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
          <div className="p-4 bg-[#12211A] border border-[#244234] rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                <LinkIcon className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <label className="text-xs font-bold text-[#8DA89B] uppercase tracking-wider">
                Target Google Sheet
              </label>
            </div>
            <div className="font-mono text-xs text-[#F0F7F4] break-all bg-[#0d1a14] p-2 rounded-lg border border-[#244234]/50">
              {initialUrl}
            </div>
            <p className="text-[10px] text-[#8DA89B] mt-3 italic leading-relaxed">
              Google Sheet link is now fixed for automatic sync. Manual input is no longer required.
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-8 py-2.5 text-xs font-black uppercase tracking-wider text-[#14241D] bg-[#D4AF37] hover:bg-[#D4AF37]/90 rounded-xl shadow-lg transition-transform active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
