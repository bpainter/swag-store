import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cart",
};

// Phase 3a placeholder. Real cart UI + getCart() call lands in Phase 3b
// (with the appropriate Suspense boundary so cookie reads don't block prerender).
export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1>Your cart is empty</h1>
      <p>Cart functionality is coming in Phase 3b.</p>
      <Link href="/">Continue shopping</Link>
    </div>
  );
}
