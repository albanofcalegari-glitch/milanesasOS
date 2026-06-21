"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateTime, paymentMethodLabel } from "@/lib/format";
import { Eye, Printer } from "lucide-react";

interface SaleProps {
  sale: {
    id: string;
    total: number;
    subtotal: number;
    discount: number;
    paymentMethod: string;
    createdAt: Date;
    customer: { name: string } | null;
    items: {
      id: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
      product: { name: string };
    }[];
  };
}

export function SaleDetail({ sale }: SaleProps) {
  const [open, setOpen] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!ticketRef.current) return;
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Ticket #${sale.id.slice(-6)}</title>
      <style>
        body { font-family: monospace; font-size: 12px; padding: 20px; max-width: 300px; margin: 0 auto; }
        .center { text-align: center; }
        .right { text-align: right; }
        .bold { font-weight: bold; }
        .line { border-top: 1px dashed #000; margin: 8px 0; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 2px 0; }
        .total { font-size: 16px; font-weight: bold; }
      </style></head><body>
      ${ticketRef.current.innerHTML}
      <script>window.print(); window.close();</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="p-1.5 rounded hover:bg-muted">
        <Eye className="size-3.5 text-muted-foreground" />
      </button>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setOpen(false)} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-xl">
          <div ref={ticketRef}>
            <div className="center">
              <div className="bold" style={{ fontSize: "16px" }}>La Milaneseria</div>
              <div>Av. Corrientes 1234, CABA</div>
              <div className="line"></div>
              <div className="bold">TICKET #{sale.id.slice(-6)}</div>
              <div>{formatDateTime(sale.createdAt)}</div>
              <div className="line"></div>
            </div>

            <table>
              <tbody>
                {sale.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.quantity}x {item.product.name}</td>
                    <td className="right">{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="line"></div>

            <table>
              <tbody>
                {sale.discount > 0 && (
                  <>
                    <tr>
                      <td>Subtotal</td>
                      <td className="right">{formatCurrency(sale.subtotal)}</td>
                    </tr>
                    <tr>
                      <td>Descuento</td>
                      <td className="right">-{formatCurrency(sale.discount)}</td>
                    </tr>
                  </>
                )}
                <tr>
                  <td className="bold total">TOTAL</td>
                  <td className="right bold total">{formatCurrency(sale.total)}</td>
                </tr>
              </tbody>
            </table>

            <div className="line"></div>

            <div className="center">
              <div>Pago: {paymentMethodLabel(sale.paymentMethod)}</div>
              <div>Cliente: {sale.customer?.name || "Consumidor final"}</div>
              <div className="line"></div>
              <div style={{ fontSize: "10px", color: "#888" }}>Milanesa OS by Qngine</div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handlePrint} className="flex-1">
              <Printer className="size-4 mr-1" data-icon="inline-start" />
              Imprimir
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>Cerrar</Button>
          </div>
        </div>
      </div>
    </>
  );
}
