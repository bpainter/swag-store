import Image from "next/image";
import { getFeaturedProducts } from "@/lib/api/products";
import { categoryLabel, formatCents } from "@/lib/format";

export async function HeroVisual() {
  const products = await getFeaturedProducts();
  const primary = products[0];
  const secondary = products[1] ?? products[0];
  if (!primary) return null;

  return (
    <div className="relative ml-auto hidden lg:block w-full max-w-[540px] aspect-square justify-self-end">
      {/* This is the page LCP — priority on the next/image below. */}
      <div className="absolute inset-0 overflow-hidden rounded-xl border border-border-200 bg-bg-200">
        <Image
          src={primary.images[0]}
          alt={primary.name}
          fill
          sizes="(max-width: 1024px) 100vw, 540px"
          priority
          className="object-cover"
        />
      </div>

      <div
        className="absolute left-[18px] top-[18px] rounded-lg border border-border-200 px-3 py-2 font-mono text-[11px] text-fg-200"
        style={{
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          letterSpacing: "0.05em",
        }}
      >
        {primary.slug.toUpperCase()} · {categoryLabel(primary.category).toUpperCase()}
      </div>

      <div
        className="absolute right-[18px] bottom-[18px] flex flex-col gap-1 rounded-lg border border-border-200 px-3.5 py-2.5"
        style={{
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <span className="eyebrow text-[10px]">{primary.name}</span>
        <span className="tabular text-base font-medium text-fg-100">
          {formatCents(primary.price, primary.currency)}
        </span>
      </div>

      {secondary && (
        <div
          className="absolute -left-9 bottom-16 h-[140px] w-[140px] overflow-hidden rounded-lg border border-border-200 shadow-lg"
          style={{ transform: "rotate(-6deg)" }}
        >
          <Image
            src={secondary.images[0]}
            alt={secondary.name}
            fill
            sizes="140px"
            className="object-cover"
          />
        </div>
      )}
    </div>
  );
}
