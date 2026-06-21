export const dynamic = "force-dynamic";

import { getStockOverview, getStockMovements } from "@/actions/stock";
import { PageHeader } from "@/components/page-header";
import { formatDateTime } from "@/lib/format";
import { StockAdjust } from "./stock-adjust";

function stockStatus(stock: number, minStock: number) {
  if (minStock === 0) return { label: "Sin minimo", className: "bg-muted text-muted-foreground" };
  if (stock <= 0) return { label: "Sin stock", className: "bg-red-100 text-red-700" };
  if (stock <= minStock) return { label: "Critico", className: "bg-red-100 text-red-700" };
  if (stock <= minStock * 1.5) return { label: "Bajo", className: "bg-yellow-100 text-yellow-700" };
  return { label: "OK", className: "bg-emerald-100 text-emerald-700" };
}

export default async function StockPage() {
  const [{ products, ingredients }, movements] = await Promise.all([
    getStockOverview(),
    getStockMovements(50),
  ]);

  return (
    <div>
      <PageHeader title="Stock / Inventario" description="Control de stock de productos e insumos" />

      <div className="space-y-6">
        <div>
          <h2 className="text-sm font-semibold mb-3">Productos</h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Producto</th>
                  <th className="text-left py-3 px-4 font-medium">Categoria</th>
                  <th className="text-left py-3 px-4 font-medium">Unidad</th>
                  <th className="text-right py-3 px-4 font-medium">Stock</th>
                  <th className="text-right py-3 px-4 font-medium">Minimo</th>
                  <th className="text-left py-3 px-4 font-medium">Estado</th>
                  <th className="text-right py-3 px-4 font-medium">Ajustar</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const status = stockStatus(p.stock, p.minStock);
                  return (
                    <tr key={p.id} className="border-b border-border/50">
                      <td className="py-3 px-4 font-medium">{p.name}</td>
                      <td className="py-3 px-4">{p.category}</td>
                      <td className="py-3 px-4">{p.unit}</td>
                      <td className="text-right py-3 px-4 font-medium">{p.stock}</td>
                      <td className="text-right py-3 px-4">{p.minStock}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="text-right py-3 px-4">
                        <StockAdjust itemType="product" itemId={p.id} itemName={p.name} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold mb-3">Insumos</h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Insumo</th>
                  <th className="text-left py-3 px-4 font-medium">Unidad</th>
                  <th className="text-right py-3 px-4 font-medium">Stock</th>
                  <th className="text-right py-3 px-4 font-medium">Minimo</th>
                  <th className="text-left py-3 px-4 font-medium">Estado</th>
                  <th className="text-right py-3 px-4 font-medium">Ajustar</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.map((i) => {
                  const status = stockStatus(i.stock, i.minStock);
                  return (
                    <tr key={i.id} className="border-b border-border/50">
                      <td className="py-3 px-4 font-medium">{i.name}</td>
                      <td className="py-3 px-4">{i.unit}</td>
                      <td className="text-right py-3 px-4 font-medium">{Number(i.stock).toFixed(2)}</td>
                      <td className="text-right py-3 px-4">{i.minStock}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="text-right py-3 px-4">
                        <StockAdjust itemType="ingredient" itemId={i.id} itemName={i.name} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {movements.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold mb-3">Ultimos movimientos</h2>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b border-border bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium">Fecha</th>
                    <th className="text-left py-3 px-4 font-medium">Tipo item</th>
                    <th className="text-left py-3 px-4 font-medium">Movimiento</th>
                    <th className="text-right py-3 px-4 font-medium">Cantidad</th>
                    <th className="text-left py-3 px-4 font-medium">Razon</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => (
                    <tr key={m.id} className="border-b border-border/50">
                      <td className="py-3 px-4">{formatDateTime(m.createdAt)}</td>
                      <td className="py-3 px-4">{m.itemType === "product" ? "Producto" : "Insumo"}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${m.quantity >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                          {m.type}
                        </span>
                      </td>
                      <td className={`text-right py-3 px-4 font-medium ${m.quantity >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {m.quantity >= 0 ? "+" : ""}{m.quantity}
                      </td>
                      <td className="py-3 px-4">{m.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
