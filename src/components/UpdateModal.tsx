import React, { useState, useEffect } from 'react';
import { triggerApkInstall } from '../utils/updateManager';

interface UpdateModalProps {
  isOpen: boolean;
  currentVersion: string;
  newVersion: string;
  apkUrl: string;
  apkSize: number; // in bytes
  onClose: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  currentVersion,
  newVersion,
  apkUrl,
  apkSize,
  onClose,
  onShowToast,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadedBytes, setDownloadedBytes] = useState(0);
  const [totalBytesState, setTotalBytesState] = useState(apkSize || 0);
  const [isComplete, setIsComplete] = useState(false);
  const [downloadedBlobUrl, setDownloadedBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    setTotalBytesState(apkSize || 0);
  }, [apkSize]);

  useEffect(() => {
    if (!isOpen) {
      setIsDownloading(false);
      setDownloadProgress(0);
      setDownloadedBytes(0);
      setIsComplete(false);
      if (downloadedBlobUrl) {
        URL.revokeObjectURL(downloadedBlobUrl);
        setDownloadedBlobUrl(null);
      }
      delete (window as any).__onApkProgress;
      delete (window as any).__onApkComplete;
      delete (window as any).__onApkError;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalBytes = totalBytesState || apkSize || 0;
  const totalMB = totalBytes > 0 ? (totalBytes / (1024 * 1024)).toFixed(1) : '--';
  const downloadedMB = (downloadedBytes / (1024 * 1024)).toFixed(1);
  const filename = `Notedpad_v${newVersion}.apk`;

  const handleStartDownload = async () => {
    if (!apkUrl) {
      onShowToast('APK download link missing in release.', 'error');
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadedBytes(0);
    setIsComplete(false);

    // Native Android wrapper bridge (direct MediaStore.Downloads + FileProvider installer)
    if ((window as any).Android && typeof (window as any).Android.downloadApk === 'function') {
      (window as any).__onApkProgress = (pct: number, received: number, total: number) => {
        setDownloadProgress(pct);
        setDownloadedBytes(received);
        if (total > 0) setTotalBytesState(total);
      };
      (window as any).__onApkComplete = (savedName: string) => {
        setDownloadProgress(100);
        if (totalBytes > 0) setDownloadedBytes(totalBytes);
        setIsComplete(true);
        onShowToast(`Saved to Download/${savedName}`, 'success');
      };
      (window as any).__onApkError = (errMsg: string) => {
        setIsDownloading(false);
        setIsComplete(false);
        onShowToast(errMsg || 'APK download failed.', 'error');
      };

      (window as any).Android.downloadApk(apkUrl, filename);
      return;
    }

    // Web / PWA fallback: stream real APK or hand off direct download to browser
    try {
      const response = await fetch(apkUrl, { mode: 'cors' });
      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}`);
      }

      const contentLength = +(response.headers.get('Content-Length') || totalBytes || 0);
      if (contentLength > 0) setTotalBytesState(contentLength);

      const reader = response.body.getReader();
      const chunks: BlobPart[] = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          received += value.length;
          setDownloadedBytes(received);
          if (contentLength > 0) {
            setDownloadProgress(Math.min(99, Math.round((received / contentLength) * 100)));
          }
        }
      }

      if (chunks.length === 0) {
        throw new Error('Empty APK file');
      }

      setDownloadProgress(100);
      setIsComplete(true);

      const blob = new Blob(chunks, { type: 'application/vnd.android.package-archive' });
      const blobUrl = URL.createObjectURL(blob);
      setDownloadedBlobUrl(blobUrl);

      triggerApkInstall(blobUrl, filename);
      onShowToast(`APK downloaded: ${filename}`, 'success');
    } catch {
      // If GitHub release redirect blocks fetch CORS in browser, trigger direct browser download
      triggerApkInstall(apkUrl, filename);
      setDownloadProgress(100);
      setIsComplete(true);
      onShowToast('Downloading APK via browser...', 'info');
    }
  };

  const handleOpenInstaller = () => {
    if (downloadedBlobUrl) {
      triggerApkInstall(downloadedBlobUrl, filename);
    } else {
      triggerApkInstall(apkUrl, filename);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={!isDownloading || isComplete ? onClose : undefined}
    >
      <div
        className="w-full max-w-sm bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border)] p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150 text-[var(--text-primary)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title: Update Available Now */}
        <h3 className="text-base font-bold text-[var(--text-primary)] text-center">
          Update Available Now
        </h3>

        {/* Current Version & New Version ONLY */}
        <div className="space-y-1.5 py-1 text-xs sm:text-sm">
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)]">Current Version:</span>
            <span className="font-mono font-bold text-[var(--text-primary)]">{currentVersion}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)]">New Version:</span>
            <span className="font-mono font-bold text-[var(--accent-gold)]">{newVersion}</span>
          </div>
        </div>

        {/* Live Progress Bar & Size (when downloading) */}
        {isDownloading && (
          <div className="space-y-2 pt-1 animate-in fade-in duration-200">
            <div className="w-full h-2.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden border border-[var(--border)]">
              <div
                className="h-full bg-[var(--accent-gold)] transition-all duration-150 ease-out rounded-full"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-xs font-mono text-[var(--text-muted)]">
              <span className="text-[var(--accent-gold)] font-bold">{downloadProgress}%</span>
              <span>
                {downloadedMB} MB / {totalMB} MB
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons: Cancel and Download (or Close / Open once completed) */}
        {!isDownloading ? (
          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleStartDownload}
              className="flex-1 py-2.5 px-4 bg-[var(--accent-gold)] text-[#14241D] rounded-xl text-xs font-black transition-all cursor-pointer shadow-md active:scale-95"
            >
              Download
            </button>
          </div>
        ) : isComplete ? (
          <div className="flex items-center gap-2.5 pt-2 animate-in fade-in">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleOpenInstaller}
              className="flex-1 py-2.5 px-4 bg-[#10B981] text-[#14241D] rounded-xl text-xs font-black transition-all cursor-pointer shadow-md active:scale-95"
            >
              Open
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
