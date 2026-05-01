import { ProductCardSkeleton } from "@/components/product/product-card-skeleton";

// Layout-matching skeleton for /search navigation. Same outer rhythm as the
// real page (header block → search row → state row → grid).
export default function Loading() {
  return (
    <div aria-hidden="true" className="container pt-10 pb-8">
      <div className="skeleton mb-3 h-3 w-20" />
      <div className="skeleton mb-2 h-10 w-72 max-w-full" />
      <div className="skeleton mb-8 h-5 w-96 max-w-full" />

      <div className="mb-8 grid grid-cols-1 gap-2.5 md:grid-cols-[1fr_200px_auto]">
        <div className="skeleton h-12 w-full" />
        <div className="skeleton h-12 w-full md:w-[200px]" />
        <div className="skeleton h-12 w-full md:w-24" />
      </div>

      <div className="skeleton mb-5 h-4 w-56" />

      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 list-none p-0 m-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </ul>
    </div>
  );
}
