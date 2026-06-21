"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createCustomer, updateCustomer, deleteCustomer } from "@/actions/customers";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  type: string;
  notes: string | null;
}

export function CustomerActions({ mode, customer }: { mode: "create" | "edit"; customer?: Customer }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: customer?.name || "",
    phone: customer?.phone || "",
    email: customer?.email || "",
    type: customer?.type || "final",
    notes: customer?.notes || "",
  });

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error("Ingresa un nombre"); return; }
    setLoading(true);
    if (mode === "create") {
      await createCustomer(form);
      toast.success("Cliente creado");
    } else if (customer) {
      await updateCustomer(customer.id, form);
      toast.success("Cliente actualizado");
    }
    setLoading(false);
    setOpen(false);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!customer) return;
    setLoading(true);
    const res = await deleteCustomer(customer.id);
    setLoading(false);
    if (res.error) { toast.error(res.error); return; }
    toast.success("Cliente eliminado");
    router.refresh();
  };

  if (!open) {
    if (mode === "create") {
      return (
        <Button onClick={() => setOpen(true)} size="sm">
          <Plus className="size-4 mr-1" data-icon="inline-start" />
          Nuevo cliente
        </Button>
      );
    }
    return (
      <div className="flex gap-1 justify-end">
        <button onClick={() => setOpen(true)} className="p-1.5 rounded hover:bg-muted"><Pencil className="size-3.5 text-muted-foreground" /></button>
        <button onClick={handleDelete} className="p-1.5 rounded hover:bg-muted"><Trash2 className="size-3.5 text-red-400" /></button>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setOpen(false)} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-xl">
          <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            {mode === "create" ? "Nuevo cliente" : "Editar cliente"}
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Nombre</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Tipo</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
                  <option value="final">Final</option>
                  <option value="empresa">Empresa</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Telefono</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Email</label>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Notas</label>
              <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
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
