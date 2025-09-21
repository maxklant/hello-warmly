import { supabase } from '@/lib/supabase'
// import type { MoodLog, MoodLogInsert, MoodLogUpdate } from '@/types/supabase'

export interface MoodOption {
  emoji: string
  label: string
  score: number
  color: string
}

export const MOOD_OPTIONS: MoodOption[] = [
  { emoji: '😢', label: 'Very Sad', score: 1, color: 'text-blue-600' },
  { emoji: '😔', label: 'Sad', score: 2, color: 'text-blue-500' },
  { emoji: '😐', label: 'Neutral', score: 3, color: 'text-gray-500' },
  { emoji: '🙂', label: 'Happy', score: 4, color: 'text-green-500' },
  { emoji: '😊', label: 'Very Happy', score: 5, color: 'text-green-600' },
  { emoji: '😴', label: 'Tired', score: 2, color: 'text-purple-500' },
  { emoji: '😰', label: 'Anxious', score: 2, color: 'text-orange-500' },
  { emoji: '😡', label: 'Angry', score: 2, color: 'text-red-500' },
  { emoji: '🤗', label: 'Grateful', score: 4, color: 'text-pink-500' },
  { emoji: '✨', label: 'Excited', score: 5, color: 'text-yellow-500' },
]

export interface MoodEntry {
  id: string
  user_id: string
  date: string
  mood_label: string
  mood_emoji: string
  mood_score: number
  notes?: string
  visibility: 'private' | 'contacts' | 'all'
  created_at: string
  updated_at: string
}

export class MoodService {
  // For now, we'll use localStorage until the database schema is applied
  private static STORAGE_KEY = 'mood_entries'
  
  static getMoodEntries(): MoodEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  static saveMoodEntries(entries: MoodEntry[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries))
    } catch (error) {
      console.error('Error saving mood entries:', error)
    }
  }

  // Log a mood entry for today (localStorage version)
  static async logMood(moodData: {
    mood_label: string
    mood_emoji: string
    mood_score?: number
    notes?: string
    visibility?: 'private' | 'contacts' | 'all'
  }): Promise<MoodEntry | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const today = new Date().toISOString().split('T')[0]
      const entries = this.getMoodEntries()
      
      // Check if mood already logged for today
      const existingIndex = entries.findIndex(
        entry => entry.user_id === user.id && entry.date === today
      )

      const moodEntry: MoodEntry = {
        id: existingIndex >= 0 ? entries[existingIndex].id : `mood_${Date.now()}`,
        user_id: user.id,
        date: today,
        mood_label: moodData.mood_label,
        mood_emoji: moodData.mood_emoji,
        mood_score: moodData.mood_score || 3,
        notes: moodData.notes,
        visibility: moodData.visibility || 'contacts',
        created_at: existingIndex >= 0 ? entries[existingIndex].created_at : new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      if (existingIndex >= 0) {
        entries[existingIndex] = moodEntry
      } else {
        entries.push(moodEntry)
      }

      this.saveMoodEntries(entries)
      return moodEntry
    } catch (error) {
      console.error('Error logging mood:', error)
      return null
    }
  }

  // Get mood for a specific date
  static async getMoodForDate(date: string, userId?: string): Promise<MoodEntry | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const targetUserId = userId || user.id
      const entries = this.getMoodEntries()
      
      return entries.find(entry => 
        entry.user_id === targetUserId && entry.date === date
      ) || null
    } catch (error) {
      console.error('Error fetching mood for date:', error)
      return null
    }
  }

  // Get mood history for a user
  static async getMoodHistory(
    userId?: string, 
    limit = 30,
    includePrivate = false
  ): Promise<MoodEntry[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const targetUserId = userId || user.id
      const isOwnHistory = targetUserId === user.id
      const entries = this.getMoodEntries()

      let userEntries = entries.filter(entry => entry.user_id === targetUserId)

      // Apply privacy filtering if viewing someone else's mood
      if (!isOwnHistory && !includePrivate) {
        userEntries = userEntries.filter(entry => 
          entry.visibility === 'contacts' || entry.visibility === 'all'
        )
      }

      return userEntries
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit)
    } catch (error) {
      console.error('Error fetching mood history:', error)
      return []
    }
  }

  // Get mood statistics
  static async getMoodStats(userId?: string, days = 30): Promise<{
    averageScore: number
    totalEntries: number
    moodDistribution: Record<string, number>
    streak: number
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const targetUserId = userId || user.id
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const entries = this.getMoodEntries()
      const moods = entries.filter(entry => 
        entry.user_id === targetUserId && 
        new Date(entry.date) >= startDate
      )
      
      // Calculate statistics
      const totalEntries = moods.length
      const averageScore = totalEntries > 0 
        ? moods.reduce((sum, mood) => sum + mood.mood_score, 0) / totalEntries
        : 0

      // Mood distribution
      const moodDistribution: Record<string, number> = {}
      moods.forEach(mood => {
        moodDistribution[mood.mood_label] = (moodDistribution[mood.mood_label] || 0) + 1
      })

      // Calculate streak (consecutive days with mood entries)
      let streak = 0
      const today = new Date()
      for (let i = 0; i < days; i++) {
        const checkDate = new Date(today)
        checkDate.setDate(today.getDate() - i)
        const dateStr = checkDate.toISOString().split('T')[0]
        
        const hasEntry = moods.some(mood => mood.date === dateStr)
        if (hasEntry) {
          streak++
        } else {
          break
        }
      }

      return {
        averageScore,
        totalEntries,
        moodDistribution,
        streak
      }
    } catch (error) {
      console.error('Error calculating mood stats:', error)
      return {
        averageScore: 0,
        totalEntries: 0,
        moodDistribution: {},
        streak: 0
      }
    }
  }

  // Get today's mood for current user
  static async getTodaysMood(): Promise<MoodEntry | null> {
    const today = new Date().toISOString().split('T')[0]
    return this.getMoodForDate(today)
  }

  // Delete a mood entry
  static async deleteMood(moodId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const entries = this.getMoodEntries()
      const filteredEntries = entries.filter(entry => 
        !(entry.id === moodId && entry.user_id === user.id)
      )

      this.saveMoodEntries(filteredEntries)
      return true
    } catch (error) {
      console.error('Error deleting mood:', error)
      return false
    }
  }

  // Get friends' recent moods (placeholder for now)
  static async getFriendsMoods(limit = 10): Promise<(MoodEntry & { user: { name: string, avatar_url: string | null } })[]> {
    // For now, return empty array until friendship system is integrated
    return []
  }
}