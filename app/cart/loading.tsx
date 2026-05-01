// Layout-matching skeleton for /cart navigation. Three line-item rows + a
// subtotal row at the bottom; matches the real CartContents rhythm.
export default function Loading() {
  return (
    <div aria-hidden="true" className="container py-12">
      <div className="skeleton mb-8 h-9 w-40" />

      <ul className="flex flex-col gap-4 list-none p-0 m-0">
        {Array.from({ length: 3 }).map((_, i) => (
          <li
            key={i}
            className="grid grid-cols-[120px_1fr_auto] items-start gap-5 rounded-lg border border-border-100 bg-bg-200 p-4"
          >
            <div className="skeleton h-[120px] w-[120px] rounded-md" />
            <div className="flex min-h-[120px] flex-col justify-between gap-3">
              <div className="flex flex-col gap-2">
                <div className="skeleton h-5 w-3/4" />
                <div className="skeleton h-4 w-24" />
              </div>
              <div className="flex items-center gap-4">
                <div className="skeleton h-9 w-28 rounded-md" />
                <div className="skeleton h-4 w-20" />
              </div>
            </div>
            <div className="skeleton h-5 w-20" />
          </li>
        ))}
      </ul>

      <div className="mt-8 flex justify-end">
        <div className="skeleton h-7 w-48" />
      </div>
    </div>
  );
}
