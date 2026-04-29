"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/lib/api/types";

export function CategorySelect({
  categories,
  defaultValue,
}: {
  categories: Category[];
  defaultValue?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const onChange = (next: string) => {
    const params = new URLSearchParams();
    const q = searchParams.get("q");
    if (q) params.set("q", q);
    // Empty string ("All categories" option) clears the filter from the URL
    // rather than persisting category="" — keeps the URL clean and shareable.
    if (next) params.set("category", next);
    const qs = params.toString();
    router.push(qs ? `/search?${qs}` : "/search");
  };

  return (
    <select
      name="category"
      defaultValue={defaultValue ?? ""}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">All categories</option>
      {categories.map((c) => (
        <option key={c.slug} value={c.slug}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
