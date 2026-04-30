import { ImageResponse } from "next/og";

// Next.js metadata file convention. Placing this at app/ generates the OG
// image for every route that doesn't override it (the PDP overrides via its
// own opengraph-image.tsx). The compiled output is served at
// `/opengraph-image.png` — the same path app/page.tsx references in its
// metadata, so the social-card pipeline lights up automatically.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Vercel Swag Store — premium swag for developers";

// ImageResponse runs Satori under the hood; every container with multiple
// children must declare `display: flex` (or block) explicitly or the layout
// engine errors out. We keep the layout deliberately simple: dark canvas,
// white triangle, wordmark — no font fetch, no remote assets.
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
