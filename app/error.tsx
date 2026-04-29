"use client";

import { useEffect } from "react";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1>Something went wrong</h1>
      {process.env.NODE_ENV === "development" && (
        <p>{error.message}</p>
      )}
      <button onClick={unstable_retry}>Try again</button>
    </div>
  );
}
