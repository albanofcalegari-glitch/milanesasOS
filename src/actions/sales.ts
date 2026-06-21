"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

interface SaleItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export async function createSale(
  items: SaleItemInput[],
  paymentMethod: string,
  customerId?: string
) {
  const cashSession = await prisma.cashSession.findFirst({
    where: { status: "open" },
  });
  if (!cashSession) return { error: "No hay caja abierta. Abri la caja antes de vender." };

  const branch = await prisma.branch.findFirst();
  if (!branch) return { error: "No hay sucursal configurada" };

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  const sale = await prisma.sale.create({
    data: {
      branchId: branch.id,
      cashSessionId: cashSession.id,
      customerId: customerId || null,
      subtotal,
      discount: 0,
      total: subtotal,
      paymentMethod,
      status: "completed",
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.unitPrice * item.quantity,
        })),
      },
    },
  });

  if (paymentMethod === "efectivo") {
    await prisma.cashMovement.create({
      data: {
        cashSessionId: cashSession.id,
        type: "sale",
        amount: subtotal,
        description: `Venta efectivo - ${sale.id.slice(-6)}`,
      },
    });
  }

  for (const item of items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } },
    });

    await prisma.stockMovement.create({
      data: {
        itemType: "product",
        itemId: item.productId,
        type: "sale",
        quantity: -item.quantity,
        reason: "Venta",
        reference: sale.id,
      },
    });

    const recipe = await prisma.recipe.findUnique({
      where: { productId: item.productId },
      include: { items: true },
    });

    if (recipe) {
      for (const ri of recipe.items) {
        const totalQty = ri.quantity * item.quantity;
        await prisma.ingredient.update({
          where: { id: ri.ingredientId },
          data: { stock: { decrement: totalQty } },
        });
        await prisma.stockMovement.create({
          data: {
            itemType: "ingredient",
            itemId: ri.ingredientId,
            type: "sale",
            quantity: -totalQty,
            reason: `Insumo por venta de ${item.quantity}x producto`,
            reference: sale.id,
          },
        });
      }
    }
  }

  revalidatePath("/pos");
  revalidatePath("/dashboard");
  revalidatePath("/cash");
  revalidatePath("/stock");
  revalidatePath("/reports");
  return { data: sale };
}

export async function getSales(limit = 50) {
  return prisma.sale.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      items: { include: { product: true } },
      customer: true,
    },
  });
}

export async function getProducts() {
  return prisma.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
}

export async function getCustomers() {
  return prisma.customer.findMany({ orderBy: { name: "asc" } });
}
