import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getCategories } from "@/lib/api/categories";
import { CategorySelect } from "./category-select";
import { ResultsSkeleton } from "./results-skeleton";
import { SearchCount } from "./search-count";
import { SearchInput } from "./search-input";
import { SearchResults, isSearchMode } from "./search-results";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the Vercel Swag Store catalog by keyword or category.",
};

type Props = {
  searchParams: Promise<{ q?: string; category?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q, category } = await searchParams;
  const categories = await getCategories();
  const hasFilter = !!q || !!category;

  // SearchInput already pushes the URL on debounce/Enter; this static Link
  // mirrors that target so the visual Search button works without adding a
  // third client island.
  const buttonHref = hasFilter
    ? `/search?${new URLSearchParams(
        Object.fromEntries(
          Object.entries({ q, category }).filter(([, v]) => v),
        ) as Record<string, string>,
      ).toString()}`
    : "/search";

  return (
    <div className="container pt-10 pb-8">
      <div className="eyebrow mb-3">Search</div>
      <h1
        className="m-0 mb-2 font-semibold"
        style={{
          fontSize: 40,
          lineHeight: 1.05,
          letterSpacing: "-0.035em",
        }}
      >
        Find your swag.
      </h1>
      <p className="mb-8 text-[15px] text-fg-200">
        Search by name, category, or material. Results update as you type.
      </p>

      <div className="mb-8 grid grid-cols-1 gap-2.5 md:grid-cols-[1fr_200px_auto]">
        <SearchInput defaultValue={q} />
        <CategorySelect categories={categories} defaultValue={category} />
        <Link
          href={buttonHref}
          className={buttonVariants({ size: "lg" }) + " h-12 px-5"}
        >
          Search
        </Link>
      </div>

      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 text-[13px] text-fg-200">
          <Suspense
            key={`count-${q ?? ""}-${category ?? ""}`}
            fallback={
              <>
                <span className="spinner" aria-hidden="true" /> Searching…
              </>
            }
          >
            <SearchCount q={q} category={category} />
          </Suspense>
        </div>
        {hasFilter && (
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] text-fg-200 hover:bg-color-100 hover:text-fg-100 transition-colors"
          >
            <X size={12} aria-hidden="true" />
            Clear
          </Link>
        )}
      </div>

      {/* `key` forces re-suspend on navigation between queries. Skeleton
          count: 5 (assignment cap) for active searches, 12 for browse. */}
      <Suspense
        key={`${q ?? ""}-${category ?? ""}`}
        fallback={
          <ResultsSkeleton count={isSearchMode(q, category) ? 5 : 12} />
        }
      >
        <SearchResults q={q} category={category} />
      </Suspense>
    </div>
  );
}
