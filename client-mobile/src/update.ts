import { Linking, PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
export async function downloadUpdate(remote: RemoteVersion): Promise<'started' | 'blocked'> {
  // Android 13+ hides DownloadManager's completion notification unless we
  // hold POST_NOTIFICATIONS — without it the download finishes silently
  // and there is nothing to tap. Ask first.
  if (Platform.OS === 'android' && Number(Platform.Version) >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      // No notification permission → skip DownloadManager, open in browser
      // so the user downloads + installs from there instead.
      await Linking.openURL(remote.apkUrl).catch(() => {});
      return 'blocked';
    }
  }
  const { config } = ReactNativeBlobUtil;
  config({
    fileCache: false,
    addAndroidDownloads: {
      useDownloadManager: true,
      notification: true,
      title: 'Maa Bhagwati update',
      description: `Downloading v${remote.versionName}… tap when finished to install`,
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
  return 'started';
}

const SKIP_KEY = 'mbpb_skip_update_code';

/** Version codes the user chose to skip (persisted). */
export async function getSkippedCode(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(SKIP_KEY);
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

export async function skipVersion(code: number): Promise<void> {
  try {
    await AsyncStorage.setItem(SKIP_KEY, String(code));
  } catch {
    // non-fatal
  }
}
