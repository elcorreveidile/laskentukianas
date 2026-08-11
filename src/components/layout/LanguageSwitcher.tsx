"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useState, useTransition } from "react";

const LOCALE_LABELS: Record<string, string> = {
  es: "🇪🇸 ES",
  en: "🇺🇸 EN",
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function switchLocale(newLocale: string) {
    router.replace(pathname, { locale: newLocale });
    setOpen(false);
  }

  return (
    <div className="fixed bottom-6 left-6 z-40">
      <div className="relative">
        {open && (
          <div className="absolute bottom-12 left-0 flex flex-col gap-1 rounded-xl border border-black/10 bg-white p-1 shadow-lg">
            {routing.locales.map((l) => (
              <button
                key={l}
                onClick={() => switchLocale(l)}
                disabled={isPending}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  l === locale
                    ? "bg-kentuki text-white"
                    : "text-tinta hover:bg-black/5"
                }`}
              >
                {LOCALE_LABELS[l]}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 items-center gap-1.5 rounded-full bg-white px-3 text-sm font-medium text-tinta shadow-lg transition hover:bg-kentuki-light/40"
        >
          {LOCALE_LABELS[locale]}
        </button>
      </div>
    </div>
  );
}
