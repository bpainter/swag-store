import Link from "next/link";
import { getCart } from "@/lib/api/cart";

// Async server component. Reads the cart cookie via getCart() so the badge
// reflects the live count. Wrapped in <Suspense> from the root layout so the
// rest of the page can prerender — getCart() touches cookies(), which makes
// this subtree dynamic under cacheComponents.
export async function Header() {
  // try/catch: a missing cookie returns null cleanly, but a transient API
  // error (network blip, expired bypass token in dev) shouldn't take down
  // the whole layout.
  let cart = null;
  try {
    cart = await getCart();
  } catch {
    cart = null;
  }
  const totalItems = cart?.totalItems ?? 0;

  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span
            aria-hidden
            className="inline-block h-5 w-5 bg-black dark:bg-white"
            style={{ clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }}
          />
          <span>Swag Store</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <Link href="/search" className="hover:underline">
            Search
          </Link>
          <Link href="/cart" className="hover:underline">
            Cart
            {totalItems > 0 && (
              <span aria-label={`${totalItems} items in cart`}>
                {" "}
                ({totalItems})
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}

// Static placeholder used as the Suspense fallback in the root layout. Same
// shape as the real Header so the chrome doesn't shift when the cart badge
// streams in — the only difference is the badge is omitted.
export function HeaderSkeleton() {
  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span
            aria-hidden
            className="inline-block h-5 w-5 bg-black dark:bg-white"
            style={{ clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }}
          />
          <span>Swag Store</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <Link href="/search" className="hover:underline">
            Search
          </Link>
          <Link href="/cart" className="hover:underline">
            Cart
          </Link>
        </nav>
      </div>
    </header>
  );
}
