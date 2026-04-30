import { searchProducts } from "@/lib/api/products";

const RESULT_LIMIT = 5;

// Server component for the state-row's left-side text. Calls searchProducts
// with the SAME params <SearchResults> uses; because that fetcher is "use
// cache" and keyed on its params, both calls dedupe to a single round-trip
// per request — no new network fetch beyond what SearchResults already does.
//
// Three states (the "Searching…" loading state is the Suspense fallback,
// not this component):
//   - no q & no category → "Showing default selection"
//   - has filter, 1 match → "1 match for "{q}" in {category}"
//   - has filter, N matches → "N matches for "{q}" in {category}"
export async function SearchCount({
  q,
  category,
}: {
  q?: string;
  category?: string;
}) {
  const hasFilter = !!q || !!category;
  if (!hasFilter) {
    return <>Showing default selection</>;
  }

  const { products } = await searchProducts({
    q: q || undefined,
    category: category || undefined,
    limit: RESULT_LIMIT,
  });

  return (
    <>
      <span className="text-fg-100">{products.length}</span>{" "}
      match{products.length === 1 ? "" : "es"}
      {q && (
        <>
          {" "}for{" "}
          <span className="font-mono text-fg-100">&ldquo;{q}&rdquo;</span>
        </>
      )}
      {category && (
        <>
          {" "}in <span className="text-fg-100">{category}</span>
        </>
      )}
    </>
  );
}
