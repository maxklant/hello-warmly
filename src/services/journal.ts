import { supabase } from '@/lib/supabase'
import { MoodService } from './mood'
// import type { JournalEntry, JournalEntryInsert, JournalEntryUpdate } from '@/types/supabase'

export interface JournalEntryData {
  id: string
  user_id: string
  date: string
  title?: string
  content: string
  mood_id?: string
  tags?: string[]
  media_urls?: string[]
  privacy_level: 'private' | 'shared_contacts' | 'public'
  shared_with?: string[]
  is_protected: boolean
  pincode_hash?: string
  created_at: string
  updated_at: string
}

export interface JournalInsertData {
  title?: string
  content: string
  tags?: string[]
  media_urls?: string[]
  privacy_level?: 'private' | 'shared_contacts' | 'public'
  shared_with?: string[]
  is_protected?: boolean
  pincode?: string // Plain text pincode for protection
}

export interface JournalSearchOptions {
  search?: string
  tags?: string[]
  dateFrom?: string
  dateTo?: string
  mood?: string
  privacy_level?: 'private' | 'shared_contacts' | 'public'
}

export class JournalService {
  private static STORAGE_KEY = 'journal_entries'
  
  // Get all journal entries from localStorage (private method)
  private static getAllJournalEntries(): JournalEntryData[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  // Save journal entries to localStorage
  static saveJournalEntries(entries: JournalEntryData[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries))
    } catch (error) {
      console.error('Error saving journal entries:', error)
    }
  }

  // Hash a pincode (simple implementation)
  private static hashPincode(pincode: string): string {
    // In a real implementation, use proper hashing like bcrypt
    return btoa(pincode) // Simple base64 encoding for demo
  }

  // Verify pincode
  private static verifyPincode(pincode: string, hash: string): boolean {
    return this.hashPincode(pincode) === hash
  }

  // Create a new journal entry
  static async createJournalEntry(entryData: JournalInsertData): Promise<JournalEntryData | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const today = new Date().toISOString().split('T')[0]
      const entries = this.getAllJournalEntries()
      
      // Check if entry already exists for today
      const existingIndex = entries.findIndex(
        entry => entry.user_id === user.id && entry.date === today
      )

      if (existingIndex >= 0) {
        throw new Error('Journal entry already exists for today. Use updateJournalEntry instead.')
      }

      // Get today's mood to link
      const todaysMood = await MoodService.getTodaysMood()

      const newEntry: JournalEntryData = {
        id: `journal_${Date.now()}`,
        user_id: user.id,
        date: today,
        title: entryData.title,
        content: entryData.content,
        mood_id: todaysMood?.id,
        tags: entryData.tags || [],
        media_urls: entryData.media_urls || [],
        privacy_level: entryData.privacy_level || 'private',
        shared_with: entryData.shared_with || [],
        is_protected: entryData.is_protected || false,
        pincode_hash: entryData.pincode ? this.hashPincode(entryData.pincode) : undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      entries.push(newEntry)
      this.saveJournalEntries(entries)
      
      return newEntry
    } catch (error) {
      console.error('Error creating journal entry:', error)
      return null
    }
  }

  // Update existing journal entry
  static async updateJournalEntry(
    entryId: string, 
    updateData: Partial<JournalInsertData>,
    pincode?: string
  ): Promise<JournalEntryData | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const entries = this.getAllJournalEntries()
      const entryIndex = entries.findIndex(entry => entry.id === entryId && entry.user_id === user.id)
      
      if (entryIndex === -1) {
        throw new Error('Journal entry not found')
      }

      const entry = entries[entryIndex]

      // Check pincode if entry is protected
      if (entry.is_protected && entry.pincode_hash) {
        if (!pincode || !this.verifyPincode(pincode, entry.pincode_hash)) {
          throw new Error('Invalid pincode')
        }
      }

      // Update entry
      const updatedEntry: JournalEntryData = {
        ...entry,
        title: updateData.title !== undefined ? updateData.title : entry.title,
        content: updateData.content || entry.content,
        tags: updateData.tags !== undefined ? updateData.tags : entry.tags,
        media_urls: updateData.media_urls !== undefined ? updateData.media_urls : entry.media_urls,
        privacy_level: updateData.privacy_level || entry.privacy_level,
        shared_with: updateData.shared_with !== undefined ? updateData.shared_with : entry.shared_with,
        is_protected: updateData.is_protected !== undefined ? updateData.is_protected : entry.is_protected,
        pincode_hash: updateData.pincode ? this.hashPincode(updateData.pincode) : entry.pincode_hash,
        updated_at: new Date().toISOString()
      }

      entries[entryIndex] = updatedEntry
      this.saveJournalEntries(entries)
      
      return updatedEntry
    } catch (error) {
      console.error('Error updating journal entry:', error)
      return null
    }
  }

  // Get journal entry for specific date
  static async getJournalEntryForDate(date: string, userId?: string): Promise<JournalEntryData | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const targetUserId = userId || user.id
      const entries = this.getAllJournalEntries()
      
      return entries.find(entry => 
        entry.user_id === targetUserId && entry.date === date
      ) || null
    } catch (error) {
      console.error('Error fetching journal entry for date:', error)
      return null
    }
  }

  // Get today's journal entry
  static async getTodaysJournalEntry(): Promise<JournalEntryData | null> {
    const today = new Date().toISOString().split('T')[0]
    return this.getJournalEntryForDate(today)
  }

  // Get journal entries with search and filter options
  static async getJournalEntries(
    options: JournalSearchOptions = {},
    limit = 50
  ): Promise<JournalEntryData[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      let entries = this.getAllJournalEntries()
      
      // Filter by user
      entries = entries.filter(entry => entry.user_id === user.id)

      // Apply search filter
      if (options.search) {
        const searchLower = options.search.toLowerCase()
        entries = entries.filter(entry => 
          entry.content.toLowerCase().includes(searchLower) ||
          entry.title?.toLowerCase().includes(searchLower) ||
          entry.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        )
      }

      // Apply tag filter
      if (options.tags && options.tags.length > 0) {
        entries = entries.filter(entry => 
          entry.tags?.some(tag => options.tags!.includes(tag))
        )
      }

      // Apply date range filter
      if (options.dateFrom) {
        entries = entries.filter(entry => entry.date >= options.dateFrom!)
      }
      if (options.dateTo) {
        entries = entries.filter(entry => entry.date <= options.dateTo!)
      }

      // Apply privacy filter
      if (options.privacy_level) {
        entries = entries.filter(entry => entry.privacy_level === options.privacy_level)
      }

      // Sort by date (newest first)
      entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      return entries.slice(0, limit)
    } catch (error) {
      console.error('Error fetching journal entries:', error)
      return []
    }
  }

  // Delete journal entry
  static async deleteJournalEntry(entryId: string, pincode?: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const entries = this.getAllJournalEntries()
      const entryIndex = entries.findIndex(entry => entry.id === entryId && entry.user_id === user.id)
      
      if (entryIndex === -1) {
        throw new Error('Journal entry not found')
      }

      const entry = entries[entryIndex]

      // Check pincode if entry is protected
      if (entry.is_protected && entry.pincode_hash) {
        if (!pincode || !this.verifyPincode(pincode, entry.pincode_hash)) {
          throw new Error('Invalid pincode')
        }
      }

      entries.splice(entryIndex, 1)
      this.saveJournalEntries(entries)
      
      return true
    } catch (error) {
      console.error('Error deleting journal entry:', error)
      return false
    }
  }

  // Get all unique tags used by user
  static async getUserTags(): Promise<string[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const entries = this.getAllJournalEntries()
      const userEntries = entries.filter(entry => entry.user_id === user.id)
      
      const tags = new Set<string>()
      userEntries.forEach(entry => {
        entry.tags?.forEach(tag => tags.add(tag))
      })
      
      return Array.from(tags).sort()
    } catch (error) {
      console.error('Error fetching user tags:', error)
      return []
    }
  }

  // Export journal entries
  static async exportJournal(format: 'txt' | 'json' = 'txt'): Promise<string> {
    try {
      const entries = await this.getJournalEntries()
      
      if (format === 'json') {
        return JSON.stringify(entries, null, 2)
      }
      
      // Text format
      let output = '# Mijn Dagboek\n\n'
      
      entries.forEach(entry => {
        output += `## ${entry.date}\n`
        if (entry.title) {
          output += `**${entry.title}**\n\n`
        }
        output += `${entry.content}\n\n`
        if (entry.tags && entry.tags.length > 0) {
          output += `Tags: ${entry.tags.join(', ')}\n\n`
        }
        output += '---\n\n'
      })
      
      return output
    } catch (error) {
      console.error('Error exporting journal:', error)
      return ''
    }
  }

  // Get journal statistics
  static async getJournalStats(): Promise<{
    totalEntries: number
    currentStreak: number
    longestStreak: number
    totalWords: number
    averageWordsPerEntry: number
    topTags: { tag: string, count: number }[]
    entriesThisMonth: number
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const entries = this.getAllJournalEntries()
      const userEntries = entries.filter(entry => entry.user_id === user.id)
      
      // Calculate statistics
      const totalEntries = userEntries.length
      const totalWords = userEntries.reduce((sum, entry) => 
        sum + entry.content.split(' ').length, 0
      )
      const averageWordsPerEntry = totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0

      // Calculate streaks
      const sortedEntries = userEntries.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      
      let currentStreak = 0
      let longestStreak = 0
      let tempStreak = 0
      
      const today = new Date()
      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today)
        checkDate.setDate(today.getDate() - i)
        const dateStr = checkDate.toISOString().split('T')[0]
        
        const hasEntry = sortedEntries.some(entry => entry.date === dateStr)
        if (hasEntry) {
          tempStreak++
          if (i === 0 || currentStreak === i) {
            currentStreak = tempStreak
          }
          longestStreak = Math.max(longestStreak, tempStreak)
        } else {
          tempStreak = 0
        }
      }

      // Top tags
      const tagCounts: Record<string, number> = {}
      userEntries.forEach(entry => {
        entry.tags?.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      })
      
      const topTags = Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([tag, count]) => ({ tag, count }))

      // Entries this month
      const thisMonth = new Date().toISOString().substring(0, 7) // YYYY-MM
      const entriesThisMonth = userEntries.filter(entry => 
        entry.date.startsWith(thisMonth)
      ).length

      return {
        totalEntries,
        currentStreak,
        longestStreak,
        totalWords,
        averageWordsPerEntry,
        topTags,
        entriesThisMonth
      }
    } catch (error) {
      console.error('Error calculating journal stats:', error)
      return {
        totalEntries: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalWords: 0,
        averageWordsPerEntry: 0,
        topTags: [],
        entriesThisMonth: 0
      }
    }
  }
}