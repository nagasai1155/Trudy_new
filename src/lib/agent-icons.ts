// Generate unique circular icons for agents like ElevenLabs
// Based on the ElevenLabs design pattern with unique gradients and gear badges

interface IconConfig {
  gradient: string
  colors: string[]
  badgeColor: string
}

// Pre-defined unique color combinations inspired by ElevenLabs
// 50+ unique color combinations for diverse agent icons
const iconTemplates: IconConfig[] = [
  // Oranges & Yellows
  { gradient: 'linear-gradient(135deg, #f97316, #fbbf24, #fbbf24)', colors: ['#f97316', '#fbbf24', '#fb923c'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #eab308, #facc15, #fef08a)', colors: ['#eab308', '#facc15', '#fef08a'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #fbbf24, #fcd34d, #fde68a)', colors: ['#fbbf24', '#fcd34d', '#fde68a'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #ea580c, #fb923c, #fed7aa)', colors: ['#ea580c', '#fb923c', '#fed7aa'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24, #fef3c7)', colors: ['#f59e0b', '#fbbf24', '#fef3c7'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #d97706, #f59e0b, #fde68a)', colors: ['#d97706', '#f59e0b', '#fde68a'], badgeColor: '#374151' },
  
  // Cyans & Blues
  { gradient: 'linear-gradient(135deg, #06b6d4, #22d3ee, #67e8f9)', colors: ['#06b6d4', '#22d3ee', '#7dd3fc'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #06b6d4, #38bdf8, #7dd3fc)', colors: ['#06b6d4', '#38bdf8', '#7dd3fc'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa, #93c5fd)', colors: ['#3b82f6', '#60a5fa', '#93c5fd'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #2563eb, #3b82f6, #60a5fa)', colors: ['#2563eb', '#3b82f6', '#60a5fa'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #1d4ed8, #3b82f6, #93c5fd)', colors: ['#1d4ed8', '#3b82f6', '#93c5fd'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #0ea5e9, #38bdf8, #7dd3fc)', colors: ['#0ea5e9', '#38bdf8', '#7dd3fc'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #0284c7, #0ea5e9, #38bdf8)', colors: ['#0284c7', '#0ea5e9', '#38bdf8'], badgeColor: '#374151' },
  
  // Greens
  { gradient: 'linear-gradient(135deg, #84cc16, #a3e635, #bef264)', colors: ['#84cc16', '#a3e635', '#d9f99d'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #22c55e, #4ade80, #86efac)', colors: ['#22c55e', '#4ade80', '#86efac'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #10b981, #34d399, #6ee7b7)', colors: ['#10b981', '#34d399', '#6ee7b7'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #059669, #10b981, #34d399)', colors: ['#059669', '#10b981', '#34d399'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #86efac, #bbf7d0, #dcfce7)', colors: ['#86efac', '#bbf7d0', '#dcfce7'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #a7f3d0, #d1fae5, #ecfdf5)', colors: ['#a7f3d0', '#d1fae5', '#ecfdf5'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #4ade80, #86efac, #bbf7d0)', colors: ['#4ade80', '#86efac', '#bbf7d0'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #16a34a, #22c55e, #4ade80)', colors: ['#16a34a', '#22c55e', '#4ade80'], badgeColor: '#374151' },
  
  // Teals & Aquas
  { gradient: 'linear-gradient(135deg, #14b8a6, #2dd4bf, #5eead4)', colors: ['#14b8a6', '#2dd4bf', '#5eead4'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #5eead4, #7dd3fc, #a5f3fc)', colors: ['#5eead4', '#7dd3fc', '#a5f3fc'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #0d9488, #14b8a6, #2dd4bf)', colors: ['#0d9488', '#14b8a6', '#2dd4bf'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #0f766e, #14b8a6, #5eead4)', colors: ['#0f766e', '#14b8a6', '#5eead4'], badgeColor: '#374151' },
  
  // Purples & Pinks
  { gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa, #c4b5fd)', colors: ['#8b5cf6', '#a78bfa', '#ddd6fe'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #ec4899, #f472b6, #f9a8d4)', colors: ['#ec4899', '#f472b6', '#f9a8d4'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #f472b6, #fb9cb4, #fbcfe8)', colors: ['#f472b6', '#fb9cb4', '#fce7f3'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #a855f7, #c084fc, #ddd6fe)', colors: ['#a855f7', '#c084fc', '#ddd6fe'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #9333ea, #a855f7, #c084fc)', colors: ['#9333ea', '#a855f7', '#c084fc'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #7c3aed, #8b5cf6, #a78bfa)', colors: ['#7c3aed', '#8b5cf6', '#a78bfa'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #be185d, #ec4899, #f9a8d4)', colors: ['#be185d', '#ec4899', '#f9a8d4'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #db2777, #ec4899, #fbcfe8)', colors: ['#db2777', '#ec4899', '#fbcfe8'], badgeColor: '#374151' },
  
  // Reds & Roses
  { gradient: 'linear-gradient(135deg, #ef4444, #f87171, #fca5a5)', colors: ['#ef4444', '#f87171', '#fca5a5'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #dc2626, #ef4444, #fca5a5)', colors: ['#dc2626', '#ef4444', '#fca5a5'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #f87171, #fca5a5, #fecaca)', colors: ['#f87171', '#fca5a5', '#fecaca'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #e11d48, #f43f5e, #fb7185)', colors: ['#e11d48', '#f43f5e', '#fb7185'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #b91c1c, #dc2626, #f87171)', colors: ['#b91c1c', '#dc2626', '#f87171'], badgeColor: '#374151' },
  
  // Indigos & Violets
  { gradient: 'linear-gradient(135deg, #6366f1, #818cf8, #a5b4fc)', colors: ['#6366f1', '#818cf8', '#a5b4fc'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #4f46e5, #6366f1, #818cf8)', colors: ['#4f46e5', '#6366f1', '#818cf8'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #4338ca, #4f46e5, #6366f1)', colors: ['#4338ca', '#4f46e5', '#6366f1'], badgeColor: '#374151' },
  
  // Multi-Color Combinations
  { gradient: 'linear-gradient(135deg, #f97316, #ec4899, #8b5cf6)', colors: ['#f97316', '#ec4899', '#8b5cf6'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6)', colors: ['#06b6d4', '#3b82f6', '#8b5cf6'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #84cc16, #06b6d4, #3b82f6)', colors: ['#84cc16', '#06b6d4', '#3b82f6'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #eab308, #ef4444, #ec4899)', colors: ['#eab308', '#ef4444', '#ec4899'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #10b981, #14b8a6, #06b6d4)', colors: ['#10b981', '#14b8a6', '#06b6d4'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #f59e0b, #f97316, #ef4444)', colors: ['#f59e0b', '#f97316', '#ef4444'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #a855f7, #ec4899, #f472b6)', colors: ['#a855f7', '#ec4899', '#f472b6'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)', colors: ['#3b82f6', '#8b5cf6', '#ec4899'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #06b6d4, #a855f7, #ec4899)', colors: ['#06b6d4', '#a855f7', '#ec4899'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #eab308, #84cc16, #10b981)', colors: ['#eab308', '#84cc16', '#10b981'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #f97316, #10b981, #06b6d4)', colors: ['#f97316', '#10b981', '#06b6d4'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4, #10b981)', colors: ['#3b82f6', '#06b6d4', '#10b981'], badgeColor: '#374151' },
  
  // Darker Tones
  { gradient: 'linear-gradient(135deg, #1e40af, #3b82f6, #60a5fa)', colors: ['#1e40af', '#3b82f6', '#60a5fa'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #047857, #10b981, #34d399)', colors: ['#047857', '#10b981', '#34d399'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #7c2d12, #ea580c, #fb923c)', colors: ['#7c2d12', '#ea580c', '#fb923c'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #581c87, #9333ea, #c084fc)', colors: ['#581c87', '#9333ea', '#c084fc'], badgeColor: '#374151' },
  
  // Light & Pastels
  { gradient: 'linear-gradient(135deg, #fce7f3, #fbcfe8, #f9a8d4)', colors: ['#fce7f3', '#fbcfe8', '#f9a8d4'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #dbeafe, #bfdbfe, #93c5fd)', colors: ['#dbeafe', '#bfdbfe', '#93c5fd'], badgeColor: '#374151' },
  { gradient: 'linear-gradient(135deg, #d1fae5, #a7f3d0, #6ee7b7)', colors: ['#d1fae5', '#a7f3d0', '#6ee7b7'], badgeColor: '#374151' },
]

/**
 * Generate a unique icon configuration for an agent based on its ID
 * This ensures each agent gets a consistent, unique icon
 */
export function getAgentIcon(agentId: number): IconConfig {
  // Use modulo to cycle through available icons
  return iconTemplates[agentId % iconTemplates.length]
}

/**
 * Get next available icon config for a new agent
 */
export function getNextAgentIcon(existingAgentIds: number[]): IconConfig {
  const maxId = existingAgentIds.length > 0 ? Math.max(...existingAgentIds) : 0
  const nextId = maxId + 1
  return getAgentIcon(nextId)
}

/**
 * Generate an inline SVG for the agent icon with gear badge
 */
export function generateAgentIconSVG(config: IconConfig): string {
  const { gradient, badgeColor } = config
  
  return `
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          ${config.colors.map((color, idx) => 
            `<stop offset="${(idx / (config.colors.length - 1)) * 100}%" stop-color="${color}" />`
          ).join('')}
        </linearGradient>
      </defs>
      
      <!-- Main circular icon with gradient -->
      <circle cx="20" cy="20" r="20" fill="url(#iconGrad)"/>
      
      <!-- Decorative swirl pattern -->
      <circle cx="15" cy="15" r="8" fill="rgba(255,255,255,0.2)"/>
      <circle cx="25" cy="12" r="6" fill="rgba(255,255,255,0.15)"/>
      <circle cx="28" cy="25" r="4" fill="rgba(255,255,255,0.1)"/>
      
      <!-- Gear badge in top-right -->
      <g transform="translate(24, 4)">
        <circle cx="8" cy="8" r="8" fill="${badgeColor}"/>
        <!-- Checkmark -->
        <path d="M5 8 L7 10 L11 6" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </g>
    </svg>
  `
}

