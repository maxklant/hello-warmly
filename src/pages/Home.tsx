import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, Check, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";

const statusOptions = [
  { id: "ok", emoji: "✅", text: "Alles oké", className: "status-ok" },
  { id: "busy", emoji: "⏳", text: "Druk bezig", className: "status-busy" },
  { id: "call", emoji: "☎️", text: "Bel me later", className: "status-call" },
];

const mockContacts = [
  { name: "Mama", status: "Alles oké", time: "2 uur geleden", avatar: "👩" },
  { name: "Papa", status: "Druk bezig", time: "4 uur geleden", avatar: "👨" },
  { name: "Anna", status: "Bel me later", time: "1 dag geleden", avatar: "👧" },
];

const Home = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [showStatusOptions, setShowStatusOptions] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("lastCheckIn");
    if (saved) {
      setLastCheckIn(saved);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("checkInUser");
    localStorage.removeItem("lastCheckIn");
    
    // Trigger custom event to notify App component
    window.dispatchEvent(new Event('localStorageChange'));
    
    navigate("/onboarding");
  };

  const handleCheckIn = () => {
    if (!isCheckedIn) {
      setShowStatusOptions(true);
    }
  };

  const handleStatusSelect = (statusId: string) => {
    const status = statusOptions.find(s => s.id === statusId);
    setSelectedStatus(status?.text || "");
    setIsCheckedIn(true);
    setShowStatusOptions(false);
    
    const now = new Date().toLocaleString("nl-NL");
    setLastCheckIn(now);
    localStorage.setItem("lastCheckIn", now);
    
    // Reset after animation
    setTimeout(() => {
      setIsCheckedIn(false);
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
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock size={16} />
            <span className="text-sm">Laatste check-in: {lastCheckIn}</span>
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
            <h3 className="text-lg font-semibold text-center mb-6">
              Hoe gaat het met je?
            </h3>
            
            <div className="space-y-3">
              {statusOptions.map((option) => (
                <Button
                  key={option.id}
                  variant="outline"
                  onClick={() => handleStatusSelect(option.id)}
                  className={`w-full justify-start text-left h-12 rounded-xl ${option.className}`}
                >
                  <span className="text-xl mr-3">{option.emoji}</span>
                  {option.text}
                </Button>
              ))}
            </div>
            
            <Button
              variant="ghost"
              onClick={() => setShowStatusOptions(false)}
              className="w-full mt-4 text-muted-foreground"
            >
              Annuleren
            </Button>
          </Card>
        )}
      </div>

      {/* Recent Contacts */}
      <div className="px-6">
        <h2 className="text-lg font-semibold mb-4">Recente check-ins</h2>
        
        <div className="space-y-3">
          {mockContacts.map((contact, index) => (
            <Card key={index} className="p-4 contact-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-lg">
                    {contact.avatar}
                  </div>
                  
                  <div>
                    <p className="font-medium text-foreground">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">{contact.time}</p>
                  </div>
                </div>
                
                <div className="status-badge status-ok">
                  {contact.status}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default Home;