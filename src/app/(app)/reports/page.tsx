import { getDailyReport } from "@/actions/reports";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { formatCurrency, paymentMethodLabel } from "@/lib/format";
import { DollarSign, Receipt, TrendingUp, Percent } from "lucide-react";
import { ReportExport } from "./report-export";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const report = await getDailyReport(params.date);
  const reportDate = new Date(report.date);

  return (
    <div>
      <PageHeader
        title="Reporte diario"
        description={reportDate.toLocaleDateString("es-AR", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
        actions={
          <div className="flex items-center gap-2">
            <form className="flex items-center gap-2">
              <input
                type="date"
                name="date"
                defaultValue={params.date || new Date().toISOString().split("T")[0]}
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm hover:bg-muted"
              >
                Ver
              </button>
            </form>
            <ReportExport report={report} />
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total vendido" value={formatCurrency(report.totalSales)} icon={DollarSign} />
        <StatCard title="Tickets" value={String(report.ticketCount)} icon={Receipt} />
        <StatCard title="Ticket promedio" value={formatCurrency(report.avgTicket)} icon={TrendingUp} />
        <StatCard title="Margen estimado" value={`${report.estimatedMargin.toFixed(1)}%`} icon={Percent} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-4">Ventas por medio de pago</h2>
          {Object.keys(report.salesByMethod).length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left py-2 font-medium">Medio</th>
                  <th className="text-right py-2 font-medium">Tickets</th>
                  <th className="text-right py-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(report.salesByMethod).map(([method, data]) => (
                  <tr key={method} className="border-b border-border/50">
                    <td className="py-2">{paymentMethodLabel(method)}</td>
                    <td className="text-right py-2">{data.count}</td>
                    <td className="text-right py-2 font-medium">{formatCurrency(data.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-muted-foreground">Sin ventas</p>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-4">Productos vendidos</h2>
          {report.productsSold.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left py-2 font-medium">Producto</th>
                  <th className="text-right py-2 font-medium">Cant.</th>
                  <th className="text-right py-2 font-medium">Ingreso</th>
                  <th className="text-right py-2 font-medium">Costo</th>
                </tr>
              </thead>
              <tbody>
                {report.productsSold.map((p, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2">{p.name}</td>
                    <td className="text-right py-2">{p.qty}</td>
                    <td className="text-right py-2 font-medium">{formatCurrency(p.total)}</td>
                    <td className="text-right py-2 text-muted-foreground">{formatCurrency(p.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-muted-foreground">Sin ventas</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-4">Caja</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ingresos extra</span>
              <span className="text-emerald-600 font-medium">{formatCurrency(report.deposits)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Egresos</span>
              <span className="text-red-500 font-medium">{formatCurrency(report.withdrawals)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <span className="font-medium">Total en caja</span>
              <span className="font-bold">{formatCurrency(report.cashFinal)}</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-4">Stock critico</h2>
          {report.criticalStock.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left py-2 font-medium">Item</th>
                  <th className="text-left py-2 font-medium">Tipo</th>
                  <th className="text-right py-2 font-medium">Stock</th>
                  <th className="text-right py-2 font-medium">Minimo</th>
                </tr>
              </thead>
              <tbody>
                {report.criticalStock.map((item, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2">{item.name}</td>
                    <td className="py-2">{item.type}</td>
                    <td className="text-right py-2 text-red-500 font-medium">{Number(item.stock).toFixed(1)}</td>
                    <td className="text-right py-2">{item.minStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-muted-foreground">Stock OK</p>
          )}
        </div>
      </div>
    </div>
  );
}
