import Link from "next/link";

function LogoBadge() {
  return (
    <svg viewBox="0 0 64 64" className="h-8 w-8 shrink-0" aria-hidden>
      <rect width="64" height="64" rx="14" fill="#3aa6d6" />
      <g stroke="#fff" strokeWidth="6" strokeLinecap="round">
        <line x1="16" y1="50" x2="48" y2="18" />
        <line x1="48" y1="50" x2="16" y2="18" />
      </g>
      <circle cx="48" cy="18" r="5.5" fill="#fff" />
      <circle cx="16" cy="18" r="5.5" fill="#fff" />
    </svg>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-black/10 bg-crema/90 backdrop-blur">
      <div className="mx-auto flex max-w-content items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <LogoBadge />
          <span className="font-display text-2xl uppercase tracking-wide text-kentuki-dark">
            Crónicas Kentukianas
          </span>
        </Link>
        <nav className="flex items-center gap-6 font-body text-sm">
          <Link href="/cronicas" className="hover:text-kentuki transition">
            Crónicas
          </Link>
          <Link href="/kentukiana" className="hover:text-kentuki transition">
            Kentukiana
          </Link>
          <Link href="/garito" className="hover:text-kentuki transition">
            El Garito 🎸
          </Link>
          <Link href="/mapa" className="hover:text-kentuki transition">
            Mapa
          </Link>
          <Link href="/reto" className="hover:text-kentuki transition">
            Reto 🇪🇸
          </Link>
          <Link href="/newsletter" className="hover:text-kentuki transition">
            No te pierdas nada
          </Link>
          <Link href="/buscar" aria-label="Buscar" className="hover:text-kentuki transition">
            🔎
          </Link>
        </nav>
      </div>
    </header>
  );
}
