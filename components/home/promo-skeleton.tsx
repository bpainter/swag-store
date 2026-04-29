// Suspense fallback for <PromoBanner />. Reserves vertical space at roughly
// the banner's resting height so the cached hero + featured grid don't shift
// when the promo streams in.
export function PromoSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="h-12 w-full bg-neutral-100 dark:bg-neutral-900"
    />
  );
}
