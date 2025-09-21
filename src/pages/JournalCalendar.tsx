import React, { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, BookOpen } from 'lucide-react'
import { type JournalEntryData } from '@/services/journal'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

interface JournalCalendarProps {
  entries: JournalEntryData[]
  onDateSelect?: (date: string) => void
}

export function JournalCalendar({ entries, onDateSelect }: JournalCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  // Create a map of dates that have entries
  const entryDates = new Set(entries.map(entry => entry.date))
  
  // Get entries for selected date
  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
  const selectedDateEntries = entries.filter(entry => entry.date === selectedDateStr)

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date && onDateSelect) {
      onDateSelect(format(date, 'yyyy-MM-dd'))
    }
  }

  // Custom day renderer to show dots for days with entries
  const modifiers = {
    hasEntry: (date: Date) => {
      const dateStr = format(date, 'yyyy-MM-dd')
      return entryDates.has(dateStr)
    }
  }

  const modifiersStyles = {
    hasEntry: {
      fontWeight: 'bold',
      background: 'hsl(var(--primary))',
      color: 'hsl(var(--primary-foreground))',
      borderRadius: '6px'
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Dagboek Kalender
          </CardTitle>
          <CardDescription>
            Dagen met entries zijn gemarkeerd. Klik op een datum om entries te bekijken.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            locale={nl}
            className="rounded-md border"
          />
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded bg-primary"></div>
              <span>Dagen met dagboekentries</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Totaal {entries.length} entries geschreven
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {selectedDate ? format(selectedDate, 'EEEE d MMMM yyyy', { locale: nl }) : 'Selecteer een datum'}
          </CardTitle>
          <CardDescription>
            {selectedDateEntries.length === 0 
              ? 'Geen entries voor deze datum'
              : `${selectedDateEntries.length} entry${selectedDateEntries.length > 1 ? 's' : ''} gevonden`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedDateEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Geen dagboekentry voor deze datum</p>
              <p className="text-sm mt-2">Selecteer een gemarkeerde datum om entries te zien</p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedDateEntries.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-4 space-y-2">
                  {entry.title && (
                    <h4 className="font-semibold">{entry.title}</h4>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {entry.content}
                  </p>
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {entry.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{entry.content.split(' ').length} woorden</span>
                    <span>
                      {entry.privacy_level === 'private' && '🔒 Privé'}
                      {entry.privacy_level === 'shared_contacts' && '👥 Gedeeld'}
                      {entry.privacy_level === 'public' && '🌍 Openbaar'}
                      {entry.is_protected && ' 🔐'}
                    </span>
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