import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LoginForm } from "@/components/auth/LoginForm";

export const dynamic = "force-dynamic";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const t = useTranslations("login");
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6">
      <Link href="/" className="mb-6 text-center font-display text-2xl uppercase text-kentuki-dark">
        Crónicas Kentukianas
      </Link>
      <div className="rounded-2xl border border-black/10 bg-white p-8 shadow-card">
        <LoginForm googleEnabled={googleEnabled} initialError={searchParams.error} />
      </div>
      <div className="mt-5 flex justify-center gap-4 text-sm">
        <Link href="/" className="text-tinta/60 hover:text-kentuki-dark">
          {t("backToSite")}
        </Link>
        <span className="text-tinta/30">·</span>
        <Link href="/admin" className="text-tinta/60 hover:text-kentuki-dark">
          {t("toPanel")}
        </Link>
      </div>
    </div>
  );
}
