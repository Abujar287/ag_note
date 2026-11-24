// Update Manager for AG Notepad / Notedpad
// Handles checking GitHub releases and downloading real APK files

export const CURRENT_APP_VERSION =
  (import.meta.env.VITE_APP_VERSION as string | undefined)?.trim() || '1.2.0';
export const GITHUB_REPO = 'Abujar287/ag_note';

export function getInstalledAppVersion(): string {
  try {
    const androidVer = (window as any).Android?.getAppVersion?.();
    if (typeof androidVer === 'string' && androidVer.trim()) {
      return androidVer.trim();
    }
  } catch {
    // ignore
  }
  return CURRENT_APP_VERSION;
}

export interface UpdateInfo {
  updateAvailable: boolean;
  apkMissing?: boolean;
  releaseMissing?: boolean;
  currentVersion: string;
  newVersion: string;
  apkUrl: string;
  apkSize: number; // in bytes
}

function compareSemver(a: string, b: string): number {
  const cleanA = a.replace(/^v/, '').trim();
  const cleanB = b.replace(/^v/, '').trim();

  const aParts = cleanA.split('.').map((n) => parseInt(n, 10) || 0);
  const bParts = cleanB.split('.').map((n) => parseInt(n, 10) || 0);

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const av = aParts[i] || 0;
    const bv = bParts[i] || 0;
    if (av > bv) return 1;
    if (av < bv) return -1;
  }
  return 0;
}

// Compare semantic versions (e.g. "1.3.1" > "1.2.0")
export function isNewerVersion(remoteVer: string, currentVer: string): boolean {
  return compareSemver(remoteVer, currentVer) > 0;
}

// Check GitHub for latest release with an actual .apk asset attached
export async function checkForGitHubUpdate(forceCheckNewer = false): Promise<UpdateInfo> {
  const currentVersion = getInstalledAppVersion();

  try {
    const headers = {
      Accept: 'application/vnd.github.v3+json',
    };

    // Query releases list with cache-busting so WebView never reads a stale CDN-cached release JSON
    let releases: any[] = [];
    const listRes = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/releases?per_page=10&_t=${Date.now()}`,
      { cache: 'no-store', headers }
    );

    if (listRes.ok) {
      const parsed = await listRes.json();
      if (Array.isArray(parsed)) {
        releases = parsed.filter((r) => !r.draft);
      }
    }

    if (releases.length === 0) {
      const latestRes = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/releases/latest?_t=${Date.now()}`,
        { cache: 'no-store', headers }
      );
      if (latestRes.status === 404) {
        return {
          updateAvailable: false,
          releaseMissing: true,
          currentVersion,
          newVersion: currentVersion,
          apkUrl: '',
          apkSize: 0,
        };
      }
      if (latestRes.ok) {
        releases = [await latestRes.json()];
      }
    }

    if (releases.length === 0) {
      return {
        updateAvailable: false,
        releaseMissing: true,
        currentVersion,
        newVersion: currentVersion,
        apkUrl: '',
        apkSize: 0,
      };
    }

    // Prefer the highest semantic version release (falling back to newest published)
    releases.sort((a, b) => {
      const verA = String(a.tag_name || '').replace(/^v/, '').trim();
      const verB = String(b.tag_name || '').replace(/^v/, '').trim();
      const cmp = compareSemver(verB, verA);
      if (cmp !== 0) return cmp;
      return new Date(b.published_at || b.created_at || 0).getTime() -
        new Date(a.published_at || a.created_at || 0).getTime();
    });

    const bestWithApk = releases.find((r) =>
      r.assets?.some(
        (a: any) => a.name && a.name.toLowerCase().endsWith('.apk') && a.browser_download_url
      )
    );
    const data = bestWithApk || releases[0];

    const tagName = data.tag_name || '';
    const remoteVersion = tagName.replace(/^v/, '').trim();

    const apkAsset = data.assets?.find(
      (a: any) => a.name && a.name.toLowerCase().endsWith('.apk') && a.browser_download_url
    );

    const hasNewerVersion = remoteVersion
      ? isNewerVersion(remoteVersion, currentVersion)
      : false;

    if ((hasNewerVersion || forceCheckNewer) && !apkAsset) {
      return {
        updateAvailable: false,
        apkMissing: true,
        currentVersion,
        newVersion: remoteVersion || currentVersion,
        apkUrl: '',
        apkSize: 0,
      };
    }

    if ((hasNewerVersion || forceCheckNewer) && apkAsset) {
      return {
        updateAvailable: true,
        currentVersion,
        newVersion: remoteVersion || currentVersion,
        apkUrl: apkAsset.browser_download_url,
        apkSize: apkAsset.size || 0,
      };
    }

    return {
      updateAvailable: false,
      currentVersion,
      newVersion: remoteVersion || currentVersion,
      apkUrl: apkAsset?.browser_download_url || '',
      apkSize: apkAsset?.size || 0,
    };
  } catch (err) {
    console.warn('[UpdateManager] Could not reach GitHub releases:', err);
  }

  return {
    updateAvailable: false,
    currentVersion,
    newVersion: currentVersion,
    apkUrl: '',
    apkSize: 0,
  };
}

// Trigger installation of APK
export function triggerApkInstall(apkBlobOrUrl: Blob | string, filename = 'Notedpad.apk') {
  try {
    // 1. Inside Android WebView native wrapper with JavascriptInterface
    if ((window as any).Android && typeof (window as any).Android.installApk === 'function') {
      (window as any).Android.installApk(filename);
      return;
    }

    // 2. Browser / PWA environment: trigger direct APK download cleanly even inside iframe
    if (!apkBlobOrUrl) return;
    const isStringUrl = typeof apkBlobOrUrl === 'string';
    const url = isStringUrl ? apkBlobOrUrl : URL.createObjectURL(apkBlobOrUrl);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    if (isStringUrl && url.startsWith('http')) {
      anchor.target = '_blank';
    }
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
