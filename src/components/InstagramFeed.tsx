"use client";

import Script from "next/script";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { INSTAGRAM } from "@/lib/instagram";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

export function InstagramFeed({ posts }: { posts?: readonly string[] }) {
  const t = useTranslations("instagram");

  // Reprocesa los embeds cuando cambian los posts o al volver a montar
  // (navegación cliente en la que embed.js ya estaba cargado).
  useEffect(() => {
    window.instgrm?.Embeds.process();
  }, [posts]);

  if (!posts || posts.length === 0) return null;

  return (
    <section className="mt-16 border-t border-black/10 pt-10">
      <h2 className="mb-8 text-center font-display text-2xl uppercase text-tinta">
        {t("heading")}
      </h2>
      <div className="flex flex-wrap justify-center gap-6">
        {posts.map((url) => (
          <blockquote
            key={url}
            className="instagram-media"
            data-instgrm-permalink={url}
            data-instgrm-version="14"
            style={{ margin: 0, maxWidth: 400, width: "100%" }}
          />
        ))}
      </div>
      <Script
        src="https://www.instagram.com/embed.js"
        strategy="lazyOnload"
        onLoad={() => window.instgrm?.Embeds.process()}
      />
      <p className="mt-8 text-center text-sm text-tinta/60">
        <a
          href={`https://instagram.com/${INSTAGRAM.handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-kentuki"
        >
          @{INSTAGRAM.handle}
        </a>
      </p>
    </section>
  );
}
