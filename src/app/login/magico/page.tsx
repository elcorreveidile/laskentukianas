import Link from "next/link";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";

export const metadata = {
  title: "Entrar con enlace mágico",
  robots: { index: false, follow: false },
};

export default function MagicLinkVerifyPage({
  searchParams,
}: {
  searchParams: { token?: string; email?: string };
}) {
  const token = searchParams.token ?? "";
  const email = searchParams.email ?? "";
  const valid = Boolean(token && email);

  async function entrar() {
    "use server";
    if (!token || !email) redirect("/login?error=Verification");
    try {
      await signIn("magic-link", { token, email, redirectTo: "/" });
    } catch (error) {
      // signIn lanza NEXT_REDIRECT al tener éxito: hay que re-lanzarlo.
      if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
      redirect("/login?error=EmailSignin");
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 text-center">
      <h1 className="mb-2 font-display text-3xl uppercase text-kentuki-dark">Enlace mágico</h1>
      {valid ? (
        <>
          <p className="mb-6 font-serif text-tinta/70">
            Pulsa el botón para entrar en tu cuenta de Crónicas Kentukianas.
          </p>
          <form action={entrar}>
            <button
              type="submit"
              className="w-full rounded-lg bg-kentuki px-6 py-3 font-display uppercase tracking-wide text-white transition hover:bg-kentuki-dark"
            >
              Entrar
            </button>
          </form>
          <p className="mt-4 text-xs text-tinta/50">
            El enlace caduca en 1 hora y solo puede usarse una vez.
          </p>
        </>
      ) : (
        <>
          <p className="mb-6 font-serif text-tinta/70">
            Este enlace no es válido o está incompleto. Solicita uno nuevo desde la página de acceso.
          </p>
          <Link
            href="/login"
            className="inline-block rounded-lg bg-kentuki px-6 py-3 font-display uppercase tracking-wide text-white transition hover:bg-kentuki-dark"
          >
            Volver al acceso
          </Link>
        </>
      )}
    </div>
  );
}
