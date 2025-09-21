import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Heart, TrendingUp, Calendar, Eye, EyeOff, Lock } from 'lucide-react'
import { MoodService, MOOD_OPTIONS, MoodOption, MoodEntry } from '@/services/mood'
import { useToast } from '@/hooks/use-toast'

interface MoodSelectorProps {
  onMoodLogged?: (mood: MoodEntry) => void
  showTitle?: boolean
  compact?: boolean
}

export function MoodSelector({ onMoodLogged, showTitle = true, compact = false }: MoodSelectorProps) {
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null)
  const [notes, setNotes] = useState('')
  const [visibility, setVisibility] = useState<'private' | 'contacts' | 'all'>('contacts')
  const [todaysMood, setTodaysMood] = useState<MoodEntry | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [moodStats, setMoodStats] = useState<{
    streak: number
    averageScore: number
    totalEntries: number
  } | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadTodaysMood()
    loadMoodStats()
  }, [])

  const loadTodaysMood = async () => {
    const mood = await MoodService.getTodaysMood()
    if (mood) {
      setTodaysMood(mood)
      const moodOption = MOOD_OPTIONS.find(opt => opt.emoji === mood.mood_emoji)
      if (moodOption) {
        setSelectedMood(moodOption)
      }
      setNotes(mood.notes || '')
      setVisibility(mood.visibility)
    }
  }

  const loadMoodStats = async () => {
    const stats = await MoodService.getMoodStats()
    setMoodStats(stats)
  }

  const handleSubmit = async () => {
    if (!selectedMood) {
      toast({
        title: "Please select a mood",
        description: "Choose how you're feeling today",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const moodEntry = await MoodService.logMood({
        mood_label: selectedMood.label,
        mood_emoji: selectedMood.emoji,
        mood_score: selectedMood.score,
        notes: notes.trim() || undefined,
        visibility
      })

      if (moodEntry) {
        setTodaysMood(moodEntry)
        onMoodLogged?.(moodEntry)
        await loadMoodStats() // Refresh stats
        
        toast({
          title: todaysMood ? "Mood updated!" : "Mood logged!",
          description: `You're feeling ${selectedMood.label.toLowerCase()} today`,
        })
      } else {
        throw new Error('Failed to save mood')
      }
    } catch (error) {
      toast({
        title: "Error saving mood",
        description: "Please try again",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMoodSelect = (mood: MoodOption) => {
    setSelectedMood(mood)
  }

  const getVisibilityIcon = () => {
    switch (visibility) {
      case 'private': return <Lock className="h-4 w-4" />
      case 'contacts': return <Eye className="h-4 w-4" />
      case 'all': return <TrendingUp className="h-4 w-4" />
    }
  }

  const getVisibilityDescription = () => {
    switch (visibility) {
      case 'private': return 'Only you can see this'
      case 'contacts': return 'Your friends can see this'
      case 'all': return 'Everyone can see this'
    }
  }

  if (compact) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="font-medium text-sm">How are you feeling?</span>
            </div>
            {todaysMood && (
              <Badge variant="secondary" className="text-xs">
                {todaysMood.mood_emoji} {todaysMood.mood_label}
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-5 gap-2 mb-3">
            {MOOD_OPTIONS.slice(0, 5).map((mood) => (
              <Button
                key={mood.label}
                variant={selectedMood?.label === mood.label ? "default" : "outline"}
                size="sm"
                className="h-12 flex flex-col gap-1 p-2"
                onClick={() => handleMoodSelect(mood)}
              >
                <span className="text-lg">{mood.emoji}</span>
                <span className="text-xs truncate">{mood.label}</span>
              </Button>
            ))}
          </div>
          
          {selectedMood && (
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading}
              size="sm" 
              className="w-full"
            >
              {isLoading ? 'Saving...' : todaysMood ? 'Update Mood' : 'Log Mood'}
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            How are you feeling today?
          </CardTitle>
          <CardDescription>
            Track your mood to build awareness and see patterns over time
          </CardDescription>
          {moodStats && (
            <div className="flex gap-4 text-sm text-muted-foreground mt-2">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                {moodStats.streak} day streak
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {moodStats.totalEntries} entries
              </div>
            </div>
          )}
        </CardHeader>
      )}
      
      <CardContent className="space-y-6">
        {/* Mood Options Grid */}
        <div>
          <Label className="text-base font-medium mb-3 block">Select your mood:</Label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {MOOD_OPTIONS.map((mood) => (
              <Button
                key={mood.label}
                variant={selectedMood?.label === mood.label ? "default" : "outline"}
                className={`h-16 flex flex-col gap-2 p-3 transition-all ${
                  selectedMood?.label === mood.label ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleMoodSelect(mood)}
              >
                <span className="text-2xl">{mood.emoji}</span>
                <span className={`text-xs font-medium ${mood.color}`}>
                  {mood.label}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Notes Section */}
        <div className="space-y-2">
          <Label htmlFor="mood-notes">Notes (optional)</Label>
          <Textarea
            id="mood-notes"
            placeholder="What's happening? How are you feeling? Any thoughts you'd like to capture..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[80px] resize-none"
            maxLength={500}
          />
          <div className="text-xs text-muted-foreground text-right">
            {notes.length}/500
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            {getVisibilityIcon()}
            Who can see this mood?
          </Label>
          <Select value={visibility} onValueChange={(value: 'private' | 'contacts' | 'all') => setVisibility(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="private">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span>Private - Only me</span>
                </div>
              </SelectItem>
              <SelectItem value="contacts">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>Friends - People I'm connected with</span>
                </div>
              </SelectItem>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Public - Everyone</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {getVisibilityDescription()}
          </p>
        </div>

        {/* Submit Button */}
        <Button 
          onClick={handleSubmit} 
          disabled={!selectedMood || isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? 'Saving...' : todaysMood ? 'Update Mood' : 'Log Mood'}
        </Button>

        {/* Today's Mood Display */}
        {todaysMood && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{todaysMood.mood_emoji}</span>
                <div>
                  <p className="font-medium">{todaysMood.mood_label}</p>
                  <p className="text-sm text-muted-foreground">
                    Logged today at {new Date(todaysMood.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <Badge variant="secondary">
                {getVisibilityIcon()}
              </Badge>
            </div>
            {todaysMood.notes && (
              <p className="mt-2 text-sm text-muted-foreground">
                "{todaysMood.notes}"
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}