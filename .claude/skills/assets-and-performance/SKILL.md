---
name: assets-and-performance
description: Use this skill any time you're working with images, fonts, third-party scripts, metadata, OG/social images, or measuring web performance in a Next.js 16 app. Triggers include next/image, the Image component, priority, sizes, srcSet, image optimization, remotePatterns, blur placeholders, next/font, font subsetting, font display, FOUT/FOIT, next/script, strategy="afterInteractive", Open Graph images, generateMetadata, opengraph-image.tsx, ImageResponse, twitter-image, viewport.themeColor, theme-color meta tag, generator meta tag, the vswag-cert-v3 generator value, Lighthouse, Core Web Vitals, LCP, CLS, INP, web-vitals package, or any "make it faster" / "improve SEO image" task. Bundles Vercel Academy topics images-next-image, advanced-image-optimization, fonts-with-next-font, core-web-vitals-and-measurement, third-party-scripts, and dynamic-metadata-done-right.
---

# Next.js 16 — Assets, Metadata, and Performance

Three flavors of work bundled here: media (images, fonts, scripts), discoverability (metadata + OG), and measurement (Web Vitals). They're grouped because they all live in the "the page paints fast and looks right" category.

## Images: `next/image`

The default for any image in your app. Don't reach for raw `<img>` unless you have a specific reason.

```tsx
import Image from "next/image";

<Image
  src={product.images[0]}
  alt={product.name}
  width={600}
  height={600}
  priority={isFirstFold}
  sizes="(max-width: 768px) 100vw, 33vw"
/>
```

### What it gives you

- Automatic resizing to the device's pixel ratio
- Modern format (AVIF/WebP) when the browser supports it
- Lazy loading by default
- `loading="lazy"` + `decoding="async"` baked in
- A `width`/`height` you provide so the browser can reserve space → no layout shift

### Critical props

- **`priority`** — set on **only** the LCP image (typically your hero or first product card). It disables lazy loading and adds `<link rel="preload">`. Don't sprinkle it on every image — that defeats the optimization.
- **`sizes`** — tells the browser which rendered size to expect at each breakpoint. Without it, you ship the largest possible variant. Always include it for non-fixed-width images.
- **`fill`** — when you don't know the dimensions and want the image to fill its parent. The parent must be `position: relative`.
- **`placeholder="blur"` + `blurDataURL`** — show a blur while the full image loads. Helps perceived performance. For remote images you must provide `blurDataURL` yourself (small base64 or generated with `plaiceholder`).

### Configuring remote hosts

Any non-local image source has to be allowlisted in `next.config.ts`:

```ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i8qy5y6gxkdgdcv9.public.blob.vercel-storage.com",
        pathname: "/storefront/**",
      },
    ],
  },
};
```

For the Swag Store this is non-negotiable — every product image sits on Vercel Blob.

### Advanced: dynamic image responses

`ImageResponse` (from `next/og`) generates an image on the fly using JSX. The standard use case is OG images (covered below), but it's also useful for badges, dynamic avatars, charts.

## Fonts: `next/font`

Loads fonts at build time, **self-hosts them**, and inlines critical CSS. No FOUT, no FOIT, no third-party request.

### Google Font

```ts
// app/layout.tsx
import { Geist } from "next/font/google";

const geist = Geist({ subsets: ["latin"], display: "swap" });

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={geist.className}>
      <body>{children}</body>
    </html>
  );
}
```

### Local font

```ts
import localFont from "next/font/local";

const customFont = localFont({
  src: "./fonts/CustomFont.woff2",
  display: "swap",
  variable: "--font-custom",
});
```

### Best practices

- **Always set `display: "swap"`** unless you have a specific reason. It avoids invisible text during font load.
- **Subset to what you need** (`subsets: ["latin"]`) — drops 80%+ of font weight for non-Latin scripts you don't ship.
- **Use the CSS variable pattern** (`variable: "--font-..."`) when you need to apply fonts to specific subtrees rather than the whole page.

## Third-party scripts: `next/script`

Most third-party JS belongs in `next/script`, not `<script>`. It gives you control over when the browser parses and executes the script.

```tsx
import Script from "next/script";

<Script
  src="https://example.com/analytics.js"
  strategy="afterInteractive"   // load after the page is interactive
/>
```

### Strategies

| Value | Loads | Use for |
|---|---|---|
| `beforeInteractive` | Before hydration (in `<head>`) | Cookie banners, A/B test code (rare) |
| `afterInteractive` (default) | After hydration | Analytics, tag managers |
| `lazyOnload` | Once browser is idle | Chat widgets, social embeds |
| `worker` | In a web worker (experimental) | Heavyweight scripts |

For most analytics, `afterInteractive` is the right default. You almost never need `beforeInteractive` and it can hurt LCP if misused.

The Swag Store assignment doesn't require third-party scripts, but if you add Vercel Analytics or Speed Insights, use `next/script` or the official `@vercel/analytics` / `@vercel/speed-insights` packages.

## Metadata and Open Graph

Two ways to define metadata: file-based exports or `generateMetadata` for dynamic data.

### Static (root or page level)

```ts
// app/layout.tsx
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: { default: "Vercel Swag Store", template: "%s | Vercel Swag Store" },
  description: "Premium developer apparel and accessories.",
  openGraph: {
    title: "Vercel Swag Store",
    description: "Premium developer apparel and accessories.",
    images: ["/opengraph-image.png"],
    type: "website",
  },
  other: {
    generator: "vswag-cert-v3",   // required by the assignment
  },
};

export const viewport: Viewport = {
  themeColor: "#171719",          // required by the assignment
};
```

### Dynamic (depends on params/data)

```ts
// app/products/[param]/page.tsx
import type { Metadata } from "next";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { param } = await params;
  const product = await getProduct(param);   // cached fetch — same as page uses
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      images: [{ url: product.images[0], width: 600, height: 600 }],
    },
  };
}
```

### Metadata merging

Metadata is merged **shallowly** from root → leaf. A page's `openGraph` wholesale replaces the root's `openGraph` (it doesn't deep-merge). Define what you want on each level explicitly.

### File-based OG images

Drop `opengraph-image.png` (or `.jpg`, `.tsx`) in any segment folder. Next.js auto-wires the metadata:

```
app/
  opengraph-image.png            ← /og-image for /
  products/
    [param]/
      opengraph-image.tsx        ← dynamic OG per product
```

A dynamic `opengraph-image.tsx` exports a default function that returns `ImageResponse(...)`:

```ts
// app/products/[param]/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG({ params }: { params: Promise<{ param: string }> }) {
  const { param } = await params;
  const product = await getProduct(param);
  return new ImageResponse(
    (
      <div style={{ display: "flex", background: "#171719", color: "white", width: "100%", height: "100%", padding: 60 }}>
        <h1 style={{ fontSize: 64 }}>{product.name}</h1>
      </div>
    ),
    { ...size }
  );
}
```

## Core Web Vitals

The three to internalize:

| Metric | What it measures | Good target |
|---|---|---|
| **LCP** (Largest Contentful Paint) | Time to render the largest visible element | ≤ 2.5s |
| **INP** (Interaction to Next Paint) | Latency of user interactions | ≤ 200ms |
| **CLS** (Cumulative Layout Shift) | Unexpected layout shifts | ≤ 0.1 |

### Levers in Next.js

- **LCP**: `priority` on the hero image; `next/font` (no font swap); cache static parts; Suspense around dynamic parts so they don't block first paint.
- **INP**: Push state down (smaller client bundles); don't run heavy JS on the main thread; use Server Actions instead of fetch + state updates.
- **CLS**: Always set `width`/`height` (or `fill` with a sized parent) on images; avoid inserting content above the fold after load (banners, cookie notices).

### Measuring

Vercel's **Speed Insights** is the easiest. Add the package and a snippet in the root layout:

```bash
pnpm add @vercel/speed-insights
```

```tsx
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({ children }) {
  return <html><body>{children}<SpeedInsights /></body></html>;
}
```

For local debugging, use Lighthouse in Chrome DevTools and the `web-vitals` library.

## Picking these for the Swag Store

| Concern | Decision |
|---|---|
| Hero image | `next/image` with `priority` |
| Featured product cards | `next/image`, **no** priority (lazy) |
| First 1–2 cards above fold | `priority` if they're the LCP candidate |
| Product detail image | `next/image` with `priority` |
| Font | One Google font via `next/font` (e.g. Geist) |
| Generator meta | `metadata.other.generator = "vswag-cert-v3"` in root layout |
| Theme color | `viewport.themeColor = "#171719"` in root layout |
| OG image | Static `app/opengraph-image.png` for root; dynamic `app/products/[param]/opengraph-image.tsx` for PDPs |
| Speed Insights | Optional but recommended |

Sources:
- [Image Optimization](https://nextjs.org/docs/app/api-reference/components/image)
- [next/font](https://nextjs.org/docs/app/api-reference/components/font)
- [next/script](https://nextjs.org/docs/app/api-reference/components/script)
- [Metadata and OG images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)
- [generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
