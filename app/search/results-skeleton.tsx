import { ProductCardSkeleton } from "@/components/product/product-card-skeleton";

// Suspense fallback for <SearchResults />. Mirrors the resolved grid shape
// (auto-fill / minmax(220px, 1fr)) so the layout doesn't shift when results
// arrive. `count` is derived in the page from the active mode: 5 for active
// text searches (the assignment cap) and a dozen for the browse / default
// view, so the skeleton looks roughly the same density as what's coming.
export function ResultsSkeleton({ count = 12 }: { count?: number }) {
  return (
    <ul
      aria-hidden="true"
      className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3.5 list-none p-0 m-0"
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </ul>
  );
}
