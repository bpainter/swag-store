import "server-only";
import { cookies } from "next/headers";
import { swagFetch, isApi404 } from "@/lib/api/client";
import type { CartWithProducts } from "@/lib/api/types";

const CART_COOKIE = "cart_token";

// ---------------------------------------------------------------------------
// Cookie helpers
// ---------------------------------------------------------------------------

async function getCartToken(): Promise<string | null> {
  return (await cookies()).get(CART_COOKIE)?.value ?? null;
}

async function setCartToken(token: string): Promise<void> {
  (await cookies()).set(CART_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours — matches API expiry
  });
}

async function clearCartToken(): Promise<void> {
  (await cookies()).delete(CART_COOKIE);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns the current cart, or null if no cart token exists or the cart has
 * expired (404). Other errors are rethrown.
 *
 * NOT cached — cart contents are per-user and change on every mutation.
 */
export async function getCart(): Promise<CartWithProducts | null> {
  const token = await getCartToken();
  if (!token) return null;

  try {
    const { data } = await swagFetch<CartWithProducts>("/cart", { cartToken: token });
    return data;
  } catch (err) {
    if (isApi404(err)) {
      // Cart expired (24h inactivity) — clear the stale cookie and signal "no cart"
      await clearCartToken();
      return null;
    }
    throw err;
  }
}

/**
 * Returns an existing cart, or creates a new one if none exists.
 *
 * IMPORTANT: The cart token returned by POST /cart/create lives in the
 * `x-cart-token` *response header*, not in the response body. We must
 * read `result.headers.get("x-cart-token")` — the body does not contain it.
 *
 * NOT cached — must be called from a Server Action or Route Handler so that
 * the cookie write is permitted by Next.js.
 */
export async function ensureCart(): Promise<CartWithProducts> {
  const existing = await getCart();
  if (existing) return existing;

  // Create a new cart. The token comes back in x-cart-token response header.
  const result = await swagFetch<CartWithProducts>("/cart/create", {
    method: "POST",
  });

  const newToken = result.headers.get("x-cart-token");
  if (!newToken) {
    throw new Error(
      "POST /cart/create did not return an x-cart-token header. " +
        "The cart cannot be tracked without it.",
    );
  }

  await setCartToken(newToken);
  return result.data;
}

/**
 * Adds a product to the cart. Calls ensureCart() first to guarantee a token.
 * Returns the updated cart.
 */
export async function addItem(
  productId: string,
  quantity: number,
): Promise<CartWithProducts> {
  // ensureCart() also handles the cookie — must be in a Server Action context.
  await ensureCart();
  const token = await getCartToken();
  if (!token) throw new Error("Cart token missing after ensureCart — this should never happen.");

  const { data } = await swagFetch<CartWithProducts>("/cart", {
    method: "POST",
    cartToken: token,
    body: JSON.stringify({ productId, quantity }),
  });
  return data;
}

/**
 * Updates the quantity of an existing cart item.
 * Set quantity to 0 to remove the item.
 * Requires an existing cart token (throws clearly if missing).
 */
export async function updateItem(
  itemId: string,
  quantity: number,
): Promise<CartWithProducts> {
  const token = await getCartToken();
  if (!token) {
    throw new Error(
      "No cart token found. Call addItem() or ensureCart() before updateItem().",
    );
  }

  const { data } = await swagFetch<CartWithProducts>(`/cart/${itemId}`, {
    method: "PATCH",
    cartToken: token,
    body: JSON.stringify({ quantity }),
  });
  return data;
}

/**
 * Removes an item from the cart entirely.
 * Requires an existing cart token (throws clearly if missing).
 */
export async function removeItem(itemId: string): Promise<CartWithProducts> {
  const token = await getCartToken();
  if (!token) {
    throw new Error(
      "No cart token found. Cannot remove an item from a non-existent cart.",
    );
  }

  const { data } = await swagFetch<CartWithProducts>(`/cart/${itemId}`, {
    method: "DELETE",
    cartToken: token,
  });
  return data;
}
