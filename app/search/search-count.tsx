import { searchProducts } from "@/lib/api/products";
import { isSearchMode, searchLimit } from "./search-results";

// Shares searchProducts' cache entry with <SearchResults>; both run with the
// same params + limit so the cache layer dedupes them to one round-trip.
export async function SearchCount({
  q,
  category,
}: {
  q?: string;
  category?: string;
}) {
  const cleanQ = q?.trim() || undefined;
  const cleanCategory =
    category && category.toLowerCase() !== "all" ? category : undefined;
  const isSearch = isSearchMode(q, category);

  if (!isSearch && !cleanCategory) {
    return <>Showing default selection</>;
  }

  if (!isSearch && cleanCategory) {
    return (
      <>
        Browsing <span className="text-fg-100">{cleanCategory}</span>
      </>
    );
  }

  const { products } = await searchProducts({
    q: cleanQ,
    category: cleanCategory,
    limit: searchLimit(q, category),
  });

  return (
    <>
      <span className="text-fg-100">{products.length}</span>{" "}
      result{products.length === 1 ? "" : "s"}
      {cleanQ && (
        <>
          {" "}for{" "}
          <span className="font-mono text-fg-100">&ldquo;{cleanQ}&rdquo;</span>
        </>
      )}
      {cleanCategory && (
        <>
          {" "}in <span className="text-fg-100">{cleanCategory}</span>
        </>
      )}
    </>
  );
}
