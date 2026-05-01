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

// Mirror of the desktop nav (header.tsx). Duplicated to keep this client
// component free of server imports.
const NAV_LINKS: ReadonlyArray<{ label: string; href: string }> = [
  { label: "T-Shirts", href: "/search?category=t-shirts" },
  { label: "Mugs", href: "/search?category=mugs" },
  { label: "Accessories", href: "/search?category=accessories" },
  { label: "Search", href: "/search" }
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

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
