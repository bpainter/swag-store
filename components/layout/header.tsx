import Link from "next/link";
import { CartButton } from "@/components/cart/cart-button";
import { MobileNav } from "@/components/layout/mobile-nav";

// Slugs match real API categories (t-shirts / mugs / accessories).
const NAV_LINKS: ReadonlyArray<{ label: string; href: string }> = [
  { label: "T-Shirts", href: "/search?category=t-shirts" },
  { label: "Mugs", href: "/search?category=mugs" },
  { label: "Accessories", href: "/search?category=accessories" },
  { label: "Search", href: "/search" },
];

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
        <MobileNav />

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

        <div className="ml-auto flex items-center gap-1.5">
          <CartButton />
        </div>
      </div>
    </header>
  );
}
