import * as React from "react"
import { cn } from "@/lib/utils"
import { getCampozyScoreColor } from "@/types"

interface CampozyScoreProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showLabel?: boolean
}

export function CampozyScore({ 
  score, 
  size = 'md', 
  className,
  showLabel = true
}: CampozyScoreProps) {
  const colorType = getCampozyScoreColor(score)
  
  const colors = {
    green: "text-success border-success bg-success/5",
    blue: "text-primary border-primary bg-primary/5",
    orange: "text-warning border-warning bg-warning/5",
    red: "text-danger border-danger bg-danger/5",
  }

  const sizes = {
    sm: "w-10 h-10 text-xs border-2",
    md: "w-14 h-14 text-sm border-[3px]",
    lg: "w-20 h-20 text-lg border-[4px]",
  }

  return (
    <div className={cn("flex flex-col items-center gap-1.5", className)}>
      <div 
        className={cn(
          "flex items-center justify-center rounded-full font-bold transition-all",
          sizes[size],
          colors[colorType]
        )}
      >
        {Math.round(score)}
      </div>
      {showLabel && (
        <span className={cn(
          "font-semibold uppercase tracking-wider text-[10px]",
          "text-neutral-500"
        )}>
          Campozy Score
        </span>
      )}
    </div>
  )
}
