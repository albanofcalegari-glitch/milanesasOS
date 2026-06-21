"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getProductionOrders() {
  return prisma.productionOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: { include: { product: { include: { recipe: { include: { items: { include: { ingredient: true } } } } } } } },
    },
  });
}

export async function getManufacturedProducts() {
  return prisma.product.findMany({
    where: { type: "manufactured", active: true },
    include: { recipe: { include: { items: { include: { ingredient: true } } } } },
    orderBy: { name: "asc" },
  });
}

interface ProductionItemInput {
  productId: string;
  quantity: number;
}

export async function createProductionOrder(items: ProductionItemInput[], notes?: string) {
  const order = await prisma.productionOrder.create({
    data: {
      status: "pending",
      notes: notes || null,
      items: {
        create: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      },
    },
    include: { items: { include: { product: true } } },
  });
  revalidatePath("/production");
  revalidatePath("/dashboard");
  return { data: order };
}

export async function completeProductionOrder(orderId: string) {
  const order = await prisma.productionOrder.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: { include: { recipe: { include: { items: true } } } },
        },
      },
    },
  });
  if (!order) return { error: "Orden no encontrada" };
  if (order.status === "completed") return { error: "La orden ya esta completada" };
  if (order.status === "cancelled") return { error: "La orden esta cancelada" };

  for (const item of order.items) {
    if (item.product.recipe) {
      for (const ri of item.product.recipe.items) {
        const needed = ri.quantity * item.quantity;
        const ingredient = await prisma.ingredient.findUnique({
          where: { id: ri.ingredientId },
        });
        if (!ingredient || ingredient.stock < needed) {
          return {
            error: `Stock insuficiente de insumo ID ${ri.ingredientId}. Necesario: ${needed}, disponible: ${ingredient?.stock ?? 0}`,
          };
        }
      }
    }
  }

  for (const item of order.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    });
    await prisma.stockMovement.create({
      data: {
        itemType: "product",
        itemId: item.productId,
        type: "production",
        quantity: item.quantity,
        reason: "Produccion completada",
        reference: orderId,
      },
    });

    if (item.product.recipe) {
      for (const ri of item.product.recipe.items) {
        const totalQty = ri.quantity * item.quantity;
        await prisma.ingredient.update({
          where: { id: ri.ingredientId },
          data: { stock: { decrement: totalQty } },
        });
        await prisma.stockMovement.create({
          data: {
            itemType: "ingredient",
            itemId: ri.ingredientId,
            type: "production",
            quantity: -totalQty,
            reason: `Insumo por produccion`,
            reference: orderId,
          },
        });
      }
    }
  }

  await prisma.productionOrder.update({
    where: { id: orderId },
    data: { status: "completed", completedAt: new Date() },
  });

  revalidatePath("/production");
  revalidatePath("/stock");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function cancelProductionOrder(orderId: string) {
  await prisma.productionOrder.update({
    where: { id: orderId },
    data: { status: "cancelled" },
  });
  revalidatePath("/production");
  return { success: true };
}
