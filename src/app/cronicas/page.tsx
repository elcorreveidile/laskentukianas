import { db } from "@/lib/db";
import { ArticleCard } from "@/components/content/ArticleCard";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Crónicas",
  description: "La saga completa de Jorge, de Menorca a Kentucky, crónica a crónica.",
  alternates: { canonical: "/cronicas" },
};

export default async function CronicasPage() {
  const articles = await db.article
    .findMany({
      where: { status: "PUBLISHED", series: "CRONICAS" },
      orderBy: [{ order: "asc" }, { publishedAt: "asc" }],
      select: { slug: true, title: true, excerpt: true, coverImage: true },
    })
    .catch(() => []);

  return (
    <div className="mx-auto max-w-content px-6 py-14">
      <h1 className="mb-2 font-display text-4xl uppercase text-tinta">Las crónicas</h1>
      <p className="mb-10 font-serif text-lg text-tinta/70">
        La saga completa, de Menorca a Kentucky.
      </p>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </div>
    </div>
  );
}
