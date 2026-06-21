"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getPurchaseOrders() {
  return prisma.purchaseOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      supplier: true,
      items: { include: { ingredient: true } },
    },
  });
}

export async function getSuppliers() {
  return prisma.supplier.findMany({ orderBy: { name: "asc" } });
}

export async function getIngredients() {
  return prisma.ingredient.findMany({ orderBy: { name: "asc" } });
}

interface PurchaseItemInput {
  ingredientId: string;
  quantity: number;
  unitPrice: number;
}

export async function createPurchaseOrder(
  supplierId: string,
  items: PurchaseItemInput[],
  notes?: string
) {
  const total = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const order = await prisma.purchaseOrder.create({
    data: {
      supplierId,
      status: "pending",
      total,
      notes: notes || null,
      items: {
        create: items.map((i) => ({
          ingredientId: i.ingredientId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          subtotal: i.quantity * i.unitPrice,
        })),
      },
    },
    include: { supplier: true, items: { include: { ingredient: true } } },
  });
  revalidatePath("/purchases");
  return { data: order };
}

export async function receivePurchaseOrder(orderId: string) {
  const order = await prisma.purchaseOrder.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return { error: "Orden no encontrada" };
  if (order.status === "received") return { error: "La orden ya fue recibida" };

  for (const item of order.items) {
    await prisma.ingredient.update({
      where: { id: item.ingredientId },
      data: {
        stock: { increment: item.quantity },
        costPerUnit: item.unitPrice,
      },
    });
    await prisma.stockMovement.create({
      data: {
        itemType: "ingredient",
        itemId: item.ingredientId,
        type: "purchase",
        quantity: item.quantity,
        reason: "Compra recibida",
        reference: orderId,
      },
    });
  }

  await prisma.purchaseOrder.update({
    where: { id: orderId },
    data: { status: "received", receivedAt: new Date() },
  });

  revalidatePath("/purchases");
  revalidatePath("/stock");
  revalidatePath("/dashboard");
  return { success: true };
}
