import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const SITE = process.env.NEXT_PUBLIC_APP_URL || "https://laskentukianas.com";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await db.article
    .findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    })
    .catch(() => []);

  const staticRoutes: MetadataRoute.Sitemap = ["", "/cronicas", "/kentukiana", "/garito", "/mapa", "/reto", "/newsletter"].map(
    (p) => ({
      url: `${SITE}${p || "/"}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: p === "" ? 1 : 0.7,
    })
  );

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE}/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...articleRoutes];
}
