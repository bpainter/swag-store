import Link from "next/link";
import { searchProducts } from "@/lib/api/products";

const RESULT_LIMIT = 5;

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// Server component, called from inside <Suspense> on /search. searchProducts
// is cached and keyed on its params, so each (q, category) combination caches
// independently — but each navigation still suspends until the cached entry
// (or fresh fetch) resolves, hence the boundary.
export async function SearchResults({
  q,
  category,
}: {
  q?: string;
  category?: string;
}) {
  const { products } = await searchProducts({
    q: q || undefined,
    category: category || undefined,
    limit: RESULT_LIMIT,
  });

  if (q && products.length === 0) {
    return <p>No results for &quot;{q}&quot;</p>;
  }

  return (
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
  );
}
