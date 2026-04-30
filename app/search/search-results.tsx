import Link from "next/link";
import { SearchX } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { searchProducts } from "@/lib/api/products";

const RESULT_LIMIT = 5;

// Server component, called from inside <Suspense> on /search. searchProducts
// is "use cache" keyed on its params — <SearchCount> calls it too with the
// same params, so the cache layer dedupes the two calls to one round-trip.
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
  const { products } = await searchProducts({
    q: q || undefined,
    category: category || undefined,
    limit: RESULT_LIMIT,
  });

  const hasFilter = !!q || !!category;

  if (hasFilter && products.length === 0) {
    return <EmptyState q={q} />;
  }

  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3.5 list-none p-0 m-0">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </ul>
  );
}

// Empty-state card — only renders when the user has applied a filter and
// got nothing back. When there's no filter we always have the default
// selection to show, so this never appears.
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
