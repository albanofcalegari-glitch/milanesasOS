"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { paymentMethodLabel, formatCurrency } from "@/lib/format";

const COLORS = ["#7c5cfc", "#c084fc", "#a870fc", "#4c1d95", "#ede9fe"];

export function DashboardChart({ salesByMethod }: { salesByMethod: Record<string, number> }) {
  const data = Object.entries(salesByMethod).map(([method, total]) => ({
    name: paymentMethodLabel(method),
    total,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
        <Bar dataKey="total" radius={[4, 4, 0, 0]}>
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
