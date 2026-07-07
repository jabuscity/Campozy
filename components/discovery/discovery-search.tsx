"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export function DiscoverySearch({ query }: { query: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateSearch(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }

    router.push(`/discovery?${params.toString()}`);
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

      <input
        value={query}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          updateSearch(e.target.value)
        }
        placeholder="Search housing..."
        className="h-10 rounded-md border border-neutral-200 bg-white px-3 pl-10 text-sm outline-none focus:ring-2 focus:ring-neutral-300"
      />
    </div>
  );
}
