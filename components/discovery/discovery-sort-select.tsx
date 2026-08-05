"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface DiscoverySortSelectProps {
  currentSort: string;
}

export function DiscoverySortSelect({ currentSort }: DiscoverySortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSortChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "highest_score") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    router.push("?" + params.toString());
  }

  return (
    <select
      name="sort"
      className="bg-transparent border-none focus:ring-0 font-bold text-neutral-900 cursor-pointer"
      defaultValue={currentSort}
      onChange={(e) => handleSortChange(e.target.value)}
    >
      <option value="highest_score">Highest Score</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="latest">Latest</option>
    </select>
  );
}