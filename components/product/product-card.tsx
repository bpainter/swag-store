import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/api/types";
import { formatCents } from "@/lib/format";

// Stock prop is OPTIONAL. Search results don't pass it (we won't issue
// per-product /stock fetches inside the grid; that's a per-request endpoint
// and would multiply the network cost by N). Homepage may pass it later if
// we want low-stock badges; for now it's omitted there too.
export type ProductCardProps = {
  product: Product;
  stock?: { stock: number; lowStock: boolean };
};

export function ProductCard({ product, stock }: ProductCardProps) {
  const soldOut = stock?.stock === 0;
  const lowStock = !!stock && stock.stock > 0 && stock.lowStock;

  return (
    <li className="list-none">
      <Link
        href={`/products/${product.slug}`}
        className="product-card group block text-fg-100 no-underline"
      >
        {/* Image — fills a 1:1 frame; scales subtly on group-hover. */}
        <div className="product-img-wrap">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        </div>

        {/* Body */}
        <div className="flex flex-col gap-1.5 p-4 pt-3 pb-[18px]">
          {/* Top row: category eyebrow + optional stock badge. */}
          <div className="flex items-center justify-between gap-2">
            <span className="eyebrow">{product.category}</span>
            {soldOut && <SoldOutBadge />}
            {lowStock && <LowStockBadge />}
          </div>

          {/* Name */}
          <div className="text-[15px] font-medium leading-tight tracking-tight">
            {product.name}
          </div>

          {/* Description — clamped to 2 lines; min-h reserves space so cards
              with shorter copy don't shrink below the typical card height. */}
          <p className="m-0 line-clamp-2 min-h-9 text-[12px] leading-relaxed text-fg-200">
            {product.description}
          </p>

          {/* Bottom row: price + "View" affordance. */}
          <div className="mt-1 flex items-center justify-between">
            <span className="tabular text-[14px] font-medium">
              {formatCents(product.price, product.currency)}
            </span>
            <span className="inline-flex items-center gap-1 text-[12px] text-blue-500">
              View
              <ArrowRight size={12} aria-hidden="true" />
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}

// Inline status pills — kept here (not the shadcn Badge primitive) because
// the design's "dotted pill" pattern needs a tinted bg + colored dot prefix
// that doesn't map cleanly onto Badge's variants. Cheap to inline, both
// shapes are nearly identical.
function SoldOutBadge() {
  return (
    <span className="inline-flex h-[22px] items-center gap-1.5 rounded-full border border-red-500/25 bg-red-500/[0.08] px-2 font-mono text-[11px] font-medium uppercase tracking-[0.04em] text-red-500">
      <span
        aria-hidden="true"
        className="inline-block h-1.5 w-1.5 rounded-full bg-red-500"
      />
      Sold out
    </span>
  );
}

function LowStockBadge() {
  return (
    <span className="inline-flex h-[22px] items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/[0.08] px-2 font-mono text-[11px] font-medium uppercase tracking-[0.04em] text-amber-500">
      <span
        aria-hidden="true"
        className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500"
      />
      Low stock
    </span>
  );
}
