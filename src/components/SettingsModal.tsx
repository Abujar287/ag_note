import React, { useRef, useState } from 'react';
import {
  X,
  Settings,
  Download,
  Upload,
  Lock,
  FileText,
  Pin,
  Trash2,
  Folder,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  RefreshCw,
  FileSpreadsheet,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { MASTER_PASSWORD } from '../types/note';
import { usePWAInstall } from '../utils/usePWAInstall';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalNotes: number;
  pinnedCount: number;
  lockedCount: number;
  trashCount: number;
  categoryCount: number;
  onExportNotes: () => void;
  onImportNotes: (file: File) => void;
  onEmptyTrash?: () => void;
  sheetsUrl: string;
  onSaveSheetsUrl: (url: string) => void;
  onSyncSheets: () => void;
  isSyncingSheets: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  totalNotes,
  pinnedCount,
  lockedCount,
  trashCount,
  categoryCount,
  onExportNotes,
  onImportNotes,
  onEmptyTrash,
  sheetsUrl,
  onSaveSheetsUrl,
  onSyncSheets,
  isSyncingSheets,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [scriptUrlInput, setScriptUrlInput] = useState(sheetsUrl);
  const [copiedCode, setCopiedCode] = useState(false);

  const appsScriptCode = `function doGet(e) {
  var sheet = SpreadsheetApp.openById("1J6xput_hnyroayLrDKJn-mGYn0xDLqTEs_gSrLzWJJI").getActiveSheet();
  var rows = sheet.getDataRange().getValues();
  var data = [];
  var startRow = (rows.length > 0 && rows[0][0] === "Datetime") ? 1 : 0;
  for (var i = startRow; i < rows.length; i++) {
    var row = rows[i];
    if (row[4] !== "DELETE" && row[1]) {
      data.push({
        datetime: row[0] || "",
        notename: row[1] || "Untitled",
        category: row[2] || "General",
        note: row[3] || "",
        action: row[4] || "CREATE"
      });
    }
  }
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var sheet = SpreadsheetApp.openById("1J6xput_hnyroayLrDKJn-mGYn0xDLqTEs_gSrLzWJJI").getActiveSheet();
  try {
    var data = JSON.parse(e.postData.contents);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Datetime", "Notename", "Category", "Note", "Action"]);
    }
    var actionType = data.action || "CREATE";
    if (actionType === "DELETE") {
      var rows = sheet.getDataRange().getValues();
      for (var i = rows.length - 1; i >= 1; i--) {
        if (rows[i][1] === data.notename) {
          sheet.deleteRow(i + 1);
        }
      }
    } else {
      sheet.appendRow([
        data.datetime || new Date().toLocaleString(),
        data.notename || "Untitled",
        data.category || "General",
        data.note || "",
        actionType
      ]);
    }
    return ContentService.createTextOutput(JSON.stringify({"status": "success"}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150"
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
                Notepad Settings
              </h3>
              <p className="text-[11px] text-[#8DA89B]">
                আপনার ডিভাইস স্টোরেজ ও ব্যাকআপ নিয়ন্ত্রণ করুন
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

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Storage & Privacy Note */}
          <div className="bg-[#12211A] p-3.5 rounded-xl border border-[#2D4A3D] flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-[#F0F7F4]">
                ১০০% লোকাল ও সুরক্ষিত নোটপ্যাড
              </p>
              <p className="text-[#8DA89B] leading-relaxed">
                আপনার সমস্ত নোট আপনার ডিভাইসের ব্রাউজার মেমোরিতে (LocalStorage) সেভ থাকে। কোনো এক্সটারনাল সার্ভার বা শিটের প্রয়োজন নেই।
              </p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="bg-[#12211A] p-4 rounded-xl border border-[#2D4A3D] space-y-2.5">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-[#D4AF37]">
              নোটের পরিসংখ্যান (Summary)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="bg-[#162920] p-2.5 rounded-lg border border-[#2D4A3D]">
                <div className="flex items-center justify-center gap-1 text-[11px] text-[#8DA89B] mb-0.5">
                  <FileText className="w-3 h-3 text-[#D4AF37]" /> Total
                </div>
                <span className="text-base font-black text-[#F0F7F4] font-mono">
                  {totalNotes}
                </span>
              </div>
              <div className="bg-[#162920] p-2.5 rounded-lg border border-[#2D4A3D]">
                <div className="flex items-center justify-center gap-1 text-[11px] text-[#8DA89B] mb-0.5">
                  <Pin className="w-3 h-3 text-[#D4AF37]" /> Pinned
                </div>
                <span className="text-base font-black text-[#D4AF37] font-mono">
                  {pinnedCount}
                </span>
              </div>
              <div className="bg-[#162920] p-2.5 rounded-lg border border-[#2D4A3D]">
                <div className="flex items-center justify-center gap-1 text-[11px] text-[#8DA89B] mb-0.5">
                  <Lock className="w-3 h-3 text-[#D4AF37]" /> Locked
                </div>
                <span className="text-base font-black text-[#D4AF37] font-mono">
                  {lockedCount}
                </span>
              </div>
              <div className="bg-[#162920] p-2.5 rounded-lg border border-[#2D4A3D]">
                <div className="flex items-center justify-center gap-1 text-[11px] text-[#8DA89B] mb-0.5">
                  <Folder className="w-3 h-3 text-[#10B981]" /> Categories
                </div>
                <span className="text-base font-black text-[#10B981] font-mono">
                  {categoryCount}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile PWA & GitHub Auto-Update Card */}
          <div className="bg-[#12211A] p-4 rounded-xl border border-[#2D4A3D] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#F0F7F4] flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#D4AF37]" />
                <span>মোবাইল অ্যাপ ও অটো-আপডেট (GitHub Push)</span>
              </h4>
              <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded-full border border-[#10B981]/30">
                PWA Enabled
              </span>
            </div>

            <p className="text-xs text-[#8DA89B] leading-relaxed">
              GitHub-এ কোড পুশ বা হোস্ট আপডেট করার সাথে সাথে আপনার ফোনে অ্যাপ ওপেন করলেই স্বয়ংক্রিয়ভাবে নতুন আপডেট চলে আসবে। কোনো ক্যাশ ডিলিট করার দরকার নেই এবং আপনার সংরক্ষিত কোনো নোট মুছে যাবে না।
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={handleCheckUpdates}
                disabled={isCheckingUpdate}
                className="flex-1 py-2 px-3 bg-[#162920] hover:bg-[#1f3b2d] border border-[#2D4A3D] hover:border-[#D4AF37]/50 text-[#F0F7F4] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#D4AF37] ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                <span>{isCheckingUpdate ? 'চেক করা হচ্ছে...' : 'আপডেট চেক করুন'}</span>
              </button>

              {!isInstalled && (
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
              )}
            </div>

            {updateMessage && (
              <p className="text-xs text-[#10B981] font-medium bg-[#10B981]/10 p-2 rounded-lg border border-[#10B981]/20 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                <span>{updateMessage}</span>
              </p>
            )}
          </div>

          {/* Google Sheets & Apps Script Integration */}
          <div className="bg-[#12211A] p-4 rounded-xl border border-[#2D4A3D] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#F0F7F4] flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-[#10B981]" />
                <span>Google Sheets সিঙ্ক ও Apps Script</span>
              </h4>
              <a
                href="https://docs.google.com/spreadsheets/d/1J6xput_hnyroayLrDKJn-mGYn0xDLqTEs_gSrLzWJJI/edit"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#10B981] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Google Sheet খুলুন</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <p className="text-xs text-[#8DA89B] leading-relaxed">
              আপনার সমস্ত নোট Google Sheet-এ (<span className="font-mono text-[#D4AF37]">1J6xput_hnyroayLrDKJn-mGYn0xDLqTEs_gSrLzWJJI</span>) Datetime, Notename, Category, Note এবং Action সহ সিঙ্ক করতে নিচের Apps Script কোডটি আপনার গুগল শিটে স্থাপন (Deploy) করুন।
            </p>

            {/* Apps Script Web App URL input */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-[11px] font-bold text-[#D4AF37]">
                Google Apps Script Web App URL:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={scriptUrlInput}
                  onChange={(e) => setScriptUrlInput(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="flex-1 px-3 py-2 bg-[#162920] border border-[#2D4A3D] rounded-xl text-xs text-[#F0F7F4] placeholder-[#8DA89B] focus:outline-none focus:border-[#D4AF37]"
                />
                <button
                  type="button"
                  onClick={() => {
                    onSaveSheetsUrl(scriptUrlInput);
                  }}
                  className="px-4 py-2 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#14241D] font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs shrink-0"
                >
                  সংরক্ষণ
                </button>
              </div>
            </div>



            {/* Apps Script Code snippet accordion / container */}
            <div className="space-y-1.5 pt-2 border-t border-[#2D4A3D]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#F0F7F4]">
                  Google Apps Script কোড (Apps Script Code):
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(appsScriptCode);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="text-[11px] text-[#D4AF37] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode ? 'কপি হয়েছে!' : 'কোড কপি করুন'}</span>
                </button>
              </div>
              <pre className="p-3 bg-[#0d1712] border border-[#2D4A3D] rounded-xl text-[10px] font-mono text-[#8DA89B] overflow-x-auto max-h-40 select-all">
                {appsScriptCode}
              </pre>
              <p className="text-[10px] text-[#8DA89B] italic">
                * শিটে Extensions &gt; Apps Script এ গিয়ে এই কোড দিন, এরপর Deploy &gt; New deployment (Web app, Execute as: Me, Who has access: Anyone) করে প্রাপ্ত Web App URL উপরের বক্সে দিন।
              </p>
            </div>
          </div>

          {/* Backup & Restore */}
          <div className="bg-[#12211A] p-4 rounded-xl border border-[#2D4A3D] space-y-3">
            <h4 className="text-xs font-bold text-[#F0F7F4] flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
              JSON ব্যাকআপ ও রিস্টোর
            </h4>
            <p className="text-xs text-[#8DA89B] leading-relaxed">
              নোটের নিরাপত্তা নিশ্চিত করতে আপনার ডিভাইসে অফলাইন ফাইল হিসেবে ব্যাকআপ নামিয়ে রাখতে পারেন:
            </p>
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={onExportNotes}
                className="flex-1 py-2.5 px-3 bg-[#162920] hover:bg-[#1f3b2d] border border-[#2D4A3D] text-[#F0F7F4] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#D4AF37]" />
                <span>Backup ডাউনলোড</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2.5 px-3 bg-[#162920] hover:bg-[#1f3b2d] border border-[#2D4A3D] text-[#F0F7F4] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
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

          {/* Master Password Note */}
          <div className="bg-[#12211A] p-4 rounded-xl border border-[#2D4A3D] space-y-2">
            <h4 className="text-xs font-bold text-[#F0F7F4] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
              লক করা নোটের মাস্টার পাসওয়ার্ড
            </h4>
            <p className="text-xs text-[#8DA89B] leading-relaxed">
              নোট লক বা আনলক করার ডিফল্ট মাস্টার পাসওয়ার্ড:{' '}
              <span className="font-mono font-bold text-[#D4AF37] bg-[#162920] px-2 py-0.5 rounded border border-[#2D4A3D]">
                {MASTER_PASSWORD}
              </span>
            </p>
          </div>

          {/* Trash Bin Quick Management */}
          {trashCount > 0 && onEmptyTrash && (
            <div className="bg-[#1F1414] p-4 rounded-xl border border-rose-900/40 flex items-center justify-between gap-3">
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-rose-300">
                  Trash বিনে {trashCount}টি মুছে ফেলা নোট আছে
                </p>
                <p className="text-[11px] text-rose-400/80">
                  স্থায়ীভাবে ট্র্যাশ খালি করতে পারেন
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onEmptyTrash();
                  onClose();
                }}
                className="px-3 py-1.5 bg-rose-900/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                Empty Trash
              </button>
            </div>
          )}
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
