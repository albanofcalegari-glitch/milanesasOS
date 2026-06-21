export const dynamic = "force-dynamic";

import { getPurchaseOrders, getSuppliers, getIngredients } from "@/actions/purchases";
import { PageHeader } from "@/components/page-header";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { PurchaseClient } from "./purchase-client";
import { PurchaseActions } from "./purchase-actions";

const statusLabels: Record<string, { label: string; className: string }> = {
  draft: { label: "Borrador", className: "bg-muted text-muted-foreground" },
  pending: { label: "Pendiente", className: "bg-yellow-100 text-yellow-700" },
  received: { label: "Recibida", className: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Cancelada", className: "bg-red-100 text-red-700" },
};

export default async function PurchasesPage() {
  const [orders, suppliers, ingredients] = await Promise.all([
    getPurchaseOrders(),
    getSuppliers(),
    getIngredients(),
  ]);

  return (
    <div>
      <PageHeader title="Compras" description="Ordenes de compra a proveedores" />

      <PurchaseClient suppliers={suppliers} ingredients={ingredients} />

      <div className="mt-6">
        <h2 className="text-sm font-semibold mb-3">Ordenes de compra</h2>
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
                      <span className="text-sm text-muted-foreground">{order.supplier.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold">{formatCurrency(order.total)}</span>
                      <span className="text-xs text-muted-foreground">{formatDateTime(order.createdAt)}</span>
                    </div>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-muted-foreground border-b border-border">
                        <th className="text-left py-2 font-medium">Insumo</th>
                        <th className="text-right py-2 font-medium">Cantidad</th>
                        <th className="text-right py-2 font-medium">Precio unit.</th>
                        <th className="text-right py-2 font-medium">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={item.id} className="border-b border-border/50">
                          <td className="py-2">{item.ingredient.name}</td>
                          <td className="text-right py-2">{item.quantity} {item.ingredient.unit}</td>
                          <td className="text-right py-2">{formatCurrency(item.unitPrice)}</td>
                          <td className="text-right py-2 font-medium">{formatCurrency(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {order.notes && (
                    <p className="text-xs text-muted-foreground mt-2">Notas: {order.notes}</p>
                  )}
                  {order.status === "pending" && (
                    <PurchaseActions orderId={order.id} />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <p className="text-sm text-muted-foreground">No hay ordenes de compra</p>
          </div>
        )}
      </div>
    </div>
  );
}
