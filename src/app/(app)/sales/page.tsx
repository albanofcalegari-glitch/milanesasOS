export const dynamic = "force-dynamic";

import { getSales } from "@/actions/sales";
import { PageHeader } from "@/components/page-header";
import { formatCurrency, formatDateTime, paymentMethodLabel } from "@/lib/format";
import { SaleDetail } from "./sale-detail";

export default async function SalesPage() {
  const sales = await getSales(100);

  return (
    <div>
      <PageHeader title="Historial de ventas" description="Todas las ventas registradas" />

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground border-b border-border bg-muted/50">
              <th className="text-left py-3 px-4 font-medium">Fecha</th>
              <th className="text-left py-3 px-4 font-medium">Cliente</th>
              <th className="text-left py-3 px-4 font-medium">Items</th>
              <th className="text-left py-3 px-4 font-medium">Pago</th>
              <th className="text-right py-3 px-4 font-medium">Total</th>
              <th className="text-right py-3 px-4 font-medium">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id} className="border-b border-border/50">
                <td className="py-3 px-4">{formatDateTime(sale.createdAt)}</td>
                <td className="py-3 px-4">{sale.customer?.name || "Consumidor final"}</td>
                <td className="py-3 px-4 text-muted-foreground">
                  {sale.items.map((i) => `${i.quantity}x ${i.product.name}`).join(", ")}
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary">
                    {paymentMethodLabel(sale.paymentMethod)}
                  </span>
                </td>
                <td className="text-right py-3 px-4 font-bold">{formatCurrency(sale.total)}</td>
                <td className="text-right py-3 px-4">
                  <SaleDetail sale={sale} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sales.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">Sin ventas registradas</div>
        )}
      </div>
    </div>
  );
}
