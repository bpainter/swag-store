import { getActivePromotion } from "@/lib/api/promotions";

// Server component, NOT cached — promo rotates per request (per the API spec).
// Rendered above the Header inside <Suspense> on the root layout so the rest
// of the page can paint without waiting on this network round-trip.
//
// The marquee animation is pure CSS (.marquee-track + @keyframes marquee from
// globals.css) — no JS, no client island. We render the promo content four
// times so the loop appears seamless: with `to: translateX(-50%)` each loop
// resets exactly one full set of repetitions to the left, and the user sees
// continuous left-scrolling text as long as N copies > the viewport width.
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

// Tiny inline SVG copied from .design/project/src/shell.jsx (Triangle).
// Width = 11px, height auto-derived from the design's 76:65 ratio so the
// triangle stays geometrically correct. Fill is var(--bg-100) so the shape
// reads as black on the white .ribbon background under our forced dark theme.
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
