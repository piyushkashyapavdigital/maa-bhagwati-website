import path from "node:path";

// mobile/api/src → mobile/api → mobile → repo root
const REPO_ROOT = path.resolve(import.meta.dir, "../../..");

export function dataDir(): string {
  return process.env.MBPB_DATA_DIR ?? path.join(REPO_ROOT, "data");
}

export function uploadsDir(): string {
  return (
    process.env.MBPB_UPLOADS_DIR ??
    path.join(REPO_ROOT, "public", "images", "uploads")
  );
}

export function dbFile(): string {
  return path.join(dataDir(), "db.json");
}

export function ordersFile(): string {
  return path.join(dataDir(), "orders.json");
}

export function messagesFile(): string {
  return path.join(dataDir(), "contact-messages.json");
}

/** Path prefix stored on products/banners so the website can serve them. */
export const UPLOAD_URL_BASE = "/images/uploads";

export { REPO_ROOT };
