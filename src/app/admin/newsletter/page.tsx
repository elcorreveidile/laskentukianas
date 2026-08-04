import { getListStats } from "@/lib/brevo";
import { ImportContacts } from "@/components/admin/ImportContacts";
import { SendAnnouncement } from "@/components/admin/SendAnnouncement";

export const dynamic = "force-dynamic";

const LIST_ID = Number(process.env.BREVO_LIST_ID || 3);

export default async function AdminNewsletter() {
  let stats: Awaited<ReturnType<typeof getListStats>> | null = null;
  let error: string | null = null;
  try {
    stats = await getListStats(LIST_ID);
  } catch (e) {
    error = (e as Error).message;
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl uppercase text-tinta">Newsletter</h1>

      {error ? (
        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          No se pudo leer la lista de Brevo: {error}
        </div>
      ) : (
        <div className="mb-6 rounded-xl border border-black/10 bg-white p-6 shadow-card">
          <p className="text-sm text-tinta/60">Lista «{stats!.name}»</p>
          <p className="mt-1 text-4xl font-bold text-kentuki-dark">{stats!.totalSubscribers}</p>
          <p className="mt-1 text-sm text-tinta/60">
            suscriptores{stats!.totalBlacklisted ? ` · ${stats!.totalBlacklisted} dados de baja` : ""}
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <ImportContacts />
        <SendAnnouncement />
      </div>
    </div>
  );
}
