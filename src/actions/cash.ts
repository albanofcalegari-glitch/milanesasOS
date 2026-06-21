"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getOpenCashSession() {
  return prisma.cashSession.findFirst({
    where: { status: "open" },
    include: {
      movements: { orderBy: { createdAt: "desc" } },
      sales: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function getCashSessions() {
  return prisma.cashSession.findMany({
    orderBy: { openedAt: "desc" },
    include: {
      movements: true,
      _count: { select: { sales: true } },
    },
  });
}

export async function openCashSession(openingAmount: number) {
  const existing = await prisma.cashSession.findFirst({
    where: { status: "open" },
  });
  if (existing) {
    return { error: "Ya hay una caja abierta" };
  }
  const branch = await prisma.branch.findFirst();
  if (!branch) return { error: "No hay sucursal configurada" };

  const session = await prisma.cashSession.create({
    data: {
      branchId: branch.id,
      openingAmount,
      status: "open",
    },
  });
  revalidatePath("/cash");
  revalidatePath("/dashboard");
  revalidatePath("/pos");
  return { data: session };
}

export async function closeCashSession(sessionId: string, closingAmount: number) {
  const session = await prisma.cashSession.findUnique({
    where: { id: sessionId },
    include: { movements: true },
  });
  if (!session) return { error: "Sesion no encontrada" };
  if (session.status !== "open") return { error: "La caja no esta abierta" };

  const totalMovements = session.movements.reduce((sum, m) => sum + m.amount, 0);
  const expectedAmount = session.openingAmount + totalMovements;
  const difference = closingAmount - expectedAmount;

  const updated = await prisma.cashSession.update({
    where: { id: sessionId },
    data: {
      status: "closed",
      closedAt: new Date(),
      closingAmount,
      expectedAmount,
      difference,
    },
  });
  revalidatePath("/cash");
  revalidatePath("/dashboard");
  revalidatePath("/pos");
  return { data: updated };
}

export async function addCashMovement(
  sessionId: string,
  type: string,
  amount: number,
  description: string
) {
  const session = await prisma.cashSession.findUnique({
    where: { id: sessionId },
  });
  if (!session) return { error: "Sesion no encontrada" };
  if (session.status !== "open") return { error: "La caja no esta abierta" };

  const movement = await prisma.cashMovement.create({
    data: {
      cashSessionId: sessionId,
      type,
      amount: type === "withdrawal" ? -Math.abs(amount) : Math.abs(amount),
      description,
    },
  });
  revalidatePath("/cash");
  revalidatePath("/dashboard");
  return { data: movement };
}
