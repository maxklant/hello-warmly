// Temporarily disable strict typing for Supabase operations
/* eslint-disable @typescript-eslint/no-explicit-any */

import { supabase as _supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'

// Cast supabase client to bypass typing issues
const supabase = _supabase as any

// Types voor vriendschap functionaliteit
export interface FriendUser {
  id: string
  email: string
  name: string
  username?: string | null
  phone?: string | null
  invite_code: string
  bio?: string | null
  avatar_url?: string | null
  is_public: boolean
  created_at: string
}

export interface Friendship {
  id: string
  requester_id: string
  receiver_id: string
  status: 'pending' | 'accepted' | 'declined' | 'blocked'
  created_at: string
  updated_at: string
}

export interface FriendRequest {
  id: string
  requester: FriendUser
  receiver: FriendUser
  status: string
  created_at: string
}

// ==================== FRIENDSHIP SERVICE ====================

export const friendshipService = {
  // Zoek gebruikers op basis van username of invite code
  async searchUsers(query: string): Promise<FriendUser[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`username.ilike.%${query}%,invite_code.ilike.%${query}%`)
        .neq('id', (await supabase.auth.getUser()).data.user?.id || '')
        .limit(10)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error searching users:', error)
      return []
    }
  },

  // Zoek gebruiker op basis van exacte invite code
  async findUserByInviteCode(inviteCode: string): Promise<FriendUser | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('invite_code', inviteCode)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error finding user by invite code:', error)
      return null
    }
  },

  // Stuur vriendschapsverzoek
  async sendFriendRequest(receiverId: string): Promise<boolean> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')

      // Check of er al een vriendschap bestaat (in beide richtingen)
      const { data: existingFriendship } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(requester_id.eq.${user.user.id},receiver_id.eq.${receiverId}),and(requester_id.eq.${receiverId},receiver_id.eq.${user.user.id})`)
        .single()

      if (existingFriendship) {
        throw new Error('Friendship already exists')
      }

      const { error } = await supabase
        .from('friendships')
        .insert({
          requester_id: user.user.id,
          receiver_id: receiverId,
          status: 'pending'
        })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error sending friend request:', error)
      return false
    }
  },

  // Accepteer vriendschapsverzoek
  async acceptFriendRequest(friendshipId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', friendshipId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error accepting friend request:', error)
      return false
    }
  },

  // Wijs vriendschapsverzoek af
  async declineFriendRequest(friendshipId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'declined' })
        .eq('id', friendshipId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error declining friend request:', error)
      return false
    }
  },

  // Verwijder vriendschap
  async removeFriend(friendshipId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error removing friend:', error)
      return false
    }
  },

  // Blokkeer gebruiker
  async blockUser(friendshipId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'blocked' })
        .eq('id', friendshipId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error blocking user:', error)
      return false
    }
  },

  // Haal vrienden lijst op
  async getFriends(): Promise<FriendUser[]> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          requester:users!friendships_requester_id_fkey(*),
          receiver:users!friendships_receiver_id_fkey(*)
        `)
        .or(`requester_id.eq.${user.user.id},receiver_id.eq.${user.user.id}`)
        .eq('status', 'accepted')

      if (error) throw error

      // Extract de friend data (niet de current user)
      const friends = data?.map((friendship) => {
        if (friendship.requester_id === user.user!.id) {
          return friendship.receiver
        } else {
          return friendship.requester
        }
      }) || []

      return friends
    } catch (error) {
      console.error('Error getting friends:', error)
      return []
    }
  },

  // Haal inkomende vriendschapsverzoeken op
  async getIncomingFriendRequests(): Promise<FriendRequest[]> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          requester:users!friendships_requester_id_fkey(*),
          receiver:users!friendships_receiver_id_fkey(*)
        `)
        .eq('receiver_id', user.user.id)
        .eq('status', 'pending')

      if (error) throw error

      return data?.map((friendship) => ({
        id: friendship.id,
        requester: friendship.requester,
        receiver: friendship.receiver,
        status: friendship.status,
        created_at: friendship.created_at
      })) || []
    } catch (error) {
      console.error('Error getting incoming friend requests:', error)
      return []
    }
  },

  // Haal uitgaande vriendschapsverzoeken op
  async getOutgoingFriendRequests(): Promise<FriendRequest[]> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          requester:users!friendships_requester_id_fkey(*),
          receiver:users!friendships_receiver_id_fkey(*)
        `)
        .eq('requester_id', user.user.id)
        .eq('status', 'pending')

      if (error) throw error

      return data?.map((friendship) => ({
        id: friendship.id,
        requester: friendship.requester,
        receiver: friendship.receiver,
        status: friendship.status,
        created_at: friendship.created_at
      })) || []
    } catch (error) {
      console.error('Error getting outgoing friend requests:', error)
      return []
    }
  },

  // Update gebruikersprofiel
  async updateUserProfile(updates: Partial<FriendUser>): Promise<boolean> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.user.id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating user profile:', error)
      return false
    }
  },

  // Haal huidige gebruikersprofiel op
  async getCurrentUserProfile(): Promise<FriendUser | null> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.user.id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting current user profile:', error)
      return null
    }
  },

  // Check vriendschap status tussen twee gebruikers
  async getFriendshipStatus(userId: string): Promise<Friendship | null> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(requester_id.eq.${user.user.id},receiver_id.eq.${userId}),and(requester_id.eq.${userId},receiver_id.eq.${user.user.id})`)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data || null
    } catch (error) {
      console.error('Error getting friendship status:', error)
      return null
    }
  }
}