"use client";

import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { DiscoverySearch } from "./discovery-search";

export function DiscoveryControls({
  query,
}: {
  query: string;
}) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" className="gap-2">
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </Button>

      <DiscoverySearch query={query} />
    </div>
  );
}