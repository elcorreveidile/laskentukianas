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

  await db.$transaction(async (tx) => {
    const last = await tx.galleryImage.findFirst({ orderBy: { order: "desc" } });
    await tx.galleryImage.create({
      data: { url, caption, link, order: (last?.order ?? 0) + 1 },
    });
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
  const item = await db.galleryImage.findUnique({ where: { id } });
  if (!item) return;

  const neighbor = await db.galleryImage.findFirst({
    where: { order: direction === "up" ? { lt: item.order } : { gt: item.order } },
    orderBy: { order: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbor) return;

  await db.$transaction([
    db.galleryImage.update({ where: { id: item.id }, data: { order: neighbor.order } }),
    db.galleryImage.update({ where: { id: neighbor.id }, data: { order: item.order } }),
  ]);
  revalidateGallery();
}
