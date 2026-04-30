import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Suspense } from "react";
import { Header, HeaderSkeleton } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PromoRibbon } from "@/components/layout/promo-ribbon";
import { PromoRibbonSkeleton } from "@/components/layout/promo-ribbon-skeleton";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Resolve the absolute origin used to make OG image URLs absolute. Order:
//   1. NEXT_PUBLIC_SITE_URL — explicit override (set this on a custom domain)
//   2. VERCEL_PROJECT_PRODUCTION_URL — Vercel's canonical production hostname
//      (stable across redeploys; only set in production). Bare hostname.
//   3. VERCEL_URL — the per-deployment hostname (preview + production). Bare
//      hostname; we prefix `https://` ourselves.
//   4. http://localhost:3000 — dev fallback
// Without this, Next emits OG URLs against http://localhost:3000 even in
// production builds — social cards would 404 every link to a deployed page.
function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const metadata: Metadata = {
  metadataBase: new URL(resolveSiteUrl()),
  title: {
    default: "Vercel Swag Store",
    template: "%s | Vercel Swag Store",
  },
  description:
    "Premium swag for developers who build with Vercel. From tees to tech gear, represent the tools you love.",
  openGraph: {
    title: "Vercel Swag Store",
    description:
      "Premium swag for developers who build with Vercel. From tees to tech gear, represent the tools you love.",
    type: "website",
    siteName: "Vercel Swag Store",
  },
  other: {
    generator: "vswag-cert-v3",
  },
};

export const viewport: Viewport = {
  themeColor: "#171719",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {/* Promo ribbon sits ABOVE the header — it's the very first visible
            row. Uncached (the API rotates promos per request), so it streams
            via Suspense alongside the header below. */}
        <Suspense fallback={<PromoRibbonSkeleton />}>
          <PromoRibbon />
        </Suspense>
        {/* Header reads the cart cookie, so it's dynamic. Suspense lets the
            rest of the page (footer, route content) keep prerendering while
            the header — including the live cart badge — streams in. */}
        <Suspense fallback={<HeaderSkeleton />}>
          <Header />
        </Suspense>
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
