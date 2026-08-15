import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

const KEY = "site";

// Anti-abuso del contador (vanidad). Control PRINCIPAL: el cliente solo hace
// POST una vez por sesión (guarda en sessionStorage, ver VisitCounter). Este
// límite por IP en memoria es una capa secundaria "best-effort": frena bucles
// de curl contra una misma instancia caliente, pero NO es infalible en
// serverless (cada instancia tiene su propio Map y se reinicia en cold-start).
// Para un contador de vanidad es suficiente; si algún día se necesitara algo
// robusto y distribuido, la vía sería Vercel KV / Upstash Redis.
const visits = new Map<string, number>();

// Lectura del total de visitas.
export async function GET() {
  try {
    const c = await db.counter.findUnique({ where: { key: KEY } });
    return NextResponse.json({ count: c?.count ?? 0 });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}

// Incremento atómico (una vez por sesión, controlado en el cliente).
export async function POST() {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const last = visits.get(ip);
  if (last && now - last < 60_000) {
    const c = await db.counter.findUnique({ where: { key: KEY } });
    return NextResponse.json({ count: c?.count ?? 0 });
  }
  visits.set(ip, now);
  if (visits.size > 10_000) {
    const entries = Array.from(visits.entries()).sort((a, b) => a[1] - b[1]);
    for (let i = 0; i < entries.length / 2; i++) visits.delete(entries[i][0]);
  }
  try {
    const c = await db.counter.upsert({
      where: { key: KEY },
      create: { key: KEY, count: 1 },
      update: { count: { increment: 1 } },
    });
    return NextResponse.json({ count: c.count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
