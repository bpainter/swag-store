import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getActivePromotion } from "@/lib/api/promotions";

// Server component, NOT cached — promo rotates per request (per the API spec).
// Rendered inside <Suspense> on the homepage so the cached hero + featured
// grid can paint without waiting on this network round-trip.
//
// Wrapped in its own <section> so the page composes vertically: hero block →
// promo strip → featured grid → brand strip. The bg-bg-200 strip + a hairline
// border below visually separates it from the hero.
export async function PromoBanner() {
  const promo = await getActivePromotion();
  if (!promo) return null;

  return (
    <section className="border-b border-border-100 bg-bg-200 py-5">
      <div className="container">
        <a
          href="#"
          role="region"
          aria-label="Active promotion"
          className="flex items-center gap-4 rounded-lg border border-border-200 px-5 py-4 text-fg-100 no-underline hover:border-border-300 transition-colors"
          style={{
            background:
              "linear-gradient(90deg, rgba(0,112,243,0.08), rgba(0,112,243,0) 60%)",
          }}
        >
          {/* Left: blue square with Zap icon */}
          <span
            aria-hidden="true"
            className="inline-flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg bg-blue-700 text-white"
          >
            <Zap size={18} />
          </span>

          {/* Middle: eyebrow row + title + description */}
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2.5">
              <span className="eyebrow text-blue-500">{promo.code}</span>
              <span
                aria-hidden="true"
                className="inline-block h-[3px] w-[3px] rounded-full bg-fg-300"
              />
              <span className="font-mono text-[12px] text-fg-300">
                code · {promo.code}
              </span>
            </div>
            <div className="text-[15px] font-medium">{promo.title}</div>
            <div className="mt-0.5 text-[13px] text-fg-200">
              {promo.description}
            </div>
          </div>

          {/* Right: % off CTA. Visual only — the wrapping <a> is the click
              target (this is a server component; tagging another anchor here
              would nest invalidly). */}
          <Button
            variant="outline"
            size="sm"
            type="button"
            tabIndex={-1}
            className="shrink-0 pointer-events-none"
          >
            {promo.discountPercent}% OFF
            <ArrowRight size={12} />
          </Button>
        </a>
      </div>
    </section>
  );
}
