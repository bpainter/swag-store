export function ProductCardSkeleton() {
  return (
    <li className="list-none overflow-hidden rounded-lg border border-border-100 bg-bg-100">
      <div
        className="skeleton aspect-square"
        // Square the corners so the image block sits flush with the card.
        style={{ borderRadius: 0 }}
        aria-hidden="true"
      />
      <div className="flex flex-col gap-2.5 p-[18px]">
        <div className="skeleton h-3 w-20" aria-hidden="true" />
        <div className="skeleton h-4 w-[70%]" aria-hidden="true" />
        <div className="skeleton h-3 w-full" aria-hidden="true" />
        <div className="skeleton mt-1 h-3.5 w-14" aria-hidden="true" />
      </div>
    </li>
  );
}
