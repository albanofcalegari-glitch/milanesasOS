export const dynamic = "force-dynamic";

import { getDashboardData } from "@/actions/dashboard";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { formatCurrency, paymentMethodLabel, formatTime } from "@/lib/format";
import {
  DollarSign,
  Receipt,
  TrendingUp,
  Wallet,
  AlertTriangle,
  Factory,
  Leaf,
  XCircle,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { DashboardChart } from "./chart";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div>
      <PageHeader title="Dashboard" description="Resumen del dia" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard
          title="Ventas hoy"
          value={formatCurrency(data.totalSales)}
          icon={DollarSign}
        />
        <StatCard
          title="Tickets"
          value={String(data.ticketCount)}
          icon={Receipt}
        />
        <StatCard
          title="Ticket promedio"
          value={formatCurrency(data.avgTicket)}
          icon={TrendingUp}
        />
        <StatCard
          title="Caja"
          value={data.cashOpen ? "Abierta" : "Cerrada"}
          subtitle={data.cashOpen ? formatCurrency(data.cashTotal) : undefined}
          icon={Wallet}
          trend={data.cashOpen ? "up" : "neutral"}
        />
        <StatCard
          title="Stock critico"
          value={String(data.criticalProducts.length + data.criticalIngredients.length)}
          subtitle={data.criticalProducts.length + data.criticalIngredients.length > 0 ? "Items bajo minimo" : "Todo OK"}
          icon={AlertTriangle}
          trend={data.criticalProducts.length + data.criticalIngredients.length > 0 ? "down" : "up"}
        />
        <StatCard
          title="Produccion pendiente"
          value={String(data.pendingProduction)}
          icon={Factory}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-4">Ventas por medio de pago</h2>
          {Object.keys(data.salesByMethod).length > 0 ? (
            <DashboardChart salesByMethod={data.salesByMethod} />
          ) : (
            <p className="text-sm text-muted-foreground">Sin ventas hoy</p>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-4">Productos mas vendidos</h2>
          {data.topProducts.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left py-2 font-medium">Producto</th>
                  <th className="text-right py-2 font-medium">Cant.</th>
                  <th className="text-right py-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.topProducts.map((p, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2">{p.name}</td>
                    <td className="text-right py-2">{p.qty}</td>
                    <td className="text-right py-2 font-medium">{formatCurrency(p.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-muted-foreground">Sin ventas hoy</p>
          )}
        </div>
      </div>

      {/* Materias primas alerts */}
      {(data.breakIngredients.length > 0 || data.reorderIngredients.length > 0) && (
        <div className="mb-6">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Leaf className="size-4 text-primary" />
                <h2 className="text-sm font-semibold">Alertas de Materias Primas</h2>
              </div>
              <Link href="/materias-primas" className="text-xs text-primary hover:underline">Ver todo</Link>
            </div>
            <div className="space-y-2">
              {data.breakIngredients.map((i) => (
                <div key={i.id} className="flex items-center gap-3 p-2 rounded-lg bg-red-500/5 border border-red-500/20">
                  <XCircle className="size-4 text-red-500 shrink-0" />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{i.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">QUIEBRE - {i.stock} {i.unit} (min: {i.breakPoint})</span>
                  </div>
                </div>
              ))}
              {data.reorderIngredients.map((i) => (
                <div key={i.id} className="flex items-center gap-3 p-2 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                  <ShoppingCart className="size-4 text-yellow-500 shrink-0" />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{i.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">Reponer - {i.stock} {i.unit} (reposicion: {i.reorderPoint})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-4">Ultimas ventas</h2>
          {data.recentSales.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left py-2 font-medium">Hora</th>
                  <th className="text-left py-2 font-medium">Cliente</th>
                  <th className="text-left py-2 font-medium">Pago</th>
                  <th className="text-right py-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.recentSales.map((sale) => (
                  <tr key={sale.id} className="border-b border-border/50">
                    <td className="py-2">{formatTime(sale.createdAt)}</td>
                    <td className="py-2">{sale.customer?.name || "Consumidor final"}</td>
                    <td className="py-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-muted">
                        {paymentMethodLabel(sale.paymentMethod)}
                      </span>
                    </td>
                    <td className="text-right py-2 font-medium">{formatCurrency(sale.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-muted-foreground">Sin ventas recientes</p>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-4">Stock critico</h2>
          {data.criticalProducts.length + data.criticalIngredients.length > 0 ? (
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
                {data.criticalProducts.map((p) => (
                  <tr key={p.id} className="border-b border-border/50">
                    <td className="py-2">{p.name}</td>
                    <td className="py-2">Producto</td>
                    <td className="text-right py-2 text-red-500 font-medium">{p.stock}</td>
                    <td className="text-right py-2">{p.minStock}</td>
                  </tr>
                ))}
                {data.criticalIngredients.map((i) => (
                  <tr key={i.id} className="border-b border-border/50">
                    <td className="py-2">{i.name}</td>
                    <td className="py-2">Insumo</td>
                    <td className="text-right py-2 text-red-500 font-medium">{i.stock}</td>
                    <td className="text-right py-2">{i.minStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-muted-foreground">Todo el stock esta OK</p>
          )}
        </div>
      </div>
    </div>
  );
}
