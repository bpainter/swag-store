---
name: data-fetching-and-caching
description: Use this skill any time you're fetching data in a Next.js 16 app, deciding what to cache, designing Suspense boundaries, or troubleshooting why a page is slow or shows stale data. Triggers include any work with the "use cache" directive, Cache Components, cacheLife, cacheTag, the cacheComponents config flag, fetch() inside server components, parallel data fetching, request waterfalls, <Suspense> boundaries, loading.tsx, streaming, or revalidatePath/revalidateTag. Also use when designing the per-endpoint caching strategy for a new feature, when an endpoint that should be dynamic is returning stale data (or vice versa), or when verifying that "Cache Components are enabled" in the project config. Bundles Vercel Academy topics cache-components, data-fetching-without-waterfalls, query-performance-patterns, and suspense-and-streaming.
---

# Next.js 16 — Data Fetching and Caching

Caching changed dramatically in Next.js 16. The defaults flipped: with **Cache Components** enabled, everything is dynamic until you opt in. This skill covers the new mental model end-to-end.

## The big change

In Next.js 14/15, `fetch()` was cached by default. In Next.js 16 with `cacheComponents: true`, **nothing is cached by default** — you opt in explicitly with the `"use cache"` directive.

```ts
// next.config.ts
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  cacheComponents: true,
};
export default nextConfig;
```

This is the configuration the Swag Store assignment requires.

## The `"use cache"` directive

Marks a function (or every export in a file) as **cacheable**. Next.js builds a cache key from the function's arguments and its closure, so the result is memoized across requests.

### File-level

```ts
// lib/api/products.ts
"use cache";

export async function getFeaturedProducts() {
  const res = await fetch(`${API}/products?featured=true`, {
    headers: { "x-vercel-protection-bypass": process.env.SWAG_BYPASS_TOKEN! },
  });
  return res.json();
}
```

### Function-level

```ts
export async function getProduct(slug: string) {
  "use cache";
  const res = await fetch(`${API}/products/${slug}`, { headers: AUTH });
  return res.json();
}
```

### What you cannot do inside `"use cache"`

- `cookies()`
- `headers()`
- `await params` (passing the resolved string in is fine — it becomes part of the cache key)
- Anything that reads request-scoped state

If you need any of those, the function can't be cached. Don't try to work around it.

## Tuning cache lifetime

Use `cacheLife()` from `next/cache` inside a `"use cache"` function:

```ts
import { cacheLife } from "next/cache";

export async function getCategories() {
  "use cache";
  cacheLife("days");  // "seconds" | "minutes" | "hours" | "days" | "weeks" | "max"
  return swagFetch("/categories");
}
```

For finer control:

```ts
cacheLife({ stale: 300, revalidate: 600, expire: 3600 });
```

- `stale`: how long the client may use a stale value
- `revalidate`: how often the server re-fetches in the background
- `expire`: hard expiry

## Tagging and on-demand invalidation

```ts
import { cacheTag, revalidateTag } from "next/cache";

export async function getCart(token: string) {
  "use cache";
  cacheTag(`cart:${token}`);
  return swagFetch(`/cart`, { headers: { "x-cart-token": token } });
}

// somewhere else (e.g. server action)
revalidateTag(`cart:${token}`);
```

`revalidatePath("/cart")` invalidates by URL instead of tag — useful when you don't have a clean tag.

## Suspense and streaming

The companion to Cache Components. **Wrap any non-cached, slow-to-resolve work in `<Suspense>`** so it doesn't block the rest of the page.

```tsx
import { Suspense } from "react";

export default function Home() {
  return (
    <main>
      <Hero />                              {/* static, instant */}
      <Suspense fallback={<PromoSkeleton />}>
        <PromoBanner />                     {/* dynamic per request */}
      </Suspense>
      <FeaturedProducts />                  {/* cached, near-instant */}
    </main>
  );
}
```

The server streams the cached/static parts immediately, then streams the dynamic part as it resolves. The user sees content faster, and the slow thing doesn't gate the page.

### `loading.tsx`

A `loading.tsx` file at any segment level is **automatically** wrapped in a Suspense boundary by Next.js. It shows during navigation while the segment's data resolves.

```tsx
// app/search/loading.tsx
export default function Loading() {
  return <ResultsSkeleton />;
}
```

### The `key` prop on `<Suspense>`

Critical and easy to miss. When the same Suspense boundary persists across navigations (e.g., navigating from `/search?q=mug` to `/search?q=hat`), React **reuses the existing instance** and won't show the fallback again. To force a re-suspense, give it a key that changes:

```tsx
<Suspense key={`${q}-${category}`} fallback={<ResultsSkeleton />}>
  <SearchResults q={q} category={category} />
</Suspense>
```

## Avoiding request waterfalls

A waterfall is when fetch B waits for fetch A even though it doesn't need to. Symptom: long TTFB even with caching.

### Bad (sequential)

```ts
const product = await getProduct(slug);   // 100ms
const reviews = await getReviews(slug);   // 80ms
// total: 180ms
```

### Good (parallel)

```ts
const [product, reviews] = await Promise.all([
  getProduct(slug),
  getReviews(slug),
]);
// total: 100ms
```

### Even better (independently streamed)

When the two pieces of data are rendered in different sections of the page and one is slower than the other, don't `Promise.all` them — render them in **separate Suspense boundaries** so each one streams as soon as it's ready.

```tsx
<Suspense fallback={<ProductSkeleton />}><Product slug={slug} /></Suspense>
<Suspense fallback={<ReviewsSkeleton />}><Reviews slug={slug} /></Suspense>
```

## React `cache` for request-scoped memoization

When two server components in the same request both need the same data, `React.cache` deduplicates without requiring `"use cache"` (which is multi-request).

```ts
import { cache } from "react";

export const getProductOnce = cache(async (slug: string) => {
  return swagFetch(`/products/${slug}`);
});
```

Useful when, e.g., the page and `generateMetadata` both call `getProduct(slug)` — you don't want two HTTP round-trips.

## Query performance patterns

1. **Fetch in the component that needs it**, not in the page above. Pair with Suspense and you get co-located, parallel-resolving data.
2. **Cache aggressively at the boundary, not at the call site.** Wrap your API client functions in `"use cache"`, not your component code.
3. **Don't cache user-specific data.** Cart, "my orders", anything keyed on a session token — leave dynamic.
4. **Cache the static, stream the dynamic.** This is the Cache Components mantra and the core thing the cert grader is checking.

## Picking caching for the Swag Store

(Mirrors `BUILD_PLAN.md` section 1.2 — keep the two consistent.)

| Endpoint | `"use cache"`? | `cacheLife` | Suspense? |
|---|---|---|---|
| `/products?featured=true` | Yes | `hours` | No (it's fast) |
| `/products?search=&category=` | Yes (key includes params) | `minutes` | Yes (`<Suspense>` on `<SearchResults>`) |
| `/products/{id}` | Yes | `hours` | No |
| `/products/{id}/stock` | **No** | n/a | Yes (`<Suspense>` on `<StockBadge>`) |
| `/categories` | Yes | `days` | No |
| `/promotions` | **No** | n/a | Yes (`<Suspense>` on `<PromoBanner>`) |
| `/store/config` | Yes | `days` | No |
| `/cart` | **No** | n/a | Optional |

## Common mistakes

- Calling `cookies()` or `await params` inside `"use cache"` — it errors at build time, but easy to miss in review.
- Forgetting `key` on Suspense boundaries that depend on URL state.
- Using `"use cache"` on cart/auth code — the wrong call here could leak one user's cart to everyone.
- `Promise.all`-ing two fetches when they should be in separate Suspense boundaries (one fast, one slow → fast one stalls).

Sources:
- [Directives: use cache](https://nextjs.org/docs/app/api-reference/directives/use-cache)
- [next.config.js: cacheComponents](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents)
- [Getting Started: Caching](https://nextjs.org/docs/app/getting-started/caching)
- [Streaming guide](https://nextjs.org/docs/app/guides/streaming)
- [revalidatePath](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)
