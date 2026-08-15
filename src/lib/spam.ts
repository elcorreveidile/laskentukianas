import { createHmac } from "crypto";

const secret = process.env.AUTH_SECRET || "dev-secret-kentukianas";

type Op = { a: number; b: number; op: string; answer: number };

function pickOp(): Op {
  const ops: (() => Op)[] = [
    () => { const a = 2 + Math.floor(Math.random() * 8); const b = 2 + Math.floor(Math.random() * 8); return { a, b, op: "+", answer: a + b }; },
    () => { const a = 5 + Math.floor(Math.random() * 10); const b = 1 + Math.floor(Math.random() * a); return { a, b, op: "-", answer: a - b }; },
    () => { const a = 2 + Math.floor(Math.random() * 6); const b = 2 + Math.floor(Math.random() * 6); return { a, b, op: "×", answer: a * b }; },
  ];
  return ops[Math.floor(Math.random() * ops.length)]();
}

export function sign(n: number): string {
  return createHmac("sha256", secret).update(String(n)).digest("hex");
}

export function verifyChallenge(answer: number, token: string): boolean {
  if (!Number.isFinite(answer) || !token) return false;
  return sign(answer) === token;
}

export function makeChallenge(): { a: number; b: number; op: string; token: string } {
  const { a, b, op, answer } = pickOp();
  return { a, b, op, token: sign(answer) };
}
