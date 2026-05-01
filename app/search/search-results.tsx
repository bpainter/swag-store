import Link from "next/link";
import { SearchX } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { searchProducts } from "@/lib/api/products";

// The 5-cap is the assignment's "Search Results" rule (active text query
// only, PDF page 6). Browse mode — empty q, with or without a category —
// shows the full first page.
const SEARCH_LIMIT = 5;
const BROWSE_LIMIT = 24;

function normalizeFilters(q?: string, category?: string) {
  const cleanQ = q?.trim() || undefined;
  const cleanCategory =
    category && category.toLowerCase() !== "all" ? category : undefined;
  return { q: cleanQ, category: cleanCategory };
}

export function isSearchMode(q?: string, category?: string): boolean {
  const { q: cleanQ } = normalizeFilters(q, category);
  return !!cleanQ;
}

export function searchLimit(q?: string, category?: string): number {
  return isSearchMode(q, category) ? SEARCH_LIMIT : BROWSE_LIMIT;
}

// Stock badges are intentionally omitted; per-product /stock fetches would
// multiply network cost across the result set.
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

  // Browse-mode never shows the empty card — that would only fire on an
  // empty catalog, which is a different problem to surface differently.
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

function EmptyState({ q }: { q?: string }) {
  const SUGGESTIONS = ["hoodie", "pin", "mug", "tee"] as const;
  return (
    <div className="rounded-xl border border-dashed border-border-200 bg-bg-200 px-6 py-20 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-color-100">
        <SearchX size={22} aria-hidden="true" className="text-fg-300" />
      </div>
      <h3 className="m-0 mb-2 text-xl font-semibold">No matches</h3>
      <p className="mx-auto mb-5 max-w-[360px] text-sm text-fg-200">
        Nothing matched{" "}
        {q ? <strong className="text-fg-100">&ldquo;{q}&rdquo;</strong> : <>that filter</>}.
        Try a different keyword or category.
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
