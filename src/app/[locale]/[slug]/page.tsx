import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import sanitizeHtml from "sanitize-html";
import { makeChallenge } from "@/lib/spam";
import { CommentForm } from "@/components/content/CommentForm";
import { SetLocaleAlternates } from "@/components/i18n/LocaleAlternates";
import { resolveArticle, localizedNeighbor, type AppLocale } from "@/lib/articles";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const resolved = await resolveArticle(slug, locale as AppLocale);
  if (!resolved) return { title: "Not found" };

  const { base, title, excerpt, metaTitle, metaDescription, esSlug, enSlug } = resolved;
  const enPath = `/en/${enSlug ?? esSlug}`;
  const esPath = `/es/${esSlug}`;
  const canonical = locale === "en" ? enPath : esPath;
  const description = metaDescription || excerpt || `${title} — Crónicas Kentukianas`;

  return {
    title: metaTitle || title,
    description,
    alternates: {
      canonical,
      languages: { es: esPath, en: enPath },
    },
    openGraph: {
      type: "article",
      title: metaTitle || title,
      description,
      url: canonical,
      images: base.coverImage ? [{ url: base.coverImage }] : undefined,
      publishedTime: base.publishedAt?.toISOString(),
      authors: base.byline ? [base.byline] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle || title,
      description,
      images: base.coverImage ? [base.coverImage] : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const appLocale = locale as AppLocale;
  const t = await getTranslations({ locale, namespace: "article" });

  const resolved = await resolveArticle(slug, appLocale);
  if (!resolved) notFound();

  const { base, title, content, esSlug, enSlug } = resolved;

  const [prev, next] = await Promise.all([
    localizedNeighbor(base.series, base.order, "prev", appLocale),
    localizedNeighbor(base.series, base.order, "next", appLocale),
  ]);

  const clean = sanitizeHtml(content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img", "figure", "figcaption", "h1", "h2", "iframe", "video", "audio", "source", "span",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "srcset", "alt", "title", "width", "height", "loading", "class"],
      a: ["href", "name", "target", "rel", "class"],
      iframe: ["src", "width", "height", "allow", "allowfullscreen", "frameborder", "title", "loading"],
      video: ["src", "controls", "poster", "width", "height", "preload", "class"],
      audio: ["src", "controls", "preload"],
      source: ["src", "type", "srcset"],
      "*": ["class", "id", "style"],
    },
    allowedIframeHostnames: [
      "www.youtube.com", "youtube.com", "youtube-nocookie.com",
      "www.youtube-nocookie.com", "player.vimeo.com", "open.spotify.com",
    ],
  });
  const challenge = makeChallenge();

  const localeStr = locale === "es" ? "es-ES" : "en-US";

  return (
    <article className="mx-auto max-w-article px-6 py-12">
      {/* Registra las rutas equivalentes para que el selector mapee el slug. */}
      <SetLocaleAlternates es={`/${esSlug}`} en={`/${enSlug ?? esSlug}`} />

      <p className="font-hand text-xl text-kentuki-dark">
        {t(`series.${base.series}`)}
      </p>
      <h1 className="mt-1 font-body text-3xl font-extrabold leading-tight text-tinta md:text-4xl">
        {title}
      </h1>
      <p className="mt-3 text-sm text-tinta/60">
        {base.byline ? t("by", { name: base.byline }) : null}
        {base.publishedAt
          ? ` · ${new Date(base.publishedAt).toLocaleDateString(localeStr, {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}`
          : null}
      </p>

      {base.coverImage && (
        <img
          src={base.coverImage}
          alt={title}
          className="mt-6 w-full rounded-xl object-cover"
        />
      )}

      <div
        className="prose-editorial mt-8"
        dangerouslySetInnerHTML={{ __html: clean }}
      />

      <nav className="mt-12 flex justify-between gap-4 border-t border-black/10 pt-6 text-sm">
        {prev ? (
          <Link href={`/${prev.slug}`} className="max-w-[45%] text-kentuki-dark hover:underline">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/${next.slug}`}
            className="max-w-[45%] text-right text-kentuki-dark hover:underline"
          >
            {next.title} →
          </Link>
        ) : (
          <span />
        )}
      </nav>

      <section className="mt-14">
        <h2 className="font-display text-2xl uppercase text-tinta">
          {base.comments.length > 0
            ? t("commentsCount", { count: base.comments.length })
            : t("comments")}
        </h2>
        {base.comments.length > 0 ? (
          <ul className="mt-6 space-y-5">
            {base.comments.map((c) => (
              <li key={c.id} className="rounded-lg border border-black/10 bg-white p-4">
                <p className="font-bold text-tinta">{c.authorName}</p>
                <p className="mt-1 whitespace-pre-line font-serif text-tinta/80">{c.content}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 font-serif text-tinta/60">
            {t("noComments")}
          </p>
        )}

        <CommentForm
          articleId={base.id}
          a={challenge.a}
          b={challenge.b}
          token={challenge.token}
        />
      </section>
    </article>
  );
}
