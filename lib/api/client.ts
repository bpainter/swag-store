import "server-only";
import { env } from "@/lib/env";
import type { ApiSuccess, ApiError, PaginationMeta } from "@/lib/api/types";

export class SwagApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "SwagApiError";
  }
}

export function isApi404(err: unknown): err is SwagApiError {
  return err instanceof SwagApiError && err.status === 404;
}

export interface SwagFetchResult<T> {
  data: T;
  /** Pagination meta, present on list endpoints */
  meta?: { pagination?: PaginationMeta };
  headers: Headers;
}

/**
 * Core fetch wrapper for the Swag Store API.
 *
 * - Injects the bypass token on every request.
 * - Injects `x-cart-token` when `init.cartToken` is provided.
 * - Defaults `Content-Type: application/json` when a body is present.
 * - Unwraps the `{ success, data }` envelope; throws SwagApiError on failure.
 * - Returns `{ data, meta, headers }` so callers can read pagination and
 *   response headers (e.g. `x-cart-token` from POST /cart/create).
 *
 * Note: this wrapper does NOT set `cache` or `next.revalidate` options.
 * Cache behaviour is controlled entirely by the `"use cache"` directive at
 * the call-site (required by cacheComponents: true).
 */
export async function swagFetch<T>(
  path: string,
  init?: RequestInit & { cartToken?: string },
): Promise<SwagFetchResult<T>> {
  const { cartToken, headers: callerHeaders, ...fetchInit } = init ?? {};

  const requestHeaders: Record<string, string> = {
    "x-vercel-protection-bypass": env.SWAG_BYPASS_TOKEN,
    ...(cartToken ? { "x-cart-token": cartToken } : {}),
    ...(fetchInit.body != null ? { "Content-Type": "application/json" } : {}),
    ...(callerHeaders as Record<string, string> | undefined),
  };

  const res = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    ...fetchInit,
    headers: requestHeaders,
  });

  let json: ApiSuccess<T> | ApiError;
  try {
    json = (await res.json()) as ApiSuccess<T> | ApiError;
  } catch {
    throw new SwagApiError(
      "PARSE_ERROR",
      `Failed to parse JSON response from ${path}`,
      res.status,
    );
  }

  if (!json.success) {
    throw new SwagApiError(
      json.error?.code ?? "UNKNOWN",
      json.error?.message ?? res.statusText,
      res.status,
    );
  }

  return { data: json.data, meta: json.meta, headers: res.headers };
}
