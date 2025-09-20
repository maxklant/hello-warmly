import { supabase } from '@/lib/supabase'
import type { User, Session, AuthError } from '@supabase/supabase-js'

// Types voor authenticatie
export interface AuthUser {
  id: string
  email: string
  name?: string
  phone?: string
  email_confirmed_at?: string
  created_at: string
}

export interface AuthState {
  user: AuthUser | null
  session: Session | null
  loading: boolean
}

export interface RegisterData {
  email: string
  password: string
  name: string
  phone?: string
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  user?: AuthUser
  session?: Session
  error?: string
}

// ==================== AUTHENTICATIE SERVICE ====================

export const authService = {
  // Registreer nieuwe gebruiker
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      // Registreer gebruiker met Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            phone: userData.phone || null
          }
        }
      })

      if (error) {
        return {
          success: false,
          error: this.getErrorMessage(error)
        }
      }

      if (!data.user) {
        return {
          success: false,
          error: 'Gebruiker kon niet worden aangemaakt'
        }
      }

      // Maak gebruikersprofiel in de database
      if (data.user && data.session) {
        await this.createUserProfile(data.user, userData)
      }

      return {
        success: true,
        user: this.formatUser(data.user),
        session: data.session
      }
    } catch (error) {
      return {
        success: false,
        error: 'Er ging iets mis bij het registreren'
      }
    }
  },

  // Login gebruiker
  async login(loginData: LoginData): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password
      })

      if (error) {
        return {
          success: false,
          error: this.getErrorMessage(error)
        }
      }

      return {
        success: true,
        user: data.user ? this.formatUser(data.user) : null,
        session: data.session
      }
    } catch (error) {
      return {
        success: false,
        error: 'Er ging iets mis bij het inloggen'
      }
    }
  },

  // Logout gebruiker
  async logout(): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        return {
          success: false,
          error: this.getErrorMessage(error)
        }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: 'Er ging iets mis bij het uitloggen'
      }
    }
  },

  // Huidige gebruiker ophalen
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      return user ? this.formatUser(user) : null
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  },

  // Huidige sessie ophalen
  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      return session
    } catch (error) {
      console.error('Error getting current session:', error)
      return null
    }
  },

  // Wachtwoord reset
  async resetPassword(email: string): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        return {
          success: false,
          error: this.getErrorMessage(error)
        }
      }

      return {
        success: true
      }
    } catch (error) {
      return {
        success: false,
        error: 'Er ging iets mis bij het versturen van de reset email'
      }
    }
  },

  // Wachtwoord updaten
  async updatePassword(newPassword: string): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        return {
          success: false,
          error: this.getErrorMessage(error)
        }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: 'Er ging iets mis bij het updaten van het wachtwoord'
      }
    }
  },

  // Profiel updaten
  async updateProfile(updates: Partial<AuthUser>): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          name: updates.name,
          phone: updates.phone
        }
      })

      if (error) {
        return {
          success: false,
          error: this.getErrorMessage(error)
        }
      }

      // Update ook in users tabel
      if (data.user) {
        await supabase
          .from('users')
          .update({
            name: updates.name,
            phone: updates.phone,
            updated_at: new Date().toISOString()
          } as never)
          .eq('id', data.user.id)
      }

      return {
        success: true,
        user: data.user ? this.formatUser(data.user) : null
      }
    } catch (error) {
      return {
        success: false,
        error: 'Er ging iets mis bij het updaten van het profiel'
      }
    }
  },

  // Luister naar auth state changes
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  },

  // Helper: Maak gebruikersprofiel in database
  async createUserProfile(user: User, userData: RegisterData) {
    try {
      await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email!,
          name: userData.name,
          phone: userData.phone || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as never)
    } catch (error) {
      console.error('Error creating user profile:', error)
    }
  },

  // Helper: Format user object
  formatUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name || '',
      phone: user.user_metadata?.phone || '',
      email_confirmed_at: user.email_confirmed_at || '',
      created_at: user.created_at
    }
  },

  // Helper: Get user-friendly error messages
  getErrorMessage(error: AuthError): string {
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Ongeldige email of wachtwoord'
      case 'User already registered':
        return 'Er bestaat al een account met dit emailadres'
      case 'Password should be at least 6 characters':
        return 'Wachtwoord moet minimaal 6 karakters lang zijn'
      case 'Unable to validate email address: invalid format':
        return 'Ongeldig emailadres format'
      case 'Email not confirmed':
        return 'Email nog niet bevestigd. Controleer je inbox.'
      case 'Invalid email or password':
        return 'Ongeldige email of wachtwoord'
      case 'Email rate limit exceeded':
        return 'Te veel emails verstuurd. Probeer later opnieuw.'
      default:
        return error.message || 'Er ging iets mis'
    }
  }
}