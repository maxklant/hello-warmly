import { supabase } from '@/lib/supabase'

// Simple types to avoid TypeScript errors until database is properly set up
interface DbUser {
  id: string
  email: string
  name: string
  phone?: string
  created_at: string
  updated_at: string
}

interface DbContact {
  id: string
  user_id: string
  contact_user_id: string
  is_muted: boolean
  muted_until?: string
  created_at: string
  updated_at: string
}

interface DbCheckIn {
  id: string
  user_id: string
  status: string
  mood?: number
  emotions?: string[]
  current_activity?: string
  today_activities?: string
  visibility: string
  created_at: string
}

interface DbMessage {
  id: string
  sender_id: string
  receiver_id: string
  message: string
  type: string
  check_in_id?: string
  created_at: string
}

// ==================== USER SERVICES ====================

export const userService = {
  // Get current user profile
  async getCurrentUser(): Promise<DbUser | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error
    return data as DbUser
  },

  // Create or update user profile
  async upsertProfile( userData: Partial<DbUser>): Promise<DbUser> {
    const { data, error } = await supabase
      .from('users')
      .upsert(userData as never)
      .select()
      .single()

    if (error) throw error
    return data as DbUser
  },

  // Update user profile
  async updateProfile(id: string, updates: Partial<DbUser>): Promise<DbUser> {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() } as never)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as DbUser
  },

  // Search users by email or name
  async searchUsers(query: string): Promise<DbUser[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`email.ilike.%${query}%,name.ilike.%${query}%`)
      .limit(10)

    if (error) throw error
    return (data || []) as DbUser[]
  }
}

// ==================== CONTACT SERVICES ====================

export const contactService = {
  // Get all contacts for current user
  async getContacts(): Promise<DbContact[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('contacts')
      .select(`
        *,
        contact_user:users!contacts_contact_user_id_fkey (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []) as DbContact[]
  },

  // Add a new contact
  async addContact(contactUserId: string): Promise<DbContact> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('contacts')
      .insert({
        user_id: user.id,
        contact_user_id: contactUserId
      } as never)
      .select()
      .single()

    if (error) throw error
    return data as DbContact
  },

  // Remove a contact
  async removeContact(contactId: string): Promise<void> {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', contactId)

    if (error) throw error
  },

  // Mute/unmute contact
  async toggleMute(contactId: string, isMuted: boolean, mutedUntil?: string): Promise<DbContact> {
    const { data, error } = await supabase
      .from('contacts')
      .update({ 
        is_muted: isMuted, 
        muted_until: mutedUntil || null,
        updated_at: new Date().toISOString()
      } as never)
      .eq('id', contactId)
      .select()
      .single()

    if (error) throw error
    return data as DbContact
  },

  // Check if user is already a contact
  async isContact(contactUserId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data, error } = await supabase
      .from('contacts')
      .select('id')
      .eq('user_id', user.id)
      .eq('contact_user_id', contactUserId)
      .single()

    return !error && !!data
  }
}

// ==================== CHECK-IN SERVICES ====================

export const checkInService = {
  // Create a new check-in
  async createCheckIn(checkInData: Partial<DbCheckIn>): Promise<DbCheckIn> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('check_ins')
      .insert({
        ...checkInData,
        user_id: user.id
      } as never)
      .select()
      .single()

    if (error) throw error
    return data as DbCheckIn
  },

  // Get user's latest check-in
  async getLatestCheckIn(userId?: string): Promise<DbCheckIn | null> {
    const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id
    if (!targetUserId) return null

    const { data, error } = await supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
    return (data || null) as DbCheckIn | null
  },

  // Get check-ins from contacts
  async getContactCheckIns(): Promise<DbCheckIn[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // First get contact user IDs
    const { data: contacts } = await supabase
      .from('contacts')
      .select('contact_user_id')
      .eq('user_id', user.id)

    if (!contacts || contacts.length === 0) return []

    const contactUserIds = contacts.map((c: { contact_user_id: string }) => c.contact_user_id)

    const { data, error } = await supabase
      .from('check_ins')
      .select(`
        *,
        user:users (*)
      `)
      .in('user_id', contactUserIds)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error
    return (data || []) as DbCheckIn[]
  },

  // Get check-in history for a user
  async getCheckInHistory(userId: string, limit = 20): Promise<DbCheckIn[]> {
    const { data, error } = await supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return (data || []) as DbCheckIn[]
  }
}

// ==================== MESSAGE SERVICES ====================

export const messageService = {
  // Send a message
  async sendMessage(messageData: Partial<DbMessage>): Promise<DbMessage> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('messages')
      .insert({
        ...messageData,
        sender_id: user.id
      } as never)
      .select()
      .single()

    if (error) throw error
    return data as DbMessage
  },

  // Get messages between two users
  async getConversation(otherUserId: string, limit = 50): Promise<DbMessage[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey (*),
        receiver:users!messages_receiver_id_fkey (*)
      `)
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true })
      .limit(limit)

    if (error) throw error
    return (data || []) as DbMessage[]
  },

  // Get all conversations for current user (simplified version)
  async getConversations(): Promise<DbMessage[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // For now, return empty array - this would need a custom function in the database
    return []
  },

  // Subscribe to new messages
  subscribeToMessages(callback: (message: DbMessage) => void) {
    return supabase
      .channel('messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => callback(payload.new as DbMessage)
      )
      .subscribe()
  },

  // Mark messages as read (future feature)
  async markAsRead(conversationUserId: string): Promise<void> {
    // Implementation depends on if you add a read_at column to messages table
    // For now, this is just a placeholder
  }
}

// ==================== REAL-TIME SUBSCRIPTIONS ====================

export const realtimeService = {
  // Subscribe to check-ins from contacts
  subscribeToContactCheckIns(callback: (checkIn: DbCheckIn) => void) {
    return supabase
      .channel('check_ins')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'check_ins' },
        (payload) => callback(payload.new as DbCheckIn)
      )
      .subscribe()
  },

  // Subscribe to contact changes
  subscribeToContacts(userId: string, callback: (contact: DbContact) => void) {
    return supabase
      .channel('contacts')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'contacts',
          filter: `user_id=eq.${userId}`
        },
        (payload) => callback(payload.new as DbContact)
      )
      .subscribe()
  }
}