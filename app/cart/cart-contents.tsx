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
import { formatCents } from "@/lib/format";

// Client renderer for /cart — consumes the same optimistic cart state as the
// header badge + drawer, so all three reflect identical truth at all times.
// The +/- and Remove buttons fire optimistic updates first, then the server
// action; on error the provider's toast surfaces the failure and the
// optimistic merge evaporates when the transition ends.
export function CartContents() {
  const { cart, applyOptimistic, setError } = useCart();
  const [isPending, startTransition] = useTransition();

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container py-16 text-center">
        <h1 className="m-0 mb-3 text-2xl font-semibold">
          Your cart is empty
        </h1>
        <p className="mb-6 text-sm text-fg-200">
          Browse the catalog and add something you&apos;ll wear with pride.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-md border border-border-200 px-3 py-2 text-sm text-fg-100 hover:bg-color-100 transition-colors"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  const adjust = (productId: string, nextQty: number) => {
    startTransition(async () => {
      applyOptimistic({ type: "update", productId, quantity: nextQty });
      try {
        await updateQuantityAction(productId, nextQty);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not update quantity",
        );
      }
    });
  };

  const remove = (productId: string) => {
    startTransition(async () => {
      applyOptimistic({ type: "remove", productId });
      try {
        await removeItemAction(productId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not remove item");
      }
    });
  };

  return (
    <div className="container py-12">
      <h1 className="m-0 mb-8 text-3xl font-semibold tracking-tight">
        Your cart
      </h1>

      <ul className="flex flex-col gap-4 list-none p-0 m-0">
        {cart.items.map((item) => (
          <li
            key={item.productId}
            className="grid grid-cols-[120px_1fr_auto] items-start gap-5 rounded-lg border border-border-100 bg-bg-200 p-4"
          >
            <Link
              href={`/products/${item.product.slug}`}
              className="relative block aspect-square w-[120px] overflow-hidden rounded-md border border-border-100 bg-color-100"
              aria-label={item.product.name}
            >
              <Image
                src={item.product.images[0]}
                alt=""
                fill
                sizes="120px"
                className="object-cover"
              />
            </Link>

            <div className="flex min-h-[120px] flex-col justify-between">
              <div>
                <Link
                  href={`/products/${item.product.slug}`}
                  className="text-base font-medium text-fg-100 hover:opacity-80 transition-opacity"
                >
                  {item.product.name}
                </Link>
                <div className="tabular mt-1 text-[13px] text-fg-200">
                  {formatCents(item.product.price, item.product.currency)} each
                </div>
              </div>

              <div className="mt-3 flex items-center gap-4">
                <div className="inline-flex h-9 items-stretch overflow-hidden rounded-md border border-border-200">
                  <button
                    type="button"
                    onClick={() => adjust(item.productId, item.quantity - 1)}
                    disabled={isPending || item.quantity <= 1}
                    aria-label={`Decrease ${item.product.name}`}
                    className="inline-flex h-full w-9 items-center justify-center text-fg-100 transition-colors hover:bg-color-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Minus size={14} aria-hidden="true" />
                  </button>
                  <span
                    aria-label={`Quantity ${item.quantity}`}
                    className="tabular inline-flex w-10 items-center justify-center border-x border-border-200 text-sm text-fg-100"
                  >
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => adjust(item.productId, item.quantity + 1)}
                    disabled={isPending}
                    aria-label={`Increase ${item.product.name}`}
                    className="inline-flex h-full w-9 items-center justify-center text-fg-100 transition-colors hover:bg-color-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Plus size={14} aria-hidden="true" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => remove(item.productId)}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 text-[13px] text-fg-300 hover:text-fg-100 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={14} aria-hidden="true" />
                  Remove
                </button>
              </div>
            </div>

            <div className="tabular text-base font-medium">
              {formatCents(item.lineTotal, item.product.currency)}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex justify-end">
        <p className="text-base">
          <span className="text-fg-200">Subtotal:</span>{" "}
          <strong className="tabular">
            {formatCents(cart.subtotal, cart.currency)}
          </strong>
        </p>
      </div>
    </div>
  );
}
