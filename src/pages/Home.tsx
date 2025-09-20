import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Clock, Check, LogOut, Plus, User, Mail, Phone, Trash2, ChevronLeft, ChevronRight, Heart, Smile, MessageCircle, MoreVertical, Edit, VolumeX, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Navigation from "@/components/Navigation";
import { 
  StatusOption, 
  EmotionOption, 
  Contact, 
  User as UserType, 
  CheckInData,
  PrivacyLevel,
  STORAGE_KEYS 
} from "@/types";

const statusOptions: StatusOption[] = [
  { id: "ok", emoji: "✅", text: "Alles oké", className: "status-ok" },
  { id: "busy", emoji: "⏳", text: "Druk bezig", className: "status-busy" },
  { id: "call", emoji: "☎️", text: "Bel me later", className: "status-call" },
  { id: "app", emoji: "☎️", text: "app mij later", className: "status-call" },
  { id: "custom", emoji: "✏️", text: "Eigen status...", className: "status-custom" },
];

const emotionOptions: EmotionOption[] = [
  { id: "happy", emoji: "😊", text: "Blij" },
  { id: "excited", emoji: "🤗", text: "Enthousiast" },
  { id: "calm", emoji: "😌", text: "Rustig" },
  { id: "tired", emoji: "😴", text: "Moe" },
  { id: "stressed", emoji: "😰", text: "Gestrest" },
  { id: "sad", emoji: "😢", text: "Verdrietig" },
  { id: "angry", emoji: "😠", text: "Boos" },
  { id: "anxious", emoji: "😟", text: "Bezorgd" },
];

const Home = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [showStatusOptions, setShowStatusOptions] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [newContactName, setNewContactName] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [isEditContactOpen, setIsEditContactOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  
  // Extended check-in state
  const [checkInStep, setCheckInStep] = useState(0); // 0: status, 1: mood, 2: emotions, 3: activities, 4: visibility
  const [customStatus, setCustomStatus] = useState("");
  const [moodRating, setMoodRating] = useState(5);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [todayActivities, setTodayActivities] = useState("");
  const [currentActivity, setCurrentActivity] = useState("");
  const [checkInVisibility, setCheckInVisibility] = useState<PrivacyLevel>("contacts");
  
  const navigate = useNavigate();

  // Utility function to check if a contact is currently muted
  const isContactMuted = (contact: Contact): boolean => {
    if (!contact.isMuted) return false;
    
    // If there's a mutedUntil date, check if it's still in the future
    if (contact.mutedUntil) {
      const mutedUntilDate = new Date(contact.mutedUntil);
      const now = new Date();
      return now < mutedUntilDate;
    }
    
    // If isMuted is true but no mutedUntil date, it's permanently muted
    return true;
  };

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LAST_CHECK_IN);
    if (saved) {
      setLastCheckIn(saved);
    }
    
    // Load contacts from localStorage
    const savedContacts = localStorage.getItem(STORAGE_KEYS.USER_CONTACTS);
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    }

    // Load last check-in data for display
    const savedCheckInData = localStorage.getItem(STORAGE_KEYS.LAST_CHECK_IN_DATA);
    if (savedCheckInData) {
      const data = JSON.parse(savedCheckInData);
      setSelectedStatus(data.status);
    }
  }, []);

  const getLastCheckInData = (): CheckInData | null => {
    const saved = localStorage.getItem(STORAGE_KEYS.LAST_CHECK_IN_DATA);
    return saved ? JSON.parse(saved) : null;
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.CHECK_IN_USER);
    localStorage.removeItem(STORAGE_KEYS.LAST_CHECK_IN);
    
    // Trigger custom event to notify App component
    window.dispatchEvent(new Event('localStorageChange'));
    
    navigate("/onboarding");
  };

  const handleAddContact = () => {
    if (newContactName && (newContactEmail || newContactPhone)) {
      const newContact: Contact = {
        id: Date.now().toString(),
        name: newContactName,
        email: newContactEmail,
        phone: newContactPhone
      };
      const updatedContacts = [...contacts, newContact];
      setContacts(updatedContacts);
      localStorage.setItem(STORAGE_KEYS.USER_CONTACTS, JSON.stringify(updatedContacts));
      setNewContactName("");
      setNewContactEmail("");
      setNewContactPhone("");
      setIsAddContactOpen(false);
    }
  };

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    setIsContactDialogOpen(true);
  };

  const handleRemoveContact = (contactId: string) => {
    const updatedContacts = contacts.filter(contact => contact.id !== contactId);
    setContacts(updatedContacts);
    localStorage.setItem(STORAGE_KEYS.USER_CONTACTS, JSON.stringify(updatedContacts));
    setIsContactDialogOpen(false);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setNewContactName(contact.name);
    setNewContactEmail(contact.email);
    setNewContactPhone(contact.phone || "");
    setIsEditContactOpen(true);
  };

  const handleUpdateContact = () => {
    if (editingContact && newContactName.trim()) {
      const updatedContacts = contacts.map(contact => 
        contact.id === editingContact.id 
          ? { 
              ...contact, 
              name: newContactName.trim(),
              email: newContactEmail.trim(),
              phone: newContactPhone.trim() || undefined
            }
          : contact
      );
      
      setContacts(updatedContacts);
      localStorage.setItem(STORAGE_KEYS.USER_CONTACTS, JSON.stringify(updatedContacts));
      
      // Reset form
      setNewContactName("");
      setNewContactEmail("");
      setNewContactPhone("");
      setEditingContact(null);
      setIsEditContactOpen(false);
    }
  };

  const handleToggleMute = (contactId: string) => {
    const updatedContacts = contacts.map(contact => 
      contact.id === contactId 
        ? { ...contact, isMuted: !contact.isMuted }
        : contact
    );
    
    setContacts(updatedContacts);
    localStorage.setItem(STORAGE_KEYS.USER_CONTACTS, JSON.stringify(updatedContacts));
  };

  const handleMuteTemporary = (contactId: string, hours: number) => {
    const mutedUntil = new Date();
    mutedUntil.setHours(mutedUntil.getHours() + hours);
    
    const updatedContacts = contacts.map(contact => 
      contact.id === contactId 
        ? { 
            ...contact, 
            isMuted: true,
            mutedUntil: mutedUntil.toISOString()
          }
        : contact
    );
    
    setContacts(updatedContacts);
    localStorage.setItem(STORAGE_KEYS.USER_CONTACTS, JSON.stringify(updatedContacts));
  };

  const handleChatWithContact = (contact: Contact) => {
    navigate(`/chat?contact=${contact.id}`);
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return "";
    // Simple Dutch phone number formatting
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('31')) {
      return `+31 ${cleaned.slice(2, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
    }
    if (cleaned.startsWith('06')) {
      return `+31 ${cleaned.slice(1, 2)} ${cleaned.slice(2, 6)} ${cleaned.slice(6)}`;
    }
    return phone;
  };

  const handleCheckIn = () => {
    if (!isCheckedIn) {
      setShowStatusOptions(true);
    }
  };

  const handleStatusSelect = (statusId: string) => {
    if (statusId === "custom") {
      // Keep status options open for custom input
      return;
    }
    
    const status = statusOptions.find(s => s.id === statusId);
    setSelectedStatus(status?.text || "");
    setCheckInStep(1); // Move to mood rating step
  };

  const handleCustomStatusSubmit = () => {
    if (customStatus.trim()) {
      setSelectedStatus(customStatus);
      setCheckInStep(1);
    }
  };

  const handleEmotionToggle = (emotionId: string) => {
    if (selectedEmotions.includes(emotionId)) {
      setSelectedEmotions(selectedEmotions.filter(id => id !== emotionId));
    } else {
      setSelectedEmotions([...selectedEmotions, emotionId]);
    }
  };


  const handleNextStep = () => {
    if (checkInStep < 4) {
      setCheckInStep(checkInStep + 1);
    } else {
      // Complete check-in
      completeCheckIn();
    }
  };

  const handlePrevStep = () => {
    if (checkInStep > 0) {
      setCheckInStep(checkInStep - 1);
    } else {
      resetCheckIn();
    }
  };

  const resetCheckIn = () => {
    setShowStatusOptions(false);
    setCheckInStep(0);
    setCustomStatus("");
    setMoodRating(5);
    setSelectedEmotions([]);
    setTodayActivities("");
    setCurrentActivity("");
    setCheckInVisibility("contacts");
  };

  const completeCheckIn = () => {
    const checkInData: CheckInData = {
      status: selectedStatus || "",
      mood: moodRating,
      emotions: selectedEmotions,
      todayActivities,
      currentActivity,
      visibility: checkInVisibility,
      timestamp: new Date().toLocaleString("nl-NL")
    };

    setIsCheckedIn(true);
    setShowStatusOptions(false);
    
    const now = new Date().toLocaleString("nl-NL");
    setLastCheckIn(now);
    localStorage.setItem(STORAGE_KEYS.LAST_CHECK_IN, now);
    localStorage.setItem(STORAGE_KEYS.LAST_CHECK_IN_DATA, JSON.stringify(checkInData));
    
    // Reset after animation
    setTimeout(() => {
      setIsCheckedIn(false);
      resetCheckIn();
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="pt-12 pb-8 px-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-foreground">
            Hallo! 👋
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut size={20} />
          </Button>
        </div>
        {lastCheckIn && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock size={16} />
              <span className="text-sm">Laatste check-in: {lastCheckIn}</span>
            </div>
            {(() => {
              const checkInData = getLastCheckInData();
              return checkInData && (
                <div className="bg-muted/30 p-3 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">
                      {checkInData.mood <= 3 ? "😔" : checkInData.mood <= 6 ? "😐" : checkInData.mood <= 8 ? "🙂" : "😄"}
                    </span>
                    <span className="font-medium">{checkInData.status}</span>
                    <span className="text-sm text-muted-foreground">({checkInData.mood}/10)</span>
                  </div>
                  {checkInData.currentActivity && (
                    <p className="text-sm text-muted-foreground">Nu: {checkInData.currentActivity}</p>
                  )}
                  {checkInData.emotions && checkInData.emotions.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {checkInData.emotions.map((emotionId: string) => {
                        const emotion = emotionOptions.find(e => e.id === emotionId);
                        return emotion ? (
                          <span key={emotionId} className="text-xs bg-background/50 px-2 py-1 rounded-full">
                            {emotion.emoji} {emotion.text}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Check-in Section */}
      <div className="flex flex-col items-center px-6 mb-12">
        {!showStatusOptions ? (
          <div className="text-center">
            <button
              onClick={handleCheckIn}
              className={`check-in-button mb-6 ${
                isCheckedIn ? "bg-secondary animate-pulse" : ""
              }`}
              disabled={isCheckedIn}
            >
              {isCheckedIn ? (
                <div className="flex items-center gap-2">
                  <Check size={24} />
                  <span className="text-sm">Klaar!</span>
                </div>
              ) : (
                "Check-in"
              )}
            </button>
            
            {selectedStatus && (
              <div className="text-center">
                <p className="text-muted-foreground mb-2">Je status:</p>
                <div className="status-badge status-ok">
                  {selectedStatus}
                </div>
              </div>
            )}
            
            <p className="text-muted-foreground">
              Tik om je status te delen
            </p>
          </div>
        ) : (
          <Card className="w-full max-w-sm p-6 contact-card">
            {/* Progress indicator */}
            <div className="flex justify-center mb-4">
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`w-2 h-2 rounded-full ${
                      step <= checkInStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Step 0: Status Selection */}
            {checkInStep === 0 && (
              <div>
                <h3 className="text-lg font-semibold text-center mb-6">
                  Hoe gaat het met je?
                </h3>
                
                <div className="space-y-3">
                  {statusOptions.map((option) => (
                    <div key={option.id}>
                      {option.id === "custom" ? (
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            onClick={() => {}}
                            className="w-full justify-start text-left h-12 rounded-xl"
                          >
                            <span className="text-xl mr-3">{option.emoji}</span>
                            {option.text}
                          </Button>
                          <div className="flex gap-2">
                            <Input
                              value={customStatus}
                              onChange={(e) => setCustomStatus(e.target.value)}
                              placeholder="Eigen status..."
                              className="rounded-xl"
                            />
                            <Button
                              onClick={handleCustomStatusSubmit}
                              disabled={!customStatus.trim()}
                              size="sm"
                              className="rounded-xl"
                            >
                              ✓
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => handleStatusSelect(option.id)}
                          className={`w-full justify-start text-left h-12 rounded-xl ${option.className}`}
                        >
                          <span className="text-xl mr-3">{option.emoji}</span>
                          {option.text}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: Mood Rating */}
            {checkInStep === 1 && (
              <div>
                <h3 className="text-lg font-semibold text-center mb-2">
                  Hoe voel je je? (1-10)
                </h3>
                <p className="text-sm text-muted-foreground text-center mb-6">
                  1 = heel slecht, 10 = fantastisch
                </p>
                
                <div className="flex justify-center items-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <Button
                      key={num}
                      variant={moodRating === num ? "default" : "outline"}
                      size="sm"
                      onClick={() => setMoodRating(num)}
                      className="w-8 h-8 p-0 rounded-full"
                    >
                      {num}
                    </Button>
                  ))}
                </div>
                
                <div className="text-center mb-4">
                  <div className="text-2xl mb-2">
                    {moodRating <= 3 ? "😔" : moodRating <= 6 ? "😐" : moodRating <= 8 ? "🙂" : "😄"}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Je voelt je: {moodRating}/10
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Emotions */}
            {checkInStep === 2 && (
              <div>
                <h3 className="text-lg font-semibold text-center mb-6">
                  Welke emoties voel je nu?
                </h3>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {emotionOptions.map((emotion) => (
                    <Button
                      key={emotion.id}
                      variant={selectedEmotions.includes(emotion.id) ? "default" : "outline"}
                      onClick={() => handleEmotionToggle(emotion.id)}
                      className="h-12 rounded-xl justify-start"
                    >
                      <span className="text-lg mr-2">{emotion.emoji}</span>
                      <span className="text-sm">{emotion.text}</span>
                    </Button>
                  ))}
                </div>
                
                <p className="text-xs text-muted-foreground text-center">
                  Selecteer alle emoties die van toepassing zijn
                </p>
              </div>
            )}

            {/* Step 3: Activities */}
            {checkInStep === 3 && (
              <div>
                <h3 className="text-lg font-semibold text-center mb-6">
                  Wat heb je vandaag gedaan?
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Vandaag gedaan:</label>
                    <Textarea
                      value={todayActivities}
                      onChange={(e) => setTodayActivities(e.target.value)}
                      placeholder="Bijv. gewerkt, geshopt, familie bezocht..."
                      className="rounded-xl"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Nu bezig met:</label>
                    <Input
                      value={currentActivity}
                      onChange={(e) => setCurrentActivity(e.target.value)}
                      placeholder="Bijv. ontspannen, tv kijken, eten..."
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Visibility */}
            {checkInStep === 4 && (
              <div>
                <h3 className="text-lg font-semibold text-center mb-6">
                  Wie mag dit zien?
                </h3>
                
                <div className="space-y-3">
                  <Button
                    variant={checkInVisibility === "everyone" ? "default" : "outline"}
                    onClick={() => setCheckInVisibility("everyone")}
                    className="w-full justify-start h-12 rounded-xl"
                  >
                    <span className="text-lg mr-3">🌍</span>
                    Iedereen
                  </Button>
                  
                  <Button
                    variant={checkInVisibility === "contacts" ? "default" : "outline"}
                    onClick={() => setCheckInVisibility("contacts")}
                    className="w-full justify-start h-12 rounded-xl"
                  >
                    <span className="text-lg mr-3">👥</span>
                    Alleen mijn contacten
                  </Button>
                  
                  <Button
                    variant={checkInVisibility === "family" ? "default" : "outline"}
                    onClick={() => setCheckInVisibility("family")}
                    className="w-full justify-start h-12 rounded-xl"
                  >
                    <span className="text-lg mr-3">👨‍👩‍👧‍👦</span>
                    Alleen familie
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                onClick={handlePrevStep}
                className="flex-1 rounded-xl"
              >
                {checkInStep === 0 ? (
                  "Annuleren"
                ) : (
                  <>
                    <ChevronLeft size={16} className="mr-1" />
                    Vorige
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleNextStep}
                className="flex-1 rounded-xl"
                disabled={
                  (checkInStep === 0 && !selectedStatus) ||
                  (checkInStep === 2 && selectedEmotions.length === 0)
                }
              >
                {checkInStep === 4 ? (
                  "Delen!"
                ) : (
                  <>
                    Volgende
                    <ChevronRight size={16} className="ml-1" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Recent Contacts */}
      <div className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Mijn contacten</h2>
          <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-xl">
                <Plus size={16} className="mr-1" />
                Toevoegen
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-xl">
              <DialogHeader>
                <DialogTitle>Contact toevoegen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Naam</label>
                  <Input
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    placeholder="Voornaam Achternaam"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    type="email"
                    value={newContactEmail}
                    onChange={(e) => setNewContactEmail(e.target.value)}
                    placeholder="contact@voorbeeld.nl (optioneel)"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Telefoonnummer</label>
                  <Input
                    type="tel"
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    placeholder="+31 6 12345678 (optioneel)"
                    className="rounded-xl"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={handleAddContact}
                    disabled={!newContactName || (!newContactEmail && !newContactPhone)}
                    className="flex-1 rounded-xl"
                  >
                    Toevoegen
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddContactOpen(false)}
                    className="flex-1 rounded-xl"
                  >
                    Annuleren
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="space-y-3">
          {contacts.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <User size={48} className="mx-auto mb-4 opacity-50" />
              <p>Nog geen contacten toegevoegd</p>
              <p className="text-sm">Voeg contacten toe om hun check-ins te zien</p>
            </div>
          ) : (
            contacts.map((contact) => {
              const isMuted = isContactMuted(contact);
              
              return (
                <Card 
                  key={contact.id} 
                  className={`p-4 contact-card transition-colors ${isMuted ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex items-center gap-3 flex-1 cursor-pointer hover:bg-muted/30 -m-2 p-2 rounded-lg transition-colors"
                      onClick={() => handleContactClick(contact)}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <User size={20} className="text-primary" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{contact.name}</p>
                          {isMuted && (
                            <VolumeX size={14} className="text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {contact.email && contact.phone 
                            ? `${contact.email} • ${formatPhoneNumber(contact.phone)}`
                            : contact.email || formatPhoneNumber(contact.phone || "")
                          }
                        </p>
                        {isMuted && contact.mutedUntil && (
                          <p className="text-xs text-orange-500">
                            Gedempt tot {new Date(contact.mutedUntil).toLocaleString('nl-NL', { 
                              day: '2-digit', 
                              month: '2-digit', 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleChatWithContact(contact)}
                        className="text-primary hover:text-primary"
                      >
                        <MessageCircle size={16} />
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleEditContact(contact)}>
                            <Edit size={16} className="mr-2" />
                            Bewerken
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleMute(contact.id)}>
                            {isMuted ? (
                              <>
                                <Volume2 size={16} className="mr-2" />
                                Ontdempen
                              </>
                            ) : (
                              <>
                                <VolumeX size={16} className="mr-2" />
                                Dempen
                              </>
                            )}
                          </DropdownMenuItem>
                          {!isMuted && (
                            <>
                              <DropdownMenuItem onClick={() => handleMuteTemporary(contact.id, 1)}>
                                <VolumeX size={16} className="mr-2" />
                                Dempen voor 1 uur
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleMuteTemporary(contact.id, 24)}>
                                <VolumeX size={16} className="mr-2" />
                                Dempen voor 1 dag
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveContact(contact.id);
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 size={16} className="mr-2" />
                            Verwijderen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
        
        {/* Contact Info Dialog */}
        <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
          <DialogContent className="rounded-xl">
            <DialogHeader>
              <DialogTitle>Contact informatie</DialogTitle>
            </DialogHeader>
            {selectedContact && (
              <div className="space-y-4 pt-4">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-3">
                    <User size={32} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{selectedContact.name}</h3>
                </div>
                
                <div className="space-y-3">
                  {selectedContact.email && (
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                      <Mail size={20} className="text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{selectedContact.email}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedContact.phone && (
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                      <Phone size={20} className="text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Telefoon</p>
                        <p className="font-medium">{formatPhoneNumber(selectedContact.phone)}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setIsContactDialogOpen(false);
                      navigate(`/chat?contact=${selectedContact.id}`);
                    }}
                    className="flex-1 rounded-xl"
                  >
                    <MessageCircle size={16} className="mr-1" />
                    Chat
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleRemoveContact(selectedContact.id)}
                    className="flex-1 rounded-xl text-destructive border-destructive/20 hover:bg-destructive/10"
                  >
                    <Trash2 size={16} className="mr-1" />
                    Verwijderen
                  </Button>
                </div>
                
                <Button 
                  onClick={() => setIsContactDialogOpen(false)}
                  className="w-full mt-2 rounded-xl"
                >
                  Sluiten
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Contact Dialog */}
        <Dialog open={isEditContactOpen} onOpenChange={setIsEditContactOpen}>
          <DialogContent className="rounded-xl">
            <DialogHeader>
              <DialogTitle>Contact bewerken</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="block text-sm font-medium mb-2">Naam</label>
                <Input
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="Voornaam Achternaam"
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  placeholder="contact@voorbeeld.nl (optioneel)"
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Telefoonnummer</label>
                <Input
                  type="tel"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  placeholder="+31 6 12345678 (optioneel)"
                  className="rounded-xl"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={handleUpdateContact}
                  disabled={!newContactName.trim()}
                  className="flex-1 rounded-xl"
                >
                  Opslaan
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditContactOpen(false);
                    setEditingContact(null);
                    setNewContactName("");
                    setNewContactEmail("");
                    setNewContactPhone("");
                  }}
                  className="flex-1 rounded-xl"
                >
                  Annuleren
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Navigation />
    </div>
  );
};

export default Home;