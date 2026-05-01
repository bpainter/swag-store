import { CartHydrate } from "@/components/cart/cart-provider";
import { getCart } from "@/lib/api/cart";

// Async server component that fetches the cart server-side and pipes it into
// the client <CartProvider /> via <CartHydrate />. Must be wrapped in
// <Suspense> at the layout level — getCart() touches cookies(), which makes
// this dynamic. Putting the fetch inside its own Suspense boundary preserves
// PPR for everything else in the layout (the static shell still prerenders;
// only this small leaf is dynamic + streamed).
//
// On every layout re-render — including after a server action calls
// revalidatePath("/", "layout") — this component re-fetches and the new cart
// snapshot flows into the provider, automatically re-basing useOptimistic.
export async function CartHydrator() {
  let cart = null;
  try {
    cart = await getCart();
  } catch {
    // A missing cookie returns null cleanly. Other transient errors (network
    // blips, expired bypass token in dev) fall back to "no cart" rather than
    // taking down the whole layout via an unhandled throw.
    cart = null;
  }
  return <CartHydrate cart={cart} />;
}
