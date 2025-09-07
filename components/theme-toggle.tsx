"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        className="inline-flex items-center justify-center rounded-lg w-9 h-9 bg-surface hover:bg-card border border-border transition-colors duration-fast"
        disabled
      >
        <div className="w-4 h-4 animate-pulse bg-muted rounded" />
      </button>
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="inline-flex items-center justify-center rounded-lg w-9 h-9 bg-surface hover:bg-card border border-border transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-text transition-all" />
      ) : (
        <Moon className="h-4 w-4 text-text transition-all" />
      )}
    </button>
  )
}
