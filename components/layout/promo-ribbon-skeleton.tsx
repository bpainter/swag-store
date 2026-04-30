// Suspense fallback for <PromoRibbon />. Renders an empty 36px-tall ribbon
// so the layout below it doesn't shift when the marquee streams in. Reuses
// the .ribbon class for the white-on-black surface; no marquee inside since
// there's nothing to scroll yet.
export function PromoRibbonSkeleton() {
  return <div aria-hidden="true" className="ribbon flex h-9 items-center" />;
}
