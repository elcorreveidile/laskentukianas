import { db } from "@/lib/db";
import { AddGalleryImageForm } from "@/components/admin/AddGalleryImageForm";
import { deleteGalleryImage, moveGalleryImage } from "@/lib/actions/gallery";

export const dynamic = "force-dynamic";

export default async function AdminGaleria() {
  const images = await db.galleryImage.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl uppercase text-tinta">Galería</h1>
        <p className="text-sm text-tinta/60">
          Fotos que se muestran en las secciones públicas · {images.length} en total
        </p>
      </div>

      <div className="mb-8 max-w-xl">
        <AddGalleryImageForm />
      </div>

      {images.length === 0 ? (
        <p className="rounded-xl border border-dashed border-black/15 p-10 text-center text-tinta/50">
          Todavía no hay fotos en la galería.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img, i) => (
            <li key={img.id} className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.caption ?? ""} className="aspect-square w-full object-cover" />
              <div className="p-3">
                {img.caption && <p className="truncate text-sm text-tinta">{img.caption}</p>}
                {img.link && <p className="truncate text-xs text-tinta/50">{img.link}</p>}
                <div className="mt-3 flex items-center gap-2">
                  <form action={moveGalleryImage.bind(null, img.id, "up")}>
                    <button
                      disabled={i === 0}
                      className="rounded-lg border border-black/10 px-2 py-1 text-sm text-tinta hover:bg-black/5 disabled:opacity-30"
                      aria-label="Subir"
                    >
                      ↑
                    </button>
                  </form>
                  <form action={moveGalleryImage.bind(null, img.id, "down")}>
                    <button
                      disabled={i === images.length - 1}
                      className="rounded-lg border border-black/10 px-2 py-1 text-sm text-tinta hover:bg-black/5 disabled:opacity-30"
                      aria-label="Bajar"
                    >
                      ↓
                    </button>
                  </form>
                  <form action={deleteGalleryImage.bind(null, img.id)} className="ml-auto">
                    <button className="rounded-lg px-3 py-1 text-sm text-red-600 hover:bg-red-50">
                      Borrar
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
