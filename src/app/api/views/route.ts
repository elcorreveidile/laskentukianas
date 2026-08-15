import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const KEY = "site";

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
