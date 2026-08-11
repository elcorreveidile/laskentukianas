import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return { title: "Magic link", robots: { index: false, follow: false } };
}

export default function MagicLinkVerifyPage({
  searchParams,
}: {
  searchParams: { token?: string; email?: string };
}) {
  const t = useTranslations("login.magicLinkPage");
  const token = searchParams.token ?? "";
  const email = searchParams.email ?? "";
  const valid = Boolean(token && email);

  async function entrar() {
    "use server";
    if (!token || !email) redirect("/login?error=Verification");
    try {
      await signIn("magic-link", { token, email, redirectTo: "/" });
    } catch (error) {
      if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
      redirect("/login?error=EmailSignin");
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 text-center">
      <h1 className="mb-2 font-display text-3xl uppercase text-kentuki-dark">{t("title")}</h1>
      {valid ? (
        <>
          <p className="mb-6 font-serif text-tinta/70">
            {t("description")}
          </p>
          <form action={entrar}>
            <button
              type="submit"
              className="w-full rounded-lg bg-kentuki px-6 py-3 font-display uppercase tracking-wide text-white transition hover:bg-kentuki-dark"
            >
              {t("backToAccess").replace("← ", "")}
            </button>
          </form>
          <p className="mt-4 text-xs text-tinta/50">
            {t("expires")}
          </p>
        </>
      ) : (
        <>
          <p className="mb-6 font-serif text-tinta/70">
            {t("invalid")}
          </p>
          <Link
            href="/login"
            className="inline-block rounded-lg bg-kentuki px-6 py-3 font-display uppercase tracking-wide text-white transition hover:bg-kentuki-dark"
          >
            {t("backToAccess")}
          </Link>
        </>
      )}
    </div>
  );
}
