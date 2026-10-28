import React, { useRef, useState } from 'react';
import {
  X,
  Settings,
  Download,
  Upload,
  Smartphone,
  RefreshCw,
  FileSpreadsheet,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  LogOut,
  LogIn,
  User as UserIcon,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { usePWAInstall } from '../utils/usePWAInstall';
import {
  APPS_SCRIPT_SOURCE_CODE,
  GOOGLE_SHEET_URL,
} from '../config/syncConfig';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportNotes: () => void;
  onImportNotes: (file: File) => void;
  currentUser?: User | null;
  onLogin?: () => void;
  onLogout?: () => void;
  // Optional legacy props kept for type safety without cluttering the UI
  totalNotes?: number;
  pinnedCount?: number;
  lockedCount?: number;
  trashCount?: number;
  categoryCount?: number;
  onEmptyTrash?: () => void;
  sheetsUrl?: string;
  onSaveSheetsUrl?: (url: string) => void;
  onSyncSheets?: () => void;
  isSyncingSheets?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onExportNotes,
  onImportNotes,
  currentUser,
  onLogin,
  onLogout,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleCheckUpdates = async () => {
    setIsCheckingUpdate(true);
    setUpdateMessage('GitHub আপডেট ও সার্ভিস ওয়ার্কার চেক করা হচ্ছে...');
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          await reg.update();
          setUpdateMessage('সর্বশেষ সংস্করণ সক্রিয় আছে! (Up to date)');
        } else {
          setUpdateMessage('অফলাইন সার্ভিস ওয়ার্কার সক্রিয় আছে।');
        }
      } else {
        setUpdateMessage('ব্রাউজার ক্যাশ ও লোকাল ডেটা সক্রিয় আছে।');
      }
    } catch {
      setUpdateMessage('আপডেট চেক সম্পন্ন হয়েছে।');
    } finally {
      setTimeout(() => {
        setIsCheckingUpdate(false);
      }, 1000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportNotes(file);
      e.target.value = '';
      onClose();
    }
  };

  const handleCopyAppsScript = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_SOURCE_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#162920] rounded-2xl shadow-2xl border border-[#2D4A3D] overflow-hidden my-auto animate-in zoom-in-95 duration-150 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2D4A3D] bg-[#14241D] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center">
              <Settings className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="font-bold text-[#F0F7F4] text-base leading-tight">
                Notepad Settings (সেটিংস)
              </h3>
              <p className="text-[11px] text-[#8DA89B]">
                অ্যাপ ইনস্টল, অ্যাপ স্ক্রিপ্ট, ব্যাকআপ ও অ্যাকাউন্ট নিয়ন্ত্রণ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8DA89B] hover:text-[#F0F7F4] p-1.5 rounded-lg hover:bg-[#2D4A3D] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: ONLY 4 items: Apps install, Apps Script, JSON backup, logout */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* 1. Apps install */}
          <div className="bg-[#12211A] p-4 rounded-xl border border-[#2D4A3D] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#F0F7F4] flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#D4AF37]" />
                <span>1. Apps Install (অ্যাপ ইনস্টল ও আপডেট)</span>
              </h4>
              <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded-full border border-[#10B981]/30">
                PWA Ready
              </span>
            </div>

            <p className="text-xs text-[#8DA89B] leading-relaxed">
              আপনার ফোনে বা কম্পিউটারে হোমস্ক্রিন অ্যাপ হিসেবে ইনস্টল করুন। GitHub-এ কোড আপডেট হলে ফোনে স্বয়ংক্রিয়ভাবে আপডেট চলে আসবে এবং কোনো নোট হারাবে না।
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={handleCheckUpdates}
                disabled={isCheckingUpdate}
                className="flex-1 py-2 px-3 bg-[#162920] hover:bg-[#1f3b2d] border border-[#2D4A3D] hover:border-[#D4AF37]/50 text-[#F0F7F4] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-60"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-[#D4AF37] ${
                    isCheckingUpdate ? 'animate-spin' : ''
                  }`}
                />
                <span>{isCheckingUpdate ? 'চেক করা হচ্ছে...' : 'আপডেট চেক করুন'}</span>
              </button>

              {!isInstalled ? (
                <button
                  type="button"
                  onClick={async () => {
                    if (isInstallable) {
                      await install();
                    } else {
                      window.dispatchEvent(new CustomEvent('open-pwa-guide'));
                    }
                  }}
                  className="flex-1 py-2 px-3 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#14241D] rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-xs"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>ফোনে অ্যাপ ইনস্টল করুন</span>
                </button>
              ) : (
                <div className="flex-1 py-2 px-3 bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>অ্যাপ ইনস্টল করা আছে</span>
                </div>
              )}
            </div>

            {updateMessage && (
              <p className="text-xs text-[#10B981] font-medium bg-[#10B981]/10 p-2 rounded-lg border border-[#10B981]/20 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                <span>{updateMessage}</span>
              </p>
            )}
          </div>

          {/* 2. Google sheet apps script - just one button */}
          <div className="bg-[#12211A] p-3 rounded-xl border border-[#2D4A3D]">
            <button
              type="button"
              onClick={handleCopyAppsScript}
              className="w-full py-3 px-4 bg-[#162920] hover:bg-[#1f3b2d] border border-[#2D4A3D] hover:border-[#10B981]/50 text-[#F0F7F4] rounded-xl text-xs font-bold flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              {copiedCode ? (
                <Check className="w-4 h-4 text-[#10B981]" />
              ) : (
                <FileSpreadsheet className="w-4 h-4 text-[#10B981]" />
              )}
              <span className={copiedCode ? 'text-[#10B981]' : ''}>
                {copiedCode
                  ? 'Apps Script কোড কপি হয়েছে!'
                  : 'Google Sheet Apps Script (কোড কপি করুন)'}
              </span>
            </button>
          </div>

          {/* 3. JSON backup */}
          <div className="bg-[#12211A] p-4 rounded-xl border border-[#2D4A3D] space-y-3">
            <h4 className="text-xs font-bold text-[#F0F7F4] flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>3. JSON Backup & Restore (ব্যাকআপ ও রিস্টোর)</span>
            </h4>
            <p className="text-xs text-[#8DA89B] leading-relaxed">
              আপনার সমস্ত নোট অফলাইনে নিরাপদে সংরক্ষণ করতে JSON ফাইল ডাউনলোড করুন অথবা আগের কোনো ব্যাকআপ ফাইল নির্বাচন করে পুনরায় ফিরিয়ে আনুন:
            </p>
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={onExportNotes}
                className="flex-1 py-2.5 px-3 bg-[#162920] hover:bg-[#1f3b2d] border border-[#2D4A3D] text-[#F0F7F4] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4 text-[#D4AF37]" />
                <span>Backup ডাউনলোড</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2.5 px-3 bg-[#162920] hover:bg-[#1f3b2d] border border-[#2D4A3D] text-[#F0F7F4] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <Upload className="w-4 h-4 text-[#10B981]" />
                <span>Backup রিস্টোর</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* 4. Logout / Account */}
          <div className="bg-[#12211A] p-4 rounded-xl border border-[#2D4A3D] space-y-3">
            <h4 className="text-xs font-bold text-[#F0F7F4] flex items-center gap-1.5">
              <LogOut className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>4. Logout & Account (লগআউট)</span>
            </h4>

            {currentUser ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-[#162920] p-3 rounded-xl border border-[#2D4A3D]">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      className="w-10 h-10 rounded-full border border-[#D4AF37]/40 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] flex items-center justify-center font-bold text-sm shrink-0">
                      {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#F0F7F4] truncate">
                      {currentUser.displayName || 'Google User'}
                    </p>
                    <p className="text-[11px] text-[#8DA89B] truncate">
                      {currentUser.email || 'Logged in'}
                    </p>
                  </div>
                  <span className="text-[10px] text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded-full border border-[#10B981]/30 shrink-0 font-semibold">
                    সক্রিয়
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onLogout) onLogout();
                    onClose();
                  }}
                  className="w-full py-2.5 px-4 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800 text-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  <LogOut className="w-4 h-4" />
                  <span>লগআউট করুন (Logout)</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-[#162920] p-3 rounded-xl border border-[#2D4A3D]">
                  <div className="w-9 h-9 rounded-full bg-[#244234] border border-[#2D4A3D] text-[#8DA89B] flex items-center justify-center shrink-0">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#F0F7F4]">
                      কোনো অ্যাকাউন্ট লগইন করা নেই
                    </p>
                    <p className="text-[11px] text-[#8DA89B]">
                      নোটসমূহ লোকাল স্টোরেজে সুরক্ষিতভাবে সেভ আছে
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {onLogin && (
                    <button
                      type="button"
                      onClick={() => {
                        onLogin();
                      }}
                      className="flex-1 py-2 px-3 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#14241D] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Google দিয়ে লগইন করুন</span>
                    </button>
                  )}
                  {onLogout && (
                    <button
                      type="button"
                      onClick={() => {
                        onLogout();
                        onClose();
                      }}
                      className="py-2 px-3 bg-[#162920] hover:bg-[#1f3b2d] border border-[#2D4A3D] text-[#8DA89B] hover:text-[#F0F7F4] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      <span>লগআউট</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#14241D] border-t border-[#2D4A3D] flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 text-xs font-black uppercase tracking-wider text-[#14241D] bg-[#D4AF37] hover:bg-[#D4AF37]/90 rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
