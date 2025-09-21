// Supabase Database Types
// These types match the database schema for the hello-warmly app

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          username: string | null
          phone: string | null
          invite_code: string
          bio: string | null
          avatar_url: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          username?: string | null
          phone?: string | null
          invite_code?: string
          bio?: string | null
          avatar_url?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          username?: string | null
          phone?: string | null
          invite_code?: string
          bio?: string | null
          avatar_url?: string | null
          is_public?: boolean
          updated_at?: string
        }
      }
      friendships: {
        Row: {
          id: string
          requester_id: string
          receiver_id: string
          status: 'pending' | 'accepted' | 'declined' | 'blocked'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          requester_id: string
          receiver_id: string
          status?: 'pending' | 'accepted' | 'declined' | 'blocked'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          requester_id?: string
          receiver_id?: string
          status?: 'pending' | 'accepted' | 'declined' | 'blocked'
          updated_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          user_id: string
          contact_user_id: string
          is_muted: boolean
          muted_until: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          contact_user_id: string
          is_muted?: boolean
          muted_until?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          contact_user_id?: string
          is_muted?: boolean
          muted_until?: string | null
          updated_at?: string
        }
      }
      check_ins: {
        Row: {
          id: string
          user_id: string
          status: string
          mood: number | null
          emotions: string[] | null
          current_activity: string | null
          today_activities: string | null
          visibility: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status: string
          mood?: number | null
          emotions?: string[] | null
          current_activity?: string | null
          today_activities?: string | null
          visibility?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          mood?: number | null
          emotions?: string[] | null
          current_activity?: string | null
          today_activities?: string | null
          visibility?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          message: string
          type: 'text' | 'check-in-reaction' | 'image' | 'system'
          check_in_id: string | null
          is_read: boolean
          edited_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          message: string
          type?: 'text' | 'check-in-reaction' | 'image' | 'system'
          check_in_id?: string | null
          is_read?: boolean
          edited_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          message?: string
          type?: 'text' | 'check-in-reaction' | 'image' | 'system'
          check_in_id?: string | null
          is_read?: boolean
          edited_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience types for use in components
export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type Friendship = Database['public']['Tables']['friendships']['Row']
export type FriendshipInsert = Database['public']['Tables']['friendships']['Insert']
export type FriendshipUpdate = Database['public']['Tables']['friendships']['Update']

export type Contact = Database['public']['Tables']['contacts']['Row']
export type ContactInsert = Database['public']['Tables']['contacts']['Insert']
export type ContactUpdate = Database['public']['Tables']['contacts']['Update']

export type CheckIn = Database['public']['Tables']['check_ins']['Row']
export type CheckInInsert = Database['public']['Tables']['check_ins']['Insert']
export type CheckInUpdate = Database['public']['Tables']['check_ins']['Update']

export type Message = Database['public']['Tables']['messages']['Row']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']
export type MessageUpdate = Database['public']['Tables']['messages']['Update']

// Extended types that include joined data
export interface ContactWithUser extends Contact {
  contact_user: User
}

export interface FriendshipWithUsers extends Friendship {
  requester: User
  receiver: User
}

export interface MessageWithSender extends Message {
  sender: User
  receiver: User
}

export interface CheckInWithUser extends CheckIn {
  user: User
}