"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Eye } from "lucide-react";

const SESSION_KEY = "visit_counted";

export function VisitCounter() {
  const t = useTranslations("site");
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Incrementa solo una vez por sesión; el resto de vistas solo leen.
    const alreadyCounted = sessionStorage.getItem(SESSION_KEY);
    const method = alreadyCounted ? "GET" : "POST";
    if (!alreadyCounted) sessionStorage.setItem(SESSION_KEY, "1");

    fetch("/api/views", { method })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && typeof d?.count === "number") setCount(d.count);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  if (count === null) return null;

  return (
    <p className="flex items-center gap-1.5 text-xs text-tinta/40">
      <Eye className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {t("visits", { count })}
    </p>
  );
}
