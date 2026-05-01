"use client";

import { useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import {
  removeItemAction,
  updateQuantityAction,
} from "@/app/cart/actions";
import type { CartItemWithProduct } from "@/lib/api/types";
import { formatCents } from "@/lib/format";

// Single drawer line — image, name, price-each, qty stepper, remove, line
// total. Lives inside the client drawer so it can close the drawer when the
// user clicks through to a PDP. Mutations apply optimistic state first, then
// hit the server action; on error the provider's toast surfaces the failure
// and the optimistic merge evaporates when the transition ends, leaving the
// real server state intact.
export function CartLine({
  item,
  onClose,
}: {
  item: CartItemWithProduct;
  onClose: () => void;
}) {
  const productHref = `/products/${item.product.slug}`;
  const { applyOptimistic, setError } = useCart();
  const [isPending, startTransition] = useTransition();

  const adjust = (nextQty: number) => {
    // Quantity changes: <=0 collapses to remove via the reducer + the
    // server action's own zero-quantity branch.
    startTransition(async () => {
      applyOptimistic({
        type: "update",
        productId: item.productId,
        quantity: nextQty,
      });
      try {
        await updateQuantityAction(item.productId, nextQty);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not update quantity",
        );
      }
    });
  };

  const remove = () => {
    startTransition(async () => {
      applyOptimistic({ type: "remove", productId: item.productId });
      try {
        await removeItemAction(item.productId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not remove item");
      }
    });
  };

  return (
    <div className="grid grid-cols-[72px_1fr_auto] items-start gap-3.5 border-t border-border-100 px-5 py-4 first:border-t-0">
      {/* Thumbnail — 72×72 framed image; closes the drawer on click. */}
      <Link
        href={productHref}
        onClick={onClose}
        className="relative block h-[72px] w-[72px] overflow-hidden rounded-md border border-border-100 bg-color-100"
        aria-label={item.product.name}
      >
        <Image
          src={item.product.images[0]}
          alt=""
          fill
          sizes="72px"
          className="object-cover"
        />
      </Link>

      {/* Middle column: name + per-unit price + stepper / remove row. */}
      <div>
        <Link
          href={productHref}
          onClick={onClose}
          className="text-sm font-medium text-fg-100 hover:opacity-80 transition-opacity"
        >
          {item.product.name}
        </Link>
        <div className="tabular mt-1 text-[12px] text-fg-200">
          {formatCents(item.product.price, item.product.currency)} each
        </div>

        <div className="mt-2.5 flex items-center gap-3">
          {/* Qty stepper — tighter (28px tall) than the PDP's 44px version. */}
          <div className="inline-flex h-7 items-stretch overflow-hidden rounded-md border border-border-200">
            <button
              type="button"
              onClick={() => adjust(item.quantity - 1)}
              disabled={isPending}
              // At qty=1, clicking − sends quantity=0; the reducer collapses
              // to remove and the server action's zero-quantity branch
              // deletes the line. Lets users empty a row from the stepper
              // without reaching for the explicit Remove button.
              aria-label={
                item.quantity > 1
                  ? `Decrease ${item.product.name}`
                  : `Remove ${item.product.name}`
              }
              className="inline-flex h-full w-7 items-center justify-center text-fg-100 transition-colors hover:bg-color-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Minus size={12} aria-hidden="true" />
            </button>
            <span
              aria-label={`Quantity ${item.quantity}`}
              className="tabular inline-flex w-9 items-center justify-center border-x border-border-200 text-[12px] text-fg-100"
            >
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => adjust(item.quantity + 1)}
              disabled={isPending}
              aria-label={`Increase ${item.product.name}`}
              className="inline-flex h-full w-7 items-center justify-center text-fg-100 transition-colors hover:bg-color-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus size={12} aria-hidden="true" />
            </button>
          </div>

          {/* Remove — text-button with trash icon. */}
          <button
            type="button"
            onClick={remove}
            disabled={isPending}
            className="inline-flex items-center gap-1 text-[12px] text-fg-300 hover:text-fg-100 transition-colors disabled:opacity-50"
          >
            <Trash2 size={12} aria-hidden="true" />
            Remove
          </button>
        </div>
      </div>

      {/* Right column: line total. */}
      <div className="tabular text-[14px] font-medium">
        {formatCents(item.lineTotal, item.product.currency)}
      </div>
    </div>
  );
}
