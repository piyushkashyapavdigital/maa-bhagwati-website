import { Linking } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { APP_VERSION_CODE, UPDATE_VERSION_URL } from './config';

export interface RemoteVersion {
  versionCode: number;
  versionName: string;
  apkUrl: string;
  notes?: string;
}

/** Pure + testable: is the remote build newer than ours? */
export function isUpdateAvailable(
  remote: RemoteVersion | null | undefined,
  localCode: number = APP_VERSION_CODE,
): remote is RemoteVersion {
  if (!remote) return false;
  if (!Number.isFinite(remote.versionCode)) return false;
  if (!remote.apkUrl) return false;
  return remote.versionCode > localCode;
}

export async function fetchRemoteVersion(): Promise<RemoteVersion | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    try {
      const res = await fetch(`${UPDATE_VERSION_URL}?t=${Date.now()}`, {
        signal: ctrl.signal,
      });
      if (!res.ok) return null;
      const j = (await res.json()) as Partial<RemoteVersion>;
      if (typeof j.versionCode !== 'number' || typeof j.apkUrl !== 'string') {
        return null;
      }
      return {
        versionCode: j.versionCode,
        versionName: String(j.versionName ?? j.versionCode),
        apkUrl: j.apkUrl,
        notes: typeof j.notes === 'string' ? j.notes : undefined,
      };
    } finally {
      clearTimeout(t);
    }
  } catch {
    return null; // offline or not hosted yet → stay silent
  }
}

/**
 * Downloads the APK via Android DownloadManager. When finished, Android
 * shows a notification — user taps it to install. No extra permissions
 * needed from our side.
 */
export function downloadUpdate(remote: RemoteVersion): void {
  const { config } = ReactNativeBlobUtil;
  config({
    fileCache: false,
    addAndroidDownloads: {
      useDownloadManager: true,
      notification: true,
      title: 'Maa Bhagwati update',
      description: `Downloading v${remote.versionName}…`,
      mime: 'application/vnd.android.package-archive',
      mediaScannable: true,
      path: `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/maa-bhagwati-v${remote.versionName}.apk`,
    },
  })
    .fetch('GET', remote.apkUrl)
    .catch(() => {
      // DownloadManager failed (or blocked) → fall back to browser.
      Linking.openURL(remote.apkUrl).catch(() => {});
    });
}
