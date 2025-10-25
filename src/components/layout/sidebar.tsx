'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/stores/app-store'
import { NAV_ITEMS } from '@/constants'
import { useState, useTransition } from 'react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import {
  Home,
  Bot,
  FolderOpen,
  Wrench,
  Mic,
  MessageSquare,
  Phone,
  BarChart3,
  Smartphone,
  PhoneOutgoing,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Menu,
  ChevronDown,
  ChevronUp,
  Bell,
  Code,
  Infinity,
  Wand2,
} from 'lucide-react'

const iconMap: Record<string, any> = {
  Home,
  Bot,
  Wand2,
  FolderOpen,
  Wrench,
  Mic,
  MessageSquare,
  Phone,
  BarChart3,
  Smartphone,
  PhoneOutgoing,
  Users,
  Settings,
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { sidebarCollapsed, toggleSidebar, mobileMenuOpen, setMobileMenuOpen } = useAppStore()
  const [isPending, startTransition] = useTransition()
  const [clickedPath, setClickedPath] = useState<string | null>(null)

  const handleNavigation = (href: string) => {
    // Optimistic UI - immediately show as active
    setClickedPath(href)
    
    // Close mobile menu when a link is clicked
    if (mobileMenuOpen) {
      setMobileMenuOpen(false)
    }

    // Use transition for smooth navigation
    startTransition(() => {
      router.push(href)
      // Clear clicked path after navigation
      setTimeout(() => setClickedPath(null), 300)
    })
  }

  return (
    <>
      {/* Mobile Menu Button - Right side for mobile */}
      {!mobileMenuOpen && (
        <Button
          variant="default"
          size="icon"
          onClick={() => setMobileMenuOpen(true)}
          className="fixed top-4 right-4 z-50 xl:hidden shadow-lg bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-gray-100"
        >
          <Menu className="h-5 w-5 text-white dark:text-black" />
        </Button>
      )}

      <aside
        className={cn(
          'fixed top-0 z-40 h-screen sidebar-modern transition-all duration-300',
          // Mobile/Tablet (< 1280px): slide in from right
          'w-72 right-0',
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full',
          // Desktop (xl: 1280px+): fixed on left, always visible
          'xl:left-0 xl:right-auto xl:translate-x-0',
          sidebarCollapsed ? 'xl:w-16' : 'xl:w-72'
        )}
      >
      <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 shrink-0 items-center px-6 justify-between bg-white dark:bg-black">
            <div className="flex items-center space-x-3 flex-1">
            {(!sidebarCollapsed || mobileMenuOpen) && (
               <button 
                onClick={() => handleNavigation('/dashboard')} 
                  className="flex items-center space-x-3 group cursor-pointer"
              >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black dark:bg-white shadow-sm group-hover:shadow-md transition-all duration-200 group-active:scale-95">
                    <Bot className="h-4 w-4 text-white dark:text-black" />
                </div>
                  <span className="text-lg font-bold text-black dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">Truedy AI</span>
              </button>
            )}
            {sidebarCollapsed && !mobileMenuOpen && (
              <button 
                onClick={() => handleNavigation('/dashboard')} 
                className="flex items-center justify-center w-full group cursor-pointer"
              >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black dark:bg-white shadow-sm group-hover:shadow-md transition-all duration-200 group-active:scale-95">
                    <Bot className="h-4 w-4 text-white dark:text-black" />
                </div>
              </button>
            )}
          </div>
          
          {/* Close button for mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(false)}
              className="xl:hidden text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </Button>

            {/* Collapse button for desktop */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="hidden xl:flex text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </Button>
        </div>


        {/* Navigation */}
          <nav className="flex-1 overflow-y-auto scrollbar-hide px-6">
            {/* Home - Always first */}
            <div className="mb-6">
              <button
                onClick={() => handleNavigation('/dashboard')}
                disabled={isPending && clickedPath === '/dashboard'}
                className={cn(
                  'sidebar-nav-item w-full',
                  (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) && 'active',
                  sidebarCollapsed && !mobileMenuOpen && 'justify-center px-2'
                )}
              >
                {isPending && clickedPath === '/dashboard' ? (
                  <Loader2 className={cn('animate-spin sidebar-icon', sidebarCollapsed && !mobileMenuOpen ? '' : 'mr-3')} />
                ) : (
                  <Home className={cn('sidebar-icon', sidebarCollapsed && !mobileMenuOpen ? '' : 'mr-3')} />
                )}
                {(!sidebarCollapsed || mobileMenuOpen) && <span className="transition-all">Home</span>}
              </button>
            </div>

            {/* Build Section */}
            <div className="mb-6">
              {(!sidebarCollapsed || mobileMenuOpen) && (
                <div className="sidebar-section-title mb-3">Build</div>
              )}
              <div className="space-y-1">
                {[
                  { title: 'Agents', href: '/agents', icon: 'Wand2' },
                  { title: 'Knowledge Base', href: '/rag', icon: 'FolderOpen' },
                  { title: 'Tools', href: '/tools', icon: 'Wrench' },
                  { title: 'Voices', href: '/voice-cloning', icon: 'Mic' },
                ].map((item) => {
                  const Icon = iconMap[item.icon]
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                  const isClickedActive = clickedPath === item.href
                  const isNavigating = isPending && isClickedActive

              return (
                    <button
                      key={item.href}
                      onClick={() => handleNavigation(item.href)}
                      disabled={isNavigating}
                  className={cn(
                        'sidebar-nav-item w-full',
                        (isActive || isClickedActive) && 'active',
                        isNavigating && 'opacity-70 cursor-wait',
                        sidebarCollapsed && !mobileMenuOpen && 'justify-center px-2'
                      )}
                    >
                      {isNavigating ? (
                        <Loader2 className={cn('animate-spin sidebar-icon', sidebarCollapsed && !mobileMenuOpen ? '' : 'mr-3')} />
                      ) : (
                        <Icon className={cn('sidebar-icon', sidebarCollapsed && !mobileMenuOpen ? '' : 'mr-3')} />
                      )}
                      {(!sidebarCollapsed || mobileMenuOpen) && <span className="transition-all">{item.title}</span>}
                    </button>
                  )
                })}
              </div>
                </div>

            {/* Evaluate Section */}
            <div className="mb-6">
              {(!sidebarCollapsed || mobileMenuOpen) && (
                <div className="sidebar-section-title mb-3">Evaluate</div>
              )}
              <div className="space-y-1">
                {[
                  { title: 'Calls', href: '/calls', icon: 'Phone' },
                  { title: 'Analytics', href: '/analytics', icon: 'BarChart3' },
                ].map((item) => {
                  const Icon = iconMap[item.icon]
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                  const isClickedActive = clickedPath === item.href
                  const isNavigating = isPending && isClickedActive

                  return (
                    <button
                      key={item.href}
                      onClick={() => handleNavigation(item.href)}
                      disabled={isNavigating}
                      className={cn(
                        'sidebar-nav-item w-full',
                        (isActive || isClickedActive) && 'active',
                        isNavigating && 'opacity-70 cursor-wait',
                        sidebarCollapsed && !mobileMenuOpen && 'justify-center px-2'
                      )}
                    >
                      {isNavigating ? (
                        <Loader2 className={cn('animate-spin sidebar-icon', sidebarCollapsed && !mobileMenuOpen ? '' : 'mr-3')} />
                      ) : (
                        <Icon className={cn('sidebar-icon', sidebarCollapsed && !mobileMenuOpen ? '' : 'mr-3')} />
                      )}
                      {(!sidebarCollapsed || mobileMenuOpen) && <span className="transition-all">{item.title}</span>}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Telephony Section */}
            <div className="mb-6">
              {(!sidebarCollapsed || mobileMenuOpen) && (
                <div className="sidebar-section-title mb-3">Telephony</div>
              )}
              <div className="space-y-1">
                {[
                  { title: 'Phone Numbers', href: '/phone-numbers', icon: 'Smartphone' },
                  { title: 'Outbound', href: '/campaigns', icon: 'PhoneOutgoing' },
                ].map((item) => {
            const Icon = iconMap[item.icon]
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const isClickedActive = clickedPath === item.href
            const isNavigating = isPending && isClickedActive
            
                  return (
                    <button
                      key={item.href}
                      onClick={() => handleNavigation(item.href)}
                      disabled={isNavigating}
                      className={cn(
                        'sidebar-nav-item w-full',
                        (isActive || isClickedActive) && 'active',
                        isNavigating && 'opacity-70 cursor-wait',
                        sidebarCollapsed && !mobileMenuOpen && 'justify-center px-2'
                      )}
                    >
                      {isNavigating ? (
                        <Loader2 className={cn('animate-spin sidebar-icon', sidebarCollapsed && !mobileMenuOpen ? '' : 'mr-3')} />
                      ) : (
                        <Icon className={cn('sidebar-icon', sidebarCollapsed && !mobileMenuOpen ? '' : 'mr-3')} />
                      )}
                      {(!sidebarCollapsed || mobileMenuOpen) && <span className="transition-all">{item.title}</span>}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Individual Items */}
            <div className="space-y-1">
              {[
                { title: 'Settings', href: '/settings', icon: 'Settings' },
              ].map((item) => {
                const Icon = iconMap[item.icon] || Settings
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                const isClickedActive = clickedPath === item.href
                const isNavigating = isPending && isClickedActive
                const isCollapsed = sidebarCollapsed && !mobileMenuOpen

             return (
                  <button
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                disabled={isNavigating}
                className={cn(
                      'sidebar-nav-item w-full',
                      (isActive || isClickedActive) && 'active',
                  isCollapsed && 'justify-center px-2',
                      isNavigating && 'opacity-70 cursor-wait'
                )}
              >
                {isNavigating ? (
                      <Loader2 className={cn('animate-spin sidebar-icon', isCollapsed ? '' : 'mr-3')} />
                ) : (
                      <Icon className={cn('sidebar-icon', isCollapsed ? '' : 'mr-3')} />
                )}
                {!isCollapsed && <span className="transition-all">{item.title}</span>}
                  </button>
            )
          })}
            </div>
        </nav>


          {/* Theme Toggle & Workspace Selector */}
          {(!sidebarCollapsed || mobileMenuOpen) && (
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-900 space-y-4">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Theme</span>
                <ThemeToggle />
              </div>

              {/* Workspace Selector */}
              <div className="sidebar-workspace-selector">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-900 rounded-full flex items-center justify-center">
                  <Infinity className="sidebar-icon-small text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Truedy AI</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">My Workspace</div>
                </div>
                <ChevronDown className="sidebar-icon-small text-gray-500 dark:text-gray-500" />
              </div>
            </div>
          )}

          {/* Theme Toggle for Collapsed Sidebar */}
          {(sidebarCollapsed && !mobileMenuOpen) && (
            <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-900 flex items-center justify-center">
              <ThemeToggle />
            </div>
          )}

      </div>
    </aside>
    </>
  )
}

