'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200">
        <Sun className="h-5 w-5" />
      </button>
    )
  }

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 transition-all duration-200 hover:scale-105 active:scale-95"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="h-5 w-5 transition-transform duration-300 rotate-0" />
      ) : (
        <Moon className="h-5 w-5 transition-transform duration-300 rotate-0" />
      )}
    </button>
  )
}

