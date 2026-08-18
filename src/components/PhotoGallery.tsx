import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { db } from "@/lib/db";

type GalleryImg = { id: string; url: string; caption: string | null; link: string | null };

/**
 * Extrae el slug candidato de un enlace interno del blog:
 * «/mi-entrada» → «mi-entrada», «/es/mi-entrada» → «mi-entrada».
 * Devuelve null para enlaces externos.
 */
function internalArticleSlug(link: string): string | null {
  if (!link.startsWith("/")) return null;
  const path = link.split(/[?#]/)[0].replace(/\/+$/, "");
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0) return null;
  if (parts[0] === "es" || parts[0] === "en") {
    return parts.length >= 2 ? parts[parts.length - 1] : null;
  }
  return parts[parts.length - 1];
}

/**
 * De entre los slugs dados, devuelve los que corresponden a un artículo que ya
 * no está publicado (archivado o borrador). Los slugs que no son artículos
 * (páginas estáticas como «/mapa») no se incluyen, así no se ocultan por error.
 */
async function unpublishedArticleSlugs(slugs: string[]): Promise<Set<string>> {
  const unique = Array.from(new Set(slugs));
  const unpublished = new Set<string>();
  if (unique.length === 0) return unpublished;

  try {
    const arts = await db.article.findMany({
      where: { slug: { in: unique } },
      select: { slug: true, status: true },
    });
    for (const a of arts) if (a.status !== "PUBLISHED") unpublished.add(a.slug);
  } catch (e) {
    console.error("[PhotoGallery] article status lookup:", e);
  }

  try {
    const trans = await db.articleTranslation.findMany({
      where: { slug: { in: unique } },
      select: { slug: true, article: { select: { status: true } } },
    });
    for (const tr of trans) if (tr.article.status !== "PUBLISHED") unpublished.add(tr.slug);
  } catch (e) {
    console.error("[PhotoGallery] translation status lookup:", e);
  }

  return unpublished;
}

export async function PhotoGallery() {
  const images = await db.galleryImage
    .findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] })
    .catch(() => [] as GalleryImg[]);

  if (images.length === 0) return null;

  // Oculta fotos cuyo enlace apunta a un artículo ya no publicado (archivado):
  // así la portada de un artículo archivado deja de aparecer y no queda un
  // enlace roto que lleve a un 404.
  const linkedSlugs = images
    .map((img) => (img.link ? internalArticleSlug(img.link) : null))
    .filter((s): s is string => Boolean(s));
  const unpublished = await unpublishedArticleSlugs(linkedSlugs);

  const visible = images.filter((img) => {
    if (!img.link) return true;
    const slug = internalArticleSlug(img.link);
    return !(slug && unpublished.has(slug));
  });

  if (visible.length === 0) return null;

  const t = await getTranslations("gallery");

  return (
    <section className="mt-16 border-t border-black/10 pt-10">
      <h2 className="mb-8 text-center font-display text-2xl uppercase text-tinta">{t("heading")}</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3">
        {visible.map((img) => {
          const image = (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img.url}
              alt={img.caption ?? ""}
              loading="lazy"
              className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
            />
          );

          const inner = (
            <figure className="group relative block overflow-hidden rounded-lg bg-black/5">
              {image}
              {img.caption && (
                <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 text-xs text-white opacity-0 transition group-hover:opacity-100">
                  {img.caption}
                </figcaption>
              )}
            </figure>
          );

          if (!img.link) return <div key={img.id}>{inner}</div>;

          return img.link.startsWith("/") ? (
            <Link key={img.id} href={img.link}>
              {inner}
            </Link>
          ) : (
            <a key={img.id} href={img.link} target="_blank" rel="noopener noreferrer">
              {inner}
            </a>
          );
        })}
      </div>
    </section>
  );
}
