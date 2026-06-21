"use server";

import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "Usuario no encontrado" };

  const cookieStore = await cookies();
  cookieStore.set("userId", user.id, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return { data: user };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("userId");
  redirect("/login");
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return null;
  return prisma.user.findUnique({
    where: { id: userId },
    include: { branch: { include: { business: true } } },
  });
}

export async function getUsers() {
  return prisma.user.findMany({
    include: { branch: true },
    orderBy: { name: "asc" },
  });
}
