"use client"

import { cn } from "@/lib/utils"

export function LiveIndicator({
  isLive = true,
  hasUrl = true,
  label,
  className,
}: {
  isLive?: boolean
  hasUrl?: boolean
  label?: string
  className?: string
}) {
  if (!isLive) {
    const displayLabel = label || (hasUrl ? "UNABLE TO RETRIEVE" : "NOT PROVIDED")
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider",
          className
        )}
      >
        <span className="size-1.5 rounded-full bg-muted-foreground/60" />
        {displayLabel}
      </span>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[10px] font-bold text-gold uppercase tracking-wider shadow-sm",
        className
      )}
    >
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-2 animate-ping rounded-full bg-gold opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-gold" />
      </span>
      {label || "LIVE"}
    </span>
  )
}
