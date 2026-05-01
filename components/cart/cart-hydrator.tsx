import { CartHydrate } from "@/components/cart/cart-provider";
import { getCart } from "@/lib/api/cart";

// Must be rendered inside its own <Suspense> at the layout level — getCart()
// touches cookies(), so isolating the fetch keeps PPR alive for the rest of
// the shell.
export async function CartHydrator() {
  let cart = null;
  try {
    cart = await getCart();
  } catch {
    cart = null;
  }
  return <CartHydrate cart={cart} />;
}
