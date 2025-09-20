import { AuthState, AuthUser } from '@/services/auth'

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string, phone?: string) => Promise<boolean>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<boolean>
  updateProfile: (updates: Partial<AuthUser>) => Promise<boolean>
  isAuthenticated: boolean
  error: string | null
  clearError: () => void
}