"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: swap for an observability sink in production.
    console.error(error);
  }, [error]);

  return (
    <div>
      <h1>Something went wrong</h1>
      <p>This page hit an error. Try again, or head back home.</p>
      {process.env.NODE_ENV === "development" && error.message && (
        <pre>{error.message}</pre>
      )}
      <button type="button" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
