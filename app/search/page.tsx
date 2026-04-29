import type { Metadata } from "next";
import { Suspense } from "react";
import { getCategories } from "@/lib/api/categories";
import { CategorySelect } from "./category-select";
import { ResultsSkeleton } from "./results-skeleton";
import { SearchInput } from "./search-input";
import { SearchResults } from "./search-results";

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

      {/* Two small client islands: the input drives URL state via router.push
          (Enter or 300ms debounce after >=3 chars), and the select pushes
          ?category=… on change. The URL remains the source of truth, so
          refresh and share-link recreate the same view. */}
      <SearchInput defaultValue={q} />
      <CategorySelect categories={categories} defaultValue={category} />

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
