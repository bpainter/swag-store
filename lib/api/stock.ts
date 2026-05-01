import "server-only";
import { cache } from "react";
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

/**
 * Request-scoped wrapper. Multiple consumers within the same render share
 * one fetch — useful on the PDP where both <StockBadge /> and the
 * AddToCartForm container need the same stock figure.
 */
export const getStockOnce = cache(getStock);
