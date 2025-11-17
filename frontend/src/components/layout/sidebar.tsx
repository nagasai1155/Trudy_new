'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/stores/app-store'
import { NAV_ITEMS } from '@/constants'
import { useState, useTransition, useRef, useEffect } from 'react'
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
  Menu,
  ChevronDown,
  ChevronUp,
  Bell,
  Code,
  Infinity,
  Wand2,
  Search,
  Check,
  Plus,
  LogOut,
  BookOpen,
  FileText,
  TrendingUp,
  Award,
  BarChart2,
} from 'lucide-react'
import { Input } from '@/components/ui/input'

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
  const { sidebarCollapsed, toggleSidebar, mobileMenuOpen, setMobileMenuOpen, modalOpen } = useAppStore()
  const [, startTransition] = useTransition()
  const [clickedPath, setClickedPath] = useState<string | null>(null)
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'workspaces' | 'settings'>('workspaces')
  const workspaceButtonRef = useRef<HTMLDivElement>(null)
  const collapsedWorkspaceButtonRef = useRef<HTMLButtonElement>(null)
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 })

  // Calculate modal position when it opens - position to the right of the clicked button
  useEffect(() => {
    if (workspaceModalOpen) {
      setTimeout(() => {
        const anchor = workspaceButtonRef.current || collapsedWorkspaceButtonRef.current
        if (anchor) {
          const rect = anchor.getBoundingClientRect()
          // Add more top/left margins for visual spacing
          setModalPosition({
            top: Math.max(16, Math.min(rect.top + 20, window.innerHeight - 600 - 16)),
            left: Math.min(rect.right + 8 + 20, window.innerWidth - 320 - 16),
          })
        }
      }, 0)
    }
  }, [workspaceModalOpen])

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
      {!mobileMenuOpen && !modalOpen && (
        <Button
          variant="default"
          size="icon"
          onClick={() => setMobileMenuOpen(true)}
          className="fixed top-2 right-2 z-[100] xl:hidden shadow-lg bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-gray-100 h-11 w-11 rounded-lg p-2.5"
        >
          <Menu className="h-6 w-6 text-white dark:text-black" strokeWidth={2} />
        </Button>
      )}

      <aside
        className={cn(
          'fixed top-0 z-[60] h-screen sidebar-modern transition-all duration-300',
          // Mobile/Tablet (< 1280px): slide in from right
          'w-72 right-0',
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full',
          // Desktop (xl: 1280px+): fixed on left, always visible unless modal is open
          'xl:left-0 xl:right-auto xl:translate-x-0',
          sidebarCollapsed ? 'xl:w-20' : 'xl:w-72',
          // Hide sidebar when modal is open
          modalOpen && 'hidden'
        )}
      >
      <div className="flex h-full flex-col">
          {/* Header */}
          <div className={cn(
            "flex h-16 shrink-0 items-center bg-white dark:bg-black",
            sidebarCollapsed && !mobileMenuOpen ? "justify-center px-2" : "justify-between px-6"
          )}>
            {(!sidebarCollapsed || mobileMenuOpen) && (
              <>
                <button 
                  onClick={() => handleNavigation('/dashboard')} 
                  className="flex items-center space-x-3 group cursor-pointer relative"
                >
                  {/* Logo for both light and dark mode - using CSS to prevent flash */}
                  <Image
                    src="/icons/Frame 1000004887.png"
                    alt="Truedy AI Logo"
                    width={150}
                    height={40}
                    className="h-10 w-auto object-contain transition-all duration-200 group-hover:opacity-80 group-active:scale-95 dark:block hidden"
                    priority
                  />
                  <Image
                    src="/icons/image2.jpg"
                    alt="Truedy AI Logo"
                    width={120}
                    height={32}
                    className="h-8 w-auto object-contain transition-all duration-200 group-hover:opacity-80 group-active:scale-95 dark:hidden block"
                    priority
                  />
                </button>
                
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
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </>
            )}
            
            {sidebarCollapsed && !mobileMenuOpen && (
              <button 
                onClick={() => handleNavigation('/dashboard')} 
                className="flex items-center justify-center group cursor-pointer"
              >
                <Image
                  src="/icons/image1.jpg"
                  alt="Truedy AI"
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-lg object-cover shadow-sm group-hover:shadow-md transition-all duration-200 group-active:scale-95"
                  priority
                />
              </button>
            )}
        </div>


        {/* Navigation */}
          <nav className={cn(
            "flex-1 overflow-y-auto scrollbar-hide",
            sidebarCollapsed && !mobileMenuOpen ? "px-2" : "px-6"
          )}>
            {/* Home - Always first */}
            <div className="mb-6">
              <button
                onClick={() => handleNavigation('/dashboard')}
                className={cn(
                  'sidebar-nav-item w-full',
                  (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) && 'active',
                  sidebarCollapsed && !mobileMenuOpen && 'justify-center px-2'
                )}
              >
                <Home className={cn('sidebar-icon', sidebarCollapsed && !mobileMenuOpen ? '' : 'mr-3')} />
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
                  { title: 'Integrations', href: '/tools', icon: 'Wrench' },
                  { title: 'Voices', href: '/voice-cloning', icon: 'Mic' },
                ].map((item) => {
                  const Icon = iconMap[item.icon]
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                  const isClickedActive = clickedPath === item.href

              return (
                    <button
                      key={item.href}
                      onClick={() => handleNavigation(item.href)}
                  className={cn(
                        'sidebar-nav-item w-full',
                        (isActive || isClickedActive) && 'active',
                        sidebarCollapsed && !mobileMenuOpen && 'justify-center px-2'
                      )}
                    >
                      <Icon className={cn('sidebar-icon', sidebarCollapsed && !mobileMenuOpen ? '' : 'mr-3')} />
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

                  return (
                    <button
                      key={item.href}
                      onClick={() => handleNavigation(item.href)}
                      className={cn(
                        'sidebar-nav-item w-full',
                        (isActive || isClickedActive) && 'active',
                        sidebarCollapsed && !mobileMenuOpen && 'justify-center px-2'
                      )}
                    >
                      <Icon className={cn('sidebar-icon', sidebarCollapsed && !mobileMenuOpen ? '' : 'mr-3')} />
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
            
                  return (
                    <button
                      key={item.href}
                      onClick={() => handleNavigation(item.href)}
                      className={cn(
                        'sidebar-nav-item w-full',
                        (isActive || isClickedActive) && 'active',
                        sidebarCollapsed && !mobileMenuOpen && 'justify-center px-2'
                      )}
                    >
                      <Icon className={cn('sidebar-icon', sidebarCollapsed && !mobileMenuOpen ? '' : 'mr-3')} />
                      {(!sidebarCollapsed || mobileMenuOpen) && <span className="transition-all">{item.title}</span>}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Integrations Section */}
            <div className="mb-6">
              {(!sidebarCollapsed || mobileMenuOpen) && (
                <div className="sidebar-section-title mb-3">Integrations</div>
              )}
              <div className="space-y-1">
                {[
                  { title: 'Contacts', href: '/contacts', icon: 'Users' },
                ].map((item) => {
                  const Icon = iconMap[item.icon]
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                  const isClickedActive = clickedPath === item.href

                  return (
                    <button
                      key={item.href}
                      onClick={() => handleNavigation(item.href)}
                      className={cn(
                        'sidebar-nav-item w-full',
                        (isActive || isClickedActive) && 'active',
                        sidebarCollapsed && !mobileMenuOpen && 'justify-center px-2'
                      )}
                    >
                      <Icon className={cn('sidebar-icon', sidebarCollapsed && !mobileMenuOpen ? '' : 'mr-3')} />
                      {(!sidebarCollapsed || mobileMenuOpen) && <span className="transition-all">{item.title}</span>}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-1">
              {[
                { title: 'Settings', href: '/settings', icon: 'Settings' },
              ].map((item) => {
                const Icon = iconMap[item.icon] || Settings
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                const isClickedActive = clickedPath === item.href
                const isCollapsed = sidebarCollapsed && !mobileMenuOpen

             return (
                  <button
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className={cn(
                      'sidebar-nav-item w-full',
                      (isActive || isClickedActive) && 'active',
                  isCollapsed && 'justify-center px-2'
                )}
              >
                      <Icon className={cn('sidebar-icon', isCollapsed ? '' : 'mr-3')} />
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
              <div className="relative">
                <div 
                  ref={workspaceButtonRef}
                  className="sidebar-workspace-selector cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    setWorkspaceModalOpen(!workspaceModalOpen)
                  }}
                >
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-900 rounded-full flex items-center justify-center">
                    <Infinity className="sidebar-icon-small text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Truedy AI</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">My Workspace</div>
                  </div>
                  <ChevronDown className="sidebar-icon-small text-gray-500 dark:text-gray-500" />
                </div>

                {/* Workspace Modal (moved to root to support collapsed mode as well) */}
              </div>
            </div>
          )}

          {/* Theme Toggle & Expand Button for Collapsed Sidebar */}
          {(sidebarCollapsed && !mobileMenuOpen) && (
            <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-900 flex flex-col items-center gap-4">
              {/* Expand Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
              
              {/* Theme Toggle - should appear above workspace icon in collapsed mode */}
              <ThemeToggle />

              {/* Workspace Button (collapsed) */}
              <button
                ref={collapsedWorkspaceButtonRef}
                onClick={(e) => {
                  e.stopPropagation()
                  const anchor = collapsedWorkspaceButtonRef.current
                  if (anchor) {
                    const rect = anchor.getBoundingClientRect()
                    const computedTop = Math.max(16, Math.min(rect.top + 20, window.innerHeight - 600 - 16))
                    const computedLeft = Math.min(rect.right + 28, window.innerWidth - 320 - 16)
                    setModalPosition({ top: computedTop, left: computedLeft })
                  }
                  setWorkspaceModalOpen(true)
                }}
                className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-800"
                aria-label="Open workspace"
                title="My Workspace"
              >
                <Infinity className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          )}

      </div>
      {/* Global Workspace Modal (always rendered for both expanded and collapsed modes) */}
      {workspaceModalOpen && (
        <>
          <div 
            className="fixed inset-0 z-[100] bg-transparent" 
            onClick={() => setWorkspaceModalOpen(false)}
          />
          <div 
            className="fixed z-[101] w-[320px] h-[600px] bg-white dark:bg-black border-2 border-gray-300 dark:border-gray-700 rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              top: `${modalPosition.top}px`,
              left: `${modalPosition.left}px`,
              maxHeight: '600px'
            }}
          >
            <div className="flex flex-col h-full">
              {/* Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setActiveTab('workspaces')}
                  className={cn(
                    "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                    activeTab === 'workspaces'
                      ? "text-primary border-b-2 border-primary bg-gray-50 dark:bg-gray-900"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  Workspaces
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={cn(
                    "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                    activeTab === 'settings'
                      ? "text-primary border-b-2 border-primary bg-gray-50 dark:bg-gray-900"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  Settings
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto">
                {activeTab === 'workspaces' ? (
                  <>
                    {/* Search */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                          type="text"
                          placeholder="Search workspaces..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 w-full"
                        />
                      </div>
                    </div>

                    {/* Workspace List */}
                    <div className="px-4 py-3">
                      <div className="space-y-2">
                        {/* Current Workspace */}
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                              <Infinity className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">Truedy AI</div>
                              <div className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-2">
                                <Users className="h-3 w-3" />
                                4 people
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 dark:text-gray-500">Free</span>
                            <Check className="h-5 w-5 text-primary" />
                          </div>
                        </div>

                        {/* Create New Workspace Option */}
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Plus className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">Create New Workspace</div>
                            <div className="text-xs text-gray-500 dark:text-gray-500">Start a new workspace</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Button */}
                    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800">
                      <Button className="w-full gap-2">
                        <Plus className="h-4 w-4" />
                        Create New Workspace
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="px-4 py-3 space-y-6">
                    {/* Credits Section */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border-2 border-gray-400 dark:border-gray-600"></div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Credits</h4>
                        </div>
                        <Button size="sm" className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200">
                          Upgrade
                        </Button>
                      </div>
                      <div className="space-y-2 pl-6">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Total</span>
                          <span className="font-medium text-gray-900 dark:text-white">10,000</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Remaining</span>
                          <span className="font-medium text-gray-900 dark:text-white">10,000</span>
                        </div>
                      </div>
                    </div>

                    {/* Settings Section */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Settings</h4>
                      <div className="space-y-1">
                        <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 text-left transition-colors">
                          <span className="text-sm text-gray-700 dark:text-gray-300">Subscription</span>
                        </button>
                        <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 text-left transition-colors">
                          <span className="text-sm text-gray-700 dark:text-gray-300">Pronunciation dictionaries</span>
                        </button>
                        <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 text-left transition-colors">
                          <span className="text-sm text-gray-700 dark:text-gray-300">Theme</span>
                          <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        </button>
                      </div>
                    </div>

                    {/* Payouts Section */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Payouts</h4>
                      <div className="space-y-1">
                        <button className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 text-left transition-colors">
                          <Award className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Become an affiliate</span>
                        </button>
                        <button className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 text-left transition-colors">
                          <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Apply for Impact Program</span>
                        </button>
                        <button className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 text-left transition-colors">
                          <BarChart2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Usage analytics</span>
                        </button>
                      </div>
                    </div>

                    {/* Voiceover Studio Section */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Voiceover Studio</h4>
                      <div className="space-y-1">
                        <button className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 text-left transition-colors">
                          <Code className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">AI Speech Classifier</span>
                        </button>
                        <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 text-left transition-colors">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Docs and resources</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        </button>
                        <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 text-left transition-colors">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Terms and privacy</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        </button>
                      </div>
                    </div>

                    {/* Sign Out */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                      <button 
                        className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 text-left transition-colors"
                        onClick={() => {
                          setWorkspaceModalOpen(false)
                          router.push('/')
                        }}
                      >
                        <LogOut className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </aside>
    </>
  )
}

