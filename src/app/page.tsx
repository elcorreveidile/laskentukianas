import Link from "next/link";
import { db } from "@/lib/db";
import { ArticleCard } from "@/components/content/ArticleCard";
import { NewsletterForm } from "@/components/NewsletterForm";

export const dynamic = "force-dynamic";

async function getCronicas() {
  try {
    return await db.article.findMany({
      where: { status: "PUBLISHED", series: "CRONICAS" },
      orderBy: [{ order: "asc" }, { publishedAt: "asc" }],
      select: { slug: true, title: true, excerpt: true, coverImage: true, order: true },
    });
  } catch {
    return [];
  }
}

export default async function Home() {
  const cronicas = await getCronicas();
  const primera = cronicas[0];

  return (
    <>
      {/* HERO */}
      <section className="bg-kentuki-light/25">
        <div className="mx-auto grid max-w-content items-center gap-10 px-6 py-16 md:grid-cols-2">
          <div>
            <p className="font-hand text-2xl text-kentuki-dark">El blog de Jorge 🥁</p>
            <h1 className="mt-1 font-display text-4xl uppercase leading-none text-tinta md:text-6xl">
              Crónicas
              <br />
              Kentukianas
            </h1>
            <p className="mt-5 max-w-md font-serif text-lg text-tinta/80">
              De Menorca a Kentucky: la crónica de un profe de español que se lanzó a la
              aventura (y a la batería). Sube el telón.
            </p>
            {primera && (
              <Link
                href={`/${primera.slug}`}
                className="mt-6 inline-block rounded-full bg-kentuki px-7 py-3 font-display uppercase tracking-wide text-white transition hover:bg-kentuki-dark"
              >
                Empezar por el principio →
              </Link>
            )}
          </div>
          <div className="flex justify-center">
            {primera?.coverImage ? (
              <div className="max-w-sm rotate-[-3deg] rounded-sm bg-white p-3 shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={primera.coverImage}
                  alt={primera.title}
                  className="aspect-[3/4] w-full object-cover"
                />
                <p className="pt-3 text-center font-hand text-xl text-tinta/70">
                  {primera.title}
                </p>
              </div>
            ) : (
              <div className="flex aspect-[3/4] w-full max-w-sm rotate-[-3deg] items-center justify-center rounded-sm bg-white font-display text-6xl uppercase text-kentuki/40 shadow-xl">
                CK
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CRÓNICAS */}
      <section className="mx-auto max-w-content px-6 py-14">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-3xl uppercase text-tinta">Las crónicas</h2>
          <Link href="/kentukiana" className="font-hand text-xl text-kentuki-dark hover:underline">
            … y las Kentukianas del aula →
          </Link>
        </div>
        {cronicas.length === 0 ? (
          <p className="rounded-xl border border-dashed border-black/15 p-10 text-center font-serif text-tinta/50">
            Las crónicas están subiendo al escenario… vuelve en un momento.
          </p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {cronicas.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        )}
      </section>

      {/* Newsletter */}
      <section className="bg-kentuki-light/25">
        <div className="mx-auto max-w-content px-6 py-14 text-center">
          <p className="font-hand text-2xl text-kentuki-dark">🥁</p>
          <h2 className="font-display text-3xl uppercase text-tinta">No te pierdas nada</h2>
          <p className="mx-auto mt-3 max-w-md font-serif text-lg text-tinta/75">
            Recibe cada nueva crónica en tu correo. Sin spam, solo las aventuras de Jorge.
          </p>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}
