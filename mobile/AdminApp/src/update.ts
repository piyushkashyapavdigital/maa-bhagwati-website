import { Linking, PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBlobUtil from 'react-native-blob-util';

// Bump together with android versionCode on every admin release build.
export const ADMIN_APP_VERSION_CODE = 5;
export const ADMIN_UPDATE_VERSION_URL =
  'https://raw.githubusercontent.com/piyushkashyapavdigital/maa-bhagwati-website/main/updates/admin/version.json';

export interface RemoteVersion {
  versionCode: number;
  versionName: string;
  apkUrl: string;
  notes?: string;
}

/** Pure + testable: is the remote build newer than ours? */
export function isUpdateAvailable(
  remote: RemoteVersion | null | undefined,
  localCode: number = ADMIN_APP_VERSION_CODE,
): remote is RemoteVersion {
  if (!remote) return false;
  if (!Number.isFinite(remote.versionCode)) return false;
  if (!remote.apkUrl) return false;
  return remote.versionCode > localCode;
}

export async function fetchRemoteVersion(): Promise<RemoteVersion | null> {
  const r = await checkForUpdate();
  return r.kind === 'update' || r.kind === 'current' ? r.remote : null;
}

export type UpdateCheck =
  | { kind: 'update'; remote: RemoteVersion }
  | { kind: 'current'; remote: RemoteVersion }
  | { kind: 'error'; message: string };

/** Verbose check for the manual "Check for updates" row. Never throws. */
export async function checkForUpdate(
  localCode: number = ADMIN_APP_VERSION_CODE,
): Promise<UpdateCheck> {
  let res: Response;
  try {
    res = await fetch(`${ADMIN_UPDATE_VERSION_URL}?t=${Date.now()}`);
  } catch {
    return { kind: 'error', message: 'No internet / server unreachable' };
  }
  if (!res.ok) {
    return { kind: 'error', message: `Server answered HTTP ${res.status}` };
  }
  let j: Partial<RemoteVersion>;
  try {
    j = (await res.json()) as Partial<RemoteVersion>;
  } catch {
    return { kind: 'error', message: 'Bad version file (not JSON)' };
  }
  if (typeof j.versionCode !== 'number' || typeof j.apkUrl !== 'string') {
    return { kind: 'error', message: 'Bad version file (missing fields)' };
  }
  const remote: RemoteVersion = {
    versionCode: j.versionCode,
    versionName: String(j.versionName ?? j.versionCode),
    apkUrl: j.apkUrl,
    notes: typeof j.notes === 'string' ? j.notes : undefined,
  };
  if (remote.versionCode > localCode) return { kind: 'update', remote };
  return { kind: 'current', remote };
}

/**
 * Downloads the APK into Downloads with progress callbacks.
 * Returns the local file path, or null on failure.
 * (DownloadManager is deliberately NOT used: its completion
 * notification is unreliable to tap on several phones.)
 */
export async function downloadApk(
  remote: RemoteVersion,
  onProgress?: (received: number, total: number) => void,
): Promise<string | null> {
  try {
    const { config } = ReactNativeBlobUtil;
    const path = `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/bhagwati-admin-v${remote.versionName}.apk`;
    const res = await config({ fileCache: true, path })
      .fetch('GET', remote.apkUrl)
      .progress((received, total) => {
        try {
          onProgress?.(received, total);
        } catch {
          // ignore listener errors
        }
      });
    const file = res.path();
    const exists = await ReactNativeBlobUtil.fs.exists(file);
    return exists ? file : null;
  } catch {
    return null;
  }
}

/**
 * Opens the system installer for a downloaded APK.
 * First time, Android redirects to "Allow install from this app" —
 * user toggles once, taps back, hits Install again.
 */
export async function installApk(filePath: string): Promise<boolean> {
  try {
    await ReactNativeBlobUtil.android.actionViewIntent(
      filePath,
      'application/vnd.android.package-archive',
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Legacy DownloadManager path kept as a last-resort fallback.
 */
export async function downloadUpdate(remote: RemoteVersion): Promise<'started' | 'blocked'> {
  // Android 13+ hides DownloadManager's completion notification unless we
  // hold POST_NOTIFICATIONS — without it there is nothing to tap.
  if (Platform.OS === 'android' && Number(Platform.Version) >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
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
      title: 'Bhagwati Admin update',
      description: `Downloading v${remote.versionName}… tap when finished to install`,
      mime: 'application/vnd.android.package-archive',
      mediaScannable: true,
      path: `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/bhagwati-admin-v${remote.versionName}.apk`,
    },
  })
    .fetch('GET', remote.apkUrl)
    .catch(() => {
      Linking.openURL(remote.apkUrl).catch(() => {});
    });
  return 'started';
}

const SKIP_KEY = 'mbpb_admin_skip_update_code';

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
