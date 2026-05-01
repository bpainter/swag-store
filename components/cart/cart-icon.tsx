import { CartButton } from "@/components/cart/cart-button";

// Server component — thin passthrough that mounts the client <CartButton />.
// CartButton owns the drawer's open/closed state and reads the cart from the
// CartProvider context (no prop drilling). Keeping this layer means the
// Header tree stays mostly server-rendered; only the small interactive
// island around the badge + drawer is client-side.
export function CartIcon() {
  return <CartButton />;
}
