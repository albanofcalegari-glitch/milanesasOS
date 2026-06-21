"use client";

import { Button } from "@/components/ui/button";
import { receivePurchaseOrder } from "@/actions/purchases";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function PurchaseActions({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleReceive = async () => {
    setLoading(true);
    const res = await receivePurchaseOrder(orderId);
    setLoading(false);
    if ("error" in res) {
      toast.error(res.error);
    } else {
      toast.success("Compra recibida. Stock actualizado.");
      router.refresh();
    }
  };

  return (
    <div className="flex gap-2 mt-3 pt-3 border-t border-border">
      <Button size="sm" onClick={handleReceive} disabled={loading}>
        Marcar como recibida
      </Button>
    </div>
  );
}
