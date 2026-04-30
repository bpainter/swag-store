"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { CartDrawer } from "@/components/cart/cart-drawer";
import type { CartWithProducts } from "@/lib/api/types";

// Client wrapper that owns the drawer's open/closed state. Receives `cart`
// from the server-rendered <CartIcon /> chain so the drawer reflects
// authoritative server data — no client-side cart fetching, no localStorage.
//
// When a server action revalidates the layout, the Header re-fetches and
// passes new props through CartIcon → CartButton → CartDrawer; the drawer
// content updates automatically without any client-side store.
export function CartButton({ cart }: { cart: CartWithProducts | null }) {
  const [open, setOpen] = useState(false);
  const count = cart?.totalItems ?? 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={count > 0 ? `Open cart, ${count} items` : "Open cart"}
        className="relative inline-flex h-8 w-8 items-center justify-center rounded-md text-fg-200 hover:bg-color-100 hover:text-fg-100 transition-colors"
      >
        <ShoppingBag size={16} aria-hidden="true" />
        {count > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-700 px-1 font-mono text-[10px] font-semibold leading-none text-white ring-2 ring-bg-100"
          >
            {count}
          </span>
        )}
      </button>

      <CartDrawer cart={cart} open={open} onOpenChange={setOpen} />
    </>
  );
}
