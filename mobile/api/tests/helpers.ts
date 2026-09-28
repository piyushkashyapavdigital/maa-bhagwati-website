import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export const TEST_TOKEN = "test-token";

/**
 * Creates an isolated temp data dir from fixtures, points the server env at
 * it, and returns the dir path. Real website data is never touched.
 */
export function setupDataDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bhagwati-api-"));
  const fixtures = path.join(import.meta.dir, "fixtures");

  fs.copyFileSync(
    path.join(fixtures, "db.json"),
    path.join(dir, "db.json")
  );
  fs.copyFileSync(
    path.join(fixtures, "contact-messages.json"),
    path.join(dir, "contact-messages.json")
  );

  let orders = fs.readFileSync(path.join(fixtures, "orders.json"), "utf8");
  orders = orders
    .replaceAll("{{TODAY}}", new Date().toISOString())
    .replaceAll(
      "{{DAYS_AGO_3}}",
      new Date(Date.now() - 3 * 86_400_000).toISOString()
    );
  fs.writeFileSync(path.join(dir, "orders.json"), orders, "utf8");

  const uploads = path.join(dir, "uploads");
  fs.mkdirSync(uploads, { recursive: true });

  process.env.MBPB_DATA_DIR = dir;
  process.env.MBPB_UPLOADS_DIR = uploads;
  process.env.ADMIN_TOKEN = TEST_TOKEN;
  return dir;
}
