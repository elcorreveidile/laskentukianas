"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useTransition } from "react";

const LOCALE_FLAGS: Record<string, string> = { es: "🇪🇸", en: "🇺🇸" };
const LOCALE_NAMES: Record<string, string> = { es: "Español", en: "English (US)" };

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function switchLocale(next: string) {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-full border border-black/10 bg-white/60 p-0.5 ${className}`}
      role="group"
      aria-label="Idioma / Language"
    >
      {routing.locales.map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            type="button"
            onClick={() => switchLocale(l)}
            disabled={isPending}
            aria-pressed={active}
            aria-label={LOCALE_NAMES[l]}
            title={LOCALE_NAMES[l]}
            className={`rounded-full px-2 py-1 text-sm font-medium leading-none transition ${
              active ? "bg-kentuki text-white" : "text-tinta hover:bg-black/5"
            }`}
          >
            <span aria-hidden>{LOCALE_FLAGS[l]}</span>
            <span className="ml-1 uppercase">{l}</span>
          </button>
        );
      })}
    </div>
  );
}
