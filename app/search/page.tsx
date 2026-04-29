import type { Metadata } from "next";
import { Suspense } from "react";
import { getCategories } from "@/lib/api/categories";
import { SearchResults } from "./search-results";
import { ResultsSkeleton } from "./results-skeleton";

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

export default async function SearchPage({ searchParams }: Props) {
  const { q, category } = await searchParams;
  const categories = await getCategories();

  return (
    <div>
      <h1>Search</h1>

      {/* Plain GET form — the URL is the state. Refresh or share works for
          free; Phase 5 swaps in a client island for debounced auto-submit. */}
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

      {/* `key` forces React to re-suspend on navigation between queries —
          without it the boundary would be reused and the fallback skipped. */}
      <Suspense
        key={`${q ?? ""}-${category ?? ""}`}
        fallback={<ResultsSkeleton />}
      >
        <SearchResults q={q} category={category} />
      </Suspense>
    </div>
  );
}
