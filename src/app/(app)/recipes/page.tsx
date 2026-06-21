export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { formatCurrency } from "@/lib/format";

export default async function RecipesPage() {
  const recipes = await prisma.recipe.findMany({
    include: {
      product: true,
      items: { include: { ingredient: true } },
    },
    orderBy: { product: { name: "asc" } },
  });

  return (
    <div>
      <PageHeader title="Recetas" description="Composicion de productos" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recipes.map((recipe) => {
          const recipeCost = recipe.items.reduce(
            (sum, ri) => sum + ri.quantity * ri.ingredient.costPerUnit,
            0
          );
          return (
            <div key={recipe.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">{recipe.product.name}</h3>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Costo receta</p>
                  <p className="text-sm font-bold">{formatCurrency(recipeCost)}</p>
                </div>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b border-border">
                    <th className="text-left py-2 font-medium">Insumo</th>
                    <th className="text-right py-2 font-medium">Cantidad</th>
                    <th className="text-left py-2 font-medium">Unidad</th>
                    <th className="text-right py-2 font-medium">Costo</th>
                  </tr>
                </thead>
                <tbody>
                  {recipe.items.map((ri) => (
                    <tr key={ri.id} className="border-b border-border/50">
                      <td className="py-2">{ri.ingredient.name}</td>
                      <td className="text-right py-2">{ri.quantity}</td>
                      <td className="py-2">{ri.ingredient.unit}</td>
                      <td className="text-right py-2">{formatCurrency(ri.quantity * ri.ingredient.costPerUnit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-2 pt-2 border-t border-border flex justify-between text-xs text-muted-foreground">
                <span>Precio venta: {formatCurrency(recipe.product.price)}</span>
                <span>Margen: {((recipe.product.price - recipeCost) / recipe.product.price * 100).toFixed(0)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
