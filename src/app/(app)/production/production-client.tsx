"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createProductionOrder } from "@/actions/production";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  recipe: {
    items: {
      quantity: number;
      ingredient: { name: string; unit: string; stock: number };
    }[];
  } | null;
}

export function ProductionClient({ products }: { products: Product[] }) {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const selected = products.find((p) => p.id === selectedProduct);

  const handleCreate = async () => {
    if (!selectedProduct || !quantity) {
      toast.error("Selecciona producto y cantidad");
      return;
    }
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Cantidad invalida");
      return;
    }

    setLoading(true);
    const res = await createProductionOrder(
      [{ productId: selectedProduct, quantity: qty }],
      notes || undefined
    );
    setLoading(false);
    if ("error" in res) {
      toast.error(String(res.error));
    } else {
      toast.success("Orden de produccion creada");
      setSelectedProduct("");
      setQuantity("");
      setNotes("");
      router.refresh();
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h2 className="text-sm font-semibold mb-3">Nueva orden de produccion</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
        >
          <option value="">Seleccionar producto</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Cantidad"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
        />
        <input
          type="text"
          placeholder="Notas (opcional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
        />
        <Button onClick={handleCreate} disabled={loading}>
          Crear orden
        </Button>
      </div>

      {selected?.recipe && quantity && parseInt(quantity) > 0 && (
        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs font-medium mb-2">Insumos necesarios para {quantity} unidades:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {selected.recipe.items.map((ri, i) => {
              const needed = ri.quantity * parseInt(quantity);
              const sufficient = ri.ingredient.stock >= needed;
              return (
                <div key={i} className={`text-xs p-2 rounded ${sufficient ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"}`}>
                  <span className="font-medium">{ri.ingredient.name}</span>
                  <br />
                  Necesario: {needed.toFixed(2)} {ri.ingredient.unit}
                  <br />
                  Disponible: {ri.ingredient.stock.toFixed(2)}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
