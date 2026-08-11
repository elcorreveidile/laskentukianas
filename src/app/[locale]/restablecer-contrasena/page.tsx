"use client";

import { Suspense, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";

function ResetForm() {
  const t = useTranslations("resetPassword");
  const params = useSearchParams();
  const email = useMemo(() => params.get("email") || "", [params]);
  const token = useMemo(() => params.get("token") || "", [params]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const invalid = !email || !token;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError(t("mismatch"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || t("error"));
        return;
      }
      setSuccess(true);
      setPassword("");
      setConfirm("");
    } catch {
      setError(t("errorRetry"));
    } finally {
      setLoading(false);
    }
  }

  if (invalid) {
    return (
      <p className="font-serif text-tinta/70">
        {t("invalid")}{" "}
        <Link href="/login" className="text-kentuki-dark underline">
          {t("backToAccess")}
        </Link>
        .
      </p>
    );
  }

  if (success) {
    return (
      <div role="status" className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-center">
        <p className="font-bold text-emerald-800">{t("success")}</p>
        <Link
          href="/login"
          className="mt-3 inline-block rounded-lg bg-kentuki px-5 py-2.5 font-semibold text-white hover:bg-kentuki-dark"
        >
          {t("login")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-tinta/60">{t("for", { email })}</p>
      <div>
        <label className="mb-1 block text-sm font-medium">{t("newPassword")}</label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-black/15 px-4 py-3"
          placeholder={t("placeholder")}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">{t("repeatPassword")}</label>
        <input
          type="password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full rounded-lg border border-black/15 px-4 py-3"
          placeholder="••••••••"
        />
      </div>
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-kentuki px-4 py-3 font-display uppercase tracking-wide text-white transition hover:bg-kentuki-dark disabled:opacity-50"
      >
        {loading ? t("saving") : t("save")}
      </button>
    </form>
  );
}

export default function RestablecerContrasenaPage() {
  const t = useTranslations("resetPassword");

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6">
      <Link href="/" className="mb-6 text-center font-display text-2xl uppercase text-kentuki-dark">
        Crónicas Kentukianas
      </Link>
      <div className="rounded-2xl border border-black/10 bg-white p-8 shadow-card">
        <h1 className="mb-6 font-body text-xl font-bold">{t("title")}</h1>
        <Suspense fallback={<p className="text-tinta/60">{t("loading")}</p>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
