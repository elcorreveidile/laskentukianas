import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export const dynamic = "force-dynamic";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6">
      <Link href="/" className="mb-6 text-center font-display text-2xl uppercase text-kentuki-dark">
        Crónicas Kentukianas
      </Link>
      <div className="rounded-2xl border border-black/10 bg-white p-8 shadow-card">
        <LoginForm googleEnabled={googleEnabled} initialError={searchParams.error} />
      </div>
    </div>
  );
}
