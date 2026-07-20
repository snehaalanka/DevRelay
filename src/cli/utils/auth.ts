import fs from "fs";
import os from "os";
import path from "path";

const CONFIG_DIR = path.join(os.homedir(), ".devrelay");
const TOKEN_FILE = path.join(CONFIG_DIR, "token");
const DEVICE_FILE = path.join(CONFIG_DIR, "device");

export function saveToken(token: string): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }

  fs.writeFileSync(TOKEN_FILE, token, "utf-8");
}

export function getToken(): string | null {
  if (!fs.existsSync(TOKEN_FILE)) {
    return null;
  }

  return fs.readFileSync(TOKEN_FILE, "utf-8");
}

export function saveDeviceId(deviceId: number): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }

  fs.writeFileSync(DEVICE_FILE, String(deviceId), "utf-8");
}

export function getDeviceId(): number | null {
  if (!fs.existsSync(DEVICE_FILE)) {
    return null;
  }

  const raw = fs.readFileSync(DEVICE_FILE, "utf-8");
  const id = Number(raw);

  return Number.isNaN(id) ? null : id;
}

export function deleteToken(): void {
  if (fs.existsSync(TOKEN_FILE)) {
    fs.unlinkSync(TOKEN_FILE);
  }
}

export function deleteDeviceId(): void {
  if (fs.existsSync(DEVICE_FILE)) {
    fs.unlinkSync(DEVICE_FILE);
  }
}