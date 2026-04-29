import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PromoBanner } from "@/components/home/promo-banner";
import { PromoSkeleton } from "@/components/home/promo-skeleton";
import { getFeaturedProducts } from "@/lib/api/products";

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

      <Suspense fallback={<PromoSkeleton />}>
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
