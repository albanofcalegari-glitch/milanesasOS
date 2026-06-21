"use server";

import { prisma } from "@/lib/db";

export async function getDailyReport(dateStr?: string) {
  const date = dateStr ? new Date(dateStr) : new Date();
  date.setHours(0, 0, 0, 0);
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);

  const [sales, cashSessions, ingredients, products] = await Promise.all([
    prisma.sale.findMany({
      where: {
        createdAt: { gte: date, lt: nextDay },
        status: "completed",
      },
      include: { items: { include: { product: true } }, customer: true },
    }),
    prisma.cashSession.findMany({
      where: {
        openedAt: { gte: date, lt: nextDay },
      },
      include: { movements: true },
    }),
    prisma.ingredient.findMany(),
    prisma.product.findMany({ where: { active: true } }),
  ]);

  const totalSales = sales.reduce((s, sale) => s + sale.total, 0);
  const ticketCount = sales.length;
  const avgTicket = ticketCount > 0 ? totalSales / ticketCount : 0;

  const salesByMethod: Record<string, { count: number; total: number }> = {};
  for (const sale of sales) {
    if (!salesByMethod[sale.paymentMethod]) {
      salesByMethod[sale.paymentMethod] = { count: 0, total: 0 };
    }
    salesByMethod[sale.paymentMethod].count++;
    salesByMethod[sale.paymentMethod].total += sale.total;
  }

  const productSales: Record<string, { name: string; qty: number; total: number; cost: number }> = {};
  for (const sale of sales) {
    for (const item of sale.items) {
      if (!productSales[item.productId]) {
        productSales[item.productId] = {
          name: item.product.name,
          qty: 0,
          total: 0,
          cost: item.product.cost * 0,
        };
      }
      productSales[item.productId].qty += item.quantity;
      productSales[item.productId].total += item.subtotal;
      productSales[item.productId].cost += item.product.cost * item.quantity;
    }
  }
  const productsSold = Object.values(productSales).sort((a, b) => b.total - a.total);

  const totalCost = productsSold.reduce((s, p) => s + p.cost, 0);
  const estimatedMargin = totalSales > 0 ? ((totalSales - totalCost) / totalSales) * 100 : 0;

  let cashMovements: { type: string; amount: number; description: string }[] = [];
  let cashFinal = 0;
  for (const cs of cashSessions) {
    cashMovements = cs.movements.map((m) => ({
      type: m.type,
      amount: m.amount,
      description: m.description,
    }));
    const movTotal = cs.movements.reduce((s, m) => s + m.amount, 0);
    cashFinal = cs.openingAmount + movTotal;
  }

  const deposits = cashMovements
    .filter((m) => m.amount > 0 && m.type !== "sale")
    .reduce((s, m) => s + m.amount, 0);
  const withdrawals = cashMovements
    .filter((m) => m.amount < 0)
    .reduce((s, m) => s + Math.abs(m.amount), 0);

  const criticalStock = [
    ...products.filter((p) => p.stock <= p.minStock && p.minStock > 0).map((p) => ({
      name: p.name,
      type: "producto" as const,
      stock: p.stock,
      minStock: p.minStock,
      unit: p.unit,
    })),
    ...ingredients.filter((i) => i.stock <= i.minStock && i.minStock > 0).map((i) => ({
      name: i.name,
      type: "insumo" as const,
      stock: i.stock,
      minStock: i.minStock,
      unit: i.unit,
    })),
  ];

  return {
    date: date.toISOString(),
    totalSales,
    ticketCount,
    avgTicket,
    salesByMethod,
    productsSold,
    totalCost,
    estimatedMargin,
    deposits,
    withdrawals,
    cashFinal,
    criticalStock,
  };
}
