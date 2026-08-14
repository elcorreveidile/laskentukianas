"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import NextLink from "next/link";
import { signOut } from "next-auth/react";
import { User } from "lucide-react";
import { useState } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { UserMenu } from "./UserMenu";

function LogoBadge() {
  return (
    <svg viewBox="0 0 64 64" className="h-8 w-8 shrink-0" aria-hidden>
      <rect width="64" height="64" rx="14" fill="#3aa6d6" />
      <g stroke="#fff" strokeWidth="6" strokeLinecap="round">
        <line x1="16" y1="50" x2="48" y2="18" />
        <line x1="48" y1="50" x2="16" y2="18" />
      </g>
      <circle cx="48" cy="18" r="5.5" fill="#fff" />
      <circle cx="16" cy="18" r="5.5" fill="#fff" />
    </svg>
  );
}

export function Header({ userName }: { userName: string | null }) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);

  const nav = [
    { href: "/cronicas", label: t("cronicas") },
    { href: "/kentukiana", label: t("kentukiana") },
    { href: "/menorquianas", label: t("menorquianas") },
    { href: "/garito", label: t("garito") },
    { href: "/mapa", label: t("mapa") },
    { href: "/reto", label: t("reto") },
    { href: "/newsletter", label: t("newsletter") },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-black/10 bg-crema/90 backdrop-blur">
      <div className="mx-auto flex max-w-content items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <LogoBadge />
        </Link>

        <nav className="hidden items-center gap-6 font-body text-sm md:flex">
          {nav.map((l) => (
            <Link key={l.href} href={l.href} className="transition hover:text-kentuki">
              {l.label}
            </Link>
          ))}
          <Link href="/buscar" aria-label={t("buscarAria")} className="transition hover:text-kentuki">
            🔎
          </Link>
          <LanguageSwitcher />
          {userName && <UserMenu userName={userName} />}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? t("closeMenu") : t("openMenu")}
          aria-expanded={open}
          aria-controls="menu-movil"
          className="-mr-2 inline-flex items-center justify-center rounded-lg p-2 text-kentuki-dark transition hover:bg-black/5 md:hidden"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            {open ? (
              <>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="7" x2="21" y2="7" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="17" x2="21" y2="17" />
              </>
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav
          id="menu-movil"
          className="border-t border-black/10 bg-crema px-4 pb-4 pt-2 font-body text-base md:hidden"
        >
          <div className="flex flex-col">
            {nav.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-tinta transition hover:bg-black/5 hover:text-kentuki"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/buscar"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-tinta transition hover:bg-black/5 hover:text-kentuki"
            >
              {t("buscar")}
            </Link>
            <div className="mt-2 border-t border-black/10 px-3 pt-3">
              <LanguageSwitcher />
            </div>
            {userName && (
              <div className="mt-2 border-t border-black/10 px-3 pt-3">
                <p className="flex items-center gap-1.5 py-1 text-sm text-tinta/60">
                  <User className="h-4 w-4 shrink-0" aria-hidden />
                  {userName}
                </p>
                <NextLink
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg py-2 text-tinta transition hover:text-kentuki"
                >
                  {t("admin")}
                </NextLink>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="block w-full rounded-lg py-2 text-left font-medium text-red-600 transition hover:text-red-800"
                >
                  {t("signOut")}
                </button>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
