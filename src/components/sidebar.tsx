"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  Wallet,
  Package,
  Warehouse,
  BookOpen,
  Factory,
  Truck,
  Users,
  BarChart3,
  Settings,
  ClipboardList,
  Leaf,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pos", label: "POS / Ventas", icon: ShoppingCart },
  { href: "/sales", label: "Historial", icon: ClipboardList },
  { href: "/cash", label: "Caja", icon: Wallet },
  { href: "/products", label: "Productos", icon: Package },
  { href: "/materias-primas", label: "Materias Primas", icon: Leaf },
  { href: "/stock", label: "Stock", icon: Warehouse },
  { href: "/recipes", label: "Recetas", icon: BookOpen },
  { href: "/production", label: "Produccion", icon: Factory },
  { href: "/purchases", label: "Compras", icon: Truck },
  { href: "/customers", label: "Clientes", icon: Users },
  { href: "/reports", label: "Reportes", icon: BarChart3 },
  { href: "/settings", label: "Configuracion", icon: Settings },
];

export function Sidebar({
  userName,
  branchName,
  businessName,
}: {
  userName: string;
  branchName: string;
  businessName: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-30">
      <div className="h-14 flex items-center gap-3 px-5 border-b border-sidebar-border">
        <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="3.5" fill="#7c5cfc" />
          <circle cx="16" cy="5" r="2" fill="#c084fc" />
          <circle cx="25.5" cy="10.5" r="2" fill="#c084fc" />
          <circle cx="25.5" cy="21.5" r="2" fill="#a870fc" />
          <circle cx="16" cy="27" r="2" fill="#a870fc" />
          <circle cx="6.5" cy="21.5" r="2" fill="#c084fc" />
          <circle cx="6.5" cy="10.5" r="2" fill="#c084fc" />
          <line x1="16" y1="12.5" x2="16" y2="7" stroke="#7c5cfc" strokeWidth="1" opacity="0.6" />
          <line x1="19" y1="14" x2="23.5" y2="11.5" stroke="#7c5cfc" strokeWidth="1" opacity="0.6" />
          <line x1="19" y1="18" x2="23.5" y2="20.5" stroke="#7c5cfc" strokeWidth="1" opacity="0.6" />
          <line x1="16" y1="19.5" x2="16" y2="25" stroke="#7c5cfc" strokeWidth="1" opacity="0.6" />
          <line x1="13" y1="18" x2="8.5" y2="20.5" stroke="#7c5cfc" strokeWidth="1" opacity="0.6" />
          <line x1="13" y1="14" x2="8.5" y2="11.5" stroke="#7c5cfc" strokeWidth="1" opacity="0.6" />
        </svg>
        <div>
          <h1 className="text-sm font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            Milanesa OS
          </h1>
          <p className="text-[10px] text-muted-foreground tracking-wider uppercase">by Qngine</p>
        </div>
      </div>

      <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="text-xs font-medium">{businessName}</div>
        <div className="text-[11px] text-muted-foreground">{branchName}</div>
      </div>
    </aside>
  );
}
