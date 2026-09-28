import fs from "node:fs";
import { ApiError } from "./errors";
import { messagesFile } from "./paths";
import type { ContactMessage } from "./types";

export function readMessages(): ContactMessage[] {
  const file = messagesFile();
  if (!fs.existsSync(file)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    return Array.isArray(data) ? (data as ContactMessage[]) : [];
  } catch {
    return [];
  }
}

function writeMessages(messages: ContactMessage[]): void {
  fs.writeFileSync(messagesFile(), JSON.stringify(messages, null, 2), "utf8");
}

export function markMessageRead(id: string): ContactMessage {
  const messages = readMessages();
  const message = messages.find((m) => m.id === id);
  if (!message) throw new ApiError(404, `Message not found: ${id}`);
  message.read = true;
  writeMessages(messages);
  return message;
}
