'use client'

import { useState, useEffect } from 'react'
import { Bell, Search, User, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/stores/app-store'
import { getInitials } from '@/lib/utils'
import { WorkspaceSwitcher } from '@/components/layout/workspace-switcher'
import { GlobalSearch } from '@/components/layout/global-search'

export function Header() {
  const { user, unreadCount, toggleMobileMenu } = useAppStore()
  const [searchOpen, setSearchOpen] = useState(false)

  // Global keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-black shadow-sm transition-all duration-300">
      <div className="flex h-16 shrink-0 items-center gap-2 sm:gap-4 px-3 sm:px-4 lg:px-6 border-b border-gray-200 dark:border-gray-900">
        {/* Mobile/Tablet Menu Button - Show below 1280px */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobileMenu}
          className="xl:hidden text-gray-700 dark:text-gray-300"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Workspace Switcher - Hidden on small mobile */}
        <div className="hidden sm:block flex-shrink-0">
          <WorkspaceSwitcher />
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <button
            onClick={() => setSearchOpen(true)}
            className="relative w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 text-sm text-gray-500 dark:text-gray-500 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-900 transition-all duration-300 ease-out hover:border-gray-300 dark:hover:border-gray-800 hover:shadow-sm hover:scale-[1.02] active:scale-[0.98]"
          >
            <Search className="h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-600" />
            <span className="hidden md:block flex-1 text-left truncate">Search agents, campaigns, contacts...</span>
            <span className="md:hidden flex-1 text-left truncate">Search...</span>
            <div className="hidden sm:flex items-center gap-1">
              <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border border-gray-300 dark:border-gray-800 bg-white dark:bg-black px-1.5 font-mono text-[10px] font-medium text-gray-600 dark:text-gray-500">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </button>
        </div>

        {/* Global Search Modal */}
        <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

        {/* Actions - Always aligned to the right */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 flex-shrink-0 ml-auto">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs shadow-sm"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-white dark:bg-black border-gray-200 dark:border-gray-900 shadow-lg">
              <DropdownMenuLabel className="text-gray-900 dark:text-white">Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-900" />
              <div className="max-h-[400px] overflow-y-auto">
                {unreadCount === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No new notifications
                  </div>
                ) : (
                  <div className="space-y-1">
                    <DropdownMenuItem className="hover:bg-gray-50 dark:hover:bg-gray-900">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Campaign Completed</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Your campaign &quot;Summer Outreach&quot; has completed successfully.
                        </p>
                      </div>
                    </DropdownMenuItem>
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                  <AvatarImage src={user?.avatar} alt={user?.name || 'User'} />
                  <AvatarFallback className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary font-semibold text-xs sm:text-sm">
                    {user ? getInitials(user.name) : <User className="h-3 w-3 sm:h-4 sm:w-4" />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-black border-gray-200 dark:border-gray-900 shadow-lg">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-gray-900 dark:text-white">{user?.name || 'User'}</p>
                  <p className="text-xs leading-none text-gray-500 dark:text-gray-500">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-900" />
              <DropdownMenuItem className="text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900">Profile Settings</DropdownMenuItem>
              <DropdownMenuItem className="text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900">Billing</DropdownMenuItem>
              <DropdownMenuItem className="text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900">Team Settings</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-900" />
              <DropdownMenuItem className="text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900">
                <a href="/logout">Log out</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

