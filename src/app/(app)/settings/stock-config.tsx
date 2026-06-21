"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateIngredientThresholds } from "@/actions/ingredients";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

interface IngredientThreshold {
  id: string;
  name: string;
  unit: string;
  stock: number;
  minStock: number;
  reorderPoint: number;
  breakPoint: number;
}

export function StockConfig({ ingredients }: { ingredients: IngredientThreshold[] }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, { reorderPoint: number; breakPoint: number; minStock: number }>>(
    Object.fromEntries(
      ingredients.map((i) => [i.id, { reorderPoint: i.reorderPoint, breakPoint: i.breakPoint, minStock: i.minStock }])
    )
  );
  const [saving, setSaving] = useState<string | null>(null);

  const handleSave = async (id: string) => {
    const v = values[id];
    if (v.breakPoint >= v.minStock) {
      toast.error("El punto de quiebre debe ser menor al minimo");
      return;
    }
    if (v.minStock >= v.reorderPoint) {
      toast.error("El minimo debe ser menor al punto de reposicion");
      return;
    }
    setSaving(id);
    await updateIngredientThresholds(id, v);
    setSaving(null);
    toast.success("Umbrales actualizados");
    router.refresh();
  };

  const update = (id: string, field: string, val: number) => {
    setValues((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: val },
    }));
  };

  const hasChanged = (ing: IngredientThreshold) => {
    const v = values[ing.id];
    return v.reorderPoint !== ing.reorderPoint || v.breakPoint !== ing.breakPoint || v.minStock !== ing.minStock;
  };

  return (
    <div id="stock-config" className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
          Umbrales de stock - Materias primas
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Configura los puntos de reposicion, minimo critico y quiebre de stock para cada insumo.
          Los valores deben cumplir: quiebre &lt; minimo &lt; reposicion.
        </p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-muted-foreground border-b border-border bg-muted/50">
            <th className="text-left py-3 px-4 font-medium">Insumo</th>
            <th className="text-right py-3 px-4 font-medium">Stock actual</th>
            <th className="text-center py-3 px-4 font-medium">
              <div>Reposicion</div>
              <div className="text-[10px] font-normal">Hay que comprar</div>
            </th>
            <th className="text-center py-3 px-4 font-medium">
              <div>Minimo</div>
              <div className="text-[10px] font-normal">Critico</div>
            </th>
            <th className="text-center py-3 px-4 font-medium">
              <div>Quiebre</div>
              <div className="text-[10px] font-normal">No se puede producir</div>
            </th>
            <th className="text-center py-3 px-4 font-medium w-20"></th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((ing) => (
            <tr key={ing.id} className="border-b border-border/50">
              <td className="py-3 px-4">
                <div className="font-medium">{ing.name}</div>
                <div className="text-xs text-muted-foreground">{ing.unit}</div>
              </td>
              <td className="text-right py-3 px-4 font-medium">{Number(ing.stock).toFixed(1)}</td>
              <td className="py-3 px-4">
                <input
                  type="number"
                  value={values[ing.id]?.reorderPoint ?? ""}
                  onChange={(e) => update(ing.id, "reorderPoint", parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-1.5 rounded-lg border border-border bg-background text-sm text-center mx-auto block"
                />
              </td>
              <td className="py-3 px-4">
                <input
                  type="number"
                  value={values[ing.id]?.minStock ?? ""}
                  onChange={(e) => update(ing.id, "minStock", parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-1.5 rounded-lg border border-border bg-background text-sm text-center mx-auto block"
                />
              </td>
              <td className="py-3 px-4">
                <input
                  type="number"
                  value={values[ing.id]?.breakPoint ?? ""}
                  onChange={(e) => update(ing.id, "breakPoint", parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-1.5 rounded-lg border border-border bg-background text-sm text-center mx-auto block"
                />
              </td>
              <td className="py-3 px-4 text-center">
                {hasChanged(ing) && (
                  <Button
                    size="sm"
                    onClick={() => handleSave(ing.id)}
                    disabled={saving === ing.id}
                    className="h-7 px-2"
                  >
                    <Save className="size-3" />
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
