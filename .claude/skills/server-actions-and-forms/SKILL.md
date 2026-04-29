---
name: server-actions-and-forms
description: Use this skill any time you're handling form submissions, mutations, or any user-triggered server-side work in a Next.js 16 app. Triggers include "use server", Server Actions, action prop on a form, FormData, useFormStatus, useActionState, useFormState, revalidatePath, revalidateTag, redirect from next/navigation, optimistic updates with useOptimistic, or any "submit", "save", "delete", "update" interaction. Also use when wiring buttons that need to mutate server state (add to cart, like, follow, vote). Bundles Vercel Academy topic server-actions-for-forms.
---

# Next.js 16 — Server Actions and Forms

Server Actions are how you mutate server state from the UI **without writing API routes**. They're the canonical way to handle forms, button-driven mutations, and any user action that should trigger server work in Next.js 16.

## What a Server Action is

An async function that:
- Has `"use server"` either at the top of its file or as the first statement in its body.
- Runs **only on the server**, even when invoked from a client component.
- Can be passed as the `action` prop to a `<form>`, called from `formAction`, or invoked from a click handler.
- Returns serializable data back to the client.

## Two ways to declare

### File-level (the default for shared actions)

```ts
// app/cart/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function addToCartAction(formData: FormData) {
  const productId = String(formData.get("productId"));
  const quantity = Number(formData.get("quantity"));

  const token = await ensureCartToken();
  await fetch(`${API}/cart`, {
    method: "POST",
    headers: {
      "x-vercel-protection-bypass": process.env.SWAG_BYPASS_TOKEN!,
      "x-cart-token": token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productId, quantity }),
  });

  revalidatePath("/cart");
  revalidatePath("/", "layout"); // refresh the header badge
}
```

### Inline (for one-off actions co-located with a server component)

```tsx
export default async function ProductPage({ params }) {
  const { param } = await params;
  const product = await getProduct(param);

  async function addOne() {
    "use server";
    await addItem(product.id, 1);
    revalidatePath("/cart");
  }

  return <form action={addOne}><button>Quick add</button></form>;
}
```

## Wiring forms

The vanilla, no-JS-required pattern:

```tsx
import { addToCartAction } from "./actions";

export function AddToCartForm({ productId }: { productId: string }) {
  return (
    <form action={addToCartAction}>
      <input type="hidden" name="productId" value={productId} />
      <input type="number" name="quantity" defaultValue={1} min={1} />
      <button type="submit">Add to cart</button>
    </form>
  );
}
```

This works **without any client-side JavaScript**. If JS loads, Next.js progressively enhances to avoid a full navigation.

## Pending UI

Use `useFormStatus` from `react-dom` for per-form pending state:

```tsx
"use client";
import { useFormStatus } from "react-dom";

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Adding..." : children}
    </button>
  );
}
```

`useFormStatus` only works **inside** a `<form>`. The button itself must be a client component, but the form can be rendered from a server component.

## Returning data and validation errors

Use `useActionState` (formerly `useFormState`) to get the action's return value:

```ts
// actions.ts
"use server";

export async function addToCartAction(prev: State, formData: FormData) {
  const qty = Number(formData.get("quantity"));
  if (qty < 1) return { error: "Quantity must be at least 1" };
  // ... do work
  return { success: true };
}
```

```tsx
"use client";
import { useActionState } from "react";

export function Form() {
  const [state, action] = useActionState(addToCartAction, { error: null });
  return (
    <form action={action}>
      <input name="quantity" />
      {state?.error && <p className="text-red-500">{state.error}</p>}
      <SubmitButton>Add</SubmitButton>
    </form>
  );
}
```

## Calling actions from non-form click handlers

For "Remove" buttons or "+/-" steppers where a `<form>` feels heavy, you can either:

1. **Wrap each button in its own tiny form:**
   ```tsx
   <form action={removeItemAction.bind(null, item.id)}>
     <button>Remove</button>
   </form>
   ```

2. **Or use `formAction`** on a button inside an outer form:
   ```tsx
   <button formAction={removeItemAction.bind(null, item.id)}>Remove</button>
   ```

3. **Or call from an `onClick` in a client component**:
   ```tsx
   "use client";
   import { removeItemAction } from "./actions";
   const onClick = async () => { await removeItemAction(item.id); };
   ```

## Revalidation: making the UI catch up

After a mutation, you almost always need to invalidate cached UI. Two functions:

- `revalidatePath(path, type?)` — invalidates by URL. `type` is `"layout"` or `"page"` (default).
- `revalidateTag(tag)` — invalidates anything tagged with that string via `cacheTag()`.

For the cart:

```ts
revalidatePath("/cart");                // /cart route's data
revalidatePath("/", "layout");          // any layout that shows cart count
```

Or with tags (cleaner if you tag your fetches):

```ts
revalidateTag(`cart:${cartToken}`);
```

**Note:** Currently `revalidatePath` from a server action also refreshes previously-visited pages on next nav — Next.js may tighten this in a future version. Don't depend on it; revalidate explicitly.

## Redirect after mutation

```ts
import { redirect } from "next/navigation";

export async function checkoutAction() {
  "use server";
  const orderId = await createOrder();
  redirect(`/orders/${orderId}`);
}
```

`redirect()` throws internally — it must be the last statement in your action.

## Optimistic updates

For instant feedback before the server responds:

```tsx
"use client";
import { useOptimistic } from "react";

export function CartItem({ item }) {
  const [optimisticQty, setOptimisticQty] = useOptimistic(item.quantity);
  async function update(newQty: number) {
    setOptimisticQty(newQty);
    await updateQuantityAction(item.id, newQty);
  }
  return <span>{optimisticQty}</span>;
}
```

Use sparingly. The basic `useFormStatus` pending UI covers most cases.

## Security checklist

Server Actions are public endpoints, even when you didn't define a route. Treat every action as untrusted input:

1. **Validate every field.** Use Zod or manual checks. Don't trust `formData.get("quantity")`.
2. **Authorize before mutating.** Check the cart token / session.
3. **Don't return secrets.** The return value is shipped to the client.
4. **Don't accept arbitrary IDs without scoping.** A `removeItemAction(itemId)` should only remove items in *this* user's cart.

## Picking actions for the Swag Store

| Trigger | Action | Revalidates |
|---|---|---|
| Add to Cart (PDP form) | `addToCartAction(formData)` | `/cart`, `/` (layout) |
| `+`/`-` in cart | `updateQuantityAction(itemId, qty)` | `/cart`, `/` (layout) |
| Remove in cart | `removeItemAction(itemId)` | `/cart`, `/` (layout) |

You don't need a checkout action — that's out of scope for this assignment.

Sources:
- [Server Actions and Mutations (Next.js docs)](https://nextjs.org/docs/app/getting-started/updating-data)
- [revalidatePath](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)
- [useActionState (React docs)](https://react.dev/reference/react/useActionState)
