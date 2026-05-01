import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div>
      <h1>Product not found</h1>
      <p>That product isn&apos;t in the catalog.</p>
      <Link href="/search">Browse all products</Link>
    </div>
  );
}
