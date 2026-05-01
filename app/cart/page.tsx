import type { Metadata } from "next";
import { CartContents } from "./cart-contents";

export const metadata: Metadata = {
  // `title` runs through the root template ("%s | Vercel Swag Store").
  title: "Cart",
  description: "Review and manage the items in your Vercel Swag Store cart.",
};

// Server component shell. The actual cart rendering is in <CartContents />
// (client) which consumes the CartProvider context — same optimistic state
// the header badge + drawer read from. Cart data flows in from the layout's
// <CartHydrator />, not a fetch on this page, so refreshing /cart and
// opening the drawer always show identical truth.
export default function CartPage() {
  return <CartContents />;
}
