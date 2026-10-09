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
import { SITE_URL } from './config';
import { supabase } from './supabase';

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

async function postToken(token: string, topic: string): Promise<void> {
  try {
    const { data } = await supabase.auth.getSession();
    const headers: Record<string, string> = { 'content-type': 'application/json' };
    const access = data.session?.access_token;
    if (access) headers.authorization = `Bearer ${access}`;
    await fetch(`${SITE_URL}/api/push-tokens`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ token, topic }),
    });
  } catch {
    // best-effort
  }
}

/**
 * Registers this phone for buyer order updates.
 * Call on auth change with the user id (or null when logged out).
 */
export async function registerCustomerPush(userId: string | null): Promise<void> {
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
    const topic = userId ? `customer:${userId}` : 'customer:guest';
    await postToken(token, topic);
    onTokenRefresh(messaging, (t) => {
      postToken(t, topic);
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
    // System tray shows the notification automatically.
  });
}
