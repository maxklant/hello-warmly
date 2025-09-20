import React, { useEffect, useState } from 'react'
import { authService, type AuthUser, type AuthState } from '@/services/auth'
import type { Session } from '@supabase/supabase-js'
import { AuthContextType } from './AuthContextType'
import { AuthContext } from './AuthContextDefinition'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Controleer initial auth state
    const initAuth = async () => {
      try {
        const [currentUser, currentSession] = await Promise.all([
          authService.getCurrentUser(),
          authService.getCurrentSession()
        ])

        setUser(currentUser)
        setSession(currentSession)
      } catch (err) {
        console.error('Error initializing auth:', err)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Luister naar auth state changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session)
        
        setSession(session)
        
        if (session?.user) {
          const user = authService.formatUser(session.user)
          setUser(user)
        } else {
          setUser(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const result = await authService.login({ email, password })
      
      if (result.success) {
        return true
      } else {
        setError(result.error || 'Login mislukt')
        return false
      }
    } catch (err) {
      setError('Er ging iets mis bij het inloggen')
      return false
    } finally {
      setLoading(false)
    }
  }

  const register = async (
    email: string, 
    password: string, 
    name: string, 
    phone?: string
  ): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const result = await authService.register({ email, password, name, phone })
      
      if (result.success) {
        return true
      } else {
        setError(result.error || 'Registratie mislukt')
        return false
      }
    } catch (err) {
      setError('Er ging iets mis bij het registreren')
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    setLoading(true)
    
    try {
      await authService.logout()
      setUser(null)
      setSession(null)
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string): Promise<boolean> => {
    setError(null)

    try {
      const result = await authService.resetPassword(email)
      
      if (result.success) {
        return true
      } else {
        setError(result.error || 'Wachtwoord reset mislukt')
        return false
      }
    } catch (err) {
      setError('Er ging iets mis bij het resetten van het wachtwoord')
      return false
    }
  }

  const updateProfile = async (updates: Partial<AuthUser>): Promise<boolean> => {
    setError(null)

    try {
      const result = await authService.updateProfile(updates)
      
      if (result.success && result.user) {
        setUser(result.user)
        return true
      } else {
        setError(result.error || 'Profiel update mislukt')
        return false
      }
    } catch (err) {
      setError('Er ging iets mis bij het updaten van het profiel')
      return false
    }
  }

  const clearError = () => {
    setError(null)
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
    isAuthenticated: !!user && !!session,
    error,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}