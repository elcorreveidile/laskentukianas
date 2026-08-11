import { getLocale, getTranslations } from "next-intl/server";
import { ArticleCard } from "@/components/content/ArticleCard";
import { listArticleCards, type AppLocale } from "@/lib/articles";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cronicas" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: {
      canonical: `/${locale}/cronicas`,
      languages: { es: "/es/cronicas", en: "/en/cronicas" },
    },
  };
}

export default async function CronicasPage() {
  const t = await getTranslations("cronicas");
  const locale = (await getLocale()) as AppLocale;
  const articles = await listArticleCards(
    { status: "PUBLISHED", series: "CRONICAS" },
    [{ order: "asc" }, { publishedAt: "asc" }],
    locale
  );

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
