import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/api/products";
import { getStock } from "@/lib/api/stock";
import { isApi404 } from "@/lib/api/client";
import { AddToCartForm } from "./add-to-cart-form";
import { StockBadge } from "./stock-badge";
import { StockSkeleton } from "./stock-skeleton";

type Props = {
  params: Promise<{ param: string }>;
};

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Same await-params pattern: generateMetadata gets a Promise too.
  const { param } = await params;
  try {
    const product = await getProduct(param);
    return {
      title: product.name,
      description: product.description,
      openGraph: { images: [product.images[0]] },
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductPage({ params }: Props) {
  // Async params: in Next.js 16 `params` is a Promise, not a sync object.
  // Awaiting it is the only correct way to read the segment value.
  const { param } = await params;

  // Resolve the cached product BEFORE we begin streaming so notFound() can
  // still set HTTP 404. Once the response starts streaming, status is locked.
  let product;
  try {
    product = await getProduct(param);
  } catch (err) {
    if (isApi404(err)) notFound();
    throw err;
  }

  // Option A from the Phase 5b plan: also resolve stock at the page level so
  // the client form has an accurate `max` for its quantity input from first
  // paint. The visible stock indicator still streams via <StockBadge> inside
  // <Suspense>, which keeps the Phase 4 streaming demo intact. Cost: one
  // extra uncached round-trip per request (stock is per-spec dynamic and not
  // cacheable). Worth it to avoid a separate "loading max" client state.
  const initialStock = await getStock(param);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={product.images[0]}
        alt={product.name}
        width={600}
        height={600}
      />

      <h1>{product.name}</h1>
      <p>{usd.format(product.price / 100)}</p>
      <p>{product.description}</p>

      <Suspense fallback={<StockSkeleton />}>
        <StockBadge param={param} />
      </Suspense>

      <AddToCartForm productId={product.id} stock={initialStock.stock} />
    </div>
  );
}
