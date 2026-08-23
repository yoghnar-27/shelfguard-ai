"use client"

import { useEffect, useState } from "react"
import { formatMoney } from "@/lib/format"

export function AnimatedNumber({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    if (value <= 0) return

    let start = 0
    const duration = 800
    const steps = 20
    const increment = value / steps
    const stepTime = duration / steps

    const timer = setInterval(() => {
      start += increment
      if (start >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.round(start))
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [value])

  if (value <= 0) return <span className={className}>Unavailable</span>


  return <span className={className}>{formatMoney(displayValue)}</span>
}
