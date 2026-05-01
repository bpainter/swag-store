"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
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

export function CartLine({
  item,
  onClose,
}: {
  item: CartItemWithProduct;
  onClose: () => void;
}) {
  const productHref = `/products/${item.product.slug}`;
  const router = useRouter();
  const { applyOptimistic, setError } = useCart();
  const [isPending, startTransition] = useTransition();

  const adjust = (nextQty: number) => {
    // qty=0 collapses to remove in both the reducer and the server action.
    startTransition(async () => {
      applyOptimistic({
        type: "update",
        productId: item.productId,
        quantity: nextQty,
      });
      try {
        await updateQuantityAction(item.productId, nextQty);
        // Re-render the current route so <CartHydrator /> re-runs and the
        // provider's baseCart syncs to post-mutation server truth.
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not update quantity",
        );
        throw err;
      }
    });
  };

  const remove = () => {
    startTransition(async () => {
      applyOptimistic({ type: "remove", productId: item.productId });
      try {
        await removeItemAction(item.productId);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not remove item");
        throw err;
      }
    });
  };

  return (
    <div className="grid grid-cols-[72px_1fr_auto] items-start gap-3.5 border-t border-border-100 px-5 py-4 first:border-t-0">
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
          <div className="inline-flex h-7 items-stretch overflow-hidden rounded-md border border-border-200">
            <button
              type="button"
              onClick={() => adjust(item.quantity - 1)}
              disabled={isPending}
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

      <div className="tabular text-[14px] font-medium">
        {formatCents(item.lineTotal, item.product.currency)}
      </div>
    </div>
  );
}
