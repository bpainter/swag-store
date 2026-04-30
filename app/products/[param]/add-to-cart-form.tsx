"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Bookmark, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addToCartAction } from "@/app/cart/actions";
import { formatCents } from "@/lib/format";

// Submit button reads pending state from the surrounding <form>'s action.
// Must be a separate component because useFormStatus only works for a button
// rendered *inside* a <form> with a server action — it can't read the parent's
// state from outside. Disabled while pending or when stock is zero. The label
// shows the live (price * qty) total so the user always sees what they'll pay.
function SubmitButton({
  outOfStock,
  totalCents,
  currency,
}: {
  outOfStock: boolean;
  totalCents: number;
  currency: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      disabled={pending || outOfStock}
      className="h-11 flex-1"
    >
      {pending
        ? "Adding…"
        : outOfStock
          ? "Sold out"
          : (
            <>
              Add to cart ·{" "}
              <span className="tabular">
                {formatCents(totalCents, currency)}
              </span>
            </>
          )}
    </Button>
  );
}

export function AddToCartForm({
  productId,
  stock,
  price,
  currency = "USD",
}: {
  productId: string;
  stock: number;
  price: number; // unit price in cents — required for live total in submit label
  currency?: string;
}) {
  const outOfStock = stock === 0;
  const max = Math.max(1, stock);
  const [qty, setQty] = useState<number>(1);
  const [state, formAction] = useActionState(addToCartAction, undefined);

  // Clamp helpers — stepper buttons + manual edit all funnel through these
  // so 0/negatives/over-stock never reach the server action.
  const setClamped = (n: number) => setQty(Math.max(1, Math.min(max, n)));
  const dec = () => setClamped(qty - 1);
  const inc = () => setClamped(qty + 1);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="productId" value={productId} />

      <div className="flex items-stretch gap-2.5">
        {/* Quantity stepper — single bordered group containing − / input / +. */}
        <div className="inline-flex h-11 items-stretch overflow-hidden rounded-md border border-border-200">
          <button
            type="button"
            onClick={dec}
            disabled={qty <= 1 || outOfStock}
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
            disabled={outOfStock}
            // tabular + mono + center; native spin buttons hidden via
            // [appearance:textfield] so the layout doesn't shift on focus.
            className="tabular w-12 border-x border-border-200 bg-transparent text-center text-sm text-fg-100 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none disabled:opacity-50"
          />
          <button
            type="button"
            onClick={inc}
            disabled={qty >= max || outOfStock}
            aria-label="Increase quantity"
            className="inline-flex w-10 items-center justify-center text-fg-100 transition-colors hover:bg-color-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus size={14} aria-hidden="true" />
          </button>
        </div>

        <SubmitButton
          outOfStock={outOfStock}
          totalCents={price * qty}
          currency={currency}
        />

        {/* Decorative save/bookmark — no behavior; icon-only outline button. */}
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

      {state?.error && (
        <p role="alert" aria-live="polite" className="text-sm text-red-500">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p role="status" aria-live="polite" className="text-sm text-green-500">
          Added to cart.
        </p>
      )}
    </form>
  );
}
