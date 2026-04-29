import "server-only";
import { cacheLife } from "next/cache";
import { swagFetch } from "@/lib/api/client";
import type { Product, PaginationMeta } from "@/lib/api/types";

/**
 * Returns all featured products.
 * Cached for hours — featured items are curated editorially and change rarely.
 */
export async function getFeaturedProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  const { data } = await swagFetch<Product[]>("/products?featured=true");
  return data;
}

/**
 * Returns a single product by its ID or slug.
 * Cached for hours — product details (name, price, description) change on
 * planned schedules, not continuously.
 */
export async function getProduct(idOrSlug: string): Promise<Product> {
  "use cache";
  cacheLife("hours");
  const { data } = await swagFetch<Product>(`/products/${idOrSlug}`);
  return data;
}

export interface SearchProductsParams {
  q?: string;
  category?: string;
  limit?: number;
  page?: number;
}

/**
 * Searches/filters the product catalog.
 * Cached for minutes — catalog membership drifts slowly, but each distinct
 * param combination produces its own cache entry, making it safe to cache
 * short-term to absorb repeated identical queries.
 */
export async function searchProducts(
  params: SearchProductsParams = {},
): Promise<{ products: Product[]; pagination: PaginationMeta }> {
  "use cache";
  cacheLife("minutes");

  const qs = new URLSearchParams();
  if (params.q) qs.set("search", params.q);
  if (params.category) qs.set("category", params.category);
  if (params.limit != null) qs.set("limit", String(params.limit));
  if (params.page != null) qs.set("page", String(params.page));

  const queryString = qs.toString();
  const url = queryString ? `/products?${queryString}` : "/products";

  const { data, meta } = await swagFetch<Product[]>(url);

  return {
    products: data,
    pagination: meta?.pagination ?? {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      total: data.length,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };
}
