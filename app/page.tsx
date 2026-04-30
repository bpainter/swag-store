import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Globe, Package, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { HeroVisual } from "@/components/home/hero-visual";
import { PromoBanner } from "@/components/home/promo-banner";
import { PromoSkeleton } from "@/components/home/promo-skeleton";
import { ProductCard } from "@/components/product/product-card";
import { getFeaturedProducts } from "@/lib/api/products";

export const metadata: Metadata = {
  // `title: "Home"` runs through the root layout's title.template
  // (`%s | Vercel Swag Store`), giving "Home | Vercel Swag Store".
  title: "Home",
  description:
    "Premium swag for developers who build with Vercel. Browse hoodies, tees, and tech accessories.",
  openGraph: {
    title: "Home | Vercel Swag Store",
    description:
      "Premium swag for developers who build with Vercel. Browse hoodies, tees, and tech accessories.",
    images: ["/opengraph-image.png"],
  },
};

export default async function HomePage() {
  // getFeaturedProducts is "use cache" + cacheLife("hours"). HeroVisual also
  // calls it; both calls share the cache entry within the request. No extra
  // round-trip — same reason getProduct/generateMetadata can both call the
  // same fetcher cheaply on the PDP.
  const featured = await getFeaturedProducts();
  const featuredGrid = featured.slice(0, 8);
  // CTA target: the second featured product (or first as fallback) — picks
  // a guaranteed-real slug rather than hardcoding one that might not exist.
  const heroCta = featured[1] ?? featured[0];
  // Brand-strip image: pick a third product for visual variety, falling back
  // to whatever's available so we never render an empty <Image>.
  const brandImage =
    featured[2]?.images[0] ??
    featured[1]?.images[0] ??
    featured[0]?.images[0];
  const brandImageAlt = featured[2]?.name ?? featured[0]?.name ?? "Swag";

  return (
    <>
      {/* ───────────── Hero ───────────── */}
      <section className="dot-grid relative overflow-hidden border-b border-border-100 pt-20 pb-24">
        <div className="container grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-14 items-center">
          <div>
            {/* "New drop" announcement chip */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-border-200 bg-black/40 pl-1.5 pr-3 py-1 text-xs">
              <Badge variant="secondary">New drop</Badge>
              <span className="text-fg-200">
                Spring/Summer 2026 just landed
              </span>
              <ArrowRight
                size={12}
                aria-hidden="true"
                className="text-fg-300"
              />
            </div>

            <h1
              className="my-6 max-w-[640px] font-semibold"
              style={{
                fontSize: "clamp(48px, 6.5vw, 84px)",
                lineHeight: 1.02,
                letterSpacing: "-0.045em",
              }}
            >
              Goods for the
              <br />
              people who ship.
            </h1>

            <p className="mb-8 max-w-[480px] text-lg leading-relaxed text-fg-200">
              Heavyweight tees, hard-enamel pins, and desk gear, designed in
              Geist and made in small batches. Wear what you ship.
            </p>

            {/* Base-UI-flavored shadcn Button doesn't accept asChild — using
                buttonVariants() to style native Links keeps a11y correct
                (one anchor, no nested button) and matches the design size. */}
            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/search"
                className={buttonVariants({ size: "lg" })}
              >
                Shop everything
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
              {heroCta && (
                <Link
                  href={`/products/${heroCta.slug}`}
                  className={buttonVariants({ variant: "outline", size: "lg" })}
                >
                  The new hoodie
                </Link>
              )}
            </div>

            {/* Trust row — three small inline icons + microcopy */}
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-2 text-[12px] text-fg-200">
              <span className="inline-flex items-center gap-2">
                <Truck size={14} aria-hidden="true" />
                Free shipping over $75
              </span>
              <span className="inline-flex items-center gap-2">
                <Package size={14} aria-hidden="true" />
                Ships in 48h
              </span>
              <span className="inline-flex items-center gap-2">
                <Globe size={14} aria-hidden="true" />
                30 countries
              </span>
            </div>
          </div>

          {/* Right: featured-product visual stack. Hidden below lg. */}
          <HeroVisual />
        </div>
      </section>

      {/* ───────────── Promo banner (Suspense, dynamic) ───────────── */}
      <Suspense fallback={<PromoSkeleton />}>
        <PromoBanner />
      </Suspense>

      {/* ───────────── Featured grid ───────────── */}
      <section className="py-20">
        <div className="container">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <div className="eyebrow mb-3">Featured</div>
              <h2
                className="m-0 font-semibold"
                style={{
                  fontSize: 40,
                  lineHeight: 1.05,
                  letterSpacing: "-0.035em",
                }}
              >
                The current rotation.
              </h2>
            </div>
            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 text-[13px] text-blue-500 hover:opacity-80 transition-opacity"
            >
              View all
              <ArrowRight size={12} aria-hidden="true" />
            </Link>
          </div>
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 list-none p-0 m-0">
            {featuredGrid.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </ul>
        </div>
      </section>

      {/* ───────────── Brand strip ───────────── */}
      <section className="pt-24 pb-8">
        <div className="container">
          <div
            className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 items-center rounded-xl border border-border-100 bg-bg-200 px-10 py-12"
            style={{
              backgroundImage:
                "radial-gradient(circle at 90% 20%, rgba(0,112,243,0.12), transparent 50%)",
            }}
          >
            <div>
              <div className="eyebrow mb-3.5">Made well, made small</div>
              <h3
                className="mb-2.5 font-semibold"
                style={{
                  fontSize: 28,
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                }}
              >
                Every piece is overengineered, on purpose.
              </h3>
              <p className="m-0 text-sm leading-relaxed text-fg-200">
                300gsm cotton. Hard enamel, not soft. Stitched edges. Pieces are
                produced in runs of 250–500 with the people we know personally.
              </p>
              <div className="mt-6 flex gap-6 font-mono text-[12px] text-fg-200">
                <div>
                  <span className="block text-[22px] font-semibold text-fg-100">
                    250
                  </span>
                  pieces / run
                </div>
                <div>
                  <span className="block text-[22px] font-semibold text-fg-100">
                    48h
                  </span>
                  avg. ship time
                </div>
                <div>
                  <span className="block text-[22px] font-semibold text-fg-100">
                    4
                  </span>
                  continents
                </div>
              </div>
            </div>
            <div className="relative aspect-[1.4/1] overflow-hidden rounded-lg border border-border-100">
              {brandImage && (
                <Image
                  src={brandImage}
                  alt={brandImageAlt}
                  fill
                  sizes="(min-width: 1024px) 480px, 100vw"
                  className="object-cover"
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
