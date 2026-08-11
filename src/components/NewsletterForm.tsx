"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { subscribeNewsletter } from "@/lib/actions/newsletter";

export function NewsletterForm() {
  const t = useTranslations("newsletter");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setMsg(null);
    const res = await subscribeNewsletter({ email, website });
    setSending(false);
    if (res.ok) {
      setMsg({ ok: true, text: res.message ?? t("success") });
      setEmail("");
    } else {
      setMsg({ ok: false, text: res.error ?? t("error") });
    }
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-8 max-w-md">
      <div aria-hidden className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden">
        <input
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="flex-1 rounded-lg border border-black/15 px-4 py-3 focus:ring-2 focus:ring-kentuki"
        />
        <button
          type="submit"
          disabled={sending}
          className="rounded-lg bg-kentuki px-6 py-3 font-display uppercase tracking-wide text-white transition hover:bg-kentuki-dark disabled:opacity-50"
        >
          {sending ? "…" : t("subscribe")}
        </button>
      </div>

      {msg && (
        <p
          className={`mt-3 rounded-lg p-3 text-sm ${
            msg.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"
          }`}
        >
          {msg.text}
        </p>
      )}
    </form>
  );
}
