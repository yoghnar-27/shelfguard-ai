"use client"

import { cn } from "@/lib/utils"

export function BrandLogo({
  className,
  showText = true,
  size = "md",
}: {
  className?: string
  showText?: boolean
  size?: "sm" | "md" | "lg"
}) {
  const iconSize = size === "sm" ? "size-6" : size === "lg" ? "size-10" : "size-8"

  return (
    <div className={cn("flex items-center gap-3 select-none", className)}>
      {/* Minimalist Shopping Bag + Price Signal Icon */}
      <div className={cn("relative flex items-center justify-center shrink-0", iconSize)}>
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-full transition-transform hover:scale-105 duration-300"
        >
          {/* Outer Shopping Bag Silhouette */}
          <rect
            x="7"
            y="13"
            width="26"
            height="22"
            rx="5"
            stroke="currentColor"
            strokeWidth="2"
            className="text-foreground"
            fill="none"
          />
          {/* Shopping Bag Handles forming Upward/Downward Market Curve */}
          <path
            d="M13 13V10C13 7.23858 15.2386 5 18 5H22C24.7614 5 27 7.23858 27 10V13"
            stroke="var(--gold, #D8B08C)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Price Waveform Signal inside Bag */}
          <path
            d="M12 26L17 21L21 24L28 17"
            stroke="var(--teal, #54D6C2)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="28" cy="17" r="2" fill="var(--teal, #54D6C2)" />
        </svg>
      </div>

      {showText ? (
        <div className="min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-heading text-sm font-black tracking-widest text-foreground uppercase">
              SHELF
            </span>
            <span className="font-heading text-sm font-light tracking-widest text-gold uppercase">
              GUARD
            </span>
          </div>
          <span className="text-[9px] font-bold tracking-[0.25em] text-muted-foreground/80 uppercase mt-0.5">
            Retail Intelligence
          </span>
        </div>
      ) : null}
    </div>
  )
}
