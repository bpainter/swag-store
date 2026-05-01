import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/api/types";
import { categoryLabel, formatCents } from "@/lib/format";

// `stock` is opt-in. The search/featured grids skip it because per-product
// /stock fetches would multiply network cost across the grid.
export type ProductCardProps = {
  product: Product;
  stock?: { stock: number; lowStock: boolean };
};

export function ProductCard({ product, stock }: ProductCardProps) {
  const soldOut = stock?.stock === 0;
  const lowStock = !!stock && stock.stock > 0 && stock.lowStock;

  return (
    // h-full + flex chain so every card in a row matches the tallest sibling.
    <li className="list-none h-full">
      <Link
        href={`/products/${product.slug}`}
        className="product-card group flex h-full flex-col text-fg-100 no-underline"
      >
        <div className="product-img-wrap">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-4 pt-3 pb-[18px]">
          <div className="flex items-center justify-between gap-2">
            <span className="eyebrow">{categoryLabel(product.category)}</span>
            {soldOut && <SoldOutBadge />}
            {lowStock && <LowStockBadge />}
          </div>

          <div className="text-[15px] font-medium leading-tight tracking-tight">
            {product.name}
          </div>

          <p className="m-0 line-clamp-2 text-[12px] leading-relaxed text-fg-200">
            {product.description}
          </p>

          <div className="mt-auto flex items-center justify-between">
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
