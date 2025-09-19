import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, Shield, Bell, Palette, LogOut, Plus, Trash2, Filter, Moon, Sun } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const [user, setUser] = useState({ name: "", email: "" });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [privacy, setPrivacy] = useState("contacts");
  const [darkMode, setDarkMode] = useState(false);
  const [contacts, setContacts] = useState<Array<{id: string, name: string, email: string}>>([]);
  const [newContactName, setNewContactName] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [checkInFilter, setCheckInFilter] = useState("all"); // all, today, week, month
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("checkInUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Load saved contacts
    const savedContacts = localStorage.getItem("userContacts");
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    }

    // Load dark mode preference
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode) {
      const isDark = JSON.parse(savedDarkMode);
      setDarkMode(isDark);
      applyDarkMode(isDark);
    }

    // Load check-in filter preference
    const savedFilter = localStorage.getItem("checkInFilter");
    if (savedFilter) {
      setCheckInFilter(savedFilter);
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
    localStorage.setItem("darkMode", JSON.stringify(enabled));
    applyDarkMode(enabled);
  };

  const handleSaveProfile = () => {
    localStorage.setItem("checkInUser", JSON.stringify(user));
    // Show success message
  };

  const handleAddContact = () => {
    if (newContactName && newContactEmail) {
      const newContact = {
        id: Date.now().toString(),
        name: newContactName,
        email: newContactEmail
      };
      const updatedContacts = [...contacts, newContact];
      setContacts(updatedContacts);
      localStorage.setItem("userContacts", JSON.stringify(updatedContacts));
      setNewContactName("");
      setNewContactEmail("");
      setIsAddContactOpen(false);
    }
  };

  const handleRemoveContact = (contactId: string) => {
    const updatedContacts = contacts.filter(contact => contact.id !== contactId);
    setContacts(updatedContacts);
    localStorage.setItem("userContacts", JSON.stringify(updatedContacts));
  };

  const handleFilterChange = (filter: string) => {
    setCheckInFilter(filter);
    localStorage.setItem("checkInFilter", filter);
  };

  const handleLogout = () => {
    localStorage.removeItem("checkInUser");
    localStorage.removeItem("lastCheckIn");
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
              <Select value={privacy} onValueChange={setPrivacy}>
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
                      placeholder="contact@voorbeeld.nl"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={handleAddContact}
                      disabled={!newContactName || !newContactEmail}
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
              contacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">{contact.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveContact(contact.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))
            )}
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