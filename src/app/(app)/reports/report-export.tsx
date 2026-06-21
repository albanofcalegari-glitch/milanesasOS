"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { paymentMethodLabel } from "@/lib/format";

interface ReportData {
  date: string;
  totalSales: number;
  ticketCount: number;
  avgTicket: number;
  salesByMethod: Record<string, { count: number; total: number }>;
  productsSold: { name: string; qty: number; total: number; cost: number }[];
  totalCost: number;
  estimatedMargin: number;
  deposits: number;
  withdrawals: number;
  cashFinal: number;
  criticalStock: { name: string; type: string; stock: number; minStock: number; unit: string }[];
}

export function ReportExport({ report }: { report: ReportData }) {
  const handleExport = () => {
    const lines: string[] = [];
    const d = new Date(report.date).toLocaleDateString("es-AR");

    lines.push("REPORTE DIARIO - " + d);
    lines.push("");
    lines.push("RESUMEN");
    lines.push(`Total vendido,${report.totalSales}`);
    lines.push(`Tickets,${report.ticketCount}`);
    lines.push(`Ticket promedio,${report.avgTicket.toFixed(0)}`);
    lines.push(`Margen estimado,${report.estimatedMargin.toFixed(1)}%`);
    lines.push("");

    lines.push("VENTAS POR MEDIO DE PAGO");
    lines.push("Medio,Tickets,Total");
    for (const [method, data] of Object.entries(report.salesByMethod)) {
      lines.push(`${paymentMethodLabel(method)},${data.count},${data.total}`);
    }
    lines.push("");

    lines.push("PRODUCTOS VENDIDOS");
    lines.push("Producto,Cantidad,Ingreso,Costo");
    for (const p of report.productsSold) {
      lines.push(`${p.name},${p.qty},${p.total},${p.cost}`);
    }
    lines.push("");

    lines.push("CAJA");
    lines.push(`Ingresos extra,${report.deposits}`);
    lines.push(`Egresos,${report.withdrawals}`);
    lines.push(`Total en caja,${report.cashFinal}`);
    lines.push("");

    if (report.criticalStock.length > 0) {
      lines.push("STOCK CRITICO");
      lines.push("Item,Tipo,Stock,Minimo,Unidad");
      for (const item of report.criticalStock) {
        lines.push(`${item.name},${item.type},${item.stock},${item.minStock},${item.unit}`);
      }
    }

    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte-${d.replace(/\//g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="outline" onClick={handleExport}>
      <Download className="size-4 mr-1" data-icon="inline-start" />
      Exportar CSV
    </Button>
  );
}
