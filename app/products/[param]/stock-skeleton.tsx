import { PillBadge } from "./stock-badge";

export function StockSkeleton() {
  return (
    <PillBadge tone="neutral">
      <span className="spinner" aria-hidden="true" />
      Checking stock
    </PillBadge>
  );
}
