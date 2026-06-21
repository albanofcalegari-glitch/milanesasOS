"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createPurchaseOrder } from "@/actions/purchases";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

interface Supplier {
  id: string;
  name: string;
}

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  costPerUnit: number;
}

interface PurchaseItem {
  ingredientId: string;
  quantity: number;
  unitPrice: number;
}

export function PurchaseClient({
  suppliers,
  ingredients,
}: {
  suppliers: Supplier[];
  ingredients: Ingredient[];
}) {
  const router = useRouter();
  const [supplierId, setSupplierId] = useState("");
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const addItem = () => {
    setItems([...items, { ingredientId: "", quantity: 0, unitPrice: 0 }]);
  };

  const updateItem = (index: number, field: keyof PurchaseItem, value: string | number) => {
    setItems(items.map((item, i) => {
      if (i !== index) return item;
      const updated = { ...item, [field]: value };
      if (field === "ingredientId") {
        const ing = ingredients.find((ig) => ig.id === value);
        if (ing) updated.unitPrice = ing.costPerUnit;
      }
      return updated;
    }));
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const total = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

  const handleCreate = async () => {
    if (!supplierId) {
      toast.error("Selecciona un proveedor");
      return;
    }
    if (items.length === 0 || items.some((i) => !i.ingredientId || i.quantity <= 0)) {
      toast.error("Agrega items validos");
      return;
    }
    setLoading(true);
    const res = await createPurchaseOrder(supplierId, items, notes || undefined);
    setLoading(false);
    if ("error" in res) {
      toast.error(String(res.error));
    } else {
      toast.success("Orden de compra creada");
      setSupplierId("");
      setItems([]);
      setNotes("");
      router.refresh();
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h2 className="text-sm font-semibold mb-3">Nueva orden de compra</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <select
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
        >
          <option value="">Seleccionar proveedor</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Notas (opcional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
        />
        <div className="text-right text-sm self-center font-bold">
          Total: {formatCurrency(total)}
        </div>
      </div>

      {items.length > 0 && (
        <table className="w-full text-sm mb-3">
          <thead>
            <tr className="text-muted-foreground border-b border-border">
              <th className="text-left py-2 font-medium">Insumo</th>
              <th className="text-right py-2 font-medium">Cantidad</th>
              <th className="text-right py-2 font-medium">Precio unit.</th>
              <th className="text-right py-2 font-medium">Subtotal</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-border/50">
                <td className="py-2">
                  <select
                    value={item.ingredientId}
                    onChange={(e) => updateItem(i, "ingredientId", e.target.value)}
                    className="w-full px-2 py-1 rounded border border-border bg-background text-xs"
                  >
                    <option value="">Seleccionar</option>
                    {ingredients.map((ing) => (
                      <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                    ))}
                  </select>
                </td>
                <td className="py-2">
                  <input
                    type="number"
                    value={item.quantity || ""}
                    onChange={(e) => updateItem(i, "quantity", parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 rounded border border-border bg-background text-xs text-right"
                  />
                </td>
                <td className="py-2">
                  <input
                    type="number"
                    value={item.unitPrice || ""}
                    onChange={(e) => updateItem(i, "unitPrice", parseFloat(e.target.value) || 0)}
                    className="w-24 px-2 py-1 rounded border border-border bg-background text-xs text-right"
                  />
                </td>
                <td className="text-right py-2 font-medium">{formatCurrency(item.quantity * item.unitPrice)}</td>
                <td className="py-2 text-right">
                  <button onClick={() => removeItem(i)} className="p-1 hover:bg-muted rounded text-red-500">
                    <Trash2 className="size-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={addItem}>
          <Plus className="size-3 mr-1" data-icon="inline-start" />
          Agregar item
        </Button>
        {items.length > 0 && (
          <Button size="sm" onClick={handleCreate} disabled={loading}>
            Crear orden
          </Button>
        )}
      </div>
    </div>
  );
}
