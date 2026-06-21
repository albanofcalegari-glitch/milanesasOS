"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getIngredientAlerts() {
  const ingredients = await prisma.ingredient.findMany({
    orderBy: { name: "asc" },
    include: {
      recipeItems: {
        include: { recipe: { include: { product: true } } },
      },
    },
  });

  const alerts = ingredients.map((ing) => {
    let status: "ok" | "reorder" | "critical" | "break" = "ok";
    if (ing.stock <= ing.breakPoint) status = "break";
    else if (ing.stock <= ing.minStock) status = "critical";
    else if (ing.stock <= ing.reorderPoint) status = "reorder";

    const usedIn = ing.recipeItems.map((ri) => ({
      product: ri.recipe.product.name,
      qtyPerUnit: ri.quantity,
      canProduce: ri.quantity > 0 ? Math.floor(ing.stock / ri.quantity) : 0,
    }));

    const daysEstimate = usedIn.length > 0
      ? Math.min(...usedIn.map((u) => u.canProduce))
      : null;

    return {
      ...ing,
      status,
      usedIn,
      canProduceMin: daysEstimate,
      recipeItems: undefined,
    };
  });

  return alerts;
}

export async function updateIngredientThresholds(
  id: string,
  data: { reorderPoint: number; breakPoint: number; minStock: number }
) {
  await prisma.ingredient.update({
    where: { id },
    data: {
      reorderPoint: data.reorderPoint,
      breakPoint: data.breakPoint,
      minStock: data.minStock,
    },
  });
  revalidatePath("/materias-primas");
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getIngredientThresholds() {
  return prisma.ingredient.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      unit: true,
      stock: true,
      minStock: true,
      reorderPoint: true,
      breakPoint: true,
    },
  });
}
