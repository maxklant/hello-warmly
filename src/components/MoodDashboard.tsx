import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, TrendingUp, BarChart3, Clock, Trash2 } from 'lucide-react'
import { MoodService, MOOD_OPTIONS, MoodEntry } from '@/services/mood'
import { useToast } from '@/hooks/use-toast'

interface MoodDashboardProps {
  userId?: string
  showControls?: boolean
}

export function MoodDashboard({ userId, showControls = true }: MoodDashboardProps) {
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([])
  const [moodStats, setMoodStats] = useState<{
    averageScore: number
    totalEntries: number
    moodDistribution: Record<string, number>
    streak: number
  } | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<7 | 30 | 90>(30)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [history, stats] = await Promise.all([
          MoodService.getMoodHistory(userId, selectedPeriod),
          MoodService.getMoodStats(userId, selectedPeriod)
        ])
        
        setMoodHistory(history)
        setMoodStats(stats)
      } catch (error) {
        console.error('Error loading mood data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [userId, selectedPeriod])

  const handleDeleteMood = async (moodId: string) => {
    if (!showControls) return
    
    const success = await MoodService.deleteMood(moodId)
    if (success) {
      toast({
        title: "Mood deleted",
        description: "Your mood entry has been removed"
      })
      // Reload data after deletion
      const [history, stats] = await Promise.all([
        MoodService.getMoodHistory(userId, selectedPeriod),
        MoodService.getMoodStats(userId, selectedPeriod)
      ])
      setMoodHistory(history)
      setMoodStats(stats)
    } else {
      toast({
        title: "Error deleting mood",
        description: "Please try again",
        variant: "destructive"
      })
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  const getMoodColor = (moodLabel: string) => {
    const mood = MOOD_OPTIONS.find(m => m.label === moodLabel)
    return mood?.color || 'text-gray-500'
  }

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600'
    if (score >= 3.5) return 'text-green-500'
    if (score >= 2.5) return 'text-yellow-500'
    if (score >= 1.5) return 'text-orange-500'
    return 'text-red-500'
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      {showControls && (
        <div className="flex gap-2">
          {[
            { value: 7, label: '7 days' },
            { value: 30, label: '30 days' },
            { value: 90, label: '90 days' }
          ].map(({ value, label }) => (
            <Button
              key={value}
              variant={selectedPeriod === value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(value as 7 | 30 | 90)}
            >
              {label}
            </Button>
          ))}
        </div>
      )}

      {/* Statistics Cards */}
      {moodStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                  <p className="text-2xl font-bold">{moodStats.streak}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Entries</p>
                  <p className="text-2xl font-bold">{moodStats.totalEntries}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(moodStats.averageScore)}`}>
                    {moodStats.averageScore.toFixed(1)}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Most Common</p>
                  <p className="text-xl font-bold truncate">
                    {Object.entries(moodStats.moodDistribution)
                      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'}
                  </p>
                </div>
                <div className="text-2xl">
                  {MOOD_OPTIONS.find(m => 
                    m.label === Object.entries(moodStats.moodDistribution)
                      .sort(([,a], [,b]) => b - a)[0]?.[0]
                  )?.emoji || '😐'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mood Distribution */}
      {moodStats && Object.keys(moodStats.moodDistribution).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mood Distribution</CardTitle>
            <CardDescription>
              Breakdown of your moods over the last {selectedPeriod} days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(moodStats.moodDistribution)
                .sort(([,a], [,b]) => b - a)
                .map(([moodLabel, count]) => {
                  const mood = MOOD_OPTIONS.find(m => m.label === moodLabel)
                  const percentage = Math.round((count / moodStats.totalEntries) * 100)
                  
                  return (
                    <div key={moodLabel} className="flex items-center gap-3">
                      <span className="text-xl">{mood?.emoji || '😐'}</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className={`font-medium ${getMoodColor(moodLabel)}`}>
                            {moodLabel}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {count} times ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary rounded-full h-2 transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mood History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Moods</CardTitle>
          <CardDescription>
            Your mood entries from the last {selectedPeriod} days
          </CardDescription>
        </CardHeader>
        <CardContent>
          {moodHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No mood entries found for this period</p>
              <p className="text-sm">Start tracking your mood to see insights here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {moodHistory.map((mood) => (
                <div 
                  key={mood.id} 
                  className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <span className="text-2xl">{mood.mood_emoji}</span>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-medium ${getMoodColor(mood.mood_label)}`}>
                        {mood.mood_label}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {formatDate(mood.date)}
                        </Badge>
                        {showControls && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMood(mood.id)}
                            className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {mood.notes && (
                      <p className="text-sm text-muted-foreground mb-2">
                        "{mood.notes}"
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {new Date(mood.created_at).toLocaleTimeString()}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Score: {mood.mood_score}/5
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}