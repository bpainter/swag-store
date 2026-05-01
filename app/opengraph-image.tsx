import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Vercel Swag Store";

// Satori (used by ImageResponse) requires display: flex on any container with
// multiple children.
export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 36,
          background: "#171719",
          color: "white",
        }}
      >
        <svg
          width={140}
          height={(140 * 65) / 76}
          viewBox="0 0 76 65"
          fill="white"
        >
          <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
        </svg>
        <div
          style={{
            fontSize: 88,
            fontWeight: 600,
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
          }}
        >
          Vercel Swag Store
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#a1a1a1",
            letterSpacing: "0.02em",
          }}
        >
          Wear what you ship.
        </div>
      </div>
    ),
    { ...size },
  );
}
