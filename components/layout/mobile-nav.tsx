"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Search } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Same set of categories the desktop nav surfaces — see header.tsx. Keeping
// them in two places risks drift, but co-locating with this client component
// avoids importing anything server-side into the client bundle.
const NAV_LINKS: ReadonlyArray<{ label: string; href: string }> = [
  { label: "Shop", href: "/" },
  { label: "Search", href: "/search" },
  { label: "T-Shirts", href: "/search?category=t-shirts" },
  { label: "Mugs", href: "/search?category=mugs" },
  { label: "Accessories", href: "/search?category=accessories" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  // shadcn's "base-nova" style is built on Base UI (@base-ui/react/dialog),
  // not Radix — Base UI's Dialog.Trigger doesn't support `asChild`, so we
  // let SheetTrigger render its own <button> and pass styling/props through.
  // Each link in the sheet calls setOpen(false) on click to close the sheet
  // before the navigation completes.
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        type="button"
        aria-label="Open menu"
        className="md:hidden inline-flex h-8 w-8 items-center justify-center rounded-md text-fg-200 hover:bg-color-100 hover:text-fg-100 transition-colors"
      >
        <Menu size={18} aria-hidden="true" />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-72 bg-bg-100 text-fg-100 border-r border-border-100"
      >
        <SheetHeader>
          <SheetTitle className="text-fg-100">Menu</SheetTitle>
        </SheetHeader>
        <nav className="mt-2 flex flex-col gap-1 px-4 pb-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={close}
              className="rounded-md px-3 py-2 text-sm text-fg-200 hover:bg-color-100 hover:text-fg-100 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/search"
            onClick={close}
            className="mt-3 inline-flex items-center gap-2 rounded-md border border-border-200 px-3 py-2 text-sm text-fg-300 hover:border-border-300 hover:text-fg-100 transition-colors"
          >
            <Search size={14} aria-hidden="true" />
            Search products
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
