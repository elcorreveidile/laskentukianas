import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { db } from "@/lib/db";

export async function PhotoGallery() {
  const images = await db.galleryImage
    .findMany({ orderBy: { order: "asc" } })
    .catch(() => [] as { id: string; url: string; caption: string | null; link: string | null }[]);

  if (images.length === 0) return null;

  const t = await getTranslations("gallery");

  return (
    <section className="mt-16 border-t border-black/10 pt-10">
      <h2 className="mb-8 text-center font-display text-2xl uppercase text-tinta">{t("heading")}</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3">
        {images.map((img) => {
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
