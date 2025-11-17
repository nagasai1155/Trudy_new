import { useEffect, useRef, useState } from 'react'

interface UseCountUpOptions {
  end: number
  duration?: number
  decimals?: number
  start?: number
  prefix?: string
  suffix?: string
  separator?: string
}

export function useCountUp({
  end,
  duration = 2000,
  decimals = 0,
  start = 0,
  prefix = '',
  suffix = '',
  separator = ',',
}: UseCountUpOptions) {
  const [count, setCount] = useState(start)
  const frameRef = useRef<number>()
  const startTimeRef = useRef<number>()

  useEffect(() => {
    startTimeRef.current = undefined
    
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
      }

      const progress = timestamp - startTimeRef.current
      const percentage = Math.min(progress / duration, 1)

      // Easing function for smooth animation (easeOutExpo)
      const easeOutExpo = percentage === 1 
        ? 1 
        : 1 - Math.pow(2, -10 * percentage)

      const currentCount = start + (end - start) * easeOutExpo

      setCount(currentCount)

      if (percentage < 1) {
        frameRef.current = requestAnimationFrame(animate)
      } else {
        setCount(end)
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [end, duration, start])

  const formatNumber = (num: number) => {
    const fixed = num.toFixed(decimals)
    const parts = fixed.split('.')
    
    // Add thousand separators
    if (separator) {
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator)
    }
    
    return prefix + parts.join('.') + suffix
  }

  return formatNumber(count)
}

