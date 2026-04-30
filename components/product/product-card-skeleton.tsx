// Skeleton sibling of <ProductCard /> — same outer shape (rounded surface
// with overflow hidden), then a 1:1 image placeholder, then four stacked
// shimmer bars at the same vertical rhythm as the resolved card.
//
// Mirrors the resolved card's chrome so swapping in real products doesn't
// shift the layout. Used by ResultsSkeleton on /search and could be reused
// by other product grids that need a streaming fallback.
export function ProductCardSkeleton() {
  return (
    <li className="list-none overflow-hidden rounded-lg border border-border-100 bg-bg-100">
      <div
        className="skeleton aspect-square"
        // Override the .skeleton border-radius so the image block stays
        // flush with the card's outer rounded corners.
        style={{ borderRadius: 0 }}
        aria-hidden="true"
      />
      <div className="flex flex-col gap-2.5 p-[18px]">
        <div className="skeleton h-3 w-20" aria-hidden="true" />
        <div className="skeleton h-4 w-[70%]" aria-hidden="true" />
        <div className="skeleton h-3 w-full" aria-hidden="true" />
        <div className="skeleton mt-1 h-3.5 w-14" aria-hidden="true" />
      </div>
    </li>
  );
}
