import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Suspense } from "react";
import { CartHydrator } from "@/components/cart/cart-hydrator";
import { CartProvider } from "@/components/cart/cart-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PromoRibbon } from "@/components/layout/promo-ribbon";
import { PromoRibbonSkeleton } from "@/components/layout/promo-ribbon-skeleton";
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Origin used to absolutize OG image URLs. Without metadataBase, Next falls
// back to localhost — social cards on production would 404.
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
    "Goods for the people who ship the web. Tees, hoodies, and tech accessories.",
  openGraph: {
    title: "Vercel Swag Store",
    description:
      "Goods for the people who ship the web. Tees, hoodies, and tech accessories.",
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
        <CartProvider>
          {/* CartHydrator (server) is the only dynamic leaf at the layout
              level — its Suspense boundary keeps the rest of the shell
              prerenderable. */}
          <Suspense fallback={null}>
            <CartHydrator />
          </Suspense>
          <Suspense fallback={<PromoRibbonSkeleton />}>
            <PromoRibbon />
          </Suspense>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
