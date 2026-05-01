"use client";

import { useState, useTransition } from "react";
import { Bookmark, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-provider";
import { addToCartAction } from "@/app/cart/actions";
import { formatCents } from "@/lib/format";
import type { Product } from "@/lib/api/types";

export function AddToCartForm({
  product,
  stock,
}: {
  // Full Product (not just an id) so the optimistic reducer can build a
  // synthetic line item without a client-side fetch.
  product: Product;
  stock: number;
}) {
  const outOfStock = stock === 0;
  const max = Math.max(1, stock);
  const [qty, setQty] = useState(1);
  const [success, setSuccess] = useState<string | null>(null);
  const { applyOptimistic, setError } = useCart();
  const [isPending, startTransition] = useTransition();

  const setClamped = (n: number) => setQty(Math.max(1, Math.min(max, n)));
  const dec = () => setClamped(qty - 1);
  const inc = () => setClamped(qty + 1);

  const handleSubmit = (formData: FormData) => {
    const productId = String(formData.get("productId") ?? "");
    const quantity = Number(formData.get("quantity") ?? 0);
    if (!productId || !Number.isFinite(quantity) || quantity < 1) return;

    startTransition(async () => {
      applyOptimistic({
        type: "add",
        productId,
        quantity,
        product,
      });
      setSuccess(null);

      const result = await addToCartAction(undefined, formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess("Added to cart.");
      }
    });
  };

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <input type="hidden" name="productId" value={product.id} />

      <div className="flex items-stretch gap-2.5">
        <div className="inline-flex h-11 items-stretch overflow-hidden rounded-md border border-border-200">
          <button
            type="button"
            onClick={dec}
            disabled={qty <= 1 || outOfStock || isPending}
            aria-label="Decrease quantity"
            className="inline-flex w-10 items-center justify-center text-fg-100 transition-colors hover:bg-color-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Minus size={14} aria-hidden="true" />
          </button>
          <input
            type="number"
            name="quantity"
            min={1}
            max={max}
            value={qty}
            onChange={(e) => {
              const next = parseInt(e.target.value || "0", 10);
              setClamped(Number.isFinite(next) ? next : 1);
            }}
            disabled={outOfStock || isPending}
            // [appearance:textfield] hides the native spin buttons so focus
            // doesn't shift the layout.
            className="tabular w-12 border-x border-border-200 bg-transparent text-center text-sm text-fg-100 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none disabled:opacity-50"
          />
          <button
            type="button"
            onClick={inc}
            disabled={qty >= max || outOfStock || isPending}
            aria-label="Increase quantity"
            className="inline-flex w-10 items-center justify-center text-fg-100 transition-colors hover:bg-color-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus size={14} aria-hidden="true" />
          </button>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={isPending || outOfStock}
          className="h-11 flex-1"
        >
          {isPending
            ? "Adding…"
            : outOfStock
              ? "Sold out"
              : (
                <>
                  Add to cart ·{" "}
                  <span className="tabular">
                    {formatCents(product.price * qty, product.currency)}
                  </span>
                </>
              )}
        </Button>

        {/* Decorative — no save-for-later flow yet. */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Save for later"
          className="h-11 w-11"
        >
          <Bookmark size={16} aria-hidden="true" />
        </Button>
      </div>

      {success && (
        <p role="status" aria-live="polite" className="text-sm text-green-500">
          {success}
        </p>
      )}
    </form>
  );
}
