"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { openCashSession, closeCashSession, addCashMovement } from "@/actions/cash";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CashSession {
  id: string;
  openedAt: Date;
  openingAmount: number;
  status: string;
  movements: {
    id: string;
    type: string;
    amount: number;
    description: string;
    createdAt: Date;
  }[];
  sales: { id: string; total: number }[];
}

export function CashActions({ openSession }: { openSession: CashSession | null }) {
  const router = useRouter();
  const [openAmount, setOpenAmount] = useState("");
  const [closeAmount, setCloseAmount] = useState("");
  const [movAmount, setMovAmount] = useState("");
  const [movDesc, setMovDesc] = useState("");
  const [movType, setMovType] = useState<"deposit" | "withdrawal">("deposit");
  const [loading, setLoading] = useState(false);

  const handleOpen = async () => {
    const amount = parseFloat(openAmount);
    if (isNaN(amount) || amount < 0) {
      toast.error("Ingresa un monto valido");
      return;
    }
    setLoading(true);
    const res = await openCashSession(amount);
    setLoading(false);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`Caja abierta con ${formatCurrency(amount)}`);
      setOpenAmount("");
      router.refresh();
    }
  };

  const handleClose = async () => {
    if (!openSession) return;
    const amount = parseFloat(closeAmount);
    if (isNaN(amount) || amount < 0) {
      toast.error("Ingresa el monto real en caja");
      return;
    }
    setLoading(true);
    const res = await closeCashSession(openSession.id, amount);
    setLoading(false);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Caja cerrada");
      setCloseAmount("");
      router.refresh();
    }
  };

  const handleMovement = async () => {
    if (!openSession) return;
    const amount = parseFloat(movAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Ingresa un monto valido");
      return;
    }
    if (!movDesc.trim()) {
      toast.error("Ingresa una descripcion");
      return;
    }
    setLoading(true);
    const res = await addCashMovement(openSession.id, movType, amount, movDesc);
    setLoading(false);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`Movimiento registrado: ${formatCurrency(movType === "withdrawal" ? -amount : amount)}`);
      setMovAmount("");
      setMovDesc("");
      router.refresh();
    }
  };

  if (!openSession) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 max-w-md">
        <h2 className="text-lg font-semibold mb-1">Abrir caja</h2>
        <p className="text-sm text-muted-foreground mb-4">No hay caja abierta. Ingresa el monto inicial.</p>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Monto inicial"
            value={openAmount}
            onChange={(e) => setOpenAmount(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
          />
          <Button onClick={handleOpen} disabled={loading}>
            Abrir
          </Button>
        </div>
      </div>
    );
  }

  const totalMovements = openSession.movements.reduce((s, m) => s + m.amount, 0);
  const currentTotal = openSession.openingAmount + totalMovements;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Monto inicial</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(openSession.openingAmount)}</p>
          <p className="text-xs text-muted-foreground mt-1">Abierta: {formatDateTime(openSession.openedAt)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Total en caja</p>
          <p className="text-2xl font-bold mt-1 text-emerald-600">{formatCurrency(currentTotal)}</p>
          <p className="text-xs text-muted-foreground mt-1">{openSession.movements.length} movimientos</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Ventas en sesion</p>
          <p className="text-2xl font-bold mt-1">{openSession.sales.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-3">Registrar movimiento</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => setMovType("deposit")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${movType === "deposit" ? "bg-emerald-600 text-white border-emerald-600" : "border-border text-muted-foreground"}`}
              >
                Ingreso
              </button>
              <button
                onClick={() => setMovType("withdrawal")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${movType === "withdrawal" ? "bg-red-500 text-white border-red-500" : "border-border text-muted-foreground"}`}
              >
                Egreso
              </button>
            </div>
            <input
              type="number"
              placeholder="Monto"
              value={movAmount}
              onChange={(e) => setMovAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
            <input
              type="text"
              placeholder="Descripcion"
              value={movDesc}
              onChange={(e) => setMovDesc(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
            <Button onClick={handleMovement} disabled={loading} className="w-full">
              Registrar
            </Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-3">Cerrar caja</h3>
          <p className="text-sm text-muted-foreground mb-3">Ingresa el monto real contado.</p>
          <div className="space-y-3">
            <input
              type="number"
              placeholder="Efectivo real"
              value={closeAmount}
              onChange={(e) => setCloseAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
            <Button onClick={handleClose} disabled={loading} variant="destructive" className="w-full">
              Cerrar caja
            </Button>
          </div>
        </div>
      </div>

      {openSession.movements.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-3">Movimientos</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground border-b border-border">
                <th className="text-left py-2 font-medium">Hora</th>
                <th className="text-left py-2 font-medium">Tipo</th>
                <th className="text-left py-2 font-medium">Descripcion</th>
                <th className="text-right py-2 font-medium">Monto</th>
              </tr>
            </thead>
            <tbody>
              {openSession.movements.map((m) => (
                <tr key={m.id} className="border-b border-border/50">
                  <td className="py-2">{formatDateTime(m.createdAt)}</td>
                  <td className="py-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${m.amount >= 0 ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-red-500/15 text-red-600 dark:text-red-400"}`}>
                      {m.type === "sale" ? "Venta" : m.amount >= 0 ? "Ingreso" : "Egreso"}
                    </span>
                  </td>
                  <td className="py-2">{m.description}</td>
                  <td className={`text-right py-2 font-medium ${m.amount >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {m.amount >= 0 ? "+" : ""}{formatCurrency(m.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
