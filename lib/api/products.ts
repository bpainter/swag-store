import "server-only";
import { cache } from "react";
import { cacheLife } from "next/cache";
import { SwagApiError, swagFetch } from "@/lib/api/client";
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
 * Returns a single product by its ID or slug, or null if the API responds
 * with NOT_FOUND. Returning null (rather than throwing) lets the caller
 * call notFound() synchronously and produce a real HTTP 404 — important
 * because the PDP is partial-prerendered and a thrown notFound() inside
 * a streamed dynamic call can't change the already-committed status.
 *
 * Cached for hours — product details rarely change.
 */
export async function getProduct(idOrSlug: string): Promise<Product | null> {
  "use cache";
  cacheLife("hours");
  try {
    const { data } = await swagFetch<Product>(`/products/${idOrSlug}`);
    return data;
  } catch (e) {
    if (e instanceof SwagApiError && e.code === "NOT_FOUND") {
      return null;
    }
    throw e;
  }
}

/**
 * Request-scoped wrapper around getProduct. Use this from server components,
 * generateMetadata, and opengraph-image generators that may all run for the
 * same request — React.cache memoizes the call within a single render so
 * the page, its metadata, and the OG image share one cache lookup. Doesn't
 * undermine the "use cache" cross-request layer; just dedupes within it.
 */
export const getProductOnce = cache(getProduct);

/**
 * Returns the entire catalog, paginating through /products until the API
 * reports no next page. Cached for days — the catalog is structural and
 * mainly used by generateStaticParams at build time.
 */
export async function listAllProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("days");

  const PAGE_SIZE = 100;
  const all: Product[] = [];
  let page = 1;

  while (true) {
    const qs = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
    });
    const { data, meta } = await swagFetch<Product[]>(`/products?${qs}`);
    all.push(...data);
    if (!meta?.pagination?.hasNextPage) break;
    page += 1;
  }

  return all;
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
