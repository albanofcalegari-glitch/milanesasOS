"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createSupplier(data: {
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
}) {
  const supplier = await prisma.supplier.create({
    data: {
      name: data.name,
      contact: data.contact || null,
      phone: data.phone || null,
      email: data.email || null,
    },
  });
  revalidatePath("/purchases");
  revalidatePath("/settings");
  return { data: supplier };
}

export async function updateSupplier(id: string, data: {
  name?: string;
  contact?: string;
  phone?: string;
  email?: string;
}) {
  const supplier = await prisma.supplier.update({ where: { id }, data });
  revalidatePath("/purchases");
  return { data: supplier };
}

export async function deleteSupplier(id: string) {
  const hasOrders = await prisma.purchaseOrder.count({ where: { supplierId: id } });
  if (hasOrders > 0) return { error: "No se puede eliminar un proveedor con ordenes asociadas" };
  await prisma.supplier.delete({ where: { id } });
  revalidatePath("/purchases");
  return { success: true };
}
