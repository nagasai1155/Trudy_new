'use client'

import { useCountUp } from '@/hooks/use-count-up'

interface AnimatedStatProps {
  value: string
  duration?: number
}

export function AnimatedStat({ value, duration = 2000 }: AnimatedStatProps) {
  // Parse the value to extract prefix, number, and suffix
  const parseValue = (val: string) => {
    const match = val.match(/^([^\d]*)([0-9,]+(?:\.\d+)?)(.*)$/)
    
    if (!match) {
      return { prefix: '', number: 0, suffix: '' }
    }

    const [, prefix, numberStr, suffix] = match
    const number = parseFloat(numberStr.replace(/,/g, ''))
    
    return { prefix, number, suffix }
  }

  const { prefix, number, suffix } = parseValue(value)
  
  const animatedValue = useCountUp({
    end: number,
    duration,
    start: 0,
    prefix,
    suffix,
    separator: ',',
    decimals: number % 1 !== 0 ? 1 : 0,
  })

  return <span>{animatedValue}</span>
}

