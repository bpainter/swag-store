"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, ShoppingBag, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { CartLine } from "@/components/cart/cart-line";
import { clearCartAction } from "@/app/cart/actions";
import type { CartWithProducts } from "@/lib/api/types";
import { formatCents } from "@/lib/format";

const FREE_SHIPPING_THRESHOLD_CENTS = 7500; // $75
const FLAT_SHIPPING_CENTS = 800; // $8 below the threshold
const TAX_RATE = 0.08; // estimate; not authoritative

// Slide-in cart drawer. Receives `cart` as a prop from the server-rendered
// CartButton chain — when a server action revalidates the layout, the
// header re-renders and passes a fresh cart in here. No client cart state.
export function CartDrawer({
  cart,
  open,
  onOpenChange,
}: {
  cart: CartWithProducts | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;
  const currency = cart?.currency ?? "USD";
  const count = cart?.totalItems ?? 0;
  const isEmpty = items.length === 0;

  const close = () => onOpenChange(false);

  const browseShop = () => {
    close();
    router.push("/");
  };

  const shippingCents =
    subtotal >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : FLAT_SHIPPING_CENTS;
  const taxCents = Math.round(subtotal * TAX_RATE);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        // Drawer width: 440px on desktop, 100vw on phones. The default
        // SheetContent class includes `data-[side=right]:w-3/4 sm:max-w-sm`
        // which we override with `!`-prefixed widths.
        className="!w-[min(440px,100vw)] !max-w-[440px] gap-0 bg-bg-100 p-0 text-fg-100 border-l border-border-100"
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-border-100 px-5">
          <div className="flex items-center gap-2.5">
            <ShoppingBag size={16} aria-hidden="true" />
            <SheetTitle className="text-sm font-medium text-fg-100">
              Your cart
            </SheetTitle>
            {count > 0 && (
              <Badge
                variant="outline"
                className="font-mono text-[11px] text-fg-200 uppercase tracking-[0.04em]"
              >
                {count} {count === 1 ? "item" : "items"}
              </Badge>
            )}
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close cart"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-fg-200 hover:bg-color-100 hover:text-fg-100 transition-colors"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {isEmpty ? (
          /* Empty state */
          <div className="flex flex-1 flex-col items-center justify-center px-8 py-10 text-center">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-color-100">
              <ShoppingBag
                size={22}
                aria-hidden="true"
                className="text-fg-300"
              />
            </div>
            <h3 className="m-0 mb-1.5 text-lg font-semibold">
              Your cart is empty
            </h3>
            <p className="mx-auto mb-5 max-w-[280px] text-[13px] text-fg-200">
              Add some swag — heavyweight tees, enamel pins, the works.
            </p>
            <Button type="button" onClick={browseShop}>
              Browse the shop
              <ArrowRight size={14} aria-hidden="true" />
            </Button>
          </div>
        ) : (
          <>
            {/* Items list — scrollable. */}
            <div className="flex-1 overflow-y-auto">
              {items.map((item) => (
                <CartLine
                  key={item.productId}
                  item={item}
                  onClose={close}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-3.5 border-t border-border-100 p-5">
              <div className="flex justify-between text-[13px] text-fg-200">
                <span>Shipping</span>
                <span className="tabular">
                  {shippingCents === 0
                    ? "Free"
                    : formatCents(shippingCents, currency)}
                </span>
              </div>
              <div className="flex justify-between text-[13px] text-fg-200">
                <span>Estimated tax</span>
                <span className="tabular">
                  {formatCents(taxCents, currency)}
                </span>
              </div>
              <div className="h-px bg-border-100" />
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium">Subtotal</span>
                <span
                  className="tabular text-[22px] font-semibold"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {formatCents(subtotal, currency)}
                </span>
              </div>

              {/* Decorative — checkout flow is out of scope for the cert. */}
              <Button type="button" size="lg" className="w-full">
                Checkout
                <ArrowRight size={14} aria-hidden="true" />
              </Button>

              {/* Clear cart — server action; revalidatePath will drop new
                  props in here on the next render and the empty-state shows. */}
              <form action={clearCartAction} className="self-center">
                <button
                  type="submit"
                  className="inline-flex h-7 items-center rounded-md px-2.5 text-[12px] text-fg-300 transition-colors hover:bg-color-100 hover:text-fg-100"
                >
                  Clear cart
                </button>
              </form>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
