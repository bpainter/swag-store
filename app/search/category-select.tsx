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

// "" is the sentinel for "All Categories" — when the user picks it, the
// `category` URL param is dropped entirely (clean, shareable URL). This
// matches the search-results normalizer, which already treats an empty /
// missing / "all" (case-insensitive) category as browse mode.
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

  // Inbound URL value → Select value. A bare `category=All` carryover from
  // the previous sentinel still maps to the All option here so old links
  // resolve cleanly.
  const selectValue =
    defaultValue && defaultValue.toLowerCase() !== "all" ? defaultValue : ALL;

  // Base UI's onValueChange surfaces `string | null` — `null` happens on
  // controlled-clear paths we don't trigger, but the type forces us to
  // handle it. Treat null and ALL ("") the same: drop the param.
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
      <SelectTrigger className="data-[size=default]:h-12 w-full text-sm">
        {/* SelectValue renders the active SelectItem's text content — so
            picking "Mugs" from the list puts "Mugs" in the trigger, not the
            "mugs" slug. Placeholder is the same string in case Base UI
            briefly renders it during hydration. */}
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
