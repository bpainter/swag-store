import { CartButton } from "@/components/cart/cart-button";
import type { CartWithProducts } from "@/lib/api/types";

// Server component — thin passthrough that forwards the server-fetched cart
// into the client <CartButton />. Keeping this layer means the Header (also
// server) stays free of client imports beyond the explicit boundary, and
// the drawer's data flow is "server fetches → server passes → client
// renders." No client-side cart fetching, no localStorage.
export function CartIcon({ cart }: { cart: CartWithProducts | null }) {
  return <CartButton cart={cart} />;
}
