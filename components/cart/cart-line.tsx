"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import {
  removeItemAction,
  updateQuantityAction,
} from "@/app/cart/actions";
import type { CartItemWithProduct } from "@/lib/api/types";
import { formatCents } from "@/lib/format";

// Single drawer line — image, name, price-each, qty stepper, remove, line
// total. Lives inside the client drawer so it can close the drawer when the
// user clicks through to a PDP. Mutations route through the existing server
// actions via tiny <form action={...}> wrappers (each .bind(null, …) call
// freezes the args needed for that specific button click).
export function CartLine({
  item,
  onClose,
}: {
  item: CartItemWithProduct;
  onClose: () => void;
}) {
  const productHref = `/products/${item.product.slug}`;

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
            <form
              action={updateQuantityAction.bind(
                null,
                item.productId,
                item.quantity - 1,
              )}
            >
              <button
                type="submit"
                disabled={item.quantity <= 1}
                aria-label={`Decrease ${item.product.name}`}
                className="inline-flex h-full w-7 items-center justify-center text-fg-100 transition-colors hover:bg-color-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Minus size={12} aria-hidden="true" />
              </button>
            </form>
            <span
              aria-label={`Quantity ${item.quantity}`}
              className="tabular inline-flex w-9 items-center justify-center border-x border-border-200 text-[12px] text-fg-100"
            >
              {item.quantity}
            </span>
            <form
              action={updateQuantityAction.bind(
                null,
                item.productId,
                item.quantity + 1,
              )}
            >
              <button
                type="submit"
                aria-label={`Increase ${item.product.name}`}
                className="inline-flex h-full w-7 items-center justify-center text-fg-100 transition-colors hover:bg-color-100"
              >
                <Plus size={12} aria-hidden="true" />
              </button>
            </form>
          </div>

          {/* Remove — text-button with trash icon; uses removeItemAction. */}
          <form action={removeItemAction.bind(null, item.productId)}>
            <button
              type="submit"
              className="inline-flex items-center gap-1 text-[12px] text-fg-300 hover:text-fg-100 transition-colors"
            >
              <Trash2 size={12} aria-hidden="true" />
              Remove
            </button>
          </form>
        </div>
      </div>

      {/* Right column: line total. */}
      <div className="tabular text-[14px] font-medium">
        {formatCents(item.lineTotal, item.product.currency)}
      </div>
    </div>
  );
}
