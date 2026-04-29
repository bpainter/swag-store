import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Search",
};

// Phase 3a placeholder. Real search UI (form + results + Suspense key on
// searchParams) lands in Phase 3b.
export default function SearchPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1>Search</h1>
      <p>Product search is coming in Phase 3b.</p>
      <Link href="/">Back to home</Link>
    </div>
  );
}
