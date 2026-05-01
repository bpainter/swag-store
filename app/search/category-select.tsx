"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/lib/api/types";

// Sentinel for "All Categories"; selecting it drops the URL param entirely.
// search-results.tsx treats empty / missing / "all" the same.
const ALL = "";

export function CategorySelect({
  categories,
  defaultValue,
}: {
  categories: Category[];
  defaultValue?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectValue =
    defaultValue && defaultValue.toLowerCase() !== "all" ? defaultValue : ALL;

  // Base UI types onValueChange's argument as `string | null`.
  const onChange = (next: string | null) => {
    const params = new URLSearchParams();
    const q = searchParams.get("q");
    if (q) params.set("q", q);
    if (next && next !== ALL) params.set("category", next);
    const qs = params.toString();
    router.push(qs ? `/search?${qs}` : "/search");
  };

  return (
    <Select value={selectValue} onValueChange={onChange}>
      <SelectTrigger className="data-[size=default]:h-12 w-full text-sm capitalize">
        <SelectValue placeholder="All Categories" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>All Categories</SelectItem>
        {categories.map((c) => (
          <SelectItem key={c.slug} value={c.slug}>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
