import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getFeaturedProducts } from "@/lib/api/products";
import { PromoBanner } from "@/components/home/promo-banner";
import { ProductCard } from "@/components/product/product-card";

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

export default async function HomePage() {
  // Featured grid is cached — await it inline so the rendered HTML on the
  // initial chunk already has the products. The promo is dynamic and lives
  // inside its own <Suspense> so it can stream without delaying first paint.
  const featured = await getFeaturedProducts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Suspense fallback={<p>&nbsp;</p>}>
        <PromoBanner />
      </Suspense>

      <section>
        <h1>Wear the framework you ship with.</h1>
        <p>
          Premium swag for developers who build on Vercel. Hoodies, tees, mugs,
          and more — made for people who ship.
        </p>
        <Link href="/search">Browse all products</Link>
      </section>

      <section>
        <h2>Featured products</h2>
        <ul>
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ul>
      </section>
    </div>
  );
}
