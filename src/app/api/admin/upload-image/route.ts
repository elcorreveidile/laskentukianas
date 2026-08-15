import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Vercel corta el cuerpo de una función serverless en ~4,5 MB; avisamos antes.
const MAX_BYTES = 4 * 1024 * 1024;

/**
 * Sube una imagen a Vercel Blob y devuelve su URL pública. Solo admin/editor.
 * Se usa desde el editor de artículos (portada e imágenes del cuerpo).
 */
export async function POST(req: Request) {
  const session = await auth();
  const role = session?.user?.role;
  if (!(role === "ADMIN" || role === "EDITOR")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "El almacenamiento (Vercel Blob) no está configurado." },
      { status: 500 }
    );
  }

  let file: FormDataEntryValue | null;
  try {
    const form = await req.formData();
    file = form.get("file");
  } catch {
    return NextResponse.json({ error: "Petición inválida" }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Falta el archivo" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "El archivo debe ser una imagen." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "La imagen supera el máximo de 4 MB. Redúcela e inténtalo de nuevo." },
      { status: 413 }
    );
  }

  const safeName =
    file.name.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/\.+$/g, ".").slice(-80) || "imagen";

  try {
    const blob = await put(`articulos/subidas/${safeName}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type || undefined,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return NextResponse.json({ url: blob.url });
  } catch (e) {
    console.error("upload-image error:", e);
    return NextResponse.json(
      { error: "No se pudo subir la imagen." },
      { status: 500 }
    );
  }
}
