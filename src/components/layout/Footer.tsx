import Link from "next/link";
import { Por2DurosCredit } from "@/components/Por2DurosCredit";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-black/10 bg-crema">
      <div className="mx-auto flex max-w-content flex-col items-center gap-2 px-6 py-10 text-center text-sm text-tinta/60">
        <p className="font-display text-lg uppercase tracking-wide text-kentuki-dark">
          Crónicas Kentukianas
        </p>
        <p>Las crónicas de Jorge, de Menorca a Kentucky.</p>
        <nav className="mt-2 flex flex-wrap justify-center gap-4">
          <Link href="/cronicas" className="hover:text-kentuki">Crónicas</Link>
          <Link href="/kentukiana" className="hover:text-kentuki">Kentukiana</Link>
          <Link href="/newsletter" className="hover:text-kentuki">No te pierdas nada</Link>
        </nav>
        <p className="mt-4 text-xs text-tinta/60">
          <Por2DurosCredit />
        </p>
        <p className="text-xs text-tinta/40">
          © {new Date().getFullYear()} Crónicas Kentukianas
        </p>
      </div>
    </footer>
  );
}
