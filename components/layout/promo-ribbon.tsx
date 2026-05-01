import { getActivePromotion } from "@/lib/api/promotions";

// Uncached + streamed via <Suspense> at the layout level. Marquee animation
// is pure CSS (.marquee-track / @keyframes marquee in globals.css). Four
// repetitions because the keyframe resets at translateX(-50%); two copies
// would leave a visible gap on wide viewports.
export async function PromoRibbon() {
  const promo = await getActivePromotion();
  if (!promo) return null;

  return (
    <div className="ribbon flex h-9 items-center" role="region" aria-label="Active promotion">
      <div className="marquee-track">
        {Array.from({ length: 4 }).map((_, i) => (
          <span key={i} className="inline-flex items-center gap-3">
            <Triangle />
            <span
              className="font-medium uppercase"
              style={{ letterSpacing: "0.06em" }}
            >
              {promo.title}
            </span>
            <span className="opacity-60">{promo.description}</span>
            <span className="opacity-40">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Triangle() {
  const size = 11;
  return (
    <svg
      width={size}
      height={(size * 65) / 76}
      viewBox="0 0 76 65"
      fill="var(--bg-100)"
      aria-hidden="true"
    >
      <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
    </svg>
  );
}
