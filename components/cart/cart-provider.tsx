"use client";

import {
  createContext,
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

export type OptimisticAction =
  | { type: "add"; productId: string; quantity: number; product: Product }
  | { type: "update"; productId: string; quantity: number }
  | { type: "remove"; productId: string }
  | { type: "clear" };

// Optimistic helpers approximate what the API will return; the next
// getCart() snapshot supersedes them once the layout re-renders.

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

export function CartProvider({ children }: { children: ReactNode }) {
  // baseCart is the authoritative server cart, hydrated by <CartHydrate />
  // on every layout re-render (including post-revalidatePath).
  const [baseCart, setBaseCart] = useState<CartWithProducts | null>(null);
  const [optimisticCart, applyOptimistic] = useOptimistic(
    baseCart,
    cartReducer,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 4500);
    return () => clearTimeout(t);
  }, [error]);

  return (
    <CartContext.Provider
      value={{
        cart: optimisticCart,
        applyOptimistic,
        setError,
        error,
        setBaseCart,
      }}
    >
      {children}
      <CartErrorToast />
    </CartContext.Provider>
  );
}

// Bridges the server-fetched cart from <CartHydrator /> into the provider's
// useState — re-renders re-base useOptimistic against fresh server truth.
export function CartHydrate({
  cart,
}: {
  cart: CartWithProducts | null;
}) {
  const { setBaseCart } = useCart();
  useEffect(() => {
    setBaseCart(cart);
  }, [cart, setBaseCart]);
  return null;
}

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
