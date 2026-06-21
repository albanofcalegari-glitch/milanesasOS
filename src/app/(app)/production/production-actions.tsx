"use client";

import { Button } from "@/components/ui/button";
import { completeProductionOrder, cancelProductionOrder } from "@/actions/production";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProductionOrderActions({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    const res = await completeProductionOrder(orderId);
    setLoading(false);
    if ("error" in res) {
      toast.error(res.error);
    } else {
      toast.success("Produccion completada. Stock actualizado.");
      router.refresh();
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    await cancelProductionOrder(orderId);
    setLoading(false);
    toast.success("Orden cancelada");
    router.refresh();
  };

  return (
    <div className="flex gap-2 mt-3 pt-3 border-t border-border">
      <Button size="sm" onClick={handleComplete} disabled={loading}>
        Completar produccion
      </Button>
      <Button size="sm" variant="outline" onClick={handleCancel} disabled={loading}>
        Cancelar
      </Button>
    </div>
  );
}
