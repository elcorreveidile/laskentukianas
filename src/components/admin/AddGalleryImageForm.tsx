"use client";

import { useState, useTransition } from "react";
import { ImageUploadField } from "./ImageUploadField";
import { addGalleryImage } from "@/lib/actions/gallery";

export function AddGalleryImageForm() {
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [link, setLink] = useState("");
  const [pending, start] = useTransition();

  const input =
    "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kentuki focus:border-transparent";

  function submit() {
    if (!url) return;
    const fd = new FormData();
    fd.set("url", url);
    fd.set("caption", caption);
    fd.set("link", link);
    start(async () => {
      await addGalleryImage(fd);
      setUrl("");
      setCaption("");
      setLink("");
    });
  }

  return (
    <div className="rounded-xl border border-black/10 bg-white p-5 shadow-card">
      <p className="mb-3 font-medium text-tinta">Añadir foto</p>
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm text-tinta/60">Imagen (sube un archivo o pega una URL)</label>
          <ImageUploadField value={url} onChange={setUrl} />
        </div>
        {url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-40 w-full rounded-lg object-cover" />
        )}
        <div>
          <label className="mb-1 block text-sm text-tinta/60">Pie de foto (opcional)</label>
          <input className={input} value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Un texto corto…" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-tinta/60">Enlace al pulsar (opcional)</label>
          <input className={input} value={link} onChange={(e) => setLink(e.target.value)} placeholder="/mi-entrada  ·  o  https://instagram.com/…" />
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={pending || !url}
          className="rounded-lg bg-kentuki px-5 py-2.5 font-bold text-white transition-colors hover:bg-kentuki-dark disabled:opacity-60"
        >
          {pending ? "Añadiendo…" : "Añadir a la galería"}
        </button>
      </div>
    </div>
  );
}
