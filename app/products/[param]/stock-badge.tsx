import { getStockOnce } from "@/lib/api/stock";

// Stock is uncached per the API spec. The "Checking stock" loading variant
// lives in <StockSkeleton /> as the Suspense fallback.
export async function StockBadge({ param }: { param: string }) {
  const stock = await getStockOnce(param);

  if (stock.stock === 0) {
    return (
      <PillBadge tone="error">
        <Dot tone="error" />
        Sold out — restocking
      </PillBadge>
    );
  }
  if (stock.lowStock) {
    return (
      <PillBadge tone="warning">
        <Dot tone="warning" />
        Only {stock.stock} left
      </PillBadge>
    );
  }
  return (
    <PillBadge tone="success">
      <Dot tone="success" />
      In stock — {stock.stock} available
    </PillBadge>
  );
}

type Tone = "success" | "warning" | "error" | "neutral";

const TONE_CLASSES: Record<Tone, string> = {
  success:
    "border-green-500/25 bg-green-500/[0.08] text-green-500",
  warning:
    "border-amber-500/25 bg-amber-500/[0.08] text-amber-500",
  error:
    "border-red-500/25 bg-red-500/[0.08] text-red-500",
  neutral: "border-border-200 bg-bg-100 text-fg-200",
};

const DOT_CLASSES: Record<Tone, string> = {
  success: "bg-green-500",
  warning: "bg-amber-500",
  error: "bg-red-500",
  neutral: "bg-fg-300",
};

export function PillBadge({
  tone,
  children,
}: {
  tone: Tone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={
        "inline-flex h-[22px] items-center gap-1.5 rounded-full border px-2 font-mono text-[11px] font-medium uppercase tracking-[0.04em] " +
        TONE_CLASSES[tone]
      }
    >
      {children}
    </span>
  );
}

function Dot({ tone }: { tone: Tone }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-1.5 w-1.5 rounded-full ${DOT_CLASSES[tone]}`}
    />
  );
}
