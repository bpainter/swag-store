"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useOptimistic,
  useState,
  type ReactNode,
} from "react";
import type {
  CartItemWithProduct,
  CartWithProducts,
  Product,
} from "@/lib/api/types";

// ---------------------------------------------------------------------------
// Optimistic action vocabulary
// ---------------------------------------------------------------------------

export type OptimisticAction =
  | { type: "add"; productId: string; quantity: number; product: Product }
  | { type: "update"; productId: string; quantity: number }
  | { type: "remove"; productId: string }
  | { type: "clear" };

// ---------------------------------------------------------------------------
// Pure cart helpers — recompute totals after every mutation. These are
// best-effort approximations of what the server will return; the real cart
// snapshot from getCart() takes over once the layout re-renders post-action.
// ---------------------------------------------------------------------------

function emptyCart(): CartWithProducts {
  const now = new Date().toISOString();
  return {
    token: "",
    items: [],
    totalItems: 0,
    subtotal: 0,
    currency: "USD",
    createdAt: now,
    updatedAt: now,
  };
}

function recomputeTotals(items: CartItemWithProduct[]) {
  let totalItems = 0;
  let subtotal = 0;
  for (const item of items) {
    totalItems += item.quantity;
    subtotal += item.lineTotal;
  }
  return { totalItems, subtotal };
}

function addItemToCart(
  cart: CartWithProducts,
  product: Product,
  quantity: number,
): CartWithProducts {
  const newItem: CartItemWithProduct = {
    productId: product.id,
    quantity,
    addedAt: new Date().toISOString(),
    product,
    lineTotal: product.price * quantity,
  };
  const items = [...cart.items, newItem];
  return {
    ...cart,
    items,
    ...recomputeTotals(items),
    currency: cart.currency || product.currency || "USD",
    updatedAt: new Date().toISOString(),
  };
}

function updateItemInCart(
  cart: CartWithProducts,
  productId: string,
  quantity: number,
): CartWithProducts {
  const items = cart.items.map((item) =>
    item.productId === productId
      ? {
          ...item,
          quantity,
          lineTotal: item.product.price * quantity,
        }
      : item,
  );
  return {
    ...cart,
    items,
    ...recomputeTotals(items),
    updatedAt: new Date().toISOString(),
  };
}

function removeItemFromCart(
  cart: CartWithProducts,
  productId: string,
): CartWithProducts {
  const items = cart.items.filter((item) => item.productId !== productId);
  return {
    ...cart,
    items,
    ...recomputeTotals(items),
    updatedAt: new Date().toISOString(),
  };
}

function cartReducer(
  state: CartWithProducts | null,
  action: OptimisticAction,
): CartWithProducts {
  const base = state ?? emptyCart();
  switch (action.type) {
    case "add": {
      const existing = base.items.find((i) => i.productId === action.productId);
      if (existing) {
        return updateItemInCart(
          base,
          action.productId,
          existing.quantity + action.quantity,
        );
      }
      return addItemToCart(base, action.product, action.quantity);
    }
    case "update":
      return action.quantity === 0
        ? removeItemFromCart(base, action.productId)
        : updateItemInCart(base, action.productId, action.quantity);
    case "remove":
      return removeItemFromCart(base, action.productId);
    case "clear":
      return {
        ...base,
        items: [],
        totalItems: 0,
        subtotal: 0,
        updatedAt: new Date().toISOString(),
      };
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

type CartContextValue = {
  /** The cart with optimistic updates merged in. */
  cart: CartWithProducts | null;
  /** Apply a synthetic mutation. Must be called inside a `startTransition`. */
  applyOptimistic: (action: OptimisticAction) => void;
  /** Surface a server-action error to the global toast. */
  setError: (error: string | null) => void;
  /** The most recent error message (null when cleared). */
  error: string | null;
  /** Hydrate the provider with the latest server-fetched cart snapshot. */
  setBaseCart: (cart: CartWithProducts | null) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside <CartProvider>");
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function CartProvider({ children }: { children: ReactNode }) {
  // baseCart is the authoritative server cart. <CartHydrate /> updates this
  // every time the layout re-renders post-revalidation, so optimistic state
  // gets re-based against fresh server truth.
  const [baseCart, setBaseCart] = useState<CartWithProducts | null>(null);
  const [optimisticCart, applyOptimistic] = useOptimistic(
    baseCart,
    cartReducer,
  );
  const [error, setError] = useState<string | null>(null);

  // Auto-dismiss the error toast after a few seconds so it doesn't pin
  // forever if the user doesn't interact.
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 4500);
    return () => clearTimeout(t);
  }, [error]);

  // Stable identity for setBaseCart so the hydrate effect doesn't re-fire
  // on every provider render (state setters are stable, but routing through
  // useCallback keeps the cross-component contract explicit).
  const stableSetBaseCart = useCallback(
    (cart: CartWithProducts | null) => setBaseCart(cart),
    [],
  );

  return (
    <CartContext.Provider
      value={{
        cart: optimisticCart,
        applyOptimistic,
        setError,
        error,
        setBaseCart: stableSetBaseCart,
      }}
    >
      {children}
      <CartErrorToast />
    </CartContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// CartHydrate — bridges server-fetched cart into the client provider state.
// Rendered by <CartHydrator /> (server async) inside a Suspense boundary in
// the layout. On every layout re-render (e.g. after revalidatePath), this
// component receives a new `cart` prop and pushes it into baseCart.
// ---------------------------------------------------------------------------

export function CartHydrate({
  cart,
}: {
  cart: CartWithProducts | null;
}) {
  const { setBaseCart } = useCart();
  // The cart object identity changes on every render even when contents are
  // equal; this useEffect runs after every prop update, which is exactly
  // what we want: useOptimistic re-bases off the freshest server snapshot.
  useEffect(() => {
    setBaseCart(cart);
  }, [cart, setBaseCart]);
  return null;
}

// ---------------------------------------------------------------------------
// Error toast — bottom-right floating pill. Auto-dismisses via the provider's
// useEffect. Kept inline (not a separate file) because it has a 1:1
// relationship with the provider's error state.
// ---------------------------------------------------------------------------

function CartErrorToast() {
  const { error, setError } = useCart();
  if (!error) return null;
  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[200] flex max-w-sm items-start gap-3 rounded-lg border border-red-500/30 bg-bg-200 px-4 py-3 text-sm text-fg-100 shadow-lg"
    >
      <span className="text-red-500">{error}</span>
      <button
        type="button"
        onClick={() => setError(null)}
        aria-label="Dismiss"
        className="-mr-1 inline-flex h-6 w-6 items-center justify-center rounded text-fg-300 hover:bg-color-100 hover:text-fg-100 transition-colors"
      >
        ×
      </button>
    </div>
  );
}
