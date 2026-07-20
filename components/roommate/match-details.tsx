import * as React from "react";
import { MatchBadge } from "@/components/matching/match-badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { MatchResult } from "@/types";

export interface MatchDetailsProps extends React.HTMLAttributes<HTMLDivElement> {
  result: MatchResult;
  labels?: {
    budget?: string;
    lifestyle?: string;
    location?: string;
    academic?: string;
    interests?: string;
    social?: string;
    proximity?: string;
  };
}

function MatchDetails({
  result,
  labels = {},
  className,
  ...props
}: MatchDetailsProps) {
  const defaultLabels = {
    budget: 'Budget Compatibility',
    lifestyle: 'Lifestyle Alignment',
    location: 'Location Proximity',
    academic: 'Academic Overlap',
    interests: 'Shared Interests',
    social: 'Social Fit',
    proximity: 'Proximity',
    ...labels,
  };

  const entries: { key: string; label: string; score: number | undefined }[] = [
    { key: 'budget', label: defaultLabels.budget, score: result.subScores.budget },
    { key: 'lifestyle', label: defaultLabels.lifestyle, score: result.subScores.lifestyle },
    { key: 'location', label: defaultLabels.location, score: result.subScores.location },
    { key: 'academic', label: defaultLabels.academic, score: result.subScores.academic },
    { key: 'interests', label: defaultLabels.interests, score: result.subScores.interests },
    { key: 'social', label: defaultLabels.social, score: result.subScores.social },
    { key: 'proximity', label: defaultLabels.proximity, score: result.subScores.proximity },
  ];

  const validEntries = entries.filter(e => e.score !== undefined);

  return (
    <div className={cn("bg-white rounded-2xl border border-neutral-200 p-6 space-y-4", className)} {...props}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-neutral-900">Compatibility Breakdown</h3>
        <MatchBadge score={Math.round(result.score)} size="md" />
      </div>

      <p className="text-sm text-neutral-600">{result.reasons[0]}</p>

      <div className="space-y-3">
        {validEntries.map(entry => (
          <div key={entry.key} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-neutral-700">{entry.label}</span>
              <span className="font-bold text-neutral-900">{entry.score}/100</span>
            </div>
            <Progress value={entry.score} className="h-2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export { MatchDetails };
