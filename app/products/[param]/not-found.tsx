import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div>
      <h1>Product not found</h1>
      <p>
        The product you are looking for does not exist or has been removed.
      </p>
      <Link href="/search">Browse all products</Link>
    </div>
  );
}
