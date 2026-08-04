import { ArticleForm } from "@/components/admin/ArticleForm";

export const dynamic = "force-dynamic";

export default function NuevoArticulo() {
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl uppercase text-tinta">Nuevo artículo</h1>
      <ArticleForm />
    </div>
  );
}
