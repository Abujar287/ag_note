// Update Manager for AG Notepad
// Handles checking GitHub releases and downloading update APK

export const CURRENT_APP_VERSION = '1.2.0';
export const GITHUB_REPO = 'Abujar287/ag_note';

export interface UpdateInfo {
  updateAvailable: boolean;
  currentVersion: string;
  newVersion: string;
  apkUrl: string;
  apkSize: number; // in bytes
}

// Compare semantic versions (e.g. "1.2.1" > "1.2.0")
export function isNewerVersion(remoteVer: string, currentVer: string): boolean {
  const cleanRemote = remoteVer.replace(/^v/, '').trim();
  const cleanCurrent = currentVer.replace(/^v/, '').trim();

  const rParts = cleanRemote.split('.').map((n) => parseInt(n, 10) || 0);
  const cParts = cleanCurrent.split('.').map((n) => parseInt(n, 10) || 0);

  for (let i = 0; i < Math.max(rParts.length, cParts.length); i++) {
    const r = rParts[i] || 0;
    const c = cParts[i] || 0;
    if (r > c) return true;
    if (r < c) return false;
  }
  return false;
}

// Check GitHub for latest release
export async function checkForGitHubUpdate(forceCheckNewer = false): Promise<UpdateInfo> {
  const defaultApkUrl = `https://github.com/${GITHUB_REPO}/releases/download/v1.2.1/AG_Notepad_v1.2.1.apk`;
  const defaultApkSize = 24.8 * 1024 * 1024; // 24.8 MB

  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      const tagName = data.tag_name || '';
      const remoteVersion = tagName.replace(/^v/, '');

      const apkAsset = data.assets?.find((a: any) =>
        a.name && a.name.toLowerCase().endsWith('.apk')
      );

      const apkUrl = apkAsset ? apkAsset.browser_download_url : defaultApkUrl;
      const apkSize = apkAsset?.size || defaultApkSize;

      const hasUpdate = isNewerVersion(remoteVersion, CURRENT_APP_VERSION);

      return {
        updateAvailable: hasUpdate,
        currentVersion: CURRENT_APP_VERSION,
        newVersion: remoteVersion || '1.2.1',
        apkUrl,
        apkSize,
      };
    }
  } catch (err) {
    console.warn('[UpdateManager] Could not reach GitHub releases:', err);
  }

  // If GitHub has no releases published yet, or error occurred:
  // When forceCheckNewer is true (e.g. testing update feature), provide v1.2.1 update
  if (forceCheckNewer) {
    return {
      updateAvailable: true,
      currentVersion: CURRENT_APP_VERSION,
      newVersion: '1.2.1',
      apkUrl: defaultApkUrl,
      apkSize: defaultApkSize,
    };
  }

  return {
    updateAvailable: false,
    currentVersion: CURRENT_APP_VERSION,
    newVersion: CURRENT_APP_VERSION,
    apkUrl: defaultApkUrl,
    apkSize: defaultApkSize,
  };
}

// Trigger installation of APK
export function triggerApkInstall(apkBlobOrUrl: Blob | string, filename = 'AG_Notepad.apk') {
  try {
    // 1. If running inside Android WebView native wrapper with JavascriptInterface
    if ((window as any).Android && typeof (window as any).Android.installApk === 'function') {
      (window as any).Android.installApk(filename);
      return;
    }

    // 2. Browser / PWA environment:
    const url = typeof apkBlobOrUrl === 'string' ? apkBlobOrUrl : URL.createObjectURL(apkBlobOrUrl);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.setAttribute('target', '_blank');
    anchor.setAttribute('rel', 'noopener noreferrer');
    document.body.appendChild(anchor);
    anchor.click();
    setTimeout(() => {
      anchor.remove();
    }, 1000);
  } catch (err) {
    console.error('[UpdateManager] Install trigger error:', err);
  }
}
