"use client";

import { useRouter } from "next/navigation";

type CampusFilterProps = {
  campuses: {
    id: string;
    name: string;
  }[];
  campusId?: string;
};

export function CampusFilter({
  campuses,
  campusId,
}: CampusFilterProps) {
  const router = useRouter();

  return (
    <select
      value={campusId || ""}
      onChange={(e) => {
        const params = new URLSearchParams(window.location.search);

        if (e.target.value) {
          params.set("campus", e.target.value);
        } else {
          params.delete("campus");
        }

        router.push(`/discovery?${params.toString()}`);
      }}
      className="border rounded-lg px-4 py-2 bg-white"
    >
      <option value="">Select Campus</option>

      {campuses.map((campus) => (
        <option key={campus.id} value={campus.id}>
          {campus.name}
        </option>
      ))}
    </select>
  );
}