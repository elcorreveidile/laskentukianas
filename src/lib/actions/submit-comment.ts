"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { verifyChallenge } from "@/lib/spam";

const schema = z.object({
  articleId: z.string().min(1),
  authorName: z.string().trim().min(2, "Pon tu nombre").max(60),
  content: z.string().trim().min(2, "Escribe algo").max(3000),
  answer: z.coerce.number(),
  token: z.string().min(1),
  website: z.string().optional(), // honeypot (debe ir vacío)
  startedAt: z.coerce.number(),
});

export type CommentResult = { ok: boolean; message?: string; error?: string };

export async function submitComment(input: unknown): Promise<CommentResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Revisa los campos." };
  }
  const d = parsed.data;

  const PENDING = "¡Gracias! Tu comentario queda pendiente de moderación.";

  // 1) Honeypot: si un bot rellena el campo oculto, fingimos éxito y no guardamos.
  if (d.website && d.website.trim() !== "") {
    return { ok: true, message: PENDING };
  }
  // 2) Trampa de tiempo: enviado demasiado rápido = bot.
  if (Date.now() - d.startedAt < 3000) {
    return { ok: false, error: "Un momento… inténtalo de nuevo en un par de segundos." };
  }
  // 3) Operación anti-spam.
  if (!verifyChallenge(d.answer, d.token)) {
    return { ok: false, error: "La operación anti-spam no es correcta." };
  }

  const article = await db.article.findUnique({
    where: { id: d.articleId },
    select: { id: true, slug: true },
  });
  if (!article) return { ok: false, error: "Artículo no encontrado." };

  await db.comment.create({
    data: {
      articleId: article.id,
      authorName: d.authorName,
      content: d.content,
      approved: false, // pasa por moderación
    },
  });

  revalidatePath(`/${article.slug}`);
  revalidatePath("/admin/comentarios");
  return { ok: true, message: PENDING };
}
