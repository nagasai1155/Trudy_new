'use client'

import { getAgentIcon } from '@/lib/agent-icons'

interface AgentIconProps {
  agentId: number
  size?: number
  className?: string
}

export function AgentIcon({ agentId, size = 40, className = '' }: AgentIconProps) {
  const config = getAgentIcon(agentId)
  const { gradient, colors, badgeColor } = config
  
  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`iconGrad-${agentId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            {colors.map((color, idx) => (
              <stop key={idx} offset={`${(idx / (colors.length - 1)) * 100}%`} stopColor={color} />
            ))}
          </linearGradient>
          <linearGradient id={`glowGrad-${agentId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
          </linearGradient>
        </defs>
        
        {/* Main circular icon with gradient */}
        <circle cx="20" cy="20" r="20" fill={`url(#iconGrad-${agentId})`} />
        
        {/* Decorative glow effect */}
        <circle cx="20" cy="20" r="20" fill={`url(#glowGrad-${agentId})`} />
        
        {/* Decorative swirl patterns for texture */}
        <circle cx="16" cy="14" r="8" fill="rgba(255,255,255,0.2)" />
        <circle cx="26" cy="10" r="5" fill="rgba(255,255,255,0.15)" />
        <circle cx="28" cy="24" r="6" fill="rgba(255,255,255,0.1)" />
        <circle cx="12" cy="28" r="4" fill="rgba(255,255,255,0.12)" />
        
        {/* Gear badge in top-right */}
        <g transform="translate(24, 4)">
          <circle cx="8" cy="8" r="8" fill={badgeColor} />
          {/* Checkmark */}
          <path 
            d="M5 8 L7 10 L11 6" 
            stroke="white" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="none"
          />
        </g>
      </svg>
    </div>
  )
}

