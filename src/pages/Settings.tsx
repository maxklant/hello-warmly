import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Shield, Bell, Palette, LogOut } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const [user, setUser] = useState({ name: "", email: "" });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [privacy, setPrivacy] = useState("contacts");
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("checkInUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleSaveProfile = () => {
    localStorage.setItem("checkInUser", JSON.stringify(user));
    // Show success message
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
          <div className="flex items-center gap-3 mb-4">
            <Palette className="text-primary" size={20} />
            <h3 className="font-semibold text-foreground">Uiterlijk</h3>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>
              De app past zich automatisch aan aan je systeem instellingen.
              Gebruik je telefoon's licht/donker modus instellingen om het 
              thema te wijzigen.
            </p>
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