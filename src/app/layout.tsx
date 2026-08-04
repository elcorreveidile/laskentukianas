import type { Metadata } from "next";
import { Anton, Inter, Crimson_Text, Caveat } from "next/font/google";
import "./globals.css";
import IntroOverlay from "@/components/IntroOverlay";
import DrumEasterEgg from "@/components/DrumEasterEgg";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";

const display = Anton({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const serif = Crimson_Text({ weight: ["400", "600"], subsets: ["latin"], variable: "--font-serif" });
const hand = Caveat({ subsets: ["latin"], variable: "--font-hand" });

const SITE = process.env.NEXT_PUBLIC_APP_URL || "https://laskentukianas.com";
const DESC =
  "De Menorca a Kentucky: las crónicas de Jorge, un profe de español lanzado a la aventura (y a la batería).";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Crónicas Kentukianas",
    template: "%s · Crónicas Kentukianas",
  },
  description: DESC,
  applicationName: "Crónicas Kentukianas",
  authors: [{ name: "Jorge Duro" }],
  creator: "Jorge Duro",
  keywords: [
    "Crónicas Kentukianas",
    "Jorge Duro",
    "profesor de español",
    "Kentucky",
    "Menorca",
    "blog de viajes",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: SITE,
    siteName: "Crónicas Kentukianas",
    title: "Crónicas Kentukianas",
    description: DESC,
  },
  twitter: {
    card: "summary_large_image",
    title: "Crónicas Kentukianas",
    description: DESC,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${display.variable} ${body.variable} ${serif.variable} ${hand.variable}`}
    >
      <body className="flex min-h-screen flex-col font-body">
        <IntroOverlay />
        <DrumEasterEgg />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ScrollToTop />
      </body>
    </html>
  );
}
