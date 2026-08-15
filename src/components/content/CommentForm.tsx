"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { submitComment } from "@/lib/actions/submit-comment";

const input = "w-full rounded-lg border border-black/15 px-4 py-2 focus:ring-2 focus:ring-kentuki";

export function CommentForm({
  articleId,
  a,
  b,
  op,
  token,
}: {
  articleId: string;
  a: number;
  b: number;
  op: string;
  token: string;
}) {
  const t = useTranslations("comment");
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [answer, setAnswer] = useState("");
  const [website, setWebsite] = useState("");
  const [startedAt] = useState(() => Date.now());
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setMsg(null);
    const res = await submitComment({
      articleId,
      authorName,
      content,
      answer,
      token,
      website,
      startedAt,
    });
    setSending(false);
    if (res.ok) {
      setMsg({ ok: true, text: res.message ?? t("success") });
      setAuthorName("");
      setContent("");
      setAnswer("");
    } else {
      setMsg({ ok: false, text: res.error ?? t("error") });
    }
  };

  return (
    <form onSubmit={onSubmit} className="mt-6 rounded-xl border border-black/10 bg-white p-5">
      <h3 className="font-body text-lg font-bold text-tinta">{t("title")}</h3>
      <p className="mb-4 text-sm text-tinta/60">
        {t("description")}
      </p>

      {msg && (
        <p
          className={`mb-4 rounded-lg p-3 text-sm ${
            msg.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"
          }`}
        >
          {msg.text}
        </p>
      )}

      <div aria-hidden="true" tabIndex={-1} className="absolute left-0 top-0 h-px w-px overflow-hidden opacity-0">
        <label>
          <input
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
      </div>

      <div className="space-y-3">
        <input
          className={input}
          placeholder={t("namePlaceholder")}
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          required
          maxLength={60}
        />
        <textarea
          className={input}
          placeholder={t("commentPlaceholder")}
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          maxLength={3000}
        />
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-tinta">
            {t("antiSpam", { a, b, op })}
          </label>
          <input
            className="w-20 rounded-lg border border-black/15 px-3 py-2 focus:ring-2 focus:ring-kentuki"
            inputMode="numeric"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            required
            aria-label={t("antiSpam", { a, b, op })}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={sending}
        className="mt-4 rounded-lg bg-kentuki px-6 py-2.5 font-display uppercase tracking-wide text-white transition hover:bg-kentuki-dark disabled:opacity-50"
      >
        {sending ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
