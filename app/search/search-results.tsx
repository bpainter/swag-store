import Link from "next/link";
import { SearchX } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { searchProducts } from "@/lib/api/products";

// The assignment caps "search" results (active text query) at 5. The "default
// state" — no query — is meant to be a browseable selection, so we ask the
// API for a generous page of products instead. Category-only views are
// treated as browsing too: "/search?category=mugs" should show all mugs, not
// the first 5.
const SEARCH_LIMIT = 5;
const BROWSE_LIMIT = 24;

// Normalize the URL inputs into a single shape both this component and
// SearchCount can rely on. "All" (case-insensitive) is the CategorySelect
// sentinel for "no category" — strip it so the API isn't called with
// `category=all` (which would 0-result).
function normalizeFilters(q?: string, category?: string) {
  const cleanQ = q?.trim() || undefined;
  const cleanCategory =
    category && category.toLowerCase() !== "all" ? category : undefined;
  return { q: cleanQ, category: cleanCategory };
}

// Resolve which mode this render is in. Only an active TEXT query triggers
// search-mode (the 5-cap). Category-only filtering keeps browse semantics
// per the assignment spec on PDF page 6.
export function isSearchMode(q?: string, category?: string): boolean {
  const { q: cleanQ } = normalizeFilters(q, category);
  return !!cleanQ;
}

export function searchLimit(q?: string, category?: string): number {
  return isSearchMode(q, category) ? SEARCH_LIMIT : BROWSE_LIMIT;
}

// Server component, called from inside <Suspense> on /search. searchProducts
// is "use cache" keyed on its params — <SearchCount> calls it too with the
// same normalized params, so the cache layer dedupes the two calls to one
// round-trip per request.
//
// Stock badges are intentionally omitted: per-product /stock fetches would
// multiply network cost across the result set with little UX payoff. The
// PDP shows stock for the one product the user actually clicks into.
export async function SearchResults({
  q,
  category,
}: {
  q?: string;
  category?: string;
}) {
  const filters = normalizeFilters(q, category);
  const isSearch = !!filters.q;
  const limit = isSearch ? SEARCH_LIMIT : BROWSE_LIMIT;

  const { products } = await searchProducts({ ...filters, limit });

  // Empty-state only fires for active text searches — browse-mode "no
  // results" should be near-impossible (would require an empty catalog
  // entirely), so the friendly empty card is reserved for the case the
  // user actually typed something that matched nothing.
  if (isSearch && products.length === 0) {
    return <EmptyState q={filters.q} />;
  }

  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3.5 list-none p-0 m-0">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </ul>
  );
}

// Empty-state card — only renders when the user has typed a query and got
// nothing back.
function EmptyState({ q }: { q?: string }) {
  const SUGGESTIONS = ["hoodie", "pin", "mug", "tee"] as const;
  return (
    <div className="rounded-xl border border-dashed border-border-200 bg-bg-200 px-6 py-20 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-color-100">
        <SearchX size={22} aria-hidden="true" className="text-fg-300" />
      </div>
      <h3 className="m-0 mb-2 text-xl font-semibold">No matches found</h3>
      <p className="mx-auto mb-5 max-w-[360px] text-sm text-fg-200">
        We couldn&apos;t find anything for{" "}
        {q ? <strong className="text-fg-100">&ldquo;{q}&rdquo;</strong> : <>that filter</>}.
        Try a different keyword or browse a category.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <Link
            key={suggestion}
            href={`/search?q=${encodeURIComponent(suggestion)}`}
            className="inline-flex h-7 items-center rounded-md border border-border-200 bg-transparent px-2.5 text-[12px] text-fg-100 transition-colors hover:bg-color-100"
          >
            {suggestion}
          </Link>
        ))}
      </div>
    </div>
  );
}
