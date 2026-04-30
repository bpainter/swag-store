import { PillBadge } from "./stock-badge";

// Suspense fallback for <StockBadge />. Renders the "Checking stock"
// loading-state pill with a small CSS spinner. PillBadge is exported from
// stock-badge.tsx so the loading and resolved states share the exact same
// chrome — only the inner content differs.
export function StockSkeleton() {
  return (
    <PillBadge tone="neutral">
      <span className="spinner" aria-hidden="true" />
      Checking stock
    </PillBadge>
  );
}
