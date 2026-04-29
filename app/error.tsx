"use client";

import { useEffect } from "react";

// error.tsx MUST be a client component — it uses React's error-boundary
// machinery (componentDidCatch under the hood) which only runs on the client.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production, swap console.error for your observability tool.
    // The user-visible message stays generic; the digest links to server logs.
    console.error(error);
  }, [error]);

  return (
    <div>
      <h1>Something went wrong</h1>
      <p>An unexpected error occurred. Please try again.</p>
      {process.env.NODE_ENV === "development" && error.message && (
        <pre>{error.message}</pre>
      )}
      <button type="button" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
