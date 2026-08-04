/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  // isomorphic-dompurify arrastra jsdom → html-encoding-sniffer (ESM); si Next lo empaqueta,
  // el runtime serverless hace require() de un módulo ESM y peta (ERR_REQUIRE_ESM). Externalizarlo
  // deja que Node lo resuelva de forma nativa.
  experimental: {
    serverComponentsExternalPackages: ["isomorphic-dompurify"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
