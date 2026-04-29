import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getFeaturedProducts } from "@/lib/api/products";
import { getActivePromotion } from "@/lib/api/promotions";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Premium swag for developers who build with Vercel. Browse hoodies, tees, and tech accessories.",
  openGraph: {
    title: "Home | Vercel Swag Store",
    description:
      "Premium swag for developers who build with Vercel. Browse hoodies, tees, and tech accessories.",
  },
};

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// Inline async server component that fetches the (uncached) promo. Wrapped in
// <Suspense> below so the cached hero + featured grid can paint immediately
// while the promo streams in. Required by cacheComponents: true — uncached
// data MUST live inside a Suspense boundary. Phase 4 will replace the inline
// component with a dedicated PromoBanner + skeleton fallback.
async function PromoBanner() {
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

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <section>
        <h1>Wear the framework you ship with.</h1>
        <p>
          Premium swag for developers who build on Vercel. Hoodies, tees, mugs,
          and more — made for people who ship.
        </p>
        <Link href="/search" role="button">
          Browse all products
        </Link>
      </section>

      <Suspense fallback={<p>Loading promotion...</p>}>
        <PromoBanner />
      </Suspense>

      <section>
        <h2>Featured products</h2>
        <ul>
          {featured.map((p) => (
            <li key={p.id}>
              <Link href={`/products/${p.slug}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.images[0]} alt={p.name} />
                <p>{p.name}</p>
                <p>{usd.format(p.price / 100)}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
