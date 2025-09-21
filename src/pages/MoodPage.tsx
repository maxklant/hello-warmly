import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Heart, TrendingUp, Calendar, BarChart3 } from 'lucide-react'
import { MoodSelector } from '@/components/MoodSelector'
import { MoodDashboard } from '@/components/MoodDashboard'
import Navigation from '@/components/Navigation'
import { MoodEntry } from '@/services/mood'

const MoodPage = () => {
  const [activeTab, setActiveTab] = useState('track')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleMoodLogged = (mood: MoodEntry) => {
    // Trigger a refresh of the dashboard when mood is logged
    setRefreshKey(prev => prev + 1)
    
    // Optionally switch to dashboard to show the update
    if (activeTab === 'track') {
      setTimeout(() => setActiveTab('history'), 500)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="pt-12 pb-6 px-6">
        <div className="flex items-center gap-3 mb-2">
          <Heart className="h-8 w-8 text-red-500" />
          <h1 className="text-3xl font-bold text-foreground">
            Mood Tracking
          </h1>
        </div>
        <p className="text-muted-foreground">
          Track your emotions and build self-awareness
        </p>
      </div>

      {/* Main Content */}
      <div className="px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="track" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Track
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          {/* Track Mood Tab */}
          <TabsContent value="track" className="space-y-6">
            <MoodSelector onMoodLogged={handleMoodLogged} />
            
            {/* Quick Tips Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Mood Tracking Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>✨ Be honest:</strong> Track your genuine feelings, not what you think you should feel
                  </p>
                  <p>
                    <strong>📅 Be consistent:</strong> Try to log your mood daily, ideally at the same time
                  </p>
                  <p>
                    <strong>📝 Add notes:</strong> Capture what influenced your mood - activities, people, events
                  </p>
                  <p>
                    <strong>🔍 Look for patterns:</strong> Review your history to understand your emotional patterns
                  </p>
                  <p>
                    <strong>🎯 No judgment:</strong> All emotions are valid and temporary
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <MoodDashboard key={refreshKey} />
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Mood Insights
                </CardTitle>
                <CardDescription>
                  Understand your emotional patterns and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Mood Patterns */}
                  <div>
                    <h3 className="font-semibold mb-3">Common Patterns</h3>
                    <div className="space-y-3 text-sm">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-1">📈 Weekly Trends</h4>
                        <p className="text-muted-foreground">
                          Most people feel better on weekends and struggle on Mondays. 
                          Track your weekly patterns to identify your personal rhythm.
                        </p>
                      </div>
                      
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-1">⏰ Time of Day</h4>
                        <p className="text-muted-foreground">
                          Energy and mood often fluctuate throughout the day. 
                          Notice if you're a morning person or night owl.
                        </p>
                      </div>
                      
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-1">🌦️ External Factors</h4>
                        <p className="text-muted-foreground">
                          Weather, social interactions, work stress, and physical health 
                          all influence mood. Track triggers and boosters.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Emotional Intelligence Tips */}
                  <div>
                    <h3 className="font-semibold mb-3">Building Emotional Awareness</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>🎯 Name it to tame it:</strong> Simply identifying emotions reduces their intensity
                      </p>
                      <p>
                        <strong>🔄 Emotions are temporary:</strong> Even intense feelings will pass
                      </p>
                      <p>
                        <strong>📊 Data over feelings:</strong> Your mood log provides objective insights into your emotional life
                      </p>
                      <p>
                        <strong>🤝 Share wisely:</strong> Choose appropriate privacy levels for different moods
                      </p>
                    </div>
                  </div>

                  {/* Action Steps */}
                  <div>
                    <h3 className="font-semibold mb-3">What to do with insights</h3>
                    <div className="grid gap-3">
                      <Button variant="outline" className="justify-start h-auto p-3">
                        <div className="text-left">
                          <div className="font-medium">Review Weekly Patterns</div>
                          <div className="text-sm text-muted-foreground">
                            Look at your mood dashboard every Sunday
                          </div>
                        </div>
                      </Button>
                      
                      <Button variant="outline" className="justify-start h-auto p-3">
                        <div className="text-left">
                          <div className="font-medium">Plan Mood Boosters</div>
                          <div className="text-sm text-muted-foreground">
                            Schedule activities that consistently improve your mood
                          </div>
                        </div>
                      </Button>
                      
                      <Button variant="outline" className="justify-start h-auto p-3">
                        <div className="text-left">
                          <div className="font-medium">Create Support Networks</div>
                          <div className="text-sm text-muted-foreground">
                            Connect with friends when you need emotional support
                          </div>
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Navigation />
    </div>
  )
}

export default MoodPage