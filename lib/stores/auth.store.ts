import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { authApi, setAuthToken, clearAuthToken } from '@/lib/api'
import type { LoginPayload, RegisterPayload, User } from '@/lib/types'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean

  // Actions
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
  setUser: (user: User) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (payload) => {
        set({ isLoading: true })
        try {
          const response = await authApi.login(payload)
          setAuthToken(response.token)
          set({ user: response.user, isAuthenticated: true })
        } finally {
          set({ isLoading: false })
        }
      },

      register: async (payload) => {
        set({ isLoading: true })
        try {
          const response = await authApi.register(payload)
          setAuthToken(response.token)
          set({ user: response.user, isAuthenticated: true })
        } finally {
          set({ isLoading: false })
        }
      },

      logout: async () => {
        try {
          await authApi.logout()
        } catch {
          // Ignore  token may already be invalid
        } finally {
          clearAuthToken()
          set({ user: null, isAuthenticated: false })
        }
      },

      fetchMe: async () => {
        set({ isLoading: true })
        try {
          const user = await authApi.me()
          set({ user, isAuthenticated: true })
        } catch {
          // Token invalid  clear state
          get().clear()
        } finally {
          set({ isLoading: false })
        }
      },

      setUser: (user) => set({ user, isAuthenticated: true }),

      clear: () => {
        clearAuthToken()
        set({ user: null, isAuthenticated: false })
      },
    }),
    {
      name: 'scheduler-auth',
      storage: createJSONStorage(() => localStorage),
      // Only persist the user object  token is always in the cookie
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
