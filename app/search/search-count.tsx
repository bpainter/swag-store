import { searchProducts } from "@/lib/api/products";
import { isSearchMode, searchLimit } from "./search-results";

// Server component for the state-row's left-side text. Calls searchProducts
// with the SAME params (and limit) <SearchResults> uses; because that fetcher
// is "use cache" and keyed on its params, both calls dedupe to a single
// round-trip per request — no new network fetch beyond what SearchResults
// already does.
//
// Three states (the "Searching…" loading state is the Suspense fallback in
// page.tsx, not this component):
//   - no q & no real category   → "Showing default selection"
//   - real category, no q       → "Browsing {category}"
//   - q is set                  → "{N} result(s) for "{q}"" (+ " in {category}")
export async function SearchCount({
  q,
  category,
}: {
  q?: string;
  category?: string;
}) {
  const cleanQ = q?.trim() || undefined;
  const cleanCategory =
    category && category.toLowerCase() !== "all" ? category : undefined;
  const isSearch = isSearchMode(q, category);

  // Browse mode, no category — pure default landing.
  if (!isSearch && !cleanCategory) {
    return <>Showing default selection</>;
  }

  // Browse mode, category-only — no need to fetch a count, the assignment
  // doesn't ask for one and the result set isn't capped.
  if (!isSearch && cleanCategory) {
    return (
      <>
        Browsing <span className="text-fg-100">{cleanCategory}</span>
      </>
    );
  }

  // Active text search — fetch with the same limit SearchResults uses so
  // both share the cache key and the count matches the rendered grid.
  const { products } = await searchProducts({
    q: cleanQ,
    category: cleanCategory,
    limit: searchLimit(q, category),
  });

  return (
    <>
      <span className="text-fg-100">{products.length}</span>{" "}
      result{products.length === 1 ? "" : "s"}
      {cleanQ && (
        <>
          {" "}for{" "}
          <span className="font-mono text-fg-100">&ldquo;{cleanQ}&rdquo;</span>
        </>
      )}
      {cleanCategory && (
        <>
          {" "}in <span className="text-fg-100">{cleanCategory}</span>
        </>
      )}
    </>
  );
}
