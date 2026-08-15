"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

async function requireEditor() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user || !(role === "ADMIN" || role === "EDITOR")) {
    throw new Error("No autorizado");
  }
}

export async function setCommentApproved(id: string, approved: boolean) {
  await requireEditor();
  const c = await db.comment.update({
    where: { id },
    data: { approved },
    include: { article: { select: { slug: true } } },
  });
  revalidatePath("/admin/comentarios");
  revalidatePath(`/es/${c.article.slug}`);
  revalidatePath(`/en/${c.article.slug}`);
}

export async function deleteComment(id: string) {
  await requireEditor();
  const c = await db.comment.delete({
    where: { id },
    include: { article: { select: { slug: true } } },
  });
  revalidatePath("/admin/comentarios");
  revalidatePath(`/es/${c.article.slug}`);
  revalidatePath(`/en/${c.article.slug}`);
}
