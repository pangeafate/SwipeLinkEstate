import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

type ModalKey = 'propertyForm' | 'linkCreator' | 'confirmDialog'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

interface UIState {
  // Theme
  theme: Theme
  
  // Layout
  sidebarOpen: boolean
  
  // Modals
  modals: Record<ModalKey, boolean>
  
  // Notifications
  notifications: Notification[]

  // Actions
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  
  openModal: (modalKey: ModalKey) => void
  closeModal: (modalKey: ModalKey) => void
  closeAllModals: () => void
  
  addNotification: (notification: Notification) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  
  // Reset
  reset: () => void
}

const initialState = {
  theme: 'light' as Theme,
  sidebarOpen: false,
  modals: {
    propertyForm: false,
    linkCreator: false,
    confirmDialog: false,
  },
  notifications: [],
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Theme management
        setTheme: (theme) =>
          set({ theme }, false, 'setTheme'),

        toggleTheme: () =>
          set(
            (state) => ({
              theme: state.theme === 'light' ? 'dark' : 'light',
            }),
            false,
            'toggleTheme'
          ),

        // Sidebar management
        setSidebarOpen: (open) =>
          set({ sidebarOpen: open }, false, 'setSidebarOpen'),

        toggleSidebar: () =>
          set(
            (state) => ({
              sidebarOpen: !state.sidebarOpen,
            }),
            false,
            'toggleSidebar'
          ),

        // Modal management
        openModal: (modalKey) =>
          set(
            (state) => ({
              modals: {
                ...state.modals,
                [modalKey]: true,
              },
            }),
            false,
            'openModal'
          ),

        closeModal: (modalKey) =>
          set(
            (state) => ({
              modals: {
                ...state.modals,
                [modalKey]: false,
              },
            }),
            false,
            'closeModal'
          ),

        closeAllModals: () =>
          set(
            {
              modals: {
                propertyForm: false,
                linkCreator: false,
                confirmDialog: false,
              },
            },
            false,
            'closeAllModals'
          ),

        // Notification management
        addNotification: (notification) =>
          set(
            (state) => ({
              notifications: [...state.notifications, notification],
            }),
            false,
            'addNotification'
          ),

        removeNotification: (id) =>
          set(
            (state) => ({
              notifications: state.notifications.filter(
                (notification) => notification.id !== id
              ),
            }),
            false,
            'removeNotification'
          ),

        clearNotifications: () =>
          set({ notifications: [] }, false, 'clearNotifications'),

        // Reset store to initial state (excluding persisted theme)
        reset: () => {
          const { theme } = get()
          set({ ...initialState, theme }, false, 'reset')
        },
      }),
      {
        name: 'ui-store',
        // Only persist theme and sidebar preferences
        partialize: (state) => ({
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
        }),
      }
    ),
    {
      name: 'ui-store',
    }
  )
)