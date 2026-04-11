import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Helpers ─────────────────────────────────────────────────────────────────────
const hashPassword = (pw) => btoa(encodeURIComponent(pw)) // lightweight obfuscation (local-only)

const getUsers = () => {
  try { return JSON.parse(localStorage.getItem('ac_users') || '[]') } catch { return [] }
}
const saveUsers = (users) => localStorage.setItem('ac_users', JSON.stringify(users))

// ─── Auth Store ───────────────────────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,      // { id, name, email, role, createdAt }
      authError: null,

      /** Create a new account (returns true on success) */
      signup: ({ name, email, password }) => {
        const users = getUsers()
        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
          set({ authError: 'An account with this email already exists.' })
          return false
        }
        const newUser = {
          id:        crypto.randomUUID(),
          name:      name.trim(),
          email:     email.trim().toLowerCase(),
          password:  hashPassword(password),
          role:      'professor',
          createdAt: new Date().toISOString(),
        }
        saveUsers([...users, newUser])
        const { password: _, ...safeUser } = newUser
        set({ user: safeUser, authError: null })
        return true
      },

      /** Sign in to an existing account */
      login: ({ email, password }) => {
        const users = getUsers()
        const found = users.find(
          u => u.email.toLowerCase() === email.trim().toLowerCase()
            && u.password === hashPassword(password)
        )
        if (!found) {
          set({ authError: 'Invalid email or password.' })
          return false
        }
        const { password: _, ...safeUser } = found
        set({ user: safeUser, authError: null })
        return true
      },

      /** Sign out */
      logout: () => set({ user: null, authError: null }),

      clearError: () => set({ authError: null }),
    }),
    {
      name: 'ac-auth-store',
      partialize: (s) => ({ user: s.user }),
    }
  )
)
