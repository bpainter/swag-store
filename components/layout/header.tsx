import Link from "next/link";
import { Search } from "lucide-react";
import { CartIcon } from "@/components/cart/cart-icon";
import { MobileNav } from "@/components/layout/mobile-nav";
import { getCart } from "@/lib/api/cart";

// Categories surfaced in the desktop nav. We only link to slugs that exist in
// the API (t-shirts / mugs / accessories).
const NAV_LINKS: ReadonlyArray<{ label: string; href: string }> = [
  { label: "T-Shirts", href: "/search?category=t-shirts" },
  { label: "Mugs", href: "/search?category=mugs" },
  { label: "Accessories", href: "/search?category=accessories" },
  { label: "Search", href: "/search" }
];

// Inline triangle SVG copied from the design's <Triangle /> helper. Kept tiny
// and inline so the logo renders in the static HTML — no JS, no extra request.
function TriangleLogo({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={(size * 65) / 76}
      viewBox="0 0 76 65"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
    </svg>
  );
}

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

  return (
    <header
      className="sticky top-0 z-50 h-16 border-b border-border-100"
      style={{
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "saturate(150%) blur(14px)",
        WebkitBackdropFilter: "saturate(150%) blur(14px)",
      }}
    >
      <div className="container flex h-full items-center gap-6">
        {/* Mobile menu — visible only below md, sits at the very left edge. */}
        <MobileNav />

        {/* Logo block: triangle + wordmark + Beta pill (Beta hidden on mobile). */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-fg-100 hover:opacity-90 transition-opacity"
          aria-label="Swag Store home"
        >
          <TriangleLogo size={20} />
          <span className="text-sm font-medium tracking-tight">Swag</span>
          <span className="hidden md:inline-flex font-mono uppercase tracking-wider text-[10px] text-fg-300 border border-border-200 rounded-full px-2 py-0.5">
            Beta
          </span>
        </Link>

        {/* Desktop nav — hidden on mobile (mobile uses MobileNav). */}
        <nav className="hidden md:flex gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded px-2.5 py-1.5 text-[13px] text-fg-200 hover:text-fg-100 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right-side cluster: search-trigger pill + cart icon. */}
        <div className="ml-auto flex items-center gap-1.5">
          {/* Search-trigger pill — looks like an input, but it's a Link to
              /search. The real search input lives there. */}
          {/* <Link
            href="/search"
            className="hidden md:inline-flex h-8 min-w-[240px] items-center gap-2 rounded-md border border-border-200 px-3 text-[13px] text-fg-300 hover:border-border-300 hover:text-fg-100 transition-colors"
          >
            <Search size={14} aria-hidden="true" />
            <span>Search products</span>
            <kbd className="ml-auto rounded border border-border-200 px-1.5 py-0.5 font-mono text-[11px] text-fg-300">
              ⌘K
            </kbd>
          </Link> */}

          <CartIcon cart={cart} />
        </div>
      </div>
    </header>
  );
}

// Static placeholder used as the Suspense fallback in the root layout. Same
// chrome shape as the real Header so nothing shifts when the cart badge
// streams in — only difference is the badge is omitted (cart count not yet
// resolved) and the desktop nav still shows.
export function HeaderSkeleton() {
  return (
    <header
      aria-hidden="true"
      className="sticky top-0 z-50 h-16 border-b border-border-100"
      style={{
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "saturate(150%) blur(14px)",
        WebkitBackdropFilter: "saturate(150%) blur(14px)",
      }}
    >
      <div className="container flex h-full items-center gap-6">
        <div className="md:hidden inline-flex h-8 w-8 items-center justify-center rounded-md text-fg-200">
          {/* Reserve space for MobileNav trigger */}
        </div>
        <div className="flex items-center gap-2.5 text-fg-100">
          <TriangleLogo size={20} />
          <span className="text-sm font-medium tracking-tight">Swag</span>
          <span className="hidden md:inline-flex font-mono uppercase tracking-wider text-[10px] text-fg-300 border border-border-200 rounded-full px-2 py-0.5">
            Beta
          </span>
        </div>
        <nav className="hidden md:flex gap-1">
          {NAV_LINKS.map((link) => (
            <span
              key={link.href}
              className="rounded px-2.5 py-1.5 text-[13px] text-fg-200"
            >
              {link.label}
            </span>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="hidden md:inline-flex h-8 min-w-[240px] items-center gap-2 rounded-md border border-border-200 px-3 text-[13px] text-fg-300">
            <Search size={14} aria-hidden="true" />
            <span>Search products</span>
            <kbd className="ml-auto rounded border border-border-200 px-1.5 py-0.5 font-mono text-[11px] text-fg-300">
              ⌘K
            </kbd>
          </span>
          {/* Cart icon shape with no badge (count unresolved during fallback). */}
          <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-md text-fg-200" />
        </div>
      </div>
    </header>
  );
}
