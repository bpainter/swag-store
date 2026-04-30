// Server component. No interactivity, no data fetch — pure markup.
const YEAR = new Date().getFullYear();

// Same triangle SVG as the Header; inlined here so the footer doesn't have
// to import a shared helper just for one logo.
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

type FooterLink = { label: string; href: string; external?: boolean };
type FooterColumn = { title: string; links: FooterLink[] };

// Shop and Help link to "#" — the assignment doesn't include those flows, so
// rendering them as placeholder anchors keeps the visual fidelity without
// pretending they navigate anywhere. Vercel column points at the real URLs.
const COLUMNS: FooterColumn[] = [
  {
    title: "Shop",
    links: [
      { label: "Apparel", href: "#" },
      { label: "Headwear", href: "#" },
      { label: "Drinkware", href: "#" },
      { label: "Accessories", href: "#" },
      { label: "Desk", href: "#" },
      { label: "Bags", href: "#" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Order status", href: "#" },
      { label: "Shipping", href: "#" },
      { label: "Returns", href: "#" },
      { label: "Sizing", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Vercel",
    links: [
      { label: "vercel.com", href: "https://vercel.com", external: true },
      { label: "v0.app", href: "https://v0.app", external: true },
      { label: "Geist", href: "https://vercel.com/font", external: true },
      { label: "Next.js", href: "https://nextjs.org", external: true },
      { label: "Careers", href: "https://vercel.com/careers", external: true },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 pt-12 pb-16 border-t border-border-100">
      <div className="container grid grid-cols-1 md:grid-cols-[1.4fr_repeat(3,1fr)] gap-8">
        {/* Column 1: brand + tagline */}
        <div>
          <div className="flex items-center gap-2.5 text-fg-100">
            <TriangleLogo size={20} />
            <span className="text-sm font-medium tracking-tight">Swag</span>
          </div>
          <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-fg-200">
            Goods for the people who ship the web. Designed in NYC. Pressed,
            stitched, and printed in small batches.
          </p>
        </div>

        {/* Columns 2-4: link groups */}
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <div className="eyebrow mb-3.5">{col.title}</div>
            <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
              {col.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    {...(link.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="text-[13px] text-fg-200 hover:text-fg-100 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Sub-footer divider + copyright + legal links */}
      <div className="container mt-12 pt-6 py-6 border-t border-border-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="font-mono text-[12px] text-fg-300">
          © {YEAR} Vercel Inc. — Built on Vercel.
        </div>
        <div className="flex gap-4 text-[12px] text-fg-300">
          <a href="#" className="hover:text-fg-100 transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-fg-100 transition-colors">
            Terms
          </a>
          <a href="#" className="hover:text-fg-100 transition-colors">
            Cookies
          </a>
        </div>
      </div>
    </footer>
  );
}
