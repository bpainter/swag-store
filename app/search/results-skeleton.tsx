import { ProductCardSkeleton } from "@/components/product/product-card-skeleton";

export function ResultsSkeleton({ count = 12 }: { count?: number }) {
  return (
    <ul
      aria-hidden="true"
      className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3.5 list-none p-0 m-0"
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </ul>
  );
}
