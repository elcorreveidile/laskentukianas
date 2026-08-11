"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/** Rutas equivalentes por locale (pathname sin prefijo de idioma, p.ej. "/15-in-the-water"). */
type Alternates = Partial<Record<string, string>>;

const Ctx = createContext<{
  alternates: Alternates;
  set: (a: Alternates) => void;
}>({ alternates: {}, set: () => {} });

export function LocaleAlternatesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [alternates, setAlternates] = useState<Alternates>({});
  const value = useMemo(
    () => ({ alternates, set: setAlternates }),
    [alternates]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Rutas equivalentes de la página actual (vacío si no las ha registrado nadie). */
export function useLocaleAlternates() {
  return useContext(Ctx).alternates;
}

/**
 * Registra las rutas equivalentes de la página actual para que el selector de
 * idioma navegue al slug correcto (los slugs difieren entre es/en). Se limpia
 * al desmontar. Renderízalo desde una página de artículo (server component).
 */
export function SetLocaleAlternates({ es, en }: { es?: string; en?: string }) {
  const { set } = useContext(Ctx);
  useEffect(() => {
    set({ es, en });
    return () => set({});
  }, [set, es, en]);
  return null;
}
