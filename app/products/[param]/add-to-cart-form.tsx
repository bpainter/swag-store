"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { addToCartAction } from "@/app/cart/actions";

// Submit button reads pending state from the surrounding <form>'s action.
// Must be a separate component because useFormStatus only works for a button
// rendered *inside* a <form> with a server action — it can't read the parent's
// state from outside. Disabled while pending or when stock is zero.
function SubmitButton({ outOfStock }: { outOfStock: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || outOfStock}>
      {pending ? "Adding..." : outOfStock ? "Out of stock" : "Add to Cart"}
    </button>
  );
}

export function AddToCartForm({
  productId,
  stock,
}: {
  productId: string;
  stock: number;
}) {
  const outOfStock = stock === 0;
  const [qty, setQty] = useState<number>(1);
  const [state, formAction] = useActionState(addToCartAction, undefined);

  return (
    <form action={formAction}>
      <input type="hidden" name="productId" value={productId} />
      <label>
        <span>Quantity</span>
        <input
          type="number"
          name="quantity"
          min={1}
          max={Math.max(1, stock)}
          value={qty}
          onChange={(e) => {
            const next = Number(e.target.value);
            if (Number.isFinite(next)) setQty(next);
          }}
          disabled={outOfStock}
        />
      </label>
      <SubmitButton outOfStock={outOfStock} />
      {state?.error && (
        <p role="alert" aria-live="polite">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p role="status" aria-live="polite">
          Added to cart.
        </p>
      )}
    </form>
  );
}
