// Suspense fallback for <SearchResults />. Renders five placeholder cards so
// the layout matches the eventual results grid (RESULT_LIMIT = 5) and the
// surrounding form/header don't shift when results stream in.
export function ResultsSkeleton() {
  return (
    <ul aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <li key={i}>
          <div className="h-40 w-full bg-neutral-100 dark:bg-neutral-900" />
          <div className="mt-2 h-4 w-3/4 bg-neutral-100 dark:bg-neutral-900" />
          <div className="mt-1 h-4 w-1/3 bg-neutral-100 dark:bg-neutral-900" />
        </li>
      ))}
    </ul>
  );
}
