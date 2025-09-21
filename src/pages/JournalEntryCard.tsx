import React, { useState } from 'react'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { Edit, Trash2, Lock, Eye, EyeOff, Heart, MessageCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { type JournalEntryData } from '@/services/journal'
import { MoodService } from '@/services/mood'

interface JournalEntryCardProps {
  entry: JournalEntryData
  onEdit: (entry: JournalEntryData) => void
  onDelete: (entryId: string) => void
}

export function JournalEntryCard({ entry, onEdit, onDelete }: JournalEntryCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPincodeDialog, setShowPincodeDialog] = useState(false)
  const [pincode, setPincode] = useState('')
  const [isContentVisible, setIsContentVisible] = useState(!entry.is_protected)
  const [mood, setMood] = useState<{ id: string; emoji: string; name: string } | null>(null)

  React.useEffect(() => {
    // Load mood data if entry has mood_id
    if (entry.mood_id) {
      const loadMood = async () => {
        try {
          const moods = await MoodService.getMoodEntries()
          const entryMood = moods.find(m => m.id === entry.mood_id)
          if (entryMood) {
            setMood({
              id: entryMood.id,
              emoji: entryMood.mood_emoji,
              name: entryMood.mood_label
            })
          }
        } catch (error) {
          console.error('Error loading mood:', error)
        }
      }
      loadMood()
    }
  }, [entry.mood_id])

  const handleDelete = () => {
    if (entry.is_protected) {
      setShowPincodeDialog(true)
    } else {
      setShowDeleteDialog(true)
    }
  }

  const confirmDelete = () => {
    onDelete(entry.id)
    setShowDeleteDialog(false)
    setShowPincodeDialog(false)
    setPincode('')
  }

  const handleEdit = () => {
    if (entry.is_protected) {
      setShowPincodeDialog(true)
    } else {
      onEdit(entry)
    }
  }

  const handlePincodeSubmit = () => {
    // In a real implementation, verify pincode here
    setShowPincodeDialog(false)
    setPincode('')
    onEdit(entry)
  }

  const toggleContentVisibility = () => {
    if (entry.is_protected && !isContentVisible) {
      setShowPincodeDialog(true)
    } else {
      setIsContentVisible(!isContentVisible)
    }
  }

  const getPrivacyIcon = () => {
    switch (entry.privacy_level) {
      case 'private':
        return '🔒'
      case 'shared_contacts':
        return '👥'
      case 'public':
        return '🌍'
      default:
        return '🔒'
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, 'EEEE d MMMM yyyy', { locale: nl })
    } catch {
      return dateString
    }
  }

  const truncateContent = (content: string, maxLength = 200) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  const wordCount = entry.content.trim().split(/\s+/).filter(word => word.length > 0).length

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                {entry.title || formatDate(entry.date)}
                {entry.is_protected && <Lock className="h-4 w-4 text-muted-foreground" />}
                <span className="text-sm">{getPrivacyIcon()}</span>
              </CardTitle>
              <CardDescription className="flex items-center gap-4">
                <span>{formatDate(entry.date)}</span>
                <span>{wordCount} woorden</span>
                {mood && (
                  <div className="flex items-center gap-1">
                    <span>{mood.emoji}</span>
                    <span className="text-xs">{mood.name}</span>
                  </div>
                )}
              </CardDescription>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleContentVisibility}
                title={isContentVisible ? 'Verberg inhoud' : 'Toon inhoud'}
              >
                {isContentVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                title="Bewerken"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                title="Verwijderen"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Content */}
          {isContentVisible && (
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap leading-relaxed">
                {truncateContent(entry.content)}
              </p>
            </div>
          )}

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {entry.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <span>
              Aangemaakt: {format(new Date(entry.created_at), 'dd/MM/yyyy HH:mm')}
            </span>
            {entry.updated_at !== entry.created_at && (
              <span>
                Bijgewerkt: {format(new Date(entry.updated_at), 'dd/MM/yyyy HH:mm')}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Entry Verwijderen</DialogTitle>
            <DialogDescription>
              Weet je zeker dat je deze dagboekentry wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Annuleren
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Verwijderen
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pincode Dialog */}
      <Dialog open={showPincodeDialog} onOpenChange={setShowPincodeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Beveiligde Entry</DialogTitle>
            <DialogDescription>
              Deze entry is beveiligd met een pincode. Voer je pincode in om door te gaan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                type="password"
                placeholder="Voer je pincode in"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                maxLength={4}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handlePincodeSubmit()
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setShowPincodeDialog(false)
                setPincode('')
              }}>
                Annuleren
              </Button>
              <Button onClick={handlePincodeSubmit} disabled={!pincode}>
                Bevestigen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}