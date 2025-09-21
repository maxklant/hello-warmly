import React, { useState, useEffect } from 'react'
import { TrendingUp, Calendar, Target, Award, Tag, FileText, Zap, Activity } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { JournalService } from '@/services/journal'

interface JournalStatsData {
  totalEntries: number
  currentStreak: number
  longestStreak: number
  totalWords: number
  averageWordsPerEntry: number
  topTags: { tag: string, count: number }[]
  entriesThisMonth: number
}

export function JournalStats() {
  const [stats, setStats] = useState<JournalStatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      const statsData = await JournalService.getJournalStats()
      setStats(statsData)
    } catch (error) {
      console.error('Error loading journal stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6">
        {/* Loading skeleton */}
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2" />
            <p>Kon statistieken niet laden</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const monthlyGoal = 20 // entries per month
  const monthlyProgress = (stats.entriesThisMonth / monthlyGoal) * 100

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Totaal Entries</p>
                <p className="text-2xl font-bold">{stats.totalEntries}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Huidige Streak</p>
                <p className="text-2xl font-bold">{stats.currentStreak}</p>
                <p className="text-xs text-muted-foreground">dagen achter elkaar</p>
              </div>
              <Zap className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Langste Streak</p>
                <p className="text-2xl font-bold">{stats.longestStreak}</p>
                <p className="text-xs text-muted-foreground">dagen record</p>
              </div>
              <Award className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Deze Maand</p>
                <p className="text-2xl font-bold">{stats.entriesThisMonth}</p>
                <p className="text-xs text-muted-foreground">entries geschreven</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Maandelijkse Voortgang
          </CardTitle>
          <CardDescription>
            Doel: {monthlyGoal} entries per maand
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>{stats.entriesThisMonth} van {monthlyGoal} entries</span>
              <span>{Math.round(monthlyProgress)}%</span>
            </div>
            <Progress value={monthlyProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {stats.entriesThisMonth >= monthlyGoal 
                ? '🎉 Geweldig! Je hebt je maandelijkse doel behaald!'
                : `Nog ${monthlyGoal - stats.entriesThisMonth} entries om je doel te behalen`
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Writing Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Schrijfstatistieken
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Totaal woorden</span>
              <span className="font-semibold">{stats.totalWords.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Gemiddeld per entry</span>
              <span className="font-semibold">{stats.averageWordsPerEntry} woorden</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Schrijffrequentie</span>
              <span className="font-semibold">
                {stats.totalEntries > 0 
                  ? `${Math.round((stats.totalEntries / 30) * 10) / 10}/maand`
                  : 'Nog geen data'
                }
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Populaire Tags
            </CardTitle>
            <CardDescription>
              Je meest gebruikte tags
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topTags.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nog geen tags gebruikt
              </p>
            ) : (
              <div className="space-y-3">
                {stats.topTags.map((tagData, index) => (
                  <div key={tagData.tag} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                      <Badge variant="secondary">{tagData.tag}</Badge>
                    </div>
                    <span className="text-sm font-semibold">{tagData.count}x</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Achievements Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Prestaties
          </CardTitle>
          <CardDescription>
            Jouw schrijfmijlpalen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* First Entry */}
            <div className={`p-4 rounded-lg border-2 ${stats.totalEntries >= 1 ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="text-center">
                <div className="text-2xl mb-2">{stats.totalEntries >= 1 ? '🎯' : '⭕'}</div>
                <p className="font-semibold text-sm">Eerste Entry</p>
                <p className="text-xs text-muted-foreground">Begin je dagboekjourney</p>
              </div>
            </div>

            {/* Week Streak */}
            <div className={`p-4 rounded-lg border-2 ${stats.currentStreak >= 7 ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="text-center">
                <div className="text-2xl mb-2">{stats.currentStreak >= 7 ? '🔥' : '⭕'}</div>
                <p className="font-semibold text-sm">Week Streak</p>
                <p className="text-xs text-muted-foreground">7 dagen achter elkaar</p>
              </div>
            </div>

            {/* Productive Writer */}
            <div className={`p-4 rounded-lg border-2 ${stats.totalWords >= 5000 ? 'border-purple-200 bg-purple-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="text-center">
                <div className="text-2xl mb-2">{stats.totalWords >= 5000 ? '✍️' : '⭕'}</div>
                <p className="font-semibold text-sm">Productieve Schrijver</p>
                <p className="text-xs text-muted-foreground">5000+ woorden geschreven</p>
              </div>
            </div>

            {/* Tag Master */}
            <div className={`p-4 rounded-lg border-2 ${stats.topTags.length >= 10 ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="text-center">
                <div className="text-2xl mb-2">{stats.topTags.length >= 10 ? '🏷️' : '⭕'}</div>
                <p className="font-semibold text-sm">Tag Master</p>
                <p className="text-xs text-muted-foreground">10+ verschillende tags</p>
              </div>
            </div>

            {/* Monthly Goal */}
            <div className={`p-4 rounded-lg border-2 ${stats.entriesThisMonth >= monthlyGoal ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="text-center">
                <div className="text-2xl mb-2">{stats.entriesThisMonth >= monthlyGoal ? '🎯' : '⭕'}</div>
                <p className="font-semibold text-sm">Maandelijk Doel</p>
                <p className="text-xs text-muted-foreground">20 entries per maand</p>
              </div>
            </div>

            {/* Consistency Master */}
            <div className={`p-4 rounded-lg border-2 ${stats.longestStreak >= 30 ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="text-center">
                <div className="text-2xl mb-2">{stats.longestStreak >= 30 ? '👑' : '⭕'}</div>
                <p className="font-semibold text-sm">Consistency Master</p>
                <p className="text-xs text-muted-foreground">30-dag streak record</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}