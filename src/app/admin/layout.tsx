import { Anton, Inter, Crimson_Text, Caveat } from "next/font/google";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";

// El admin vive fuera de [locale], así que aporta su propio documento
// (<html>/<body>), igual que hace [locale]/layout para el sitio público.
const display = Anton({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const serif = Crimson_Text({ weight: ["400", "600"], subsets: ["latin"], variable: "--font-serif" });
const hand = Caveat({ subsets: ["latin"], variable: "--font-hand" });

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user || !(role === "ADMIN" || role === "EDITOR")) {
    redirect("/login");
  }

  return (
    <html
      lang="es"
      className={`${display.variable} ${body.variable} ${serif.variable} ${hand.variable}`}
    >
      <body className="min-h-screen bg-crema font-body">
        <div className="mx-auto flex max-w-content flex-col gap-8 px-6 py-8 md:flex-row">
          <AdminSidebarNav userName={session.user.name ?? session.user.email ?? ""} />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}
