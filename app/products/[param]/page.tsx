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
import { getProductOnce, listAllProducts } from "@/lib/api/products";
import { categoryLabel, formatCents } from "@/lib/format";
import { AddToCartSection } from "./add-to-cart-section";
import { AddToCartSkeleton } from "./add-to-cart-skeleton";
import { StockBadge } from "./stock-badge";
import { StockSkeleton } from "./stock-skeleton";

type Props = {
  params: Promise<{ param: string }>;
};

// Prerender every known PDP at build time. Unknown slugs fall through to the
// runtime route, where getProduct returns null and notFound() returns 404.
export async function generateStaticParams() {
  const products = await listAllProducts();
  return products.map((p) => ({ param: p.slug }));
}

// 155 is the practical OG description ceiling on X/Facebook.
function truncate(text: string, max = 155): string {
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  const cut = slice.lastIndexOf(" ");
  return (cut > 0 ? slice.slice(0, cut) : slice).trimEnd() + "…";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { param } = await params;
  const product = await getProductOnce(param);
  if (!product) return { title: "Product not found" };

  const description = truncate(product.description);
  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
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
}

// The API doesn't surface variants — the swatches are decorative.
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
  const { param } = await params;

  // notFound() must fire synchronously here, before any streamed dynamic
  // call commits the response status. getProduct returns null on NOT_FOUND
  // (rather than throwing) so the call is plain control flow.
  const product = await getProductOnce(param);
  if (!product) notFound();

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
          {/* The API only ships one image per product; the trailing three
              thumbs are intentionally dim placeholders. */}
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

        <div>
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

          {/* Badge streams; "Ships in 48h" stays outside the boundary. */}
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

          <Suspense fallback={<AddToCartSkeleton />}>
            <AddToCartSection product={product} />
          </Suspense>

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
