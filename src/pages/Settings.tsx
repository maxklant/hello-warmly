import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, Shield, Bell, Palette, LogOut, Plus, Trash2, Filter, Moon, Sun, Phone, Share2, Copy, UserPlus, Mail, Edit, VolumeX, Volume2, MoreVertical } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useNavigate } from "react-router-dom";
import { 
  User as UserType, 
  Contact, 
  PrivacyLevel, 
  CheckInFilter,
  STORAGE_KEYS 
} from "@/types";

const Settings = () => {
  const [user, setUser] = useState<UserType>({ name: "", email: "", phone: "" });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [privacy, setPrivacy] = useState<PrivacyLevel>("contacts");
  const [darkMode, setDarkMode] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newContactName, setNewContactName] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [friendPhone, setFriendPhone] = useState("");
  const [checkInFilter, setCheckInFilter] = useState<CheckInFilter>("all");
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isEditContactOpen, setIsEditContactOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isInviteLinkOpen, setIsInviteLinkOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.CHECK_IN_USER);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Load saved contacts
    const savedContacts = localStorage.getItem(STORAGE_KEYS.USER_CONTACTS);
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    }

    // Load dark mode preference
    const savedDarkMode = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
    if (savedDarkMode) {
      const isDark = JSON.parse(savedDarkMode);
      setDarkMode(isDark);
      applyDarkMode(isDark);
    }

    // Load check-in filter preference
    const savedFilter = localStorage.getItem(STORAGE_KEYS.CHECK_IN_FILTER);
    if (savedFilter && (savedFilter === "all" || savedFilter === "today" || savedFilter === "week" || savedFilter === "month")) {
      setCheckInFilter(savedFilter as CheckInFilter);
    }
  }, []);

  const applyDarkMode = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleDarkModeToggle = (enabled: boolean) => {
    setDarkMode(enabled);
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, JSON.stringify(enabled));
    applyDarkMode(enabled);
  };

  const handleSaveProfile = () => {
    localStorage.setItem(STORAGE_KEYS.CHECK_IN_USER, JSON.stringify(user));
    // Show success message
  };

  const handleAddContact = () => {
    if (newContactName && (newContactEmail || newContactPhone)) {
      const newContact = {
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

  const handleRemoveContact = (contactId: string) => {
    const updatedContacts = contacts.filter(contact => contact.id !== contactId);
    setContacts(updatedContacts);
    localStorage.setItem(STORAGE_KEYS.USER_CONTACTS, JSON.stringify(updatedContacts));
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

  const handleFilterChange = (filter: CheckInFilter) => {
    setCheckInFilter(filter);
    localStorage.setItem(STORAGE_KEYS.CHECK_IN_FILTER, filter);
  };

  const generateInviteLink = () => {
    // Generate a unique invite code based on user's phone number or ID
    const userPhone = user.phone || "default";
    const inviteCode = btoa(userPhone + Date.now()).replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
    const baseUrl = window.location.origin + window.location.pathname.replace('/settings', '');
    const link = `${baseUrl}?invite=${inviteCode}&from=${encodeURIComponent(user.name || 'Someone')}`;
    setInviteLink(link);
    
    // Store the invite code for validation
    localStorage.setItem(`invite_${inviteCode}`, JSON.stringify({
      userId: user.phone || user.email,
      userName: user.name,
      createdAt: Date.now()
    }));
    
    return link;
  };

  const copyInviteLink = async () => {
    const link = generateInviteLink();
    try {
      await navigator.clipboard.writeText(link);
      // You could show a toast notification here
      alert("Uitnodigingslink gekopieerd!");
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert("Uitnodigingslink gekopieerd!");
    }
  };

  const shareInviteLink = () => {
    const link = generateInviteLink();
    if (navigator.share) {
      navigator.share({
        title: 'Check-in App Uitnodiging',
        text: `${user.name} nodigt je uit voor de Check-in App!`,
        url: link,
      });
    } else {
      // Fallback to copying
      copyInviteLink();
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Simple Dutch phone number formatting
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{2})(\d{3})/, '$1 $2 $3 $4');
    } else if (cleaned.length === 11 && cleaned.startsWith('31')) {
      return `+${cleaned.substring(0, 2)} ${cleaned.substring(2, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7, 9)} ${cleaned.substring(9)}`;
    }
    return phone;
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.CHECK_IN_USER);
    localStorage.removeItem(STORAGE_KEYS.LAST_CHECK_IN);
    navigate("/onboarding");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="pt-12 pb-8 px-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Instellingen
        </h1>
        <p className="text-muted-foreground">
          Beheer je profiel en app voorkeuren
        </p>
      </div>

      <div className="px-6 space-y-6">
        {/* Profile Settings */}
        <Card className="p-6 contact-card">
          <div className="flex items-center gap-3 mb-6">
            <User className="text-primary" size={20} />
            <h3 className="font-semibold text-foreground">Profiel</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Naam</label>
              <Input
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                placeholder="Je volledige naam"
                className="rounded-xl"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                placeholder="je.email@voorbeeld.nl"
                className="rounded-xl"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Telefoonnummer</label>
              <Input
                type="tel"
                value={user.phone || ''}
                onChange={(e) => setUser({ ...user, phone: e.target.value })}
                placeholder="+31 6 12345678"
                className="rounded-xl"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Gebruikt voor uitnodigingen en contactverzoeken
              </p>
            </div>
            
            <Button onClick={handleSaveProfile} className="w-full rounded-xl">
              Profiel opslaan
            </Button>
          </div>
        </Card>

        {/* Privacy Settings */}
        <Card className="p-6 contact-card">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="text-primary" size={20} />
            <h3 className="font-semibold text-foreground">Privacy</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Wie mag mijn check-ins zien?
              </label>
              <Select value={privacy} onValueChange={(value: PrivacyLevel) => setPrivacy(value)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Iedereen</SelectItem>
                  <SelectItem value="contacts">Alleen contacten</SelectItem>
                  <SelectItem value="family">Alleen gezin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-xl">
              <p className="font-medium mb-2">🔒 Beveiliging</p>
              <p>
                Je check-ins zijn privé en alleen zichtbaar voor de contacten 
                die je uitnodigt. We delen nooit je gegevens met derden.
              </p>
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6 contact-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="text-primary" size={20} />
              <div>
                <h3 className="font-semibold text-foreground">Notificaties</h3>
                <p className="text-sm text-muted-foreground">
                  Ontvang pushmeldingen voor nieuwe check-ins
                </p>
              </div>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>
        </Card>

        {/* Theme Settings */}
        <Card className="p-6 contact-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="text-primary" size={20} /> : <Sun className="text-primary" size={20} />}
              <div>
                <h3 className="font-semibold text-foreground">Donkere modus</h3>
                <p className="text-sm text-muted-foreground">
                  Schakel tussen licht en donker thema
                </p>
              </div>
            </div>
            <Switch
              checked={darkMode}
              onCheckedChange={handleDarkModeToggle}
            />
          </div>
        </Card>

        {/* Contact Management */}
        <Card className="p-6 contact-card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <User className="text-primary" size={20} />
              <h3 className="font-semibold text-foreground">Contacten</h3>
            </div>
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
          
          <div className="space-y-3">
            {contacts.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <User size={48} className="mx-auto mb-4 opacity-50" />
                <p>Nog geen contacten toegevoegd</p>
                <p className="text-sm">Voeg contacten toe om hun check-ins te zien</p>
              </div>
            ) : (
              contacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{contact.name}</p>
                      {contact.isMuted && (
                        <VolumeX size={14} className="text-muted-foreground" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {contact.email && (
                        <div className="flex items-center gap-1">
                          <Mail size={12} />
                          <span>{contact.email}</span>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-1">
                          <Phone size={12} />
                          <span>{formatPhoneNumber(contact.phone)}</span>
                        </div>
                      )}
                      {contact.isMuted && contact.mutedUntil && (
                        <div className="text-xs text-orange-500">
                          Gedempt tot {new Date(contact.mutedUntil).toLocaleString('nl-NL', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      )}
                    </div>
                  </div>
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
                        {contact.isMuted ? (
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
                      {!contact.isMuted && (
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
                        onClick={() => handleRemoveContact(contact.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Verwijderen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Invite System */}
        <Card className="p-6 contact-card">
          <div className="flex items-center gap-3 mb-6">
            <UserPlus className="text-primary" size={20} />
            <h3 className="font-semibold text-foreground">Vrienden uitnodigen</h3>
          </div>
          
          <div className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-xl">
              <h4 className="font-medium mb-2 text-sm">Deel je uitnodigingslink</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Deel deze link met vrienden zodat ze je kunnen toevoegen
              </p>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    const link = generateInviteLink();
                    copyInviteLink();
                  }}
                  variant="outline" 
                  size="sm" 
                  className="rounded-xl flex-1"
                >
                  <Copy size={16} className="mr-1" />
                  Kopieer link
                </Button>
                <Button 
                  onClick={() => {
                    const link = generateInviteLink();
                    shareInviteLink();
                  }}
                  variant="outline" 
                  size="sm" 
                  className="rounded-xl flex-1"
                >
                  <Share2 size={16} className="mr-1" />
                  Delen
                </Button>
              </div>
              
              {inviteLink && (
                <div className="mt-3 p-2 bg-background/50 rounded-lg">
                  <p className="text-xs text-muted-foreground break-all">{inviteLink}</p>
                </div>
              )}
            </div>
            
            <div className="bg-muted/30 p-4 rounded-xl">
              <h4 className="font-medium mb-2 text-sm flex items-center gap-2">
                <Phone size={16} />
                Via telefoonnummer toevoegen
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                Voeg een vriend toe door hun telefoonnummer in te voeren
              </p>
              
              <div className="flex gap-2">
                <Input
                  type="tel"
                  placeholder="+31 6 12345678"
                  className="rounded-xl flex-1"
                  value={friendPhone}
                  onChange={(e) => setFriendPhone(e.target.value)}
                />
                <Button 
                  onClick={() => {
                    if (friendPhone) {
                      setNewContactPhone(friendPhone);
                      setNewContactName("Contact via telefoon");
                      setIsAddContactOpen(true);
                      setFriendPhone("");
                    }
                  }}
                  disabled={!friendPhone}
                  size="sm" 
                  className="rounded-xl"
                >
                  <UserPlus size={16} />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Check-in Filter Settings */}
        <Card className="p-6 contact-card">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="text-primary" size={20} />
            <h3 className="font-semibold text-foreground">Check-in overzicht</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Standaard tijdsperiode
              </label>
              <Select value={checkInFilter} onValueChange={handleFilterChange}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle check-ins</SelectItem>
                  <SelectItem value="today">Vandaag</SelectItem>
                  <SelectItem value="week">Deze week</SelectItem>
                  <SelectItem value="month">Deze maand</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-xl">
              <p className="font-medium mb-2">💡 Tip</p>
              <p>
                Deze instelling bepaalt welke check-ins standaard worden getoond 
                op de timeline en home pagina.
              </p>
            </div>
          </div>
        </Card>

        {/* Status Options */}
        <Card className="p-6 contact-card">
          <div className="flex items-center gap-3 mb-4">
            <User className="text-primary" size={20} />
            <h3 className="font-semibold text-foreground">Status opties</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
              <span className="flex items-center gap-2">
                <span className="text-lg">✅</span>
                <span className="text-sm">Alles oké</span>
              </span>
              <span className="text-xs text-muted-foreground">Standaard</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
              <span className="flex items-center gap-2">
                <span className="text-lg">⏳</span>
                <span className="text-sm">Druk bezig</span>
              </span>
              <span className="text-xs text-muted-foreground">Standaard</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
              <span className="flex items-center gap-2">
                <span className="text-lg">☎️</span>
                <span className="text-sm">Bel me later</span>
              </span>
              <span className="text-xs text-muted-foreground">Standaard</span>
            </div>
          </div>
        </Card>

        {/* Logout */}
        <Card className="p-6 contact-card">
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="w-full rounded-xl"
          >
            <LogOut size={16} className="mr-2" />
            Uitloggen
          </Button>
        </Card>
      </div>

      <Navigation />
    </div>
  );
};

export default Settings;