import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { db } from "@/lib/db";
import { ArticleCard } from "@/components/content/ArticleCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cronicas" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: { canonical: `/${locale}/cronicas` },
  };
}

export default async function CronicasPage() {
  const t = useTranslations("cronicas");
  const articles = await db.article
    .findMany({
      where: { status: "PUBLISHED", series: "CRONICAS" },
      orderBy: [{ order: "asc" }, { publishedAt: "asc" }],
      select: { slug: true, title: true, excerpt: true, coverImage: true },
    })
    .catch(() => []);

  return (
    <div className="mx-auto max-w-content px-6 py-14">
      <h1 className="mb-2 font-display text-4xl uppercase text-tinta">{t("title")}</h1>
      <p className="mb-10 font-serif text-lg text-tinta/70">
        {t("description")}
      </p>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </div>
    </div>
  );
}
