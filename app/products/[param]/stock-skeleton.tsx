// Suspense fallback for <StockBadge />. Reserves a single line of vertical
// space so the cached product details don't shift when stock streams in.
export function StockSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="h-5 w-32 bg-neutral-100 dark:bg-neutral-900"
    />
  );
}
