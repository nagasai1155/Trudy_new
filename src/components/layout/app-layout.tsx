'use client'

import { useAppStore } from '@/stores/app-store'
import { cn } from '@/lib/utils'
import { Sidebar } from './sidebar'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { sidebarCollapsed, mobileMenuOpen, setMobileMenuOpen } = useAppStore()

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-black">
      <Sidebar />
      
      {/* Mobile/Tablet menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[50] bg-black/50 dark:bg-black/80 xl:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-300 ease-out w-full',
          // Desktop XL: adjust margin based on sidebar state (1280px+)
          sidebarCollapsed ? 'xl:ml-16' : 'xl:ml-72',
          // Mobile/Tablet: full width (below 1280px)
          'ml-0'
        )}
      >
        <main className="flex-1 overflow-hidden bg-white dark:bg-black">
          <div className="h-full overflow-y-auto overflow-x-hidden px-3 pb-4 pt-2 pr-[52px] sm:px-6 sm:pb-6 sm:pr-6 lg:px-8 xl:pt-[72px] xl:pb-8 xl:pr-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

