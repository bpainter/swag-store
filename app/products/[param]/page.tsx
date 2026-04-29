import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/api/products";
import { getStock } from "@/lib/api/stock";
import { isApi404 } from "@/lib/api/client";

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

// Inline async server component for the (uncached) stock fetch + the Add to
// Cart button (whose disabled state depends on stock). Lives inside <Suspense>
// below so the cached product details can stream first. Required by
// cacheComponents: true — uncached data MUST be inside a Suspense boundary.
async function StockAndAddToCart({ param }: { param: string }) {
  const stock = await getStock(param);
  const outOfStock = stock.stock === 0;
  return (
    <>
      <p>
        {outOfStock
          ? "Out of stock"
          : stock.lowStock
            ? `Only ${stock.stock} left`
            : `In stock: ${stock.stock}`}
      </p>
      <button type="button" disabled={outOfStock}>
        Add to Cart
      </button>
    </>
  );
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

      <Suspense fallback={<p>Loading stock...</p>}>
        <StockAndAddToCart param={param} />
      </Suspense>
    </div>
  );
}
