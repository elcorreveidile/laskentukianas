import { NextResponse } from "next/server";
import { makeChallenge } from "@/lib/spam";

export const dynamic = "force-dynamic";

// Devuelve una operación matemática firmada para la verificación humana.
export function GET() {
  return NextResponse.json(makeChallenge());
}
