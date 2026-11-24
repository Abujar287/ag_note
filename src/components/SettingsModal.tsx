import React, { useRef, useState, useEffect } from 'react';
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
  Save,
} from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';
import {
  APPS_SCRIPT_SOURCE_CODE,
  GOOGLE_SHEET_URL,
  FIXED_APPS_SCRIPT_URL,
} from '../config/syncConfig';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportNotes: () => void;
  onImportNotes: (file: File) => void;
  sheetsUrl?: string;
  onSaveSheetsUrl?: (url: string) => void;
  onSyncSheets?: () => void;
  isSyncingSheets?: boolean;
  onTriggerCheckUpdate?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onExportNotes,
  onImportNotes,
  sheetsUrl,
  onSaveSheetsUrl,
  onSyncSheets,
  isSyncingSheets,
  onTriggerCheckUpdate,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [urlInput, setUrlInput] = useState(sheetsUrl || FIXED_APPS_SCRIPT_URL);
  const [urlSaved, setUrlSaved] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [installTip, setInstallTip] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUrlInput(sheetsUrl || FIXED_APPS_SCRIPT_URL);
      setUrlSaved(false);
      setInstallTip(false);
    }
  }, [isOpen, sheetsUrl]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportNotes(file);
      e.target.value = '';
      onClose();
    }
  };

  const handleSaveUrl = () => {
    if (onSaveSheetsUrl) {
      onSaveSheetsUrl(urlInput.trim());
      setUrlSaved(true);
      setTimeout(() => setUrlSaved(false), 2000);
    }
  };

  const handleCopyAppsScript = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_SOURCE_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden my-auto animate-in zoom-in-95 duration-150 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/30 flex items-center justify-center">
              <Settings className="w-4 h-4 text-[var(--accent-gold)]" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--text-primary)] text-base leading-tight">
                Google Sheet & Sync Settings
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                Configure Google Sheet sync, backup, and app installation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1.5 rounded-lg hover:bg-[var(--border)]/40 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Google Sheet Setup / Sync Settings */}
          <div className="bg-[var(--bg-elevated)] p-4 rounded-xl border border-[var(--border)] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-[#10B981]" />
                <span>Google Sheets Sync Setup</span>
              </h4>
              <a
                href={GOOGLE_SHEET_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-[var(--accent-gold)] hover:underline flex items-center gap-1"
              >
                <span>Open Sheet</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Apps Script Web App URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="flex-1 px-3 py-2 bg-[var(--bg-card)] border border-[var(--border)] focus:border-[var(--accent-gold)] rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveUrl}
                  className="px-3 py-2 bg-[var(--accent-gold)] text-[#14241D] rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95"
                >
                  {urlSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{urlSaved ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              {onSyncSheets && (
                <button
                  type="button"
                  onClick={onSyncSheets}
                  disabled={isSyncingSheets}
                  className="flex-1 py-2 px-3 bg-[var(--bg-card)] hover:border-[var(--accent-gold)] border border-[var(--border)] text-[var(--text-primary)] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#10B981] ${isSyncingSheets ? 'animate-spin' : ''}`} />
                  <span>{isSyncingSheets ? 'Syncing...' : 'Sync Now'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCopyAppsScript}
                className="flex-1 py-2 px-3 bg-[var(--bg-card)] hover:border-[#10B981] border border-[var(--border)] text-[var(--text-primary)] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copiedCode ? (
                  <Check className="w-3.5 h-3.5 text-[#10B981]" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-[#10B981]" />
                )}
                <span>{copiedCode ? 'Copied Code!' : 'Copy Apps Script'}</span>
              </button>
            </div>
          </div>

          {/* Backup & Restore */}
          <div className="bg-[var(--bg-elevated)] p-4 rounded-xl border border-[var(--border)] space-y-3">
            <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
              <span>JSON Backup & Restore</span>
            </h4>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={onExportNotes}
                className="flex-1 py-2.5 px-3 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-[var(--accent-gold)]" />
                <span>Export JSON</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2.5 px-3 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-[#10B981]" />
                <span>Restore JSON</span>
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

          {/* Install & Check Update */}
          <div className="bg-[var(--bg-elevated)] p-4 rounded-xl border border-[var(--border)] space-y-3">
            <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-[var(--accent-gold)]" />
              <span>App Install & Updates</span>
            </h4>
            <div className="flex flex-col sm:flex-row gap-2">
              {onTriggerCheckUpdate && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onTriggerCheckUpdate();
                  }}
                  className="flex-1 py-2 px-3 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                  <span>Check Update</span>
                </button>
              )}

              {!isInstalled ? (
                <button
                  type="button"
                  onClick={async () => {
                    if (isInstallable) {
                      await install();
                    } else {
                      setInstallTip((prev) => !prev);
                    }
                  }}
                  className="flex-1 py-2 px-3 bg-[var(--accent-gold)] text-[#14241D] rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Install App</span>
                </button>
              ) : (
                <div className="flex-1 py-2 px-3 bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>App Installed</span>
                </div>
              )}
            </div>
            {installTip && !isInstalled && (
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                Open your browser menu (⋮) and choose &quot;Add to Home screen&quot; or &quot;Install app&quot; to install Notedpad.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[var(--bg-elevated)] border-t border-[var(--border)] flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 text-xs font-black uppercase tracking-wider text-[#14241D] bg-[var(--accent-gold)] rounded-xl shadow-md transition-transform active:scale-95 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
