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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            Mijn Dagboek
          </h1>
          <p className="text-muted-foreground">
            {todaysEntry 
              ? "Je hebt vandaag al geschreven!"
              : "Schrijf je gedachten en herinneringen op"
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportJournal} variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            Exporteren
          </Button>
          <Button onClick={handleNewEntry}>
            <Plus className="h-4 w-4 mr-2" />
            Nieuwe Entry
          </Button>
        </div>
      </div>

      {/* Today's Entry Quick Access */}
      {!todaysEntry && (
        <Card className="border-2 border-dashed border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Schrijf vandaag</h3>
              <p className="text-muted-foreground mb-4">
                Je hebt nog geen dagboekentry voor vandaag. Hoe was je dag?
              </p>
              <Button onClick={handleNewEntry}>
                <Plus className="h-4 w-4 mr-2" />
                Begin met schrijven
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Zoek in je dagboek..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Lijst</TabsTrigger>
          <TabsTrigger value="calendar">Kalender</TabsTrigger>
          <TabsTrigger value="stats">Statistieken</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {entries.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Geen entries gevonden</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || selectedTags.length > 0
                      ? "Probeer je zoekopdracht aan te passen"
                      : "Begin met het schrijven van je eerste dagboekentry"
                    }
                  </p>
                  {!searchQuery && selectedTags.length === 0 && (
                    <Button onClick={handleNewEntry}>
                      <Plus className="h-4 w-4 mr-2" />
                      Eerste Entry
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

        <TabsContent value="calendar">
          <JournalCalendar 
            entries={entries}
            onDateSelect={(date) => {
              // Handle date selection - could open entry for that date
            }}
          />
        </TabsContent>

        <TabsContent value="stats">
          <JournalStats />
        </TabsContent>
      </Tabs>

      {/* Journal Entry Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? 'Entry Bewerken' : 'Nieuwe Dagboekentry'}
            </DialogTitle>
            <DialogDescription>
              {editingEntry 
                ? `Bewerk je entry van ${editingEntry.date}`
                : 'Schrijf over je dag, gedachten en herinneringen'
              }
            </DialogDescription>
          </DialogHeader>
          <JournalEntryEditor
            entry={editingEntry}
            onSave={handleSaveEntry}
            onCancel={() => setIsEditorOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}