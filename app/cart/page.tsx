import type { Metadata } from "next";
import Link from "next/link";
import { getCart } from "@/lib/api/cart";

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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.product.images[0]}
              alt={item.product.name}
              width={120}
              height={120}
            />
            <p>{item.product.name}</p>
            <p>{usd.format(item.product.price / 100)} each</p>
            <p>Qty: {item.quantity}</p>
            <p>Line total: {usd.format(item.lineTotal / 100)}</p>
          </li>
        ))}
      </ul>

      <p>
        <strong>Subtotal: {usd.format(cart.subtotal / 100)}</strong>
      </p>
    </div>
  );
}
