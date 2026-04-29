import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/api/products";
import { isApi404 } from "@/lib/api/client";
import { formatCents } from "@/lib/format";
import { StockInfo } from "./stock-info";

type Props = {
  params: Promise<{ param: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { param } = await params;
  try {
    const product = await getProduct(param);
    return {
      title: product.name,
      description: product.description,
      openGraph: {
        images: [product.images[0]],
      },
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductPage({ params }: Props) {
  const { param } = await params;

  // Resolve the product BEFORE any streaming starts so notFound() can still
  // set HTTP 404. Once the response begins streaming, the status is locked.
  let product;
  try {
    product = await getProduct(param);
  } catch (err) {
    if (isApi404(err)) notFound();
    throw err;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Image
        src={product.images[0]}
        alt={product.name}
        width={600}
        height={600}
        priority
      />
      <h1>{product.name}</h1>
      <p>{formatCents(product.price, product.currency)}</p>
      <p>{product.description}</p>

      {/* Stock is dynamic — Suspense so cached product details paint first. */}
      <Suspense fallback={<p>Loading stock…</p>}>
        <StockInfo idOrSlug={param} />
      </Suspense>
    </div>
  );
}
