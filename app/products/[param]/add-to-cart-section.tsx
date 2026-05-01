import { getStockOnce } from "@/lib/api/stock";
import type { Product } from "@/lib/api/types";
import { AddToCartForm } from "./add-to-cart-form";

// Server wrapper that owns the dynamic stock fetch on behalf of <AddToCartForm />.
// Wrapping here (rather than awaiting at the page level) keeps the rest of the
// PDP shell — image, name, price, description, colorway, detail rows —
// free to stream as soon as the cached product resolves; the form streams in
// behind its own Suspense boundary as the stock arrives.
//
// getStockOnce is React.cache-wrapped, so this call dedupes with <StockBadge />
// — both subtrees see the same fetch within a request.
export async function AddToCartSection({ product }: { product: Product }) {
  const stock = await getStockOnce(product.slug);
  return <AddToCartForm product={product} stock={stock.stock} />;
}
