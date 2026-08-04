"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { saveArticle } from "@/lib/actions/articles";

type Initial = {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content?: string;
  coverImage?: string | null;
  series?: "CRONICAS" | "KENTUKIANA" | "PAGINA";
  order?: number;
  status?: "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED";
  byline?: string | null;
  tags?: string;
};

const input = "w-full rounded-lg border border-black/15 px-4 py-2 focus:ring-2 focus:ring-kentuki";

export function ArticleForm({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [series, setSeries] = useState(initial?.series ?? "CRONICAS");
  const [order, setOrder] = useState(String(initial?.order ?? 0));
  const [status, setStatus] = useState(initial?.status ?? "DRAFT");
  const [byline, setByline] = useState(initial?.byline ?? "");
  const [tags, setTags] = useState(initial?.tags ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await saveArticle({
        id: initial?.id,
        title,
        slug: slug || undefined,
        excerpt,
        content,
        coverImage,
        series,
        order,
        status,
        byline,
        tags,
      });
      router.push("/admin/articulos");
      router.refresh();
    } catch (err) {
      setError((err as Error).message || "Error al guardar");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div>
        <label className="mb-1 block text-sm font-medium">Título</label>
        <input className={input} value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Slug (opcional)</label>
          <input
            className={input}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="se genera del título"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Firma</label>
          <input className={input} value={byline ?? ""} onChange={(e) => setByline(e.target.value)} placeholder="Jorge Duro" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Serie</label>
          <select className={input} value={series} onChange={(e) => setSeries(e.target.value as Initial["series"])}>
            <option value="CRONICAS">Crónicas</option>
            <option value="KENTUKIANA">Kentukiana</option>
            <option value="PAGINA">Página</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Orden</label>
          <input type="number" className={input} value={order} onChange={(e) => setOrder(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Estado</label>
          <select className={input} value={status} onChange={(e) => setStatus(e.target.value as Initial["status"])}>
            <option value="DRAFT">Borrador</option>
            <option value="REVIEW">En revisión</option>
            <option value="PUBLISHED">Publicado</option>
            <option value="ARCHIVED">Archivado</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Portada</label>
        <ImageUploadField value={coverImage ?? ""} onChange={setCoverImage} />
        {coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImage} alt="" className="mt-2 h-32 rounded-lg object-cover" />
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Extracto</label>
        <textarea className={input} rows={2} value={excerpt ?? ""} onChange={(e) => setExcerpt(e.target.value)} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Etiquetas (separadas por comas)</label>
        <input className={input} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="kentucky, batería, aula" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Contenido</label>
        <RichTextEditor value={content} onChange={setContent} />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-kentuki px-6 py-3 font-display uppercase tracking-wide text-white transition hover:bg-kentuki-dark disabled:opacity-50"
        >
          {saving ? "Guardando…" : "Guardar"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/articulos")}
          className="rounded-lg bg-black/10 px-6 py-3 font-medium hover:bg-black/20"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
