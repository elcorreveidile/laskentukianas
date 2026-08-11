import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "garito" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: { canonical: `/${locale}/garito` },
  };
}

const BLOB_GIG =
  "https://nkrpa7hjjwvhb02a.public.blob.vercel-storage.com/wp/506-VID_20230804_0012150_0_COMPRESSED-1.mp4";

const VIDEOS = [
  { src: "/videos/intro.mp4", poster: "/videos/intro-poster.jpg", titleKey: "drumStreet" },
  { src: "/videos/gig2.mp4", poster: "/videos/gig2-poster.jpg", titleKey: "live" },
  { src: BLOB_GIG, poster: undefined as string | undefined, titleKey: "morePower" },
];

export default function GaritoPage() {
  const t = useTranslations("garito");

  return (
    <>
      <section className="bg-escenario text-white">
        <div className="mx-auto max-w-content px-6 py-16 text-center">
          <p className="font-hand text-2xl text-ambar">{t("subtitle")}</p>
          <h1
            className="mt-1 font-display text-5xl uppercase md:text-6xl"
            style={{ textShadow: "0 0 20px rgba(255,55,95,.6), 0 0 44px rgba(245,166,35,.4)" }}
          >
            {t("title")}
          </h1>
          <p className="mx-auto mt-5 max-w-xl font-serif text-lg text-white/75">
            {t("description")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-12">
        <h2 className="mb-6 font-display text-2xl uppercase text-tinta">{t("liveTitle")}</h2>
        <div className="space-y-8">
          {[
            { id: "DHMq9jRC5_4", cap: "Holy Crackers — «Don't wake me now»" },
            { id: "-akWmqJUeDc", cap: "Y además… rap en directo 🎤" },
          ].map((v) => (
            <figure key={v.id}>
              <div className="aspect-video overflow-hidden rounded-2xl border border-black/10 bg-black shadow-card">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${v.id}`}
                  title={v.cap}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <figcaption className="mt-2 text-center font-hand text-lg text-tinta/70">
                {v.cap}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-content px-6 pb-6">
        <h2 className="mb-6 font-display text-2xl uppercase text-tinta">{t("drumsticks")}</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {VIDEOS.map((v) => (
            <figure key={v.src} className="overflow-hidden rounded-xl border border-black/10 bg-black">
              <video
                controls
                playsInline
                preload="metadata"
                poster={v.poster}
                className="mx-auto max-h-[70vh] w-full bg-black object-contain"
              >
                <source src={v.src} type="video/mp4" />
              </video>
            </figure>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-content px-6 pb-16 text-center">
        <p className="font-hand text-xl text-kentuki-dark">
          {t("hint")}
        </p>
      </section>
    </>
  );
}
