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

function revalidateGallery() {
  revalidatePath("/admin/galeria");
  revalidatePath("/cronicas");
  revalidatePath("/kentukiana");
  revalidatePath("/menorquianas");
}

export async function addGalleryImage(formData: FormData) {
  await requireEditor();
  const url = String(formData.get("url") || "").trim();
  const caption = String(formData.get("caption") || "").trim() || null;
  const link = String(formData.get("link") || "").trim() || null;
  if (!url) return;

  const last = await db.galleryImage.findFirst({ orderBy: { order: "desc" } });
  await db.galleryImage.create({
    data: { url, caption, link, order: (last?.order ?? 0) + 1 },
  });
  revalidateGallery();
}

export async function deleteGalleryImage(id: string) {
  await requireEditor();
  await db.galleryImage.delete({ where: { id } }).catch(() => {});
  revalidateGallery();
}

// Intercambia el orden con la imagen vecina (arriba/abajo).
export async function moveGalleryImage(id: string, direction: "up" | "down") {
  await requireEditor();
  const all = await db.galleryImage.findMany({ orderBy: { order: "asc" } });
  const i = all.findIndex((g) => g.id === id);
  if (i === -1) return;
  const j = direction === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= all.length) return;

  const a = all[i];
  const b = all[j];
  await db.$transaction([
    db.galleryImage.update({ where: { id: a.id }, data: { order: b.order } }),
    db.galleryImage.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);
  revalidateGallery();
}
