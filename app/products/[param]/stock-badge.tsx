import { getStock } from "@/lib/api/stock";

// Server component, NOT cached — stock can change on every request (per spec).
// Rendered inside <Suspense> on the PDP so the cached product details paint
// without waiting on this network round-trip. Phase 5b promotes the Add to
// Cart button into a client island that reads the resolved stock as a prop.
export async function StockBadge({ param }: { param: string }) {
  const stock = await getStock(param);
  const outOfStock = stock.stock === 0;
  return (
    <p>
      {outOfStock
        ? "Out of stock"
        : stock.lowStock
          ? `Only ${stock.stock} left`
          : `In stock: ${stock.stock}`}
    </p>
  );
}
