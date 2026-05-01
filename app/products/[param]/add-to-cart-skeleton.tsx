// Suspense fallback for <AddToCartSection />. Same row dimensions as the
// resolved form so the layout doesn't shift when stock arrives.
export function AddToCartSkeleton() {
  return (
    <div aria-hidden="true" className="flex items-stretch gap-2.5">
      <div className="skeleton h-11 w-32 rounded-md" />
      <div className="skeleton h-11 flex-1 rounded-md" />
      <div className="skeleton h-11 w-11 rounded-md" />
    </div>
  );
}
