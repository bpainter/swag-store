import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  Layers,
  RefreshCcw,
  Ruler,
  Truck,
} from "lucide-react";
import { isApi404 } from "@/lib/api/client";
import { getProduct } from "@/lib/api/products";
import { getStock } from "@/lib/api/stock";
import { categoryLabel, formatCents } from "@/lib/format";
import { AddToCartForm } from "./add-to-cart-form";
import { StockBadge } from "./stock-badge";
import { StockSkeleton } from "./stock-skeleton";

type Props = {
  params: Promise<{ param: string }>;
};

// OG description max is ~155 chars; clamp the product blurb so social-card
// previews never end mid-word with an ellipsis browser-side.
function truncate(text: string, max = 155): string {
  if (text.length <= max) return text;
  // Cut at the last whitespace before the limit so we don't slice through a
  // word; fall back to a hard cut if the string has no spaces under max.
  const slice = text.slice(0, max);
  const cut = slice.lastIndexOf(" ");
  return (cut > 0 ? slice.slice(0, cut) : slice).trimEnd() + "…";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Same await-params pattern: generateMetadata gets a Promise too. The
  // getProduct() call here shares the same `"use cache"` entry as the call
  // inside ProductPage — this isn't an extra round-trip.
  const { param } = await params;
  try {
    const product = await getProduct(param);
    const description = truncate(product.description);
    return {
      title: product.name,
      description,
      openGraph: {
        title: product.name,
        description,
        // Object form gives the renderer authoritative dimensions so the
        // crawler doesn't have to fetch the image to compute aspect ratio.
        images: [
          {
            url: product.images[0],
            width: 600,
            height: 600,
            alt: product.name,
          },
        ],
      },
    };
  } catch {
    return { title: "Product not found" };
  }
}

// Hardcoded colorway swatch — the API doesn't surface variants. The first
// swatch is "selected"; the other two are decorative/disabled. Matches the
// design's pattern verbatim with a sensible monochrome default.
const COLORWAY = {
  hex: "#0A0A0A",
  swatch: "#0A0A0A",
};

const DETAIL_ROWS: ReadonlyArray<{
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
}> = [
  {
    label: "Materials",
    value: "300gsm cotton, hard-enamel hardware where applicable",
    icon: Layers,
  },
  {
    label: "Shipping",
    value: "Free over $75 · 48h handling time",
    icon: Truck,
  },
  { label: "Returns", value: "30-day, on us", icon: RefreshCcw },
  { label: "Sizing", value: "Runs true to size", icon: Ruler },
];

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

  // Page-level stock fetch (Option A from Phase 5b) gives the client form an
  // accurate `max` for its quantity input from first paint. The visible stock
  // indicator still streams via <StockBadge> inside <Suspense>, preserving
  // the Phase 4 streaming demo. One extra uncached round-trip per request;
  // stock is per-spec dynamic and not cacheable.
  const initialStock = await getStock(param);

  return (
    <div className="container pt-8 pb-16">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-2 text-[12px] text-fg-300"
      >
        <Link href="/" className="text-fg-200 hover:text-fg-100 transition-colors">
          Shop
        </Link>
        <ChevronRight size={12} aria-hidden="true" />
        <Link
          href={`/search?category=${encodeURIComponent(product.category)}`}
          className="text-fg-200 hover:text-fg-100 transition-colors"
        >
          {categoryLabel(product.category)}
        </Link>
        <ChevronRight size={12} aria-hidden="true" />
        <span className="text-fg-100">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 items-start">
        {/* ───────────── Image column (left, sticky) ───────────── */}
        <div className="flex flex-col gap-3 lg:sticky lg:top-20">
          <div className="relative aspect-square overflow-hidden rounded-xl border border-border-100 bg-bg-200">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              className="object-cover"
            />
          </div>
          {/* Thumbnail strip — first thumb is the real image (selected ring);
              the other three are decorative. The API only ships one image
              per product, so the placeholders are intentionally dimmed. */}
          <div className="grid grid-cols-4 gap-2">
            <div className="relative aspect-square overflow-hidden rounded-md border-2 border-fg-100 bg-bg-200">
              <Image
                src={product.images[0]}
                alt=""
                fill
                sizes="120px"
                className="object-cover"
              />
            </div>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                aria-hidden="true"
                className="aspect-square overflow-hidden rounded-md border border-border-100 bg-bg-200 opacity-40 cursor-not-allowed"
              />
            ))}
          </div>
        </div>

        {/* ───────────── Info column (right) ───────────── */}
        <div>
          {/* Top metadata row */}
          <div className="mb-3.5 flex items-center gap-2.5">
            <span className="eyebrow">{categoryLabel(product.category)}</span>
            <span
              aria-hidden="true"
              className="inline-block h-[3px] w-[3px] rounded-full bg-fg-300"
            />
            <span className="font-mono text-[11px] text-fg-300">
              {product.id}
            </span>
          </div>

          <h1
            className="m-0 mb-2.5 font-semibold"
            style={{
              fontSize: 40,
              lineHeight: 1.05,
              letterSpacing: "-0.035em",
            }}
          >
            {product.name}
          </h1>

          <div className="tabular mb-4 text-[28px] font-medium">
            {formatCents(product.price, product.currency)}
          </div>

          {/* Stock indicator row — the badge streams; "Ships in 48h" sits
              outside the boundary so it's always visible. */}
          <div className="mb-5 flex items-center gap-3">
            <Suspense fallback={<StockSkeleton />}>
              <StockBadge param={param} />
            </Suspense>
            <span className="font-mono text-[12px] text-fg-300">
              · Ships in 48h
            </span>
          </div>

          <p className="mb-6 max-w-[520px] text-sm leading-relaxed text-fg-200">
            {product.description}
          </p>

          {/* Colorway — decorative; the API doesn't expose variants. */}
          <div className="mb-6">
            <div className="mb-2 flex justify-between text-[12px]">
              <span className="text-fg-200">Colorway</span>
              <span className="font-mono text-fg-300">{COLORWAY.hex}</span>
            </div>
            <div className="flex gap-2">
              <div
                aria-label={`Selected colorway ${COLORWAY.hex}`}
                className="h-9 w-9 rounded-md"
                style={{
                  background: COLORWAY.swatch,
                  border: "2px solid var(--fg-100)",
                  outline: "1px solid var(--border-100)",
                  outlineOffset: 2,
                }}
              />
              <div
                aria-hidden="true"
                className="h-9 w-9 rounded-md border border-border-200 opacity-40 cursor-not-allowed"
                style={{ background: "linear-gradient(135deg,#fff,#a1a1a1)" }}
              />
              <div
                aria-hidden="true"
                className="h-9 w-9 rounded-md border border-border-200 opacity-40 cursor-not-allowed"
                style={{ background: "linear-gradient(135deg,#0070f3,#002766)" }}
              />
            </div>
          </div>

          {/* Quantity stepper + Add to Cart + Bookmark — client island.
              Receives the full product so the optimistic reducer can build a
              synthetic line item for the cart provider on submit. */}
          <AddToCartForm product={product} stock={initialStock.stock} />

          {/* Detail rows table */}
          <div className="mt-8 rounded-lg border border-border-100">
            {DETAIL_ROWS.map((row, i) => {
              const Icon = row.icon;
              return (
                <div
                  key={row.label}
                  className={
                    "grid grid-cols-[auto_110px_1fr] items-center gap-3.5 px-4 py-3.5 " +
                    (i === 0 ? "" : "border-t border-border-100")
                  }
                >
                  <Icon size={14} aria-hidden={true} />
                  <span className="font-mono text-[12px] uppercase tracking-[0.04em] text-fg-200">
                    {row.label}
                  </span>
                  <span className="text-[13px]">{row.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
