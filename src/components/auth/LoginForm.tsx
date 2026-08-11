"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MagicLinkForm } from "@/components/auth/MagicLinkForm";

type Mode = "password" | "magic" | "forgot";

export function LoginForm({
  googleEnabled,
  initialError,
}: {
  googleEnabled: boolean;
  initialError?: string;
}) {
  const t = useTranslations("login");
  const tForgot = useTranslations("login.forgot");
  const tMagic = useTranslations("login.magicLinkPage");
  const tMagicForm = useTranslations("login.magicForm");
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const errorMap: Record<string, string> = {
    EmailSignin: t("errors.EmailSignin"),
    Verification: t("errors.Verification"),
    OAuthAccountNotLinked: t("errors.OAuthAccountNotLinked"),
  };

  const [error, setError] = useState(initialError ? errorMap[initialError] ?? "" : "");

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  async function onPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setError("Credenciales inválidas");
    else {
      router.push("/admin");
      router.refresh();
    }
  }

  async function onForgotSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: forgotEmail }),
    }).catch(() => {});
    setLoading(false);
    setForgotSent(true);
  }

  if (mode === "magic") {
    return (
      <div className="space-y-4">
        <h1 className="font-body text-xl font-bold">{t("magicLink")}</h1>
        <p className="text-sm text-tinta/60">{t("magicLinkDesc")}</p>
        <MagicLinkForm />
        <button onClick={() => setMode("password")} className="text-sm text-kentuki-dark hover:underline">
          {t("back")}
        </button>
      </div>
    );
  }

  if (mode === "forgot") {
    return (
      <div className="space-y-4">
        <h1 className="font-body text-xl font-bold">{tForgot("title")}</h1>
        {forgotSent ? (
          <p className="rounded-lg border border-kentuki/40 bg-kentuki/5 p-4 text-sm text-tinta/80">
            {tForgot("sent")}
          </p>
        ) : (
          <form onSubmit={onForgotSubmit} className="space-y-3">
            <input
              type="email"
              required
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full rounded-lg border border-black/15 px-4 py-3 text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-kentuki px-4 py-3 font-display uppercase tracking-wide text-white transition hover:bg-kentuki-dark disabled:opacity-50"
            >
              {loading ? tForgot("sending") : tForgot("submit")}
            </button>
          </form>
        )}
        <button onClick={() => setMode("password")} className="text-sm text-kentuki-dark hover:underline">
          {t("back")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="font-body text-xl font-bold">{t("title")}</h1>
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {googleEnabled && (
        <>
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-black/15 bg-white px-4 py-3 font-body font-semibold text-tinta transition hover:bg-black/5"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 5.1 29.4 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.2-.1-2.3-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 5.1 29.4 3 24 3 15.9 3 8.9 7.6 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 45c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.6 26.7 36.5 24 36.5c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C8.8 40.3 15.8 45 24 45z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.3 5.3C41.4 36 44 30.6 44 24c0-1.2-.1-2.3-.4-3.5z"/>
            </svg>
            {t("google")}
          </button>
          <div className="flex items-center gap-3 text-xs text-tinta/40">
            <span className="h-px flex-1 bg-black/10" /> o <span className="h-px flex-1 bg-black/10" />
          </div>
        </>
      )}

      <form onSubmit={onPasswordSubmit} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="w-full rounded-lg border border-black/15 px-4 py-3"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-lg border border-black/15 px-4 py-3"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-kentuki px-4 py-3 font-display uppercase tracking-wide text-white transition hover:bg-kentuki-dark disabled:opacity-50"
        >
          {loading ? t("entering") : t("enter")}
        </button>
      </form>

      <div className="flex justify-between text-sm">
        <button onClick={() => setMode("magic")} className="text-kentuki-dark hover:underline">
          {t("magicLink")}
        </button>
        <button onClick={() => setMode("forgot")} className="text-tinta/60 hover:underline">
          {t("forgotPassword")}
        </button>
      </div>
    </div>
  );
}
