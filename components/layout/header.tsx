import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span aria-hidden className="inline-block h-5 w-5 bg-black dark:bg-white" style={{ clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }} />
          <span>Swag Store</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <Link href="/search" className="hover:underline">
            Search
          </Link>
        </nav>
      </div>
    </header>
  );
}
