import type { Metadata } from "next";
import { CartContents } from "./cart-contents";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review and manage the items in your Vercel Swag Store cart.",
};

export default function CartPage() {
  return <CartContents />;
}
