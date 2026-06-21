export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { formatCurrency } from "@/lib/format";
import { ProductActions } from "./product-actions";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });

  return (
    <div>
      <PageHeader
        title="Productos"
        description="Catalogo de productos"
        actions={<ProductActions mode="create" />}
      />

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground border-b border-border bg-muted/50">
              <th className="text-left py-3 px-4 font-medium">Producto</th>
              <th className="text-left py-3 px-4 font-medium">Categoria</th>
              <th className="text-left py-3 px-4 font-medium">Tipo</th>
              <th className="text-right py-3 px-4 font-medium">Precio</th>
              <th className="text-right py-3 px-4 font-medium">Costo</th>
              <th className="text-right py-3 px-4 font-medium">Margen</th>
              <th className="text-right py-3 px-4 font-medium">Stock</th>
              <th className="text-left py-3 px-4 font-medium">Estado</th>
              <th className="text-right py-3 px-4 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const margin = p.price > 0 ? ((p.price - p.cost) / p.price * 100) : 0;
              return (
                <tr key={p.id} className={`border-b border-border/50 ${!p.active ? "opacity-50" : ""}`}>
                  <td className="py-3 px-4 font-medium">{p.name}</td>
                  <td className="py-3 px-4">{p.category}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${p.type === "manufactured" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {p.type === "manufactured" ? "Fabricado" : "Terminado"}
                    </span>
                  </td>
                  <td className="text-right py-3 px-4 font-medium">{formatCurrency(p.price)}</td>
                  <td className="text-right py-3 px-4 text-muted-foreground">{formatCurrency(p.cost)}</td>
                  <td className="text-right py-3 px-4">
                    <span className={margin > 40 ? "text-emerald-600" : margin > 20 ? "text-yellow-600" : "text-red-500"}>
                      {margin.toFixed(0)}%
                    </span>
                  </td>
                  <td className="text-right py-3 px-4">{p.stock} {p.unit}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${p.active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {p.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="text-right py-3 px-4">
                    <ProductActions mode="edit" product={p} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
