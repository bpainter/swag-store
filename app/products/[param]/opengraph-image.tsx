import { ImageResponse } from "next/og";
import { getProductOnce } from "@/lib/api/products";
import { categoryLabel } from "@/lib/format";

// getProduct() shares its "use cache" entry with the page + generateMetadata,
// so the per-product OG isn't an extra fetch.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Product";

type Props = { params: Promise<{ param: string }> };

const BG = "#171719";
const FG = "#ffffff";
const MUTED = "#a1a1a1";
const BORDER = "#2a2a2a";

// Shown when the product 404s — keeps the crawler from getting an error.
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
  const product = await getProductOnce(param);
  if (!product) return brandFallback();

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
            {categoryLabel(product.category)}
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
