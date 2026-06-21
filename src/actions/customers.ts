"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createCustomer(data: {
  name: string;
  phone?: string;
  email?: string;
  type: string;
  notes?: string;
}) {
  const customer = await prisma.customer.create({
    data: {
      name: data.name,
      phone: data.phone || null,
      email: data.email || null,
      type: data.type,
      notes: data.notes || null,
    },
  });
  revalidatePath("/customers");
  return { data: customer };
}

export async function updateCustomer(id: string, data: {
  name?: string;
  phone?: string;
  email?: string;
  type?: string;
  notes?: string;
}) {
  const customer = await prisma.customer.update({ where: { id }, data });
  revalidatePath("/customers");
  return { data: customer };
}

export async function deleteCustomer(id: string) {
  const hasSales = await prisma.sale.count({ where: { customerId: id } });
  if (hasSales > 0) return { error: "No se puede eliminar un cliente con ventas asociadas" };
  await prisma.customer.delete({ where: { id } });
  revalidatePath("/customers");
  return { success: true };
}
