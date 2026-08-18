import Link from "next/link";

// Not-found global (fuera del segmento [locale]): captura rutas desconocidas y
// la ruta interna `/_not-found`. Sin él, el middleware de next-intl vuelve a
// añadir el prefijo de idioma en cada intento y provoca un bucle de redirección.
// Al renderizarse fuera de `[locale]/layout`, debe definir `<html>` y `<body>`.
export default function GlobalNotFound() {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col items-center justify-center bg-crema px-6 text-center font-body">
        <p className="font-hand text-3xl text-kentuki-dark">404</p>
        <h1 className="mt-2 font-display text-4xl uppercase text-tinta md:text-5xl">
          Página no encontrada
        </h1>
        <p className="mt-4 max-w-md font-serif text-lg text-tinta/70">
          La página que buscas no existe o ya no está disponible.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-kentuki px-7 py-3 font-display uppercase tracking-wide text-white transition hover:bg-kentuki-dark"
        >
          Volver al inicio
        </Link>
      </body>
    </html>
  );
}
