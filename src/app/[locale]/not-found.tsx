import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-content flex-col items-center justify-center px-6 text-center">
      <p className="font-hand text-3xl text-kentuki-dark">404</p>
      <h1 className="mt-2 font-display text-4xl uppercase text-tinta md:text-5xl">
        {t("title")}
      </h1>
      <p className="mt-4 max-w-md font-serif text-lg text-tinta/70">
        {t("description")}
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-full bg-kentuki px-7 py-3 font-display uppercase tracking-wide text-white transition hover:bg-kentuki-dark"
      >
        {t("home")}
      </Link>
    </div>
  );
}
