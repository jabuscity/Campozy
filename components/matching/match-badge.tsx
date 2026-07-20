import * as React from "react";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

export interface MatchBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

function MatchBadge({ score, size = 'md', showLabel = true, className, ...props }: MatchBadgeProps) {
  const color = getScoreColor(score);
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-bold border",
        sizeClasses[size],
        color.bg,
        color.text,
        color.border,
        className
      )}
      {...props}
    >
      <Star className={cn("fill-current", size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5')} />
      {showLabel && <span>{score}%</span>}
    </div>
  );
}

function getScoreColor(score: number): { bg: string; text: string; border: string } {
  if (score >= 80) return { bg: 'bg-success/15', text: 'text-success', border: 'border-success/20' };
  if (score >= 60) return { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' };
  if (score >= 40) return { bg: 'bg-warning/15', text: 'text-warning', border: 'border-warning/20' };
  return { bg: 'bg-neutral-100', text: 'text-neutral-500', border: 'border-neutral-200' };
}

export { MatchBadge };
