import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Por2DurosCredit } from "@/components/Por2DurosCredit";

export function Footer() {
  const t = useTranslations("site");
  const tNav = useTranslations("nav");

  return (
    <footer className="mt-20 border-t border-black/10 bg-crema">
      <div className="mx-auto flex max-w-content flex-col items-center gap-2 px-6 py-10 text-center text-sm text-tinta/60">
        <p className="font-display text-lg uppercase tracking-wide text-kentuki-dark">
          {t("name")}
        </p>
        <p>{t("footer")}</p>
        <nav className="mt-2 flex flex-wrap justify-center gap-4">
          <Link href="/cronicas" className="hover:text-kentuki">{tNav("cronicas")}</Link>
          <Link href="/kentukiana" className="hover:text-kentuki">{tNav("kentukiana")}</Link>
          <Link href="/newsletter" className="hover:text-kentuki">{tNav("newsletter")}</Link>
        </nav>
        <p className="mt-4 text-xs text-tinta/60">
          <Por2DurosCredit />
        </p>
        <p className="text-xs text-tinta/40">
          © {new Date().getFullYear()} {t("name")}
        </p>
      </div>
    </footer>
  );
}
