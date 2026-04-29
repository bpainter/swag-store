import { getStock } from "@/lib/api/stock";

// Server component, NOT cached — stock is dynamic per the API spec.
// Rendered inside <Suspense> on the PDP so the cached product image / name /
// price / description paint immediately.
export async function StockInfo({ idOrSlug }: { idOrSlug: string }) {
  const stock = await getStock(idOrSlug);

  return (
    <>
      <p>
        {stock.stock === 0
          ? "Out of stock"
          : `In stock: ${stock.stock}${stock.lowStock ? " (low stock)" : ""}`}
      </p>

      <form>
        <input
          type="number"
          name="quantity"
          min={1}
          max={stock.stock}
          defaultValue={1}
          disabled={stock.stock === 0}
        />
        <button type="submit" disabled={stock.stock === 0}>
          Add to Cart
        </button>
      </form>
    </>
  );
}
