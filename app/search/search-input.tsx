"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

const DEBOUNCE_MS = 300;
const MIN_AUTO_SUBMIT = 3;

export function SearchInput({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState<string>(defaultValue ?? "");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Build /search?q=&category=, preserving any category that's already in
  // the URL. Reading searchParams here rather than via prop keeps category
  // and search state independent — typing doesn't clobber the dropdown.
  const submit = (q: string) => {
    const params = new URLSearchParams();
    const trimmed = q.trim();
    if (trimmed) params.set("q", trimmed);
    const category = searchParams.get("category");
    if (category) params.set("category", category);
    const qs = params.toString();
    router.push(qs ? `/search?${qs}` : "/search");
  };

  // Debounced auto-submit. Each keystroke clears the previous timer and
  // restarts the countdown — only the last quiet 300ms fires the navigation,
  // and only when the trimmed value is long enough to be a useful query.
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (value.trim().length < MIN_AUTO_SUBMIT) return;
    timerRef.current = setTimeout(() => submit(value), DEBOUNCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // submit closes over searchParams + router; both are stable identities
    // from the hooks. We want to re-arm on value change only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const clear = () => {
    setValue("");
    if (timerRef.current) clearTimeout(timerRef.current);
    submit("");
  };

  const hasValue = value.length > 0;

  return (
    <div className="relative">
      <Search
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-300"
      />
      <input
        type="search"
        name="q"
        placeholder='Try "hoodie", "pin", or "mug"…'
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (timerRef.current) clearTimeout(timerRef.current);
            submit(value);
          }
        }}
        className={
          "h-12 w-full rounded-md border border-border-200 bg-bg-100 text-sm text-fg-100 outline-none transition-colors placeholder:text-fg-300 hover:border-border-300 focus:border-blue-700 focus:ring-3 focus:ring-blue-700/20 pl-[42px] " +
          (hasValue ? "pr-[42px]" : "pr-3")
        }
      />
      {hasValue && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-fg-300 hover:bg-color-100 hover:text-fg-100 transition-colors"
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
