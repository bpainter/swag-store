import { ProductCardSkeleton } from "@/components/product/product-card-skeleton";

// Suspense fallback for <SearchResults />. Renders five placeholder cards in
// a 5-col grid (matching the design's loading state). The 2/3-col steps for
// narrower viewports keep the cards readable on tablet and mobile.
export function ResultsSkeleton() {
  return (
    <ul
      aria-hidden="true"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 list-none p-0 m-0"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </ul>
  );
}
