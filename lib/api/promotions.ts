import "server-only";
import { swagFetch } from "@/lib/api/client";
import type { Promotion } from "@/lib/api/types";

/**
 * Returns the currently active promotion banner.
 * NOT cached — the spec states the API may return a different promotion on
 * each request (random selection); caching would defeat the purpose.
 */
export async function getActivePromotion(): Promise<Promotion> {
  const { data } = await swagFetch<Promotion>("/promotions");
  return data;
}
