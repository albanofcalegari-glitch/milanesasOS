export const dynamic = "force-dynamic";

import { getProductionOrders, getManufacturedProducts } from "@/actions/production";
import { PageHeader } from "@/components/page-header";
import { formatDateTime } from "@/lib/format";
import { ProductionClient } from "./production-client";

const statusLabels: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendiente", className: "bg-yellow-100 text-yellow-700" },
  in_progress: { label: "En proceso", className: "bg-blue-100 text-blue-700" },
  completed: { label: "Completada", className: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Cancelada", className: "bg-red-100 text-red-700" },
};

export default async function ProductionPage() {
  const [orders, products] = await Promise.all([
    getProductionOrders(),
    getManufacturedProducts(),
  ]);

  return (
    <div>
      <PageHeader title="Produccion" description="Ordenes de produccion" />

      <ProductionClient products={products} />

      <div className="mt-6">
        <h2 className="text-sm font-semibold mb-3">Ordenes</h2>
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusLabels[order.status] || statusLabels.pending;
              return (
                <div key={order.id} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">#{order.id.slice(-6)}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDateTime(order.createdAt)}</span>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-muted-foreground border-b border-border">
                        <th className="text-left py-2 font-medium">Producto</th>
                        <th className="text-right py-2 font-medium">Cantidad</th>
                        <th className="text-left py-2 font-medium">Insumos necesarios</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={item.id} className="border-b border-border/50">
                          <td className="py-2">{item.product.name}</td>
                          <td className="text-right py-2">{item.quantity}</td>
                          <td className="py-2 text-xs text-muted-foreground">
                            {item.product.recipe?.items.map((ri) =>
                              `${ri.ingredient.name}: ${(ri.quantity * item.quantity).toFixed(2)} ${ri.ingredient.unit}`
                            ).join(" | ") || "Sin receta"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {order.notes && (
                    <p className="text-xs text-muted-foreground mt-2">Notas: {order.notes}</p>
                  )}
                  {order.status === "pending" && (
                    <ProductionOrderActions orderId={order.id} />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <p className="text-sm text-muted-foreground">No hay ordenes de produccion</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { ProductionOrderActions } from "./production-actions";
