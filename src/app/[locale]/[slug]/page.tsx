import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import sanitizeHtml from "sanitize-html";
import { db } from "@/lib/db";
import { makeChallenge } from "@/lib/spam";
import { CommentForm } from "@/components/content/CommentForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const a = await db.article.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: { title: true, excerpt: true, coverImage: true, publishedAt: true, byline: true },
  });
  if (!a) return { title: "Not found" };
  const t = await getTranslations({ locale, namespace: "article" });
  const description = a.excerpt || `${a.title} — Crónicas Kentukianas`;
  return {
    title: a.title,
    description,
    alternates: { canonical: `/${locale}/${slug}` },
    openGraph: {
      type: "article",
      title: a.title,
      description,
      url: `/${locale}/${slug}`,
      images: a.coverImage ? [{ url: a.coverImage }] : undefined,
      publishedTime: a.publishedAt?.toISOString(),
      authors: a.byline ? [a.byline] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: a.title,
      description,
      images: a.coverImage ? [a.coverImage] : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "article" });

  const article = await db.article.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      comments: {
        where: { approved: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!article) notFound();

  const [prev, next] = await Promise.all([
    db.article.findFirst({
      where: { series: article.series, status: "PUBLISHED", order: { lt: article.order } },
      orderBy: { order: "desc" },
      select: { slug: true, title: true },
    }),
    db.article.findFirst({
      where: { series: article.series, status: "PUBLISHED", order: { gt: article.order } },
      orderBy: { order: "asc" },
      select: { slug: true, title: true },
    }),
  ]);

  const clean = sanitizeHtml(article.content, {
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
      <p className="font-hand text-xl text-kentuki-dark">
        {t(`series.${article.series}`)}
      </p>
      <h1 className="mt-1 font-body text-3xl font-extrabold leading-tight text-tinta md:text-4xl">
        {article.title}
      </h1>
      <p className="mt-3 text-sm text-tinta/60">
        {article.byline ? t("by", { name: article.byline }) : null}
        {article.publishedAt
          ? ` · ${new Date(article.publishedAt).toLocaleDateString(localeStr, {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}`
          : null}
      </p>

      {article.coverImage && (
        <img
          src={article.coverImage}
          alt={article.title}
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
          {article.comments.length > 0
            ? t("commentsCount", { count: article.comments.length })
            : t("comments")}
        </h2>
        {article.comments.length > 0 ? (
          <ul className="mt-6 space-y-5">
            {article.comments.map((c) => (
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
          articleId={article.id}
          a={challenge.a}
          b={challenge.b}
          token={challenge.token}
        />
      </section>
    </article>
  );
}
