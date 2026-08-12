"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

/** Menú de usuario para el Header cuando hay sesión (escritorio). */
export function UserMenu({ userName }: { userName: string }) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white/60 px-3 py-1 text-sm text-tinta transition hover:bg-black/5"
      >
        <span aria-hidden>👤</span>
        <span className="max-w-[12ch] truncate">{userName}</span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-44 rounded-xl border border-black/10 bg-white p-1 shadow-lg"
        >
          <Link
            href="/admin"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm text-tinta transition hover:bg-black/5"
          >
            {t("admin")}
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            {t("signOut")}
          </button>
        </div>
      )}
    </div>
  );
}
