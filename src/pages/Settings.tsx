import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield, Bell, Palette, LogOut, Plus, Trash2, Filter, Moon, Sun, Phone, Share2, Copy, UserPlus, Mail, Edit, VolumeX, Volume2, MoreVertical } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
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
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();

  useEffect(() => {
    // Load authenticated user info
    if (authUser) {
      setUser({
        name: authUser.name || authUser.email || '',
        email: authUser.email || '',
        phone: authUser.phone || ''
      });
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
  }, [authUser]);

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
      
      // Reset form
      setNewContactName("");
      setNewContactEmail("");
      setNewContactPhone("");
      setIsAddContactOpen(false);
    }
  };

  const handleEditContact = () => {
    if (editingContact && newContactName && (newContactEmail || newContactPhone)) {
      const updatedContacts = contacts.map(contact =>
        contact.id === editingContact.id
          ? { ...contact, name: newContactName, email: newContactEmail, phone: newContactPhone }
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

  const handleDeleteContact = (contactId: string) => {
    const updatedContacts = contacts.filter(contact => contact.id !== contactId);
    setContacts(updatedContacts);
    localStorage.setItem(STORAGE_KEYS.USER_CONTACTS, JSON.stringify(updatedContacts));
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
    try {
      await navigator.clipboard.writeText(inviteLink);
      // Show success message
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback - force logout even if API call fails
      localStorage.removeItem(STORAGE_KEYS.CHECK_IN_USER);
      localStorage.removeItem(STORAGE_KEYS.LAST_CHECK_IN);
      navigate("/login");
    } finally {
      setIsLoggingOut(false);
    }
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

      <div className="px-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profiel</TabsTrigger>
            <TabsTrigger value="settings">App Settings</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6 mt-6">
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
                  <label className="block text-sm font-medium mb-2">Telefoon</label>
                  <Input
                    type="tel"
                    value={user.phone}
                    onChange={(e) => setUser({ ...user, phone: e.target.value })}
                    placeholder="+31 6 12345678"
                    className="rounded-xl"
                  />
                </div>

                <Button 
                  onClick={handleSaveProfile}
                  className="w-full rounded-xl check-in-button bg-primary hover:bg-primary/90"
                >
                  Opslaan
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
                    Wie kan je check-ins zien?
                  </label>
                  <Select value={privacy} onValueChange={(value: PrivacyLevel) => setPrivacy(value)}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="everyone">Iedereen</SelectItem>
                      <SelectItem value="contacts">Alleen contacten</SelectItem>
                      <SelectItem value="family">Alleen familie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  <p>
                    Je privacy is belangrijk voor ons. We slaan alleen de gegevens op 
                    die je uitnodigt. We delen nooit je gegevens met derden.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 mt-6">
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

            {/* Logout */}
            <Card className="p-6 contact-card">
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="w-full rounded-xl"
                disabled={isLoggingOut}
              >
                <LogOut size={16} className="mr-2" />
                {isLoggingOut ? 'Uitloggen...' : 'Uitloggen'}
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Navigation />
    </div>
  );
};

export default Settings;