"use server";

import { prisma } from "@/lib/db";

export async function getDashboardData() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    todaySales,
    cashSession,
    products,
    ingredients,
    recentSales,
    pendingProduction,
  ] = await Promise.all([
    prisma.sale.findMany({
      where: {
        createdAt: { gte: today, lt: tomorrow },
        status: "completed",
      },
      include: { items: { include: { product: true } } },
    }),
    prisma.cashSession.findFirst({
      where: { status: "open" },
      include: { movements: true },
    }),
    prisma.product.findMany({ where: { active: true } }),
    prisma.ingredient.findMany(),
    prisma.sale.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { items: { include: { product: true } }, customer: true },
    }),
    prisma.productionOrder.count({ where: { status: "pending" } }),
  ]);

  const totalSales = todaySales.reduce((sum, s) => sum + s.total, 0);
  const ticketCount = todaySales.length;
  const avgTicket = ticketCount > 0 ? totalSales / ticketCount : 0;

  const cashOpen = !!cashSession;
  let cashTotal = 0;
  if (cashSession) {
    const movTotal = cashSession.movements.reduce((s, m) => s + m.amount, 0);
    cashTotal = cashSession.openingAmount + movTotal;
  }

  const productSales: Record<string, { name: string; qty: number; total: number }> = {};
  for (const sale of todaySales) {
    for (const item of sale.items) {
      if (!productSales[item.productId]) {
        productSales[item.productId] = { name: item.product.name, qty: 0, total: 0 };
      }
      productSales[item.productId].qty += item.quantity;
      productSales[item.productId].total += item.subtotal;
    }
  }
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const criticalProducts = products.filter(
    (p) => p.stock <= p.minStock && p.minStock > 0
  );
  const criticalIngredients = ingredients.filter(
    (i) => i.stock <= i.minStock && i.minStock > 0
  );

  const salesByMethod: Record<string, number> = {};
  for (const sale of todaySales) {
    salesByMethod[sale.paymentMethod] = (salesByMethod[sale.paymentMethod] || 0) + sale.total;
  }

  return {
    totalSales,
    ticketCount,
    avgTicket,
    cashOpen,
    cashTotal,
    topProducts,
    criticalProducts,
    criticalIngredients,
    recentSales,
    pendingProduction,
    salesByMethod,
  };
}
