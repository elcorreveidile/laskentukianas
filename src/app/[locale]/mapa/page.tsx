import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import MapaViaje from "@/components/MapaViaje";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "mapa" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: { canonical: `/${locale}/mapa` },
  };
}

export default function MapaPage() {
  const t = useTranslations("mapa");

  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <h1 className="font-display text-4xl uppercase text-tinta">{t("title")}</h1>
      <p className="mb-6 mt-2 font-serif text-lg text-tinta/70">
        {t("description")}
      </p>
      <MapaViaje />
    </div>
  );
}
