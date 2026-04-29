import "server-only";
import { swagFetch } from "@/lib/api/client";
import type { StockInfo } from "@/lib/api/types";

/**
 * Returns real-time stock availability for a product.
 * NOT cached — stock levels change continuously and must be fresh on every request.
 */
export async function getStock(idOrSlug: string): Promise<StockInfo> {
  const { data } = await swagFetch<StockInfo>(`/products/${idOrSlug}/stock`);
  return data;
}
