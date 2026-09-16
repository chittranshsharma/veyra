"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

export function SearchInput({ defaultValue }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue ?? "");
  const router = useRouter();
  const [, startTransition] = useTransition();

  const navigate = useDebouncedCallback((q: string) => {
    startTransition(() => {
      if (q.trim()) {
        router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      } else {
        router.push("/search");
      }
    });
  }, 350);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    navigate(e.target.value);
  };

  const clear = () => {
    setValue("");
    router.push("/search");
  };

  return (
    <div className="relative">
      <Search
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
      />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Search movies, TV shows, people..."
        autoFocus
        className="h-14 w-full rounded-2xl border border-border bg-surface pl-12 pr-12 text-base text-text-primary placeholder:text-muted focus:border-accent/60 focus:outline-none"
      />
      {value && (
        <button
          onClick={clear}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted transition hover:text-text-primary"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
