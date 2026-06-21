export const dynamic = "force-dynamic";

import { getIngredientAlerts } from "@/actions/ingredients";
import { PageHeader } from "@/components/page-header";
import { formatCurrency } from "@/lib/format";
import {
  AlertTriangle,
  XCircle,
  ShoppingCart,
  CheckCircle,
  Package,
} from "lucide-react";
import Link from "next/link";

const statusConfig = {
  break: {
    label: "QUIEBRE",
    className: "bg-red-500/15 text-red-600 dark:text-red-400",
    icon: XCircle,
    border: "border-l-red-500",
  },
  critical: {
    label: "Critico",
    className: "bg-red-500/15 text-red-600 dark:text-red-400",
    icon: AlertTriangle,
    border: "border-l-red-500",
  },
  reorder: {
    label: "Reponer",
    className: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
    icon: ShoppingCart,
    border: "border-l-yellow-500",
  },
  ok: {
    label: "OK",
    className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    icon: CheckCircle,
    border: "border-l-emerald-500",
  },
};

export default async function MateriasPrimasPage() {
  const ingredients = await getIngredientAlerts();

  const breakCount = ingredients.filter((i) => i.status === "break").length;
  const criticalCount = ingredients.filter((i) => i.status === "critical").length;
  const reorderCount = ingredients.filter((i) => i.status === "reorder").length;
  const okCount = ingredients.filter((i) => i.status === "ok").length;

  const needsAttention = ingredients.filter((i) => i.status !== "ok");
  const sorted = [...ingredients].sort((a, b) => {
    const order = { break: 0, critical: 1, reorder: 2, ok: 3 };
    return order[a.status] - order[b.status];
  });

  return (
    <div>
      <PageHeader
        title="Materias Primas"
        description="Control de stock de insumos y alertas de reposicion"
        actions={
          <Link
            href="/settings#stock-config"
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-muted transition-colors"
          >
            Configurar umbrales
          </Link>
        }
      />

      {/* Alert summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="size-4 text-red-500" />
            <span className="text-xs text-muted-foreground">Quiebre</span>
          </div>
          <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>{breakCount}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="size-4 text-red-500" />
            <span className="text-xs text-muted-foreground">Critico</span>
          </div>
          <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>{criticalCount}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart className="size-4 text-yellow-500" />
            <span className="text-xs text-muted-foreground">Reponer</span>
          </div>
          <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>{reorderCount}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="size-4 text-emerald-500" />
            <span className="text-xs text-muted-foreground">OK</span>
          </div>
          <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>{okCount}</p>
        </div>
      </div>

      {/* Urgency alerts banner */}
      {needsAttention.length > 0 && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="size-4 text-red-500" />
            <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">
              {needsAttention.length} insumo{needsAttention.length > 1 ? "s" : ""} requiere{needsAttention.length > 1 ? "n" : ""} atencion
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {needsAttention.map((ing) => {
              const cfg = statusConfig[ing.status];
              return (
                <span key={ing.id} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium ${cfg.className}`}>
                  <cfg.icon className="size-3" />
                  {ing.name}: {ing.stock} {ing.unit}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Main table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground border-b border-border bg-muted/50">
              <th className="text-left py-3 px-4 font-medium">Estado</th>
              <th className="text-left py-3 px-4 font-medium">Insumo</th>
              <th className="text-right py-3 px-4 font-medium">Stock</th>
              <th className="text-right py-3 px-4 font-medium">Reposicion</th>
              <th className="text-right py-3 px-4 font-medium">Critico</th>
              <th className="text-right py-3 px-4 font-medium">Quiebre</th>
              <th className="text-right py-3 px-4 font-medium">Costo unit.</th>
              <th className="text-left py-3 px-4 font-medium">Se usa en</th>
              <th className="text-right py-3 px-4 font-medium">Produce max</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((ing) => {
              const cfg = statusConfig[ing.status];
              const stockPct = ing.reorderPoint > 0 ? (ing.stock / ing.reorderPoint) * 100 : 100;
              return (
                <tr key={ing.id} className={`border-b border-border/50 border-l-4 ${cfg.border}`}>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${cfg.className}`}>
                      <cfg.icon className="size-3" />
                      {cfg.label}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium">{ing.name}</div>
                    <div className="text-xs text-muted-foreground">{ing.unit}</div>
                  </td>
                  <td className="text-right py-3 px-4">
                    <div className="font-bold">{Number(ing.stock).toFixed(1)}</div>
                    <div className="w-16 h-1.5 bg-muted rounded-full mt-1 ml-auto">
                      <div
                        className={`h-full rounded-full ${ing.status === "ok" ? "bg-emerald-500" : ing.status === "reorder" ? "bg-yellow-500" : "bg-red-500"}`}
                        style={{ width: `${Math.min(stockPct, 100)}%` }}
                      />
                    </div>
                  </td>
                  <td className="text-right py-3 px-4 text-muted-foreground">{ing.reorderPoint}</td>
                  <td className="text-right py-3 px-4 text-muted-foreground">{ing.minStock}</td>
                  <td className="text-right py-3 px-4 text-muted-foreground">{ing.breakPoint}</td>
                  <td className="text-right py-3 px-4">{formatCurrency(ing.costPerUnit)}</td>
                  <td className="py-3 px-4">
                    {ing.usedIn.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {ing.usedIn.map((u, i) => (
                          <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground">
                            {u.product}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="text-right py-3 px-4">
                    {ing.canProduceMin !== null ? (
                      <span className={`font-medium ${ing.canProduceMin <= 5 ? "text-red-500" : ing.canProduceMin <= 15 ? "text-yellow-600 dark:text-yellow-400" : ""}`}>
                        {ing.canProduceMin} uds
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 bg-card border border-border rounded-xl p-4">
        <h3 className="text-xs font-semibold mb-2 text-muted-foreground">Niveles de alerta</h3>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="size-3 rounded-full bg-emerald-500" />
            <span><b>OK</b> - Stock por encima del punto de reposicion</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-3 rounded-full bg-yellow-500" />
            <span><b>Reponer</b> - Hay que comprar (stock &le; reposicion)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-3 rounded-full bg-red-500" />
            <span><b>Critico</b> - Urgente (stock &le; minimo)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-3 rounded-full bg-red-800" />
            <span><b>Quiebre</b> - No se puede producir (stock &le; quiebre)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
