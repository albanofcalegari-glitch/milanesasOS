"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { createSale } from "@/actions/sales";
import { formatCurrency, paymentMethodLabel, formatDateTime } from "@/lib/format";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ShoppingCart, Plus, Minus, Trash2, AlertCircle, Search, Printer } from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
}

interface Customer {
  id: string;
  name: string;
  type: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const PAYMENT_METHODS = [
  { value: "efectivo", label: "Efectivo" },
  { value: "debito", label: "Debito" },
  { value: "credito", label: "Credito" },
  { value: "mercadopago", label: "Mercado Pago" },
  { value: "transferencia", label: "Transferencia" },
];

interface LastSale {
  id: string;
  total: number;
  paymentMethod: string;
  items: { name: string; qty: number; price: number }[];
  customer: string;
  date: Date;
}

export function POSClient({
  products,
  customers,
  cashOpen,
}: {
  products: Product[];
  customers: Customer[];
  cashOpen: boolean;
}) {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [customerId, setCustomerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [lastSale, setLastSale] = useState<LastSale | null>(null);

  const categories = [...new Set(products.map((p) => p.category))];
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesFilter = !filter || p.name.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory = !activeCategory || p.category === activeCategory;
    return matchesFilter && matchesCategory;
  });

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.product.id === productId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const total = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const handleSale = async () => {
    if (!cashOpen) {
      toast.error("No hay caja abierta. Abri la caja antes de vender.");
      return;
    }
    if (cart.length === 0) {
      toast.error("El carrito esta vacio");
      return;
    }
    setLoading(true);
    const res = await createSale(
      cart.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
        unitPrice: i.product.price,
      })),
      paymentMethod,
      customerId || undefined
    );
    setLoading(false);
    if (res.error) {
      toast.error(res.error);
    } else {
      const customerName = customerId
        ? customers.find((c) => c.id === customerId)?.name || "Consumidor final"
        : "Consumidor final";
      setLastSale({
        id: res.data!.id,
        total,
        paymentMethod,
        items: cart.map((i) => ({ name: i.product.name, qty: i.quantity, price: i.product.price * i.quantity })),
        customer: customerName,
        date: new Date(),
      });
      toast.success(`Venta registrada: ${formatCurrency(total)}`);
      setCart([]);
      setCustomerId("");
      router.refresh();
    }
  };

  const printTicket = () => {
    if (!lastSale) return;
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) return;
    const itemsHtml = lastSale.items.map((i) =>
      `<tr><td>${i.qty}x ${i.name}</td><td style="text-align:right">${formatCurrency(i.price)}</td></tr>`
    ).join("");
    printWindow.document.write(`
      <html><head><title>Ticket #${lastSale.id.slice(-6)}</title>
      <style>
        body { font-family: monospace; font-size: 12px; padding: 20px; max-width: 300px; margin: 0 auto; }
        .center { text-align: center; }
        .line { border-top: 1px dashed #000; margin: 8px 0; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 2px 0; }
        .total { font-size: 16px; font-weight: bold; }
      </style></head><body>
      <div class="center"><b style="font-size:16px">La Milaneseria</b><br>Av. Corrientes 1234, CABA</div>
      <div class="line"></div>
      <div class="center"><b>TICKET #${lastSale.id.slice(-6)}</b><br>${formatDateTime(lastSale.date)}</div>
      <div class="line"></div>
      <table>${itemsHtml}</table>
      <div class="line"></div>
      <table><tr><td class="total">TOTAL</td><td class="total" style="text-align:right">${formatCurrency(lastSale.total)}</td></tr></table>
      <div class="line"></div>
      <div class="center">Pago: ${paymentMethodLabel(lastSale.paymentMethod)}<br>Cliente: ${lastSale.customer}</div>
      <div class="line"></div>
      <div class="center" style="font-size:10px;color:#888">Milanesa OS by Qngine</div>
      <script>window.print(); window.close();</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  return (
    <div>
      <PageHeader title="POS / Ventas" description="Registrar nueva venta" />

      {!cashOpen && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="size-5 text-red-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-700 dark:text-red-400">Caja cerrada</p>
            <p className="text-sm text-red-600 dark:text-red-400/80">Abri la caja desde el modulo Caja para poder vender.</p>
          </div>
        </div>
      )}

      {lastSale && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <ShoppingCart className="size-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                Venta #{lastSale.id.slice(-6)} - {formatCurrency(lastSale.total)}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400/80">{paymentMethodLabel(lastSale.paymentMethod)} - {lastSale.customer}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={printTicket}>
            <Printer className="size-3.5 mr-1" data-icon="inline-start" />
            Imprimir ticket
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Buscar producto... (F2)"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${!activeCategory ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"}`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${activeCategory === cat ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-card border border-border rounded-xl p-4 text-left hover:border-primary/50 hover:shadow-sm transition-all"
              >
                <p className="text-sm font-medium leading-tight">{product.name}</p>
                <p className="text-lg font-bold mt-1" style={{ color: "#7c5cfc" }}>{formatCurrency(product.price)}</p>
                <p className="text-xs text-muted-foreground mt-1">Stock: {product.stock} {product.unit}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 sticky top-20">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="size-4" />
              <h2 className="text-sm font-semibold">Carrito</h2>
              <span className="text-xs text-muted-foreground ml-auto">
                {cart.reduce((s, i) => s + i.quantity, 0)} items
              </span>
            </div>

            {cart.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Agrega productos al carrito
              </p>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(item.product.price)} x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQty(item.product.id, -1)} className="p-1 rounded hover:bg-muted">
                        <Minus className="size-3" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item.product.id, 1)} className="p-1 rounded hover:bg-muted">
                        <Plus className="size-3" />
                      </button>
                      <button onClick={() => removeFromCart(item.product.id)} className="p-1 rounded hover:bg-muted text-red-500 ml-1">
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                    <p className="text-sm font-medium w-20 text-right">
                      {formatCurrency(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-border mt-4 pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-semibold">Total</span>
                <span className="text-xl font-bold" style={{ color: "#7c5cfc" }}>{formatCurrency(total)}</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Medio de pago</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {PAYMENT_METHODS.map((pm) => (
                      <button
                        key={pm.value}
                        onClick={() => setPaymentMethod(pm.value)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors ${paymentMethod === pm.value ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}
                      >
                        {pm.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Cliente (opcional)</label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                  >
                    <option value="">Consumidor final</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <Button
                  onClick={handleSale}
                  disabled={loading || cart.length === 0 || !cashOpen}
                  className="w-full"
                  size="lg"
                >
                  {loading ? "Procesando..." : `Confirmar venta - ${formatCurrency(total)}`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
