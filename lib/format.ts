export function formatCents(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

// "t-shirts" → "T Shirts". Use the API's Category.name when available; this
// is just a fallback for sites that only have the slug.
export function categoryLabel(slug: string | undefined | null): string {
  if (!slug) return "";
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
