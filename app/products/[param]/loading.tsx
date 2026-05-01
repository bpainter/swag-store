// Layout-matching skeleton for /products/[param] navigation. Mirrors the
// rhythm of the real PDP so the swap to content doesn't shift the layout.
export default function Loading() {
  return (
    <div aria-hidden="true" className="container pt-8 pb-16">
      {/* Breadcrumb */}
      <div className="skeleton mb-6 h-3 w-48" />

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 items-start">
        {/* Image column */}
        <div className="flex flex-col gap-3 lg:sticky lg:top-20">
          <div className="skeleton aspect-square rounded-xl" />
          <div className="grid grid-cols-4 gap-2">
            <div className="skeleton aspect-square rounded-md" />
            <div className="skeleton aspect-square rounded-md" />
            <div className="skeleton aspect-square rounded-md" />
            <div className="skeleton aspect-square rounded-md" />
          </div>
        </div>

        {/* Info column */}
        <div className="flex flex-col gap-3.5">
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-10 w-3/4" />
          <div className="skeleton h-7 w-32" />
          <div className="skeleton h-6 w-40" />
          <div className="skeleton h-20 w-full max-w-[520px]" />
          <div className="skeleton mt-2 h-11 w-full" />
        </div>
      </div>
    </div>
  );
}
