import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return { title: "Buscar", robots: { index: false } };
}

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const t = await getTranslations("buscar");
  const q = (searchParams.q ?? "").trim();
  const resultados =
    q.length >= 2
      ? await db.article
          .findMany({
            where: {
              status: "PUBLISHED",
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { content: { contains: q, mode: "insensitive" } },
              ],
            },
            orderBy: { order: "asc" },
            select: { slug: true, title: true },
          })
          .catch(() => [])
      : [];

  return (
    <div className="mx-auto max-w-content px-6 py-14">
      <h1 className="mb-6 font-display text-4xl uppercase text-tinta">{t("title")}</h1>
      <form className="mb-8 flex max-w-md gap-2" action="/buscar">
        <input
          name="q"
          defaultValue={q}
          placeholder={t("placeholder")}
          className="flex-1 rounded-lg border border-black/15 px-4 py-3"
        />
        <button className="rounded-lg bg-kentuki px-6 py-3 font-display uppercase text-white">
          {t("button")}
        </button>
      </form>
      {q.length >= 2 && (
        <>
          <p className="mb-4 text-sm text-tinta/60">
            {resultados.length} resultado{resultados.length === 1 ? "" : "s"} para «{q}»
          </p>
          <ul className="space-y-3">
            {resultados.map((a) => (
              <li key={a.slug}>
                <Link href={`/${a.slug}`} className="text-lg text-kentuki-dark hover:underline">
                  {a.title}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
