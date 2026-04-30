import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCart } from "@/lib/api/cart";
import { removeItemAction, updateQuantityAction } from "./actions";

export const metadata: Metadata = {
  title: "Cart",
  description: "Your Vercel Swag Store shopping cart.",
};

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default async function CartPage() {
  // getCart() is dynamic by design — reads the cart_token cookie, calls the
  // API on every request. NOT cached. Returns null if no cookie or 404.
  const cart = await getCart();

  if (!cart || cart.items.length === 0) {
    return (
      <div>
        <h1>Your cart is empty</h1>
        <p>Browse the catalog and add something you&apos;ll wear with pride.</p>
        <Link href="/">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>Your cart</h1>
      <ul>
        {cart.items.map((item) => (
          <li key={item.productId}>
            <Image
              src={item.product.images[0]}
              alt={item.product.name}
              width={120}
              height={120}
              sizes="120px"
            />
            <p>{item.product.name}</p>
            <p>{usd.format(item.product.price / 100)} each</p>
            <p>Qty: {item.quantity}</p>
            <p>Line total: {usd.format(item.lineTotal / 100)}</p>

            {/* Each button is its own tiny <form> bound to the action with the
                pre-computed args. No "use client" needed — server components
                can render forms whose action is a server action reference. */}
            <form
              action={updateQuantityAction.bind(
                null,
                item.productId,
                item.quantity + 1,
              )}
            >
              <button type="submit" aria-label={`Increase ${item.product.name}`}>
                +
              </button>
            </form>
            <form
              action={updateQuantityAction.bind(
                null,
                item.productId,
                item.quantity - 1,
              )}
            >
              <button type="submit" aria-label={`Decrease ${item.product.name}`}>
                −
              </button>
            </form>
            <form action={removeItemAction.bind(null, item.productId)}>
              <button type="submit" aria-label={`Remove ${item.product.name}`}>
                Remove
              </button>
            </form>
          </li>
        ))}
      </ul>

      <p>
        <strong>Subtotal: {usd.format(cart.subtotal / 100)}</strong>
      </p>
    </div>
  );
}
