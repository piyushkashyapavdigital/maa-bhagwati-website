import admin from "firebase-admin";

let app: admin.app.App | null = null;

function getApp(): admin.app.App | null {
  if (app) return app;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null; // push not configured — callers skip silently
  try {
    const creds = JSON.parse(raw);
    app =
      admin.apps.length > 0
        ? admin.apps[0]!
        : admin.initializeApp({ credential: admin.credential.cert(creds) });
    return app;
  } catch (e) {
    console.error("FCM init failed:", e);
    return null;
  }
}

export async function tokensFor(topic: string): Promise<string[]> {
  // Lazy import to avoid a hard dependency cycle (lib/db is imported widely).
  const { supabase } = await import("./supabase");
  const { data } = await supabase
    .from("push_tokens")
    .select("token")
    .eq("topic", topic);
  return (data ?? []).map((r: { token: string }) => r.token);
}

/** Fire-and-forget FCM multicast. Never throws. */
export async function sendPush(
  topic: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  try {
    const fcm = getApp();
    if (!fcm) return;
    const tokens = await tokensFor(topic);
    if (tokens.length === 0) return;
    await admin.messaging(fcm).sendEachForMulticast({
      tokens,
      notification: { title, body },
      data,
      android: { priority: "high" },
    });
  } catch (e) {
    console.error("FCM send failed:", e);
  }
}

export const ADMIN_TOPIC = "admin";
export const customerTopic = (userId: string) => `customer:${userId}`;
