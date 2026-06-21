"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getStockOverview() {
  const [products, ingredients] = await Promise.all([
    prisma.product.findMany({ orderBy: { name: "asc" } }),
    prisma.ingredient.findMany({ orderBy: { name: "asc" } }),
  ]);
  return { products, ingredients };
}

export async function getStockMovements(limit = 100) {
  return prisma.stockMovement.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}

export async function adjustStock(
  itemType: "product" | "ingredient",
  itemId: string,
  quantity: number,
  reason: string
) {
  if (itemType === "product") {
    await prisma.product.update({
      where: { id: itemId },
      data: { stock: { increment: quantity } },
    });
  } else {
    await prisma.ingredient.update({
      where: { id: itemId },
      data: { stock: { increment: quantity } },
    });
  }

  await prisma.stockMovement.create({
    data: {
      itemType,
      itemId,
      type: quantity > 0 ? "adjustment_in" : "adjustment_out",
      quantity,
      reason,
    },
  });

  revalidatePath("/stock");
  revalidatePath("/dashboard");
  return { success: true };
}
