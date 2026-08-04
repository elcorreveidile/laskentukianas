import { createHmac } from "crypto";

const secret = process.env.AUTH_SECRET || "dev-secret-kentukianas";

/** Firma el resultado correcto para poder validarlo sin guardar estado. */
export function sign(n: number): string {
  return createHmac("sha256", secret).update(String(n)).digest("hex");
}

export function verifyChallenge(answer: number, token: string): boolean {
  if (!Number.isFinite(answer) || !token) return false;
  return sign(answer) === token;
}

/** Genera una operación matemática sencilla (suma) y su token firmado. */
export function makeChallenge(): { a: number; b: number; token: string } {
  const a = 1 + Math.floor(Math.random() * 9);
  const b = 1 + Math.floor(Math.random() * 9);
  return { a, b, token: sign(a + b) };
}
