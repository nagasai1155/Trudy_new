'use client'

import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/stores/app-store'
import { cn } from '@/lib/utils'

export function WorkspaceSwitcher() {
  const { currentWorkspace, workspaces, setCurrentWorkspace } = useAppStore()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[200px] justify-between border-gray-300 dark:border-gray-800 shadow-sm hover:shadow">
          <span className="truncate font-semibold text-gray-900 dark:text-white">
            {currentWorkspace?.name || 'Select Workspace'}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px] bg-white dark:bg-black border-gray-200 dark:border-gray-900 shadow-lg">
        <DropdownMenuLabel className="text-gray-900 dark:text-white">Workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-900" />
        {workspaces.length === 0 ? (
          <div className="p-2 text-sm text-gray-500 dark:text-gray-500">
            No workspaces available
          </div>
        ) : (
          workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              onClick={() => setCurrentWorkspace(workspace)}
              className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white"
            >
              <Check
                className={cn(
                  'mr-2 h-4 w-4 text-primary dark:text-primary',
                  currentWorkspace?.id === workspace.id
                    ? 'opacity-100'
                    : 'opacity-0'
                )}
              />
              <span className="truncate">{workspace.name}</span>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-900" />
        <DropdownMenuItem className="text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white">
          <Plus className="mr-2 h-4 w-4" />
          <span>Create Workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

