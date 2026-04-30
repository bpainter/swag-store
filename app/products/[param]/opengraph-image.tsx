import { ImageResponse } from "next/og";
import { getProduct } from "@/lib/api/products";
import { isApi404 } from "@/lib/api/client";

// Per-product OG image, file-routed under [param]/. Overrides the root
// app/opengraph-image.tsx for any route under /products/. The handler
// awaits the same async params as the page itself; getProduct() shares the
// `"use cache"` entry with the page + generateMetadata, so this isn't an
// extra round-trip — we hit the same cache the page already warmed.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Product";

type Props = { params: Promise<{ param: string }> };

const BG = "#171719";
const FG = "#ffffff";
const MUTED = "#a1a1a1";
const BORDER = "#2a2a2a";

// Brand fallback shown when the product 404s — gives the crawler a sensible
// canvas instead of an error or empty card.
function brandFallback() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BG,
          color: FG,
          fontSize: 72,
          fontWeight: 600,
          letterSpacing: "-0.025em",
        }}
      >
        Vercel Swag Store
      </div>
    ),
    { ...size },
  );
}

export default async function OG({ params }: Props) {
  const { param } = await params;

  let product;
  try {
    product = await getProduct(param);
  } catch (err) {
    if (isApi404(err)) return brandFallback();
    throw err;
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          background: BG,
          color: FG,
          padding: 80,
          gap: 56,
        }}
      >
        {/* Left: category eyebrow + product name. flex-column with
            justifyContent: center vertically centers the title block in
            the canvas. */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 24,
              color: MUTED,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 28,
            }}
          >
            {product.category}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            {product.name}
          </div>
        </div>

        {/* Right: 470×470 product image card. Satori fetches the remote
            image and inlines it; the API's blob host is whitelisted in
            next.config.ts already. */}
        <div
          style={{
            display: "flex",
            width: 470,
            height: 470,
            alignSelf: "center",
            overflow: "hidden",
            borderRadius: 16,
            border: `1px solid ${BORDER}`,
          }}
        >
          <img
            src={product.images[0]}
            alt={product.name}
            width={470}
            height={470}
            style={{ objectFit: "cover" }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
