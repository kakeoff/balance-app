import crypto from "crypto";
import os from "os";

export function generateServerId(): string {
  const hostname = os.hostname();
  const randomComponent = crypto.randomBytes(8).toString("hex");
  return `${hostname}-${randomComponent}`;
}

export const SERVER_ID = generateServerId();
