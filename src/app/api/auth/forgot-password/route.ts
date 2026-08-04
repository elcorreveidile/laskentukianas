import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/auth-email";

export const dynamic = "force-dynamic";

const schema = z.object({ email: z.string().email("Email no válido") });

export async function POST(req: Request) {
  try {
    const { email } = schema.parse(await req.json());

    // Respuesta genérica siempre (no revela si el email existe).
    const ok = NextResponse.json({
      success: true,
      message:
        "Si existe una cuenta con ese correo, te enviaremos instrucciones para restablecer la contraseña.",
    });

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, password: true },
    });
    // Solo tiene sentido para cuentas con contraseña.
    if (!user || !user.password) return ok;

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60);
    await db.verificationToken.deleteMany({ where: { identifier: email } });
    await db.verificationToken.create({ data: { identifier: email, token: hashedToken, expires } });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3010";
    const resetUrl = `${appUrl}/restablecer-contrasena?token=${rawToken}&email=${encodeURIComponent(email)}`;
    await sendPasswordResetEmail(email, user.name || "", resetUrl);

    return ok;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Datos no válidos" },
        { status: 400 }
      );
    }
    console.error("[forgot-password] error:", error);
    return NextResponse.json({ error: "No se pudo procesar la solicitud" }, { status: 500 });
  }
}
