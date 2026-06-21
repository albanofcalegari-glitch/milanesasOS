export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { formatDateTime } from "@/lib/format";
import { CustomerActions } from "./customer-actions";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { name: "asc" },
    include: {
      sales: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { sales: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Listado de clientes"
        actions={<CustomerActions mode="create" />}
      />

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground border-b border-border bg-muted/50">
              <th className="text-left py-3 px-4 font-medium">Nombre</th>
              <th className="text-left py-3 px-4 font-medium">Tipo</th>
              <th className="text-left py-3 px-4 font-medium">Telefono</th>
              <th className="text-left py-3 px-4 font-medium">Email</th>
              <th className="text-right py-3 px-4 font-medium">Compras</th>
              <th className="text-left py-3 px-4 font-medium">Ultima compra</th>
              <th className="text-left py-3 px-4 font-medium">Notas</th>
              <th className="text-right py-3 px-4 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-border/50">
                <td className="py-3 px-4 font-medium">{c.name}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${c.type === "empresa" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {c.type === "empresa" ? "Empresa" : "Final"}
                  </span>
                </td>
                <td className="py-3 px-4">{c.phone || "-"}</td>
                <td className="py-3 px-4">{c.email || "-"}</td>
                <td className="text-right py-3 px-4">{c._count.sales}</td>
                <td className="py-3 px-4">{c.sales[0] ? formatDateTime(c.sales[0].createdAt) : "-"}</td>
                <td className="py-3 px-4 text-muted-foreground max-w-32 truncate">{c.notes || "-"}</td>
                <td className="text-right py-3 px-4">
                  <CustomerActions mode="edit" customer={c} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
