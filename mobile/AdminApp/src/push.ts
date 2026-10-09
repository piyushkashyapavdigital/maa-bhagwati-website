import { getApp } from '@react-native-firebase/app';
import {
  AuthorizationStatus,
  getInitialNotification,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  requestPermission,
  setBackgroundMessageHandler,
  type RemoteMessage,
} from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import { api } from './api';

export interface PushEvent {
  title: string;
  body: string;
  type?: string;
  id?: string;
}

type Listener = (e: PushEvent) => void;
const listeners = new Set<Listener>();

export function onPushEvent(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function emit(e: PushEvent) {
  listeners.forEach((fn) => {
    try {
      fn(e);
    } catch {
      // never break the push pipeline
    }
  });
}

function toEvent(m: RemoteMessage): PushEvent {
  const str = (v: unknown): string | undefined =>
    typeof v === 'string' ? v : undefined;
  return {
    title: m.notification?.title ?? 'Maa Bhagwati',
    body: m.notification?.body ?? '',
    type: str(m.data?.type),
    id: str(m.data?.id),
  };
}

export function onPushOpened(fn: (e: PushEvent) => void): () => void {
  const messaging = getMessaging(getApp());
  return onNotificationOpenedApp(messaging, (m) => fn(toEvent(m)));
}

/** Call once at login/app start. Registers this phone for admin pushes. */
export async function registerAdminPush(): Promise<void> {
  try {
    if (Platform.OS === 'android' && Number(Platform.Version) >= 33) {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      ).catch(() => {});
    }
    const messaging = getMessaging(getApp());
    const status = await requestPermission(messaging);
    const enabled =
      status === AuthorizationStatus.AUTHORIZED ||
      status === AuthorizationStatus.PROVISIONAL;
    if (!enabled) return;
    const token = await getToken(messaging);
    if (!token) return;
    await api
      .post('/api/push-tokens', { token, topic: 'admin' })
      .catch(() => {});
    // Token refresh → re-register.
    onTokenRefresh(messaging, (t) => {
      api.post('/api/push-tokens', { token: t, topic: 'admin' }).catch(() => {});
    });
  } catch {
    // push is best-effort; the app works without it
  }
}

/** Foreground messages → in-app banner via onPushEvent. */
export function watchForegroundPush(): () => void {
  const messaging = getMessaging(getApp());
  return onMessage(messaging, async (m) => {
    emit(toEvent(m));
  });
}

/** Cold-start tap payload, if the app was opened from a push. */
export async function initialPushOpen(): Promise<PushEvent | null> {
  try {
    const messaging = getMessaging(getApp());
    const m = await getInitialNotification(messaging);
    if (!m) return null;
    return toEvent(m);
  } catch {
    return null;
  }
}

/** Must be called at the top level of index.js (headless JS). */
export function registerBackgroundHandler(): void {
  const messaging = getMessaging(getApp());
  setBackgroundMessageHandler(messaging, async () => {
    // System tray shows the notification automatically (notification
    // payload present). Nothing to do here — tap handled on open.
  });
}
