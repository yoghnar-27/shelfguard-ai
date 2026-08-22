"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function ScoreRing({ score, size = 88 }: { score: number; size?: number }) {
  const [drawn, setDrawn] = useState(score)
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) {
      setDrawn(score)
      return
    }
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 700)
      setDrawn(Math.round(score * (1 - Math.pow(1 - p, 3))))
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [score])

  const r = 15.5
  const c = 2 * Math.PI * r
  const offset = c - (drawn / 100) * c

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      aria-label={`Opportunity score ${score} out of 100`}
    >
      <svg viewBox="0 0 36 36" className="-rotate-90" aria-hidden>
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          stroke="oklch(1 0 0 / 0.08)"
          strokeWidth="3.2"
        />
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          stroke="oklch(0.84 0.13 85)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="font-heading text-xl tabular-nums">{drawn}</span>
        <span className="text-[10px] text-muted-foreground">/ 100</span>
      </div>
    </div>
  )
}

export function ScoreMeter({ score }: { score: number }) {
  return <ScoreRing score={score} size={72} />
}
