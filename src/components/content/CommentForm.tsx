"use client";

import { useState } from "react";
import { submitComment } from "@/lib/actions/submit-comment";

const input = "w-full rounded-lg border border-black/15 px-4 py-2 focus:ring-2 focus:ring-kentuki";

export function CommentForm({
  articleId,
  a,
  b,
  token,
}: {
  articleId: string;
  a: number;
  b: number;
  token: string;
}) {
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [answer, setAnswer] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
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
      setMsg({ ok: true, text: res.message ?? "Enviado." });
      setAuthorName("");
      setContent("");
      setAnswer("");
    } else {
      setMsg({ ok: false, text: res.error ?? "No se pudo enviar." });
    }
  };

  return (
    <form onSubmit={onSubmit} className="mt-6 rounded-xl border border-black/10 bg-white p-5">
      <h3 className="font-body text-lg font-bold text-tinta">Deja tu comentario</h3>
      <p className="mb-4 text-sm text-tinta/60">
        Se publicará cuando Jorge lo revise.
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

      {/* Honeypot: oculto para humanos, tentador para bots */}
      <div aria-hidden className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden">
        <label>
          No rellenar
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
          placeholder="Tu nombre"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          required
          maxLength={60}
        />
        <textarea
          className={input}
          placeholder="Tu comentario…"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          maxLength={3000}
        />
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-tinta">
            Anti-spam: ¿cuánto es {a} + {b}?
          </label>
          <input
            className="w-20 rounded-lg border border-black/15 px-3 py-2 focus:ring-2 focus:ring-kentuki"
            inputMode="numeric"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            required
            aria-label={`Cuánto es ${a} más ${b}`}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={sending}
        className="mt-4 rounded-lg bg-kentuki px-6 py-2.5 font-display uppercase tracking-wide text-white transition hover:bg-kentuki-dark disabled:opacity-50"
      >
        {sending ? "Enviando…" : "Enviar comentario"}
      </button>
    </form>
  );
}
