export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";

export default async function SettingsPage() {
  const [business, branch, user, productCount, ingredientCount, supplierCount, customerCount] = await Promise.all([
    prisma.business.findFirst(),
    prisma.branch.findFirst(),
    prisma.user.findFirst(),
    prisma.product.count(),
    prisma.ingredient.count(),
    prisma.supplier.count(),
    prisma.customer.count(),
  ]);

  return (
    <div>
      <PageHeader title="Configuracion" description="Datos del sistema" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-4">Negocio</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Nombre</dt>
              <dd className="font-medium">{business?.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">CUIT</dt>
              <dd className="font-medium">{business?.cuit}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Moneda</dt>
              <dd className="font-medium">{business?.currency}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-4">Sucursal</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Nombre</dt>
              <dd className="font-medium">{branch?.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Direccion</dt>
              <dd className="font-medium">{branch?.address}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-4">Usuario</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Nombre</dt>
              <dd className="font-medium">{user?.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{user?.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Rol</dt>
              <dd className="font-medium capitalize">{user?.role}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-4">Datos del sistema</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Productos</dt>
              <dd className="font-medium">{productCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Insumos</dt>
              <dd className="font-medium">{ingredientCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Proveedores</dt>
              <dd className="font-medium">{supplierCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Clientes</dt>
              <dd className="font-medium">{customerCount}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-6 bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold mb-2">Acerca de</h2>
        <p className="text-sm text-muted-foreground">
          Milanesa OS v0.1.0 - Sistema de gestion para La Milaneseria.
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Stack: Next.js 16, Prisma, SQLite, Tailwind CSS.
        </p>
        <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Un producto de</span>
          <span className="text-sm font-bold" style={{ color: "#7c5cfc", fontFamily: "var(--font-heading)" }}>Qngine</span>
          <span className="text-xs text-muted-foreground">- Software, Calidad, Precision</span>
        </div>
      </div>
    </div>
  );
}
