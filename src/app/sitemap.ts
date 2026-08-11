import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { routing } from "@/i18n/routing";

const SITE = process.env.NEXT_PUBLIC_APP_URL || "https://laskentukianas.com";

export const dynamic = "force-dynamic";

type ArticleRow = { slug: string; updatedAt: Date; translations: { slug: string }[] };

async function getArticles(): Promise<ArticleRow[]> {
  try {
    return await db.article.findMany({
      where: { status: "PUBLISHED" },
      select: {
        slug: true,
        updatedAt: true,
        translations: { where: { locale: "en" }, select: { slug: true }, take: 1 },
      },
    });
  } catch {
    // Tabla de traducciones ausente → solo español.
    const rows = await db.article
      .findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } })
      .catch(() => [] as { slug: string; updatedAt: Date }[]);
    return rows.map((r) => ({ ...r, translations: [] }));
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getArticles();

  const staticPaths = ["", "/cronicas", "/kentukiana", "/garito", "/mapa", "/reto", "/newsletter"];

  const staticRoutes: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${SITE}/${routing.defaultLocale}${p}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.7,
    alternates: {
      languages: Object.fromEntries(routing.locales.map((l) => [l, `${SITE}/${l}${p}`])),
    },
  }));

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => {
    const enSlug = a.translations[0]?.slug ?? a.slug;
    return {
      url: `${SITE}/es/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: { languages: { es: `${SITE}/es/${a.slug}`, en: `${SITE}/en/${enSlug}` } },
    };
  });

  return [...staticRoutes, ...articleRoutes];
}
