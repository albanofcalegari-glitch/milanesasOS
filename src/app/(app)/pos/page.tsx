export const dynamic = "force-dynamic";

import { getProducts, getCustomers } from "@/actions/sales";
import { getOpenCashSession } from "@/actions/cash";
import { POSClient } from "./pos-client";

export default async function POSPage() {
  const [products, customers, cashSession] = await Promise.all([
    getProducts(),
    getCustomers(),
    getOpenCashSession(),
  ]);

  return (
    <POSClient
      products={products}
      customers={customers}
      cashOpen={!!cashSession}
    />
  );
}
