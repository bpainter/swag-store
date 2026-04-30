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

// Sentinel value for the "All categories" option. We can't use an empty
// string because Base UI's Select treats "" as unset, which conflicts with
// rendering a placeholder vs. the chosen item.
const ALL = "__all__";

export function CategorySelect({
  categories,
  defaultValue,
}: {
  categories: Category[];
  defaultValue?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Base UI's onValueChange surfaces `string | null` — null happens on
  // controlled-clear paths we don't trigger, but the type forces us to
  // handle it. Treat null the same as the "All" sentinel: drop the param.
  const onChange = (next: string | null) => {
    const params = new URLSearchParams();
    const q = searchParams.get("q");
    if (q) params.set("q", q);
    if (next && next !== ALL) params.set("category", next);
    const qs = params.toString();
    router.push(qs ? `/search?${qs}` : "/search");
  };

  return (
    <Select
      value={defaultValue && defaultValue !== "" ? defaultValue : ALL}
      onValueChange={onChange}
    >
      <SelectTrigger className="h-12 w-full text-sm">
        <SelectValue placeholder="All" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>All</SelectItem>
        {categories.map((c) => (
          <SelectItem key={c.slug} value={c.slug}>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
