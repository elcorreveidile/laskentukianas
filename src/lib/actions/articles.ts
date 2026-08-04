"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

async function requireEditor() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user || !(role === "ADMIN" || role === "EDITOR")) {
    throw new Error("No autorizado");
  }
  return session;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const ArticleSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "El título es obligatorio"),
  slug: z.string().optional(),
  excerpt: z.string().optional().nullable(),
  content: z.string().min(1, "El contenido es obligatorio"),
  coverImage: z.string().optional().nullable(),
  series: z.enum(["CRONICAS", "KENTUKIANA", "PAGINA"]),
  order: z.coerce.number().int().default(0),
  status: z.enum(["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"]),
  byline: z.string().optional().nullable(),
  tags: z.string().optional(), // separadas por comas
});

export type ArticleInput = z.input<typeof ArticleSchema>;

export async function saveArticle(input: ArticleInput) {
  const session = await requireEditor();
  const data = ArticleSchema.parse(input);

  const tagNames = (data.tags ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  // Resolver etiquetas (upsert por slug)
  const tagIds: string[] = [];
  for (const name of tagNames) {
    const slug = slugify(name);
    if (!slug) continue;
    const tag = await db.tag.upsert({
      where: { slug },
      create: { name, slug },
      update: {},
    });
    tagIds.push(tag.id);
  }

  const existing = data.id
    ? await db.article.findUnique({ where: { id: data.id } })
    : null;

  const publishedAt =
    data.status === "PUBLISHED"
      ? existing?.publishedAt ?? new Date()
      : null;

  const base = {
    title: data.title,
    slug: data.slug || slugify(data.title),
    excerpt: data.excerpt || null,
    content: data.content,
    coverImage: data.coverImage || null,
    series: data.series,
    order: data.order,
    status: data.status,
    byline: data.byline || session.user?.name || null,
    publishedAt,
  };

  let article;
  if (existing) {
    article = await db.article.update({ where: { id: existing.id }, data: base });
    // resincronizar etiquetas
    await db.tagsOnArticles.deleteMany({ where: { articleId: existing.id } });
  } else {
    article = await db.article.create({
      data: { ...base, authorId: session.user!.id },
    });
  }
  if (tagIds.length) {
    await db.tagsOnArticles.createMany({
      data: tagIds.map((tagId) => ({ articleId: article.id, tagId })),
      skipDuplicates: true,
    });
  }

  revalidatePath("/");
  revalidatePath("/cronicas");
  revalidatePath("/kentukiana");
  revalidatePath(`/${article.slug}`);
  revalidatePath("/admin/articulos");
  return { id: article.id, slug: article.slug };
}

export async function deleteArticle(id: string) {
  await requireEditor();
  const a = await db.article.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });
  revalidatePath("/");
  revalidatePath("/admin/articulos");
  revalidatePath(`/${a.slug}`);
}
