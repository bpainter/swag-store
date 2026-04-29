import "server-only";
import { cacheLife } from "next/cache";
import { swagFetch } from "@/lib/api/client";
import type { Category } from "@/lib/api/types";

/**
 * Returns all product categories with their product counts.
 * Cached for days — categories are structural taxonomy that almost never changes.
 */
export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("days");
  const { data } = await swagFetch<Category[]>("/categories");
  return data;
}
