import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import QuizReto from "@/components/QuizReto";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "reto" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: { canonical: `/${locale}/reto` },
  };
}

export default function RetoPage() {
  const t = useTranslations("reto");

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <header className="mb-8 text-center">
        <p className="font-hand text-2xl text-kentuki-dark">{t("subtitle")}</p>
        <h1 className="mt-1 font-display text-4xl uppercase text-tinta sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-3 max-w-lg font-serif text-lg text-tinta/70">
          {t("description")}
        </p>
      </header>
      <QuizReto />
    </div>
  );
}
