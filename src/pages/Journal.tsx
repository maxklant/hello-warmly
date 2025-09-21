import React, { useState, useEffect } from 'react'
import { Plus, Search, Calendar, Filter, Lock, ExternalLink, BookOpen, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { JournalService, type JournalEntryData, type JournalSearchOptions } from '@/services/journal'
import { MoodService } from '@/services/mood'
import { JournalEntryEditor } from '@/pages/JournalEntryEditor'
import { JournalEntryCard } from '@/pages/JournalEntryCard'
import { JournalCalendar } from '@/pages/JournalCalendar'
import { JournalStats } from '@/pages/JournalStats'
import Navigation from '@/components/Navigation'

export function Journal() {
  const [entries, setEntries] = useState<JournalEntryData[]>([])
  const [todaysEntry, setTodaysEntry] = useState<JournalEntryData | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('list')
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JournalEntryData | null>(null)

  // Load data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [entriesData, todaysData, tagsData] = await Promise.all([
        JournalService.getJournalEntries(),
        JournalService.getTodaysJournalEntry(),
        JournalService.getUserTags()
      ])
      
      setEntries(entriesData)
      setTodaysEntry(todaysData)
      setAvailableTags(tagsData)
    } catch (error) {
      console.error('Error loading journal data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Search and filter entries
  const searchEntries = React.useCallback(async () => {
    const options: JournalSearchOptions = {
      search: searchQuery || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined
    }
    
    const results = await JournalService.getJournalEntries(options)
    setEntries(results)
  }, [searchQuery, selectedTags])

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      searchEntries()
    }, 300)
    
    return () => clearTimeout(debounceTimeout)
  }, [searchEntries])

  const handleNewEntry = () => {
    setEditingEntry(null)
    setIsEditorOpen(true)
  }

  const handleEditEntry = (entry: JournalEntryData) => {
    setEditingEntry(entry)
    setIsEditorOpen(true)
  }

  const handleSaveEntry = async () => {
    setIsEditorOpen(false)
    setEditingEntry(null)
    await loadData()
  }

  const handleDeleteEntry = async (entryId: string) => {
    const success = await JournalService.deleteJournalEntry(entryId)
    if (success) {
      await loadData()
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const exportJournal = async () => {
    const content = await JournalService.exportJournal('txt')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dagboek-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <BookOpen className="h-8 w-8 mx-auto mb-2 animate-pulse" />
            <p className="text-muted-foreground">Laden...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold flex items-center gap-2 sm:gap-3 text-slate-800 dark:text-slate-200">
            📚 Mijn Dagboek
          </h1>
          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-serif italic">
            {todaysEntry 
              ? "✅ Je hebt vandaag al een prachtig verhaal geschreven!"
              : "✍️ Deel je gedachten en herinneringen van vandaag"
            }
          </p>
        </div>
        <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
          <Button onClick={exportJournal} variant="outline" size="sm" className="font-serif text-xs sm:text-sm">
            <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            📤 Exporteren
          </Button>
          <Button onClick={handleNewEntry} className="font-serif bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm">
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            📖 Nieuw Verhaal
          </Button>
        </div>
      </div>

      {/* Today's Entry Quick Access */}
      {!todaysEntry && (
        <Card className="border-2 border-dashed border-slate-400 dark:border-slate-600 bg-gradient-to-br from-slate-50 to-blue-100 dark:from-slate-900/20 dark:to-blue-900/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl mb-3">📖</div>
              <h3 className="text-lg font-serif font-semibold mb-2 text-slate-800 dark:text-slate-200">Schrijf je verhaal van vandaag</h3>
              <p className="text-slate-700 dark:text-slate-300 mb-4 font-serif">
                Je hebt nog geen dagboekentry voor vandaag. Wat voor verhaal heeft deze dag je gebracht?
              </p>
              <Button onClick={handleNewEntry} className="font-serif bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Plus className="h-4 w-4 mr-2" />
                ✍️ Begin met schrijven
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <Card className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900/20 dark:to-blue-900/20 border-slate-200 dark:border-slate-800">
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="w-full">
              <div className="relative">
                <Search className="h-3 w-3 sm:h-4 sm:w-4 absolute left-3 top-3 text-indigo-600 dark:text-indigo-400" />
                <Input
                  placeholder="🔍 Zoek in je dagboek verhalen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 sm:pl-9 font-serif bg-white dark:bg-slate-900/30 border-slate-300 dark:border-slate-700 text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-1 sm:gap-2 max-h-24 overflow-y-auto">
              {availableTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "secondary"}
                  className={`cursor-pointer font-serif transition-all duration-200 hover:scale-105 text-xs ${
                    selectedTags.includes(tag) 
                      ? "bg-indigo-600 text-white" 
                      : "bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-900/30 border border-slate-300 dark:border-slate-700 h-auto">
          <TabsTrigger value="list" className="font-serif data-[state=active]:bg-slate-200 dark:data-[state=active]:bg-slate-800 text-xs sm:text-sm px-2 sm:px-4 py-2">
            <span className="hidden sm:inline">📄 Verhalen</span>
            <span className="sm:hidden">📄</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="font-serif data-[state=active]:bg-slate-200 dark:data-[state=active]:bg-slate-800 text-xs sm:text-sm px-2 sm:px-4 py-2">
            <span className="hidden sm:inline">📅 Kalender</span>
            <span className="sm:hidden">📅</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="font-serif data-[state=active]:bg-slate-200 dark:data-[state=active]:bg-slate-800 text-xs sm:text-sm px-2 sm:px-4 py-2">
            <span className="hidden sm:inline">📊 Statistieken</span>
            <span className="sm:hidden">📊</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
          {entries.length === 0 ? (
            <Card className="bg-gradient-to-br from-slate-50 to-blue-100 dark:from-slate-900/20 dark:to-blue-900/20 border-slate-200 dark:border-slate-800">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-lg font-serif font-semibold mb-2 text-slate-800 dark:text-slate-200">Geen verhalen gevonden</h3>
                  <p className="text-slate-700 dark:text-slate-300 mb-4 font-serif">
                    {searchQuery || selectedTags.length > 0
                      ? "🔍 Probeer je zoekopdracht aan te passen om andere verhalen te vinden"
                      : "📖 Begin met het schrijven van je eerste dagboekverhaaltje"
                    }
                  </p>
                  {!searchQuery && selectedTags.length === 0 && (
                    <Button onClick={handleNewEntry} className="font-serif bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <Plus className="h-4 w-4 mr-2" />
                      ✍️ Eerste Verhaal
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {entries.map((entry) => (
                <JournalEntryCard
                  key={entry.id}
                  entry={entry}
                  onEdit={handleEditEntry}
                  onDelete={handleDeleteEntry}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card className="bg-gradient-to-br from-slate-50 to-blue-100 dark:from-slate-900/20 dark:to-blue-900/20 border-slate-200 dark:border-slate-800">
            <CardHeader className="border-b border-slate-200 dark:border-slate-800">
              <CardTitle className="font-serif text-slate-800 dark:text-slate-200">📅 Verhalen Kalender</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 font-serif">
              <JournalCalendar 
                entries={entries}
                onDateSelect={(date) => {
                  // Handle date selection - could open entry for that date
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-800">
            <CardHeader className="border-b border-amber-200 dark:border-amber-800">
              <CardTitle className="font-serif text-amber-800 dark:text-amber-200">📊 Dagboek Statistieken</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 font-serif">
              <JournalStats />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Journal Entry Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="w-[95vw] max-w-5xl h-[90vh] sm:max-h-[95vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-100 dark:from-slate-900/20 dark:to-blue-900/20 border-2 border-slate-200 dark:border-slate-800 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-500 p-3 sm:p-6">
          {/* Book spine effect - hidden on mobile */}
          <div className="absolute left-0 top-0 bottom-0 w-3 sm:w-6 bg-gradient-to-b from-slate-800 to-slate-900 shadow-inner"></div>
          <div className="absolute left-3 sm:left-6 top-0 bottom-0 w-1 bg-indigo-600"></div>
          
          <DialogHeader className="relative z-10 text-center border-b-2 border-dashed border-slate-300 dark:border-slate-700 pb-3 sm:pb-4 ml-4 sm:ml-8">
            <DialogTitle className="font-serif text-lg sm:text-2xl text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1 sm:gap-2">
              {editingEntry ? '📝 Bewerk je verhaal' : '📖 Nieuw Dagboek Verhaal'}
            </DialogTitle>
            <DialogDescription className="font-serif text-slate-700 dark:text-slate-300 text-sm sm:text-base">
              {editingEntry 
                ? `Verander je verhaal van ${editingEntry.date}`
                : 'Vertel je verhaal van vandaag aan je dagboek'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="ml-8">
            <JournalEntryEditor
              entry={editingEntry}
              onSave={handleSaveEntry}
              onCancel={() => setIsEditorOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
      </div>

      {/* Bottom Navigation */}
      <Navigation />
    </div>
  )
}