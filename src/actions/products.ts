"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createProduct(data: {
  name: string;
  category: string;
  price: number;
  cost: number;
  type: string;
  stock: number;
  minStock: number;
  unit: string;
}) {
  const product = await prisma.product.create({ data });
  revalidatePath("/products");
  return { data: product };
}

export async function updateProduct(id: string, data: {
  name?: string;
  category?: string;
  price?: number;
  cost?: number;
  type?: string;
  stock?: number;
  minStock?: number;
  unit?: string;
  active?: boolean;
}) {
  const product = await prisma.product.update({ where: { id }, data });
  revalidatePath("/products");
  revalidatePath("/pos");
  return { data: product };
}

export async function deleteProduct(id: string) {
  await prisma.product.update({ where: { id }, data: { active: false } });
  revalidatePath("/products");
  revalidatePath("/pos");
  return { success: true };
}
