import type { Metadata } from "next";
import { Anton, Inter, Crimson_Text, Caveat } from "next/font/google";
import { NextIntlClientProvider, useMessages } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import IntroOverlay from "@/components/IntroOverlay";
import DrumEasterEgg from "@/components/DrumEasterEgg";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { LocaleAlternatesProvider } from "@/components/i18n/LocaleAlternates";

const display = Anton({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const serif = Crimson_Text({ weight: ["400", "600"], subsets: ["latin"], variable: "--font-serif" });
const hand = Caveat({ subsets: ["latin"], variable: "--font-hand" });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });

  const SITE = process.env.NEXT_PUBLIC_APP_URL || "https://laskentukianas.com";

  return {
    title: {
      default: t("title"),
      template: `%s · ${t("title")}`,
    },
    description: t("description"),
    applicationName: t("title"),
    authors: [{ name: "Jorge Duro" }],
    creator: "Jorge Duro",
    keywords: ["Crónicas Kentukianas", "Jorge Duro", "profesor de español", "Kentucky", "Menorca", "blog de viajes"],
    alternates: {
      canonical: `/${locale}`,
      languages: {
        es: "/es",
        en: "/en",
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "es" ? "es_ES" : "en_US",
      url: SITE,
      siteName: t("title"),
      title: t("title"),
      description: t("description"),
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "es" | "en")) {
    notFound();
  }

  const messages = await getMessages();
  const session = await auth();
  const userName = session?.user
    ? session.user.name ?? session.user.email ?? null
    : null;

  return (
    <html
      lang={locale}
      className={`${display.variable} ${body.variable} ${serif.variable} ${hand.variable}`}
    >
      <body className="flex min-h-screen flex-col font-body">
        <NextIntlClientProvider messages={messages}>
          <LocaleAlternatesProvider>
            <IntroOverlay />
            <DrumEasterEgg />
            <Header userName={userName} />
            <main className="flex-1">{children}</main>
            <Footer loggedIn={!!userName} />
            <ScrollToTop />
          </LocaleAlternatesProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
