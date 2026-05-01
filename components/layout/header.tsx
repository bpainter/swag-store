import Link from "next/link";
import { CartIcon } from "@/components/cart/cart-icon";
import { MobileNav } from "@/components/layout/mobile-nav";

// Categories surfaced in the desktop nav. We only link to slugs that exist in
// the API (t-shirts / mugs / accessories).
const NAV_LINKS: ReadonlyArray<{ label: string; href: string }> = [
  { label: "Shop", href: "/" },
  { label: "Search", href: "/search" },
  { label: "T-Shirts", href: "/search?category=t-shirts" },
  { label: "Mugs", href: "/search?category=mugs" },
  { label: "Accessories", href: "/search?category=accessories" },
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

// Sync server component — no longer fetches the cart. The cart badge is now
// rendered by <CartIcon /> (client), which reads from the CartProvider
// context populated by <CartHydrator /> at the layout level. Header itself
// is purely static chrome, so it prerenders into the PPR shell.
export function Header() {
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

        {/* Right-side cluster: cart icon. The search-trigger pill from the
            design is intentionally hidden — the search input lives on
            /search itself, and the desktop pill duplicated that affordance
            without adding value at the size of this catalog. */}
        <div className="ml-auto flex items-center gap-1.5">
          <CartIcon />
        </div>
      </div>
    </header>
  );
}
