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
  
  const colorMap = {
    green: { text: "text-success", border: "border-success", bg: "bg-success/5", ring: "#16A34A" },
    blue: { text: "text-primary", border: "border-primary", bg: "bg-primary/5", ring: "#1D4ED8" },
    orange: { text: "text-warning", border: "border-warning", bg: "bg-warning/5", ring: "#F97316" },
    red: { text: "text-danger", border: "border-danger", bg: "bg-danger/5", ring: "#DC2626" },
  }
  const colors = colorMap[colorType]

  const sizes = {
    sm: { circle: 40, stroke: 3, text: "text-xs", label: "text-[10px]" },
    md: { circle: 56, stroke: 4, text: "text-sm", label: "text-[10px]" },
    lg: { circle: 80, stroke: 5, text: "text-lg", label: "text-xs" },
  }
  const s = sizes[size]
  const radius = (s.circle - s.stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className={cn("flex flex-col items-center gap-1.5", className)}>
      <div className="relative" style={{ width: s.circle, height: s.circle }}>
        <svg className="h-full w-full -rotate-90" viewBox={`0 0 ${s.circle} ${s.circle}`}>
          <circle
            cx={s.circle / 2}
            cy={s.circle / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={s.stroke}
            className="text-neutral-200"
          />
          <circle
            cx={s.circle / 2}
            cy={s.circle / 2}
            r={radius}
            fill="none"
            stroke={colors.ring}
            strokeWidth={s.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className={cn("absolute inset-0 flex items-center justify-center font-bold", s.text, colors.text)}>
          {Math.round(score)}
        </div>
      </div>
      {showLabel && (
        <span className={cn("font-semibold uppercase tracking-wider", s.label, "text-neutral-500")}>
          Campozy Score
        </span>
      )}
    </div>
  )
}
