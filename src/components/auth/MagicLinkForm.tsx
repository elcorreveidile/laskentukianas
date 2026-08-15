"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type Status = "idle" | "sending" | "sent" | "error";
type Challenge = { a: number; b: number; op: string; token: string };

export function MagicLinkForm() {
  const t = useTranslations("login.magicForm");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [answer, setAnswer] = useState("");

  async function loadChallenge() {
    try {
      const res = await fetch("/api/auth/challenge", { cache: "no-store" });
      setChallenge(await res.json());
      setAnswer("");
    } catch {}
  }
  useEffect(() => {
    loadChallenge();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!challenge) return;
    setStatus("sending");
    setMessage(null);

    const fd = new FormData(e.currentTarget);
    fd.set("answer", answer);
    fd.set("challenge", challenge.token);

    try {
      const res = await fetch("/api/auth/magic-link", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus("sent");
        return;
      }
      setStatus("error");
      if (data?.error === "challenge") {
        setMessage(t("challengeError"));
        loadChallenge();
      } else {
        setMessage(typeof data?.error === "string" ? data.error : t("error"));
      }
    } catch {
      setStatus("error");
      setMessage(t("errorRetry"));
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="rounded-lg border border-kentuki/40 bg-kentuki/5 p-4 text-center text-sm">
        <p className="font-bold text-tinta">{t("sent")}</p>
        <p className="mt-1 text-tinta/70">
          {t("sentDesc")}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />
      <input
        name="name"
        type="text"
        required
        minLength={2}
        placeholder={t("namePlaceholder")}
        className="w-full rounded-lg border border-black/15 px-4 py-3 text-sm"
      />
      <input
        name="email"
        type="email"
        required
        placeholder={t("emailPlaceholder")}
        className="w-full rounded-lg border border-black/15 px-4 py-3 text-sm"
      />
      <div className="flex items-center gap-2">
        <label className="text-sm text-tinta/70">
          {t("challenge", { a: challenge?.a ?? "…", b: challenge?.b ?? "…", op: challenge?.op ?? "+" })}
        </label>
        <input
          type="number"
          required
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-20 rounded-lg border border-black/15 px-3 py-2 text-sm"
          aria-label="Resultado de la operación"
        />
      </div>

      {status === "error" && message && (
        <p role="alert" className="text-sm text-red-600">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending" || !challenge}
        className="w-full rounded-lg border border-kentuki bg-white px-4 py-3 font-body font-semibold text-kentuki-dark transition hover:bg-kentuki/5 disabled:opacity-50"
      >
        {status === "sending" ? t("sending") : t("submit")}
      </button>
    </form>
  );
}
