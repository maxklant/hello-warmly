// Supabase Database Types
// These types match the database schema for the hello-warmly app including advanced features

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
      mood_log: {
        Row: {
          id: string
          user_id: string
          date: string
          mood_label: string
          mood_emoji: string
          mood_score: number | null
          notes: string | null
          visibility: 'private' | 'contacts' | 'all'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date?: string
          mood_label: string
          mood_emoji: string
          mood_score?: number | null
          notes?: string | null
          visibility?: 'private' | 'contacts' | 'all'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          mood_label?: string
          mood_emoji?: string
          mood_score?: number | null
          notes?: string | null
          visibility?: 'private' | 'contacts' | 'all'
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          message: string
          type: 'text' | 'check-in-reaction' | 'image' | 'system'
          is_read: boolean
          created_at: string
          edited_at: string | null
          content_url: string | null
          media_type: 'text' | 'photo' | 'voice' | 'sticker' | 'video' | null
          duration: number | null
          file_size: number | null
          thumbnail_url: string | null
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          message: string
          type?: 'text' | 'check-in-reaction' | 'image' | 'system'
          is_read?: boolean
          created_at?: string
          edited_at?: string | null
          content_url?: string | null
          media_type?: 'text' | 'photo' | 'voice' | 'sticker' | 'video' | null
          duration?: number | null
          file_size?: number | null
          thumbnail_url?: string | null
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          message?: string
          type?: 'text' | 'check-in-reaction' | 'image' | 'system'
          is_read?: boolean
          edited_at?: string | null
          content_url?: string | null
          media_type?: 'text' | 'photo' | 'voice' | 'sticker' | 'video' | null
          duration?: number | null
          file_size?: number | null
          thumbnail_url?: string | null
        }
      }
      special_events: {
        Row: {
          id: string
          user_id: string
          contact_id: string
          event_type: 'birthday' | 'anniversary' | 'holiday' | 'custom'
          event_name: string
          event_date: string
          recurring: boolean
          reminder_days_before: number
          reminder_sent: boolean
          last_reminded_year: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          contact_id: string
          event_type: 'birthday' | 'anniversary' | 'holiday' | 'custom'
          event_name: string
          event_date: string
          recurring?: boolean
          reminder_days_before?: number
          reminder_sent?: boolean
          last_reminded_year?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          contact_id?: string
          event_type?: 'birthday' | 'anniversary' | 'holiday' | 'custom'
          event_name?: string
          event_date?: string
          recurring?: boolean
          reminder_days_before?: number
          reminder_sent?: boolean
          last_reminded_year?: number | null
          updated_at?: string
        }
      }
      escalation_settings: {
        Row: {
          user_id: string
          days_until_alert: number
          emergency_contact_ids: string[]
          escalation_enabled: boolean
          last_check_in: string | null
          alert_sent: boolean
          updated_at: string
        }
        Insert: {
          user_id: string
          days_until_alert?: number
          emergency_contact_ids?: string[]
          escalation_enabled?: boolean
          last_check_in?: string | null
          alert_sent?: boolean
          updated_at?: string
        }
        Update: {
          user_id?: string
          days_until_alert?: number
          emergency_contact_ids?: string[]
          escalation_enabled?: boolean
          last_check_in?: string | null
          alert_sent?: boolean
          updated_at?: string
        }
      }
      alerts: {
        Row: {
          id: string
          user_id: string
          alert_type: 'reminder' | 'escalation' | 'emergency'
          sent_to: string[]
          message: string
          resolved: boolean
          created_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          alert_type: 'reminder' | 'escalation' | 'emergency'
          sent_to?: string[]
          message: string
          resolved?: boolean
          created_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          alert_type?: 'reminder' | 'escalation' | 'emergency'
          sent_to?: string[]
          message?: string
          resolved?: boolean
          resolved_at?: string | null
        }
      }
      priority_contacts: {
        Row: {
          id: string
          user_id: string
          contact_id: string
          priority_level: 'low' | 'medium' | 'high'
          reminder_frequency: number
          last_contact_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          contact_id: string
          priority_level?: 'low' | 'medium' | 'high'
          reminder_frequency?: number
          last_contact_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          contact_id?: string
          priority_level?: 'low' | 'medium' | 'high'
          reminder_frequency?: number
          last_contact_date?: string | null
          notes?: string | null
          updated_at?: string
        }
      }
      privacy_settings: {
        Row: {
          id: string
          user_id: string
          contact_id: string
          show_status: boolean
          show_mood: boolean
          show_last_seen: boolean
          show_location: boolean
          show_activity_feed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          contact_id: string
          show_status?: boolean
          show_mood?: boolean
          show_last_seen?: boolean
          show_location?: boolean
          show_activity_feed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          contact_id?: string
          show_status?: boolean
          show_mood?: boolean
          show_last_seen?: boolean
          show_location?: boolean
          show_activity_feed?: boolean
          updated_at?: string
        }
      }
      user_points: {
        Row: {
          user_id: string
          points_total: number
          level: number
          current_streak: number
          longest_streak: number
          check_ins_count: number
          messages_sent: number
          friends_added: number
          challenges_completed: number
          last_activity_date: string
          updated_at: string
        }
        Insert: {
          user_id: string
          points_total?: number
          level?: number
          current_streak?: number
          longest_streak?: number
          check_ins_count?: number
          messages_sent?: number
          friends_added?: number
          challenges_completed?: number
          last_activity_date?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          points_total?: number
          level?: number
          current_streak?: number
          longest_streak?: number
          check_ins_count?: number
          messages_sent?: number
          friends_added?: number
          challenges_completed?: number
          last_activity_date?: string
          updated_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          user_id: string
          badge_name: string
          badge_description: string | null
          badge_icon: string | null
          category: 'general' | 'social' | 'wellness' | 'consistency' | 'special'
          points_earned: number
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_name: string
          badge_description?: string | null
          badge_icon?: string | null
          category?: 'general' | 'social' | 'wellness' | 'consistency' | 'special'
          points_earned?: number
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_name?: string
          badge_description?: string | null
          badge_icon?: string | null
          category?: 'general' | 'social' | 'wellness' | 'consistency' | 'special'
          points_earned?: number
          earned_at?: string
        }
      }
      challenges: {
        Row: {
          id: string
          created_by: string | null
          title: string
          description: string | null
          type: 'personal' | 'group' | 'global'
          goal_type: 'check_ins' | 'messages' | 'streak' | 'friends' | 'mood_logs'
          goal_target: number
          participants: string[]
          start_date: string
          end_date: string | null
          is_active: boolean
          reward_points: number
          reward_badge: string | null
          created_at: string
        }
        Insert: {
          id?: string
          created_by?: string | null
          title: string
          description?: string | null
          type: 'personal' | 'group' | 'global'
          goal_type: 'check_ins' | 'messages' | 'streak' | 'friends' | 'mood_logs'
          goal_target: number
          participants?: string[]
          start_date?: string
          end_date?: string | null
          is_active?: boolean
          reward_points?: number
          reward_badge?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          created_by?: string | null
          title?: string
          description?: string | null
          type?: 'personal' | 'group' | 'global'
          goal_type?: 'check_ins' | 'messages' | 'streak' | 'friends' | 'mood_logs'
          goal_target?: number
          participants?: string[]
          start_date?: string
          end_date?: string | null
          is_active?: boolean
          reward_points?: number
          reward_badge?: string | null
        }
      }
      collections: {
        Row: {
          id: string
          user_id: string
          item_type: 'sticker' | 'background' | 'theme' | 'badge' | 'emoji_pack'
          item_name: string
          item_data: Record<string, any> | null
          unlocked_at: string
          unlock_condition: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          item_type: 'sticker' | 'background' | 'theme' | 'badge' | 'emoji_pack'
          item_name: string
          item_data?: Record<string, any> | null
          unlocked_at?: string
          unlock_condition?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          item_type?: 'sticker' | 'background' | 'theme' | 'badge' | 'emoji_pack'
          item_name?: string
          item_data?: Record<string, any> | null
          unlocked_at?: string
          unlock_condition?: string | null
          is_active?: boolean
        }
      }
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
      contextual_nudges: {
        Row: {
          id: string
          user_id: string
          nudge_type: 'reminder' | 'encouragement' | 'suggestion' | 'check_in_prompt'
          message: string
          shown: boolean
          shown_at: string | null
          dismissed: boolean
          dismissed_at: string | null
          conditions: Record<string, any> | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          nudge_type: 'reminder' | 'encouragement' | 'suggestion' | 'check_in_prompt'
          message: string
          shown?: boolean
          shown_at?: string | null
          dismissed?: boolean
          dismissed_at?: string | null
          conditions?: Record<string, any> | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          nudge_type?: 'reminder' | 'encouragement' | 'suggestion' | 'check_in_prompt'
          message?: string
          shown?: boolean
          shown_at?: string | null
          dismissed?: boolean
          dismissed_at?: string | null
          conditions?: Record<string, any> | null
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string
          action_type: 'check_in' | 'message_sent' | 'friend_added' | 'mood_logged' | 'challenge_completed' | 'achievement_earned'
          description: string
          metadata: Record<string, any> | null
          points_earned: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action_type: 'check_in' | 'message_sent' | 'friend_added' | 'mood_logged' | 'challenge_completed' | 'achievement_earned'
          description: string
          metadata?: Record<string, any> | null
          points_earned?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action_type?: 'check_in' | 'message_sent' | 'friend_added' | 'mood_logged' | 'challenge_completed' | 'achievement_earned'
          description?: string
          metadata?: Record<string, any> | null
          points_earned?: number
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

export type MoodLog = Database['public']['Tables']['mood_log']['Row']
export type MoodLogInsert = Database['public']['Tables']['mood_log']['Insert']
export type MoodLogUpdate = Database['public']['Tables']['mood_log']['Update']

export type Message = Database['public']['Tables']['messages']['Row']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']
export type MessageUpdate = Database['public']['Tables']['messages']['Update']

export type SpecialEvent = Database['public']['Tables']['special_events']['Row']
export type SpecialEventInsert = Database['public']['Tables']['special_events']['Insert']
export type SpecialEventUpdate = Database['public']['Tables']['special_events']['Update']

export type EscalationSettings = Database['public']['Tables']['escalation_settings']['Row']
export type EscalationSettingsInsert = Database['public']['Tables']['escalation_settings']['Insert']
export type EscalationSettingsUpdate = Database['public']['Tables']['escalation_settings']['Update']

export type Alert = Database['public']['Tables']['alerts']['Row']
export type AlertInsert = Database['public']['Tables']['alerts']['Insert']
export type AlertUpdate = Database['public']['Tables']['alerts']['Update']

export type PriorityContact = Database['public']['Tables']['priority_contacts']['Row']
export type PriorityContactInsert = Database['public']['Tables']['priority_contacts']['Insert']
export type PriorityContactUpdate = Database['public']['Tables']['priority_contacts']['Update']

export type PrivacySettings = Database['public']['Tables']['privacy_settings']['Row']
export type PrivacySettingsInsert = Database['public']['Tables']['privacy_settings']['Insert']
export type PrivacySettingsUpdate = Database['public']['Tables']['privacy_settings']['Update']

export type UserPoints = Database['public']['Tables']['user_points']['Row']
export type UserPointsInsert = Database['public']['Tables']['user_points']['Insert']
export type UserPointsUpdate = Database['public']['Tables']['user_points']['Update']

export type Achievement = Database['public']['Tables']['achievements']['Row']
export type AchievementInsert = Database['public']['Tables']['achievements']['Insert']
export type AchievementUpdate = Database['public']['Tables']['achievements']['Update']

export type Challenge = Database['public']['Tables']['challenges']['Row']
export type ChallengeInsert = Database['public']['Tables']['challenges']['Insert']
export type ChallengeUpdate = Database['public']['Tables']['challenges']['Update']

export type Collection = Database['public']['Tables']['collections']['Row']
export type CollectionInsert = Database['public']['Tables']['collections']['Insert']
export type CollectionUpdate = Database['public']['Tables']['collections']['Update']

// Extended types that include joined data
export interface FriendshipWithUsers extends Friendship {
  requester: User
  receiver: User
}

export interface MessageWithSender extends Message {
  sender: User
  receiver: User
}

export interface MoodLogWithUser extends MoodLog {
  user: User
}

export interface PriorityContactWithUser extends PriorityContact {
  contact_user: User
}

export interface AchievementWithUser extends Achievement {
  user: User
}