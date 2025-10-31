import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, Workspace, Notification } from '@/types'

interface AppState {
  // User
  user: User | null
  setUser: (user: User | null) => void
  
  // Workspaces
  currentWorkspace: Workspace | null
  workspaces: Workspace[]
  setCurrentWorkspace: (workspace: Workspace) => void
  setWorkspaces: (workspaces: Workspace[]) => void
  addWorkspace: (workspace: Workspace) => void
  updateWorkspace: (id: string, data: Partial<Workspace>) => void
  removeWorkspace: (id: string) => void
  
  // Notifications
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Notification) => void
  markNotificationRead: (id: string) => void
  markAllRead: () => void
  removeNotification: (id: string) => void
  
  // UI State
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  mobileMenuOpen: boolean
  toggleMobileMenu: () => void
  setMobileMenuOpen: (open: boolean) => void
  modalOpen: boolean
  setModalOpen: (open: boolean) => void
  
  // Theme
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // User
      user: null,
      setUser: (user) => set({ user }),
      
      // Workspaces
      currentWorkspace: null,
      workspaces: [],
      setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
      setWorkspaces: (workspaces) => set({ workspaces }),
      addWorkspace: (workspace) => 
        set((state) => ({ workspaces: [...state.workspaces, workspace] })),
      updateWorkspace: (id, data) =>
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === id ? { ...w, ...data } : w
          ),
          currentWorkspace:
            state.currentWorkspace?.id === id
              ? { ...state.currentWorkspace, ...data }
              : state.currentWorkspace,
        })),
      removeWorkspace: (id) =>
        set((state) => ({
          workspaces: state.workspaces.filter((w) => w.id !== id),
          currentWorkspace:
            state.currentWorkspace?.id === id ? null : state.currentWorkspace,
        })),
      
      // Notifications
      notifications: [],
      unreadCount: 0,
      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        })),
      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        })),
      markAllRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        })),
      removeNotification: (id) =>
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id)
          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: notification?.read
              ? state.unreadCount
              : Math.max(0, state.unreadCount - 1),
          }
        }),
      
      // UI State
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      mobileMenuOpen: false,
      toggleMobileMenu: () =>
        set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
      modalOpen: false,
      setModalOpen: (open) => set({ modalOpen: open }),
      
      // Theme
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'trudy-app-storage',
      partialize: (state) => ({
        currentWorkspace: state.currentWorkspace,
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
)

