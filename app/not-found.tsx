import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <h1>Page not found</h1>
      <p>That page doesn&apos;t exist.</p>
      <Link href="/">Home</Link>
    </div>
  );
}
