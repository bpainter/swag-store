// Suspense fallback for <PromoBanner />. The skeleton mirrors the rendered
// banner's section chrome (border-b + bg-bg-200 strip) so the layout below
// doesn't shift when the promo streams in. Inner block uses the .skeleton
// shimmer class with the same 72px height as the resolved card.
export function PromoSkeleton() {
  return (
    <section
      aria-hidden="true"
      className="border-b border-border-100 bg-bg-200 py-5"
    >
      <div className="container">
        <div className="skeleton h-[72px]" />
      </div>
    </section>
  );
}
