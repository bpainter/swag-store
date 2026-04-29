import { getActivePromotion } from "@/lib/api/promotions";

// Server component, NOT cached — promo rotates per request (per the API spec).
// Rendered inside <Suspense> on the homepage so the cached hero + featured
// grid can paint without waiting on this network round-trip.
export async function PromoBanner() {
  const promo = await getActivePromotion();
  if (!promo) return null;

  return (
    <div>
      <p>
        {promo.title} — {promo.description}
        {promo.code ? ` Use code: ${promo.code}` : ""}
      </p>
    </div>
  );
}
