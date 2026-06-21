export const dynamic = "force-dynamic";

import { getCashSessions, getOpenCashSession } from "@/actions/cash";
import { PageHeader } from "@/components/page-header";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { CashActions } from "./cash-actions";

export default async function CashPage() {
  const [openSession, sessions] = await Promise.all([
    getOpenCashSession(),
    getCashSessions(),
  ]);

  const closedSessions = sessions.filter((s) => s.status === "closed");

  return (
    <div>
      <PageHeader title="Caja" description="Gestion de sesiones de caja" />
      <CashActions openSession={openSession} />

      {closedSessions.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold mb-4">Sesiones anteriores</h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Apertura</th>
                  <th className="text-left py-3 px-4 font-medium">Cierre</th>
                  <th className="text-right py-3 px-4 font-medium">Monto inicial</th>
                  <th className="text-right py-3 px-4 font-medium">Esperado</th>
                  <th className="text-right py-3 px-4 font-medium">Real</th>
                  <th className="text-right py-3 px-4 font-medium">Diferencia</th>
                  <th className="text-right py-3 px-4 font-medium">Ventas</th>
                </tr>
              </thead>
              <tbody>
                {closedSessions.map((s) => (
                  <tr key={s.id} className="border-b border-border/50">
                    <td className="py-3 px-4">{formatDateTime(s.openedAt)}</td>
                    <td className="py-3 px-4">{s.closedAt ? formatDateTime(s.closedAt) : "-"}</td>
                    <td className="text-right py-3 px-4">{formatCurrency(s.openingAmount)}</td>
                    <td className="text-right py-3 px-4">{s.expectedAmount != null ? formatCurrency(s.expectedAmount) : "-"}</td>
                    <td className="text-right py-3 px-4">{s.closingAmount != null ? formatCurrency(s.closingAmount) : "-"}</td>
                    <td className={`text-right py-3 px-4 font-medium ${(s.difference ?? 0) < 0 ? "text-red-500" : (s.difference ?? 0) > 0 ? "text-emerald-600" : ""}`}>
                      {s.difference != null ? formatCurrency(s.difference) : "-"}
                    </td>
                    <td className="text-right py-3 px-4">{s._count.sales}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
