import { getLocale, getTranslations } from "next-intl/server";
import { ArticleCard } from "@/components/content/ArticleCard";
import { PhotoGallery } from "@/components/PhotoGallery";
import { listArticleCards, type AppLocale } from "@/lib/articles";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "menorquianas" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: {
      canonical: `/${locale}/menorquianas`,
      languages: { es: "/es/menorquianas", en: "/en/menorquianas" },
    },
  };
}

export default async function MenorquianasPage() {
  const t = await getTranslations("menorquianas");
  const locale = (await getLocale()) as AppLocale;
  const articles = await listArticleCards(
    { status: "PUBLISHED", series: "MENORQUIANA" },
    { order: "asc" },
    locale
  );

  return (
    <div className="mx-auto max-w-content px-6 py-14">
      <h1 className="mb-2 font-display text-4xl uppercase text-tinta">{t("title")}</h1>
      <p className="mb-8 font-serif text-lg text-tinta/70">
        {t("description")}
      </p>
      <p className="mb-10 max-w-2xl whitespace-pre-line font-serif text-lg text-tinta/80">
        {t("intro")}
      </p>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </div>
      <PhotoGallery />
    </div>
  );
}
