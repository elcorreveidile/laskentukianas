import { db } from "@/lib/db";
import type { Prisma, Series } from "@prisma/client";

export type AppLocale = "es" | "en";

export type CardArticle = {
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
};

const commentsInclude = {
  comments: { where: { approved: true }, orderBy: { createdAt: "asc" } },
} satisfies Prisma.ArticleInclude;

type ArticleWithComments = Prisma.ArticleGetPayload<{ include: typeof commentsInclude }>;

export type ResolvedArticle = {
  base: ArticleWithComments;
  title: string;
  excerpt: string | null;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  /** slug del artículo original (español) */
  esSlug: string;
  /** slug de la traducción inglesa, si existe */
  enSlug: string | null;
};

/**
 * Listado de tarjetas de artículos localizadas. En "en" usa la traducción
 * (slug/title/excerpt) si existe, con fallback a español. Resiliente si la
 * tabla de traducciones aún no existe (cae a español).
 */
export async function listArticleCards(
  where: Prisma.ArticleWhereInput,
  orderBy:
    | Prisma.ArticleOrderByWithRelationInput
    | Prisma.ArticleOrderByWithRelationInput[],
  locale: AppLocale
): Promise<CardArticle[]> {
  if (locale === "en") {
    try {
      const rows = await db.article.findMany({
        where,
        orderBy,
        select: {
          slug: true,
          title: true,
          excerpt: true,
          coverImage: true,
          translations: {
            where: { locale: "en" },
            select: { slug: true, title: true, excerpt: true },
            take: 1,
          },
        },
      });
      return rows.map((a) => {
        const tr = a.translations[0];
        return {
          slug: tr?.slug ?? a.slug,
          title: tr?.title ?? a.title,
          excerpt: tr?.excerpt ?? a.excerpt,
          coverImage: a.coverImage,
        };
      });
    } catch (e) {
      console.error("[listArticleCards] fallback:", e);
    }
  }

  try {
    const rows = await db.article.findMany({
      where,
      orderBy,
      select: { slug: true, title: true, excerpt: true, coverImage: true },
    });
    return rows;
  } catch (e) {
    console.error("[listArticleCards]", e);
    return [];
  }
}

/**
 * Resuelve un artículo por slug para un locale, con textos traducidos si
 * existen y fallback a español. Los campos no textuales (portada, comentarios,
 * serie, orden, fecha) vienen siempre del artículo base.
 */
export async function resolveArticle(
  slug: string,
  locale: AppLocale
): Promise<ResolvedArticle | null> {
  let base: ArticleWithComments | null = null;
  let en: {
    slug: string;
    title: string;
    excerpt: string | null;
    content: string;
    metaTitle: string | null;
    metaDescription: string | null;
  } | null = null;

  if (locale === "en") {
    // 1) Buscar por el slug de la traducción inglesa.
    try {
      const tr = await db.articleTranslation.findFirst({
        where: { locale: "en", slug, article: { status: "PUBLISHED" } },
        include: { article: { include: commentsInclude } },
      });
      if (tr) {
        base = tr.article;
        en = {
          slug: tr.slug,
          title: tr.title,
          excerpt: tr.excerpt,
          content: tr.content,
          metaTitle: tr.metaTitle,
          metaDescription: tr.metaDescription,
        };
      }
    } catch (e) {
      console.error("[resolveArticle] translation lookup:", e);
      // tabla ausente → seguimos con el fallback por slug español
    }
  }

  // 2) Buscar por el slug del artículo (español); también es el fallback en "en".
  if (!base) {
    base = await db.article.findFirst({
      where: { slug, status: "PUBLISHED" },
      include: commentsInclude,
    });
    if (base && locale === "en" && !en) {
      try {
        const tr = await db.articleTranslation.findUnique({
          where: { articleId_locale: { articleId: base.id, locale: "en" } },
        });
        if (tr) {
          en = {
            slug: tr.slug,
            title: tr.title,
            excerpt: tr.excerpt,
            content: tr.content,
            metaTitle: tr.metaTitle,
            metaDescription: tr.metaDescription,
          };
        }
      } catch (e) {
        console.error("[resolveArticle] en translation:", e);
      }
    }
  }

  if (!base) return null;

  return {
    base,
    title: en?.title ?? base.title,
    excerpt: en?.excerpt ?? base.excerpt,
    content: en?.content ?? base.content,
    metaTitle: en?.metaTitle ?? base.metaTitle,
    metaDescription: en?.metaDescription ?? base.metaDescription,
    esSlug: base.slug,
    enSlug: en?.slug ?? null,
  };
}

/** Vecino (anterior/siguiente) de una serie, con slug/título localizados. */
export async function localizedNeighbor(
  series: Series,
  order: number,
  dir: "prev" | "next",
  locale: AppLocale
): Promise<{ slug: string; title: string } | null> {
  const article = await db.article.findFirst({
    where: {
      series,
      status: "PUBLISHED",
      order: dir === "prev" ? { lt: order } : { gt: order },
    },
    orderBy: { order: dir === "prev" ? "desc" : "asc" },
    select: { id: true, slug: true, title: true },
  });
  if (!article) return null;

  if (locale === "en") {
    try {
      const tr = await db.articleTranslation.findUnique({
        where: { articleId_locale: { articleId: article.id, locale: "en" } },
        select: { slug: true, title: true },
      });
      if (tr) return { slug: tr.slug, title: tr.title };
      } catch (e) {
        console.error("[localizedNeighbor]", e);
      }
  }
  return { slug: article.slug, title: article.title };
}

export type SearchHit = { slug: string; title: string };

/** Búsqueda localizada. En "en" busca sobre las traducciones inglesas. */
export async function searchArticles(
  q: string,
  locale: AppLocale
): Promise<SearchHit[]> {
  if (locale === "en") {
    try {
      return await db.articleTranslation.findMany({
        where: {
          locale: "en",
          article: { status: "PUBLISHED" },
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { content: { contains: q, mode: "insensitive" } },
          ],
        },
        orderBy: { article: { order: "asc" } },
        select: { slug: true, title: true },
      });
    } catch (e) {
      console.error("[searchArticles] en fallback:", e);
    }
  }

  try {
    return await db.article.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { content: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { order: "asc" },
      select: { slug: true, title: true },
    });
  } catch (e) {
    console.error("[searchArticles]", e);
    return [];
  }
}
