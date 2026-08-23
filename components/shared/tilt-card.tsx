"use client"

import type { ReactNode, MouseEvent } from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function TiltCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)")

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = Number((-(y - centerY) / 20).toFixed(2))
    const rotateY = Number(((x - centerX) / 20).toFixed(2))

    setTransform(
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`
    )
  }

  function handleMouseLeave() {
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)")
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform, transition: "transform 0.15s ease-out" }}
      className={cn("will-change-transform", className)}
    >
      {children}
    </div>
  )
}
