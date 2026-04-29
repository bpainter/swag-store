import { getActivePromotion } from "@/lib/api/promotions";

// Server component, NOT cached — promo rotates per request (per the API spec).
// Rendered inside <Suspense> on the homepage so the cached hero + featured
// grid can paint without waiting on this network round-trip.
export async function PromoBanner() {
  const promo = await getActivePromotion();
  if (!promo) return null;
  return (
    <div role="region" aria-label="Active promotion">
      <p>{promo.title}</p>
      <p>{promo.description}</p>
      {promo.code && (
        <p>
          <strong>Code: {promo.code}</strong>
        </p>
      )}
    </div>
  );
}
