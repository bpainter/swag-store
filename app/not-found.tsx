import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link href="/">Home</Link>
    </div>
  );
}
