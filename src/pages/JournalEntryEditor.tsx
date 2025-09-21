import React, { useState, useEffect } from 'react'
import { Save, X, Lock, UnlockIcon, Tag, Camera, Mic } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { JournalService, type JournalEntryData, type JournalInsertData } from '@/services/journal'
import { MoodSelector } from '@/components/MoodSelector'

interface JournalEntryEditorProps {
  entry?: JournalEntryData | null
  onSave: () => void
  onCancel: () => void
}

export function JournalEntryEditor({ entry, onSave, onCancel }: JournalEntryEditorProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [privacyLevel, setPrivacyLevel] = useState<'private' | 'shared_contacts' | 'public'>('private')
  const [isProtected, setIsProtected] = useState(false)
  const [pincode, setPincode] = useState('')
  const [confirmPincode, setConfirmPincode] = useState('')
  const [showPincodeDialog, setShowPincodeDialog] = useState(false)
  const [saving, setSaving] = useState(false)
  const [wordCount, setWordCount] = useState(0)

  // Initialize form with entry data
  useEffect(() => {
    if (entry) {
      setTitle(entry.title || '')
      setContent(entry.content)
      setTags(entry.tags || [])
      setPrivacyLevel(entry.privacy_level)
      setIsProtected(entry.is_protected)
    } else {
      // Reset form for new entry
      setTitle('')
      setContent('')
      setTags([])
      setPrivacyLevel('private')
      setIsProtected(false)
      setPincode('')
      setConfirmPincode('')
    }
  }, [entry])

  // Update word count
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0)
    setWordCount(words.length)
  }, [content])

  const handleSave = async () => {
    if (!content.trim()) {
      alert('Je dagboekentry kan niet leeg zijn')
      return
    }

    if (content.length > 2000) {
      alert('Je entry is te lang. Maximaal 2000 karakters toegestaan.')
      return
    }

    if (isProtected && !pincode) {
      setShowPincodeDialog(true)
      return
    }

    if (isProtected && pincode !== confirmPincode) {
      alert('Pincodes komen niet overeen')
      return
    }

    setSaving(true)
    try {
      const entryData: JournalInsertData = {
        title: title.trim() || undefined,
        content: content.trim(),
        tags,
        privacy_level: privacyLevel,
        is_protected: isProtected,
        pincode: isProtected ? pincode : undefined
      }

      if (entry) {
        // Update existing entry
        await JournalService.updateJournalEntry(entry.id, entryData, pincode || undefined)
      } else {
        // Create new entry
        await JournalService.createJournalEntry(entryData)
      }

      onSave()
    } catch (error) {
      console.error('Error saving journal entry:', error)
      alert('Er ging iets mis bij het opslaan van je entry')
    } finally {
      setSaving(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Titel (optioneel)</Label>
        <Input
          id="title"
          placeholder="Geef je entry een titel..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label htmlFor="content">Inhoud *</Label>
        <Textarea
          id="content"
          placeholder="Schrijf over je dag, gedachten, herinneringen..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[200px] resize-none"
          maxLength={2000}
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{wordCount} woorden</span>
          <span>{content.length}/2000 karakters</span>
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeTag(tag)}
              />
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Voeg een tag toe..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button onClick={addTag} variant="outline" size="sm">
            <Tag className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="space-y-4">
        <Label>Privacy Instellingen</Label>
        
        <div className="space-y-2">
          <Label htmlFor="privacy-level" className="text-sm">Zichtbaarheid</Label>
          <Select value={privacyLevel} onValueChange={(value) => setPrivacyLevel(value as 'private' | 'shared_contacts' | 'public')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="private">🔒 Privé (alleen jij)</SelectItem>
              <SelectItem value="shared_contacts">👥 Gedeeld met contacten</SelectItem>
              <SelectItem value="public">🌍 Openbaar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="pincode-protection"
            checked={isProtected}
            onCheckedChange={setIsProtected}
          />
          <Label htmlFor="pincode-protection" className="flex items-center gap-2">
            {isProtected ? <Lock className="h-4 w-4" /> : <UnlockIcon className="h-4 w-4" />}
            Beveilig met pincode
          </Label>
        </div>

        {isProtected && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                type="password"
                placeholder="4-cijferige pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                maxLength={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-pincode">Bevestig Pincode</Label>
              <Input
                id="confirm-pincode"
                type="password"
                placeholder="Herhaal pincode"
                value={confirmPincode}
                onChange={(e) => setConfirmPincode(e.target.value)}
                maxLength={4}
              />
            </div>
          </div>
        )}
      </div>

      {/* Future: Media attachments */}
      <div className="space-y-2">
        <Label>Media (binnenkort beschikbaar)</Label>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            <Camera className="h-4 w-4 mr-2" />
            Foto
          </Button>
          <Button variant="outline" size="sm" disabled>
            <Mic className="h-4 w-4 mr-2" />
            Audio
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Annuleren
        </Button>
        <Button onClick={handleSave} disabled={saving || !content.trim()}>
          {saving ? (
            <>Opslaan...</>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {entry ? 'Bijwerken' : 'Opslaan'}
            </>
          )}
        </Button>
      </div>

      {/* Pincode Requirement Dialog */}
      <Dialog open={showPincodeDialog} onOpenChange={setShowPincodeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pincode Vereist</DialogTitle>
            <DialogDescription>
              Je hebt gekozen om deze entry te beveiligen. Voer een 4-cijferige pincode in.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dialog-pincode">Pincode</Label>
              <Input
                id="dialog-pincode"
                type="password"
                placeholder="4-cijferige pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                maxLength={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dialog-confirm-pincode">Bevestig Pincode</Label>
              <Input
                id="dialog-confirm-pincode"
                type="password"
                placeholder="Herhaal pincode"
                value={confirmPincode}
                onChange={(e) => setConfirmPincode(e.target.value)}
                maxLength={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPincodeDialog(false)}>
                Annuleren
              </Button>
              <Button 
                onClick={() => {
                  setShowPincodeDialog(false)
                  handleSave()
                }}
                disabled={!pincode || pincode !== confirmPincode}
              >
                Doorgaan met Opslaan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}