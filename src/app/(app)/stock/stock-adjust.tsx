"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { adjustStock } from "@/actions/stock";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function StockAdjust({
  itemType,
  itemId,
  itemName,
}: {
  itemType: "product" | "ingredient";
  itemId: string;
  itemName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (direction: "in" | "out") => {
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Ingresa una cantidad valida");
      return;
    }
    if (!reason.trim()) {
      toast.error("Ingresa un motivo");
      return;
    }
    setLoading(true);
    const adjustedQty = direction === "out" ? -qty : qty;
    await adjustStock(itemType, itemId, adjustedQty, reason);
    setLoading(false);
    toast.success(`Stock ajustado: ${direction === "in" ? "+" : "-"}${qty} ${itemName}`);
    setOpen(false);
    setQuantity("");
    setReason("");
    router.refresh();
  };

  if (!open) {
    return (
      <Button variant="outline" size="xs" onClick={() => setOpen(true)}>
        Ajustar
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        placeholder="Cant."
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        className="w-16 px-2 py-1 rounded border border-border bg-background text-xs"
      />
      <input
        type="text"
        placeholder="Motivo"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-24 px-2 py-1 rounded border border-border bg-background text-xs"
      />
      <Button size="xs" onClick={() => handleSubmit("in")} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
        +
      </Button>
      <Button size="xs" variant="destructive" onClick={() => handleSubmit("out")} disabled={loading}>
        -
      </Button>
      <Button size="xs" variant="ghost" onClick={() => setOpen(false)}>
        X
      </Button>
    </div>
  );
}
