import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { NewsletterForm } from "@/components/NewsletterForm";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "newsletter" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: { canonical: `/${locale}/newsletter` },
  };
}

export default function NewsletterPage() {
  const t = useTranslations("newsletter");

  return (
    <div className="mx-auto max-w-article px-6 py-16 text-center">
      <p className="font-hand text-2xl text-kentuki-dark">🥁</p>
      <h1 className="font-display text-4xl uppercase text-tinta">{t("title")}</h1>
      <p className="mx-auto mt-4 max-w-md font-serif text-lg text-tinta/75">
        {t("description")}
      </p>
      <NewsletterForm />
      <p className="mt-4 text-xs text-tinta/40">
        {t("unsubscribe")}
      </p>
    </div>
  );
}
