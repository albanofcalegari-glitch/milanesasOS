"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createProduct, updateProduct, deleteProduct } from "@/actions/products";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  type: string;
  stock: number;
  minStock: number;
  unit: string;
  active: boolean;
}

export function ProductActions({ mode, product }: { mode: "create" | "edit"; product?: Product }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: product?.name || "",
    category: product?.category || "Milanesas",
    price: product?.price || 0,
    cost: product?.cost || 0,
    type: product?.type || "manufactured",
    stock: product?.stock || 0,
    minStock: product?.minStock || 0,
    unit: product?.unit || "unidad",
  });

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error("Ingresa un nombre"); return; }
    setLoading(true);
    if (mode === "create") {
      await createProduct(form);
      toast.success("Producto creado");
    } else if (product) {
      await updateProduct(product.id, form);
      toast.success("Producto actualizado");
    }
    setLoading(false);
    setOpen(false);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!product) return;
    setLoading(true);
    await deleteProduct(product.id);
    setLoading(false);
    toast.success("Producto desactivado");
    router.refresh();
  };

  if (!open) {
    if (mode === "create") {
      return (
        <Button onClick={() => setOpen(true)} size="sm">
          <Plus className="size-4 mr-1" data-icon="inline-start" />
          Nuevo producto
        </Button>
      );
    }
    return (
      <div className="flex gap-1 justify-end">
        <button onClick={() => setOpen(true)} className="p-1.5 rounded hover:bg-muted">
          <Pencil className="size-3.5 text-muted-foreground" />
        </button>
        {product?.active && (
          <button onClick={handleDelete} className="p-1.5 rounded hover:bg-muted">
            <Trash2 className="size-3.5 text-red-400" />
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setOpen(false)} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-xl">
          <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            {mode === "create" ? "Nuevo producto" : "Editar producto"}
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Nombre</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Categoria</label>
                <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Tipo</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
                  <option value="manufactured">Fabricado</option>
                  <option value="finished">Terminado</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Precio</label>
                <input type="number" value={form.price || ""} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Costo</label>
                <input type="number" value={form.cost || ""} onChange={(e) => setForm({ ...form, cost: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Stock</label>
                <input type="number" value={form.stock || ""} onChange={(e) => setForm({ ...form, stock: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Minimo</label>
                <input type="number" value={form.minStock || ""} onChange={(e) => setForm({ ...form, minStock: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Unidad</label>
                <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-5">
            <Button onClick={handleSubmit} disabled={loading} className="flex-1">
              {mode === "create" ? "Crear" : "Guardar"}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          </div>
        </div>
      </div>
    </>
  );
}
