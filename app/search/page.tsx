import type { Metadata } from "next";
import Link from "next/link";
import { searchProducts } from "@/lib/api/products";
import { getCategories } from "@/lib/api/categories";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the Vercel Swag Store catalog by keyword or category.",
  openGraph: {
    title: "Search | Vercel Swag Store",
    description: "Search the Vercel Swag Store catalog by keyword or category.",
  },
};

type Props = {
  // Async searchParams: in Next.js 16 searchParams is a Promise. Must be
  // awaited in a server component (or read with `use()` in a client one).
  searchParams: Promise<{ q?: string; category?: string }>;
};

const RESULT_LIMIT = 5;

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default async function SearchPage({ searchParams }: Props) {
  const { q, category } = await searchParams;

  // Both calls are cached. searchProducts is keyed on its params, so each
  // (q, category) combination gets its own cache entry automatically.
  const [{ products }, categories] = await Promise.all([
    searchProducts({
      q: q || undefined,
      category: category || undefined,
      limit: RESULT_LIMIT,
    }),
    getCategories(),
  ]);

  return (
    <div>
      <h1>Search</h1>

      {/* Plain GET form — the URL is the state. Refresh or share works for
          free; Phase 4 swaps in a client island for debounced auto-submit. */}
      <form method="GET" action="/search">
        <label>
          <span>Query</span>
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search products"
          />
        </label>
        <label>
          <span>Category</span>
          <select name="category" defaultValue={category ?? ""}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Search</button>
      </form>

      {q && products.length === 0 ? (
        <p>No results for &quot;{q}&quot;</p>
      ) : (
        <ul>
          {products.map((p) => (
            <li key={p.id}>
              <Link href={`/products/${p.slug}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.images[0]} alt={p.name} />
                <p>{p.name}</p>
                <p>{usd.format(p.price / 100)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
