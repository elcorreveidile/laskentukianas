import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user || !(role === "ADMIN" || role === "EDITOR")) {
    redirect("/login");
  }

  return (
    <div className="mx-auto flex max-w-content flex-col gap-8 px-6 py-8 md:flex-row">
      <AdminSidebarNav userName={session.user.name ?? session.user.email ?? ""} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
