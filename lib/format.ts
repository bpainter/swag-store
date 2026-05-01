export function formatCents(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

// Humanize a category slug ("t-shirts" → "T Shirts", "mugs" → "Mugs"). Used
// as a fallback for places that only have the slug on hand (the breadcrumb
// middle crumb, product card eyebrow, hero overlay). When the API's
// `Category.name` is available (the dropdown), prefer that — categoryLabel
// can't reproduce non-mechanical formatting like "T-Shirts" with the hyphen.
export function categoryLabel(slug: string | undefined | null): string {
  if (!slug) return "";
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
