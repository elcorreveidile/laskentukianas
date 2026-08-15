import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { db } from "@/lib/db";
import { verifyChallenge } from "@/lib/spam";
import { sendMagicLinkEmail } from "@/lib/auth-email";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().trim().min(2, "Indica tu nombre.").max(120),
  email: z.string().trim().toLowerCase().email("El email no es válido."),
});

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    // 1) Honeypot: si el campo oculto viene relleno, es un bot → fingimos éxito.
    if (String(form.get("website") || "").trim() !== "") {
      return NextResponse.json({ ok: true });
    }

    // 2) Verificación humana (operación matemática firmada).
    const answer = Number(form.get("answer"));
    const token = String(form.get("challenge") || "");
    if (!verifyChallenge(answer, token)) {
      return NextResponse.json({ error: "challenge" }, { status: 400 });
    }

    // 3) Datos.
    const parsed = schema.safeParse({ name: form.get("name"), email: form.get("email") });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Datos no válidos" },
        { status: 400 }
      );
    }
    const { name, email } = parsed.data;

    // 4) Alta sin contraseña si no existe (rol USER).
    let user = await db.user.findUnique({ where: { email } });
    if (!user) {
      user = await db.user.create({ data: { email, name, role: "USER" } });
    } else if (!user.name && name) {
      user = await db.user.update({ where: { id: user.id }, data: { name } });
    }

    // 5) Token de un solo uso (1 hora), guardado hasheado.
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60);
    await db.verificationToken.deleteMany({ where: { identifier: email } });
    await db.verificationToken.create({ data: { identifier: email, token: hashedToken, expires } });

    // 6) Envío del enlace.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3010";
    const magicUrl = `${appUrl}/login/magico?token=${rawToken}&email=${encodeURIComponent(email)}&hash=${encodeURIComponent(hashedToken.slice(0, 12))}`;
    await sendMagicLinkEmail(email, user.name || name, magicUrl);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[magic-link] error:", error);
    return NextResponse.json({ error: "No se pudo procesar la solicitud" }, { status: 500 });
  }
}
