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
    <div className="space-y-4 sm:space-y-6 relative">
      {/* Book-like Container */}
      <div className="relative bg-gradient-to-br from-slate-50 to-blue-100 dark:from-slate-900/20 dark:to-blue-900/20 p-4 sm:p-8 rounded-lg shadow-2xl border-2 border-slate-200 dark:border-slate-800">
        {/* Paper texture overlay */}
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%224%22 height=%224%22 viewBox=%220 0 4 4%22%3E%3Cpath fill=%22%23000%22 fill-opacity=%220.1%22 d=%22M1,3h1v1H1V3zm2-2h1v1H3V1z%22%3E%3C/path%3E%3C/svg%3E')] pointer-events-none rounded-lg"></div>
        
        {/* Red margin line like in a real notebook - adjusted for mobile */}
        <div className="absolute left-12 sm:left-20 top-0 bottom-0 w-[1px] sm:w-[2px] bg-red-300 dark:bg-red-700"></div>
        
        {/* Horizontal lines like ruled paper - responsive spacing */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 15 }).map((_, i) => (
            <div 
              key={i} 
              className="absolute left-0 right-0 h-[1px] bg-blue-200/30 dark:bg-blue-700/30"
              style={{ top: `${60 + i * 30}px` }}
            />
          ))}
        </div>

        {/* Date Header like a diary */}
        <div className="relative z-10 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-dashed border-slate-300 dark:border-slate-700">
          <div className="text-center">
            <div className="font-serif text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 mb-1 sm:mb-2">
              📖 Mijn Dagboek
            </div>
            <div className="font-serif text-sm sm:text-lg text-slate-700 dark:text-slate-300">
              {new Date().toLocaleDateString('nl-NL', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>
        {/* Title */}
        <div className="space-y-2 relative z-10">
          <Label htmlFor="title" className="font-serif text-slate-800 dark:text-slate-200 font-semibold text-sm sm:text-base">Onderwerp van vandaag</Label>
          <Input
            id="title"
            placeholder="Waar gaat je verhaal vandaag over..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-serif text-sm sm:text-lg bg-transparent border-none border-b-2 border-slate-300 dark:border-slate-700 rounded-none focus:border-indigo-500 dark:focus:border-indigo-400 shadow-none px-2 py-2 sm:py-3"
          />
        </div>

        {/* Content */}
        <div className="space-y-2 relative z-10">
          <Label htmlFor="content" className="font-serif text-slate-800 dark:text-slate-200 font-semibold text-sm sm:text-base">Mijn verhaal *</Label>
          <Textarea
            id="content"
            placeholder="Lieve dagboek,&#10;&#10;Vandaag was een bijzondere dag omdat..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="font-serif text-sm sm:text-base leading-relaxed bg-transparent border-none shadow-none resize-none focus:ring-0 px-3 sm:px-6 py-3 sm:py-4 min-h-[250px] sm:min-h-[300px] text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 placeholder:italic"
            maxLength={2000}
            style={{
              lineHeight: '30px', // Adjusted for mobile
              background: 'transparent'
            }}
          />
          <div className="flex justify-between text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 font-serif italic">
            <span>{wordCount} woorden geschreven</span>
            <span>{content.length}/2000 karakters</span>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2 relative z-10">
          <Label className="font-serif text-slate-800 dark:text-slate-200 font-semibold text-sm sm:text-base">Herinneringswoorden</Label>
          <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 max-h-20 overflow-y-auto">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-serif text-xs">
                #{tag}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeTag(tag)}
                />
              </Badge>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Voeg een herinneringswoord toe..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleKeyPress}
              className="font-serif bg-slate-50 dark:bg-slate-900/30 border-slate-300 dark:border-slate-700 text-sm"
            />
            <Button onClick={addTag} variant="outline" size="sm" className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 flex-shrink-0">
              <Tag className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="ml-1 sm:hidden">Toevoegen</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Settings Panel - Outside the book */}
      <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 rounded-lg border border-slate-200 dark:border-slate-700">
        <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
          ⚙️ Instellingen
        </h3>

        {/* Privacy Settings */}
        <div className="space-y-3 sm:space-y-4">
          <Label className="text-sm sm:text-base">Privacy Instellingen</Label>
          
          <div className="space-y-2">
            <Label htmlFor="privacy-level" className="text-xs sm:text-sm">Zichtbaarheid</Label>
            <Select value={privacyLevel} onValueChange={(value) => setPrivacyLevel(value as 'private' | 'shared_contacts' | 'public')}>
              <SelectTrigger className="text-sm">
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
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel} className="font-serif text-sm">
          ❌ Annuleren
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={saving || !content.trim()}
          className="font-serif bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
        >
          {saving ? (
            <>💫 Opslaan...</>
          ) : (
            <>
              <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              {entry ? '📝 Bijwerken' : '📖 Opslaan in Dagboek'}
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