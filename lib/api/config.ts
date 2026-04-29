import "server-only";
import { cacheLife } from "next/cache";
import { swagFetch } from "@/lib/api/client";
import type { StoreConfig } from "@/lib/api/types";

/**
 * Returns store configuration (name, currency, feature flags, social links, SEO defaults).
 * Cached for days — store config is essentially static between deployments.
 */
export async function getStoreConfig(): Promise<StoreConfig> {
  "use cache";
  cacheLife("days");
  const { data } = await swagFetch<StoreConfig>("/store/config");
  return data;
}
