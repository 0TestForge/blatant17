"use client"

import { useTransition } from "react"

export function GlobalLoading() {
  const [isPending] = useTransition()

  if (!isPending) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-sm flex items-center justify-center pointer-events-none">
      {/* Blue spinning loader */}
      <div className="relative w-20 h-20">
        {/* Outer rotating ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-accent border-r-accent/60 animate-spin" style={{ animationDuration: "1.2s" }}></div>

        {/* Middle counter-rotating ring */}
        <div
          className="absolute inset-2 rounded-full border-4 border-transparent border-b-blue-500 border-l-blue-500/60 animate-spin"
          style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
        ></div>

        {/* Inner pulsing ring */}
        <div className="absolute inset-4 rounded-full border-2 border-accent/40 animate-pulse"></div>

        {/* Center glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent/20 via-blue-500/10 to-transparent blur-lg animate-pulse"></div>
      </div>

      {/* Loading text */}
      <div className="absolute bottom-24 text-center">
        <p className="text-muted-foreground text-sm font-medium animate-pulse">Loading...</p>
      </div>
    </div>
  )
}
