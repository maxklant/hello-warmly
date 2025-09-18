import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Phone, AlertCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useNavigate } from "react-router-dom";

const mockContacts = [
  { 
    id: 1,
    name: "Mama", 
    status: "Alles oké", 
    time: "2 uur geleden", 
    avatar: "👩",
    statusType: "ok",
    isRecent: true
  },
  { 
    id: 2,
    name: "Papa", 
    status: "Druk bezig", 
    time: "4 uur geleden", 
    avatar: "👨",
    statusType: "busy",
    isRecent: true
  },
  { 
    id: 3,
    name: "Anna", 
    status: "Bel me later", 
    time: "1 dag geleden", 
    avatar: "👧",
    statusType: "call",
    isRecent: false
  },
  { 
    id: 4,
    name: "Oma", 
    status: "Alles oké", 
    time: "8 dagen geleden", 
    avatar: "👵",
    statusType: "ok",
    isRecent: false
  },
  { 
    id: 5,
    name: "Tom", 
    status: "Druk bezig", 
    time: "2 weken geleden", 
    avatar: "👦",
    statusType: "busy",
    isRecent: false
  },
];

const Timeline = () => {
  const navigate = useNavigate();

  const getStatusClass = (statusType: string) => {
    switch (statusType) {
      case "ok": return "status-ok";
      case "busy": return "status-busy";
      case "call": return "status-call";
      default: return "status-ok";
    }
  };

  const handleContactClick = (contactId: number) => {
    navigate(`/contact/${contactId}`);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="pt-12 pb-8 px-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Timeline
        </h1>
        <p className="text-muted-foreground">
          Overzicht van alle check-ins
        </p>
      </div>

      {/* Contacts List */}
      <div className="px-6 space-y-4">
        {mockContacts.map((contact) => (
          <Card 
            key={contact.id} 
            className="p-4 contact-card cursor-pointer hover:scale-[1.02]"
            onClick={() => handleContactClick(contact.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xl">
                    {contact.avatar}
                  </div>
                  {!contact.isRecent && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center">
                      <AlertCircle size={10} className="text-destructive-foreground" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <p className="font-medium text-foreground">{contact.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`status-badge ${getStatusClass(contact.statusType)} text-xs`}>
                      {contact.status}
                    </div>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{contact.time}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-9 h-9 rounded-full p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle message action
                  }}
                >
                  <MessageCircle size={16} />
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-9 h-9 rounded-full p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle call action
                  }}
                >
                  <Phone size={16} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="px-6 mt-8">
        <Card className="p-4 contact-card text-center">
          <p className="text-muted-foreground mb-4">
            Wil je iemand uitnodigen voor Check-in?
          </p>
          <Button variant="outline" className="rounded-xl">
            Contacten uitnodigen
          </Button>
        </Card>
      </div>

      <Navigation />
    </div>
  );
};

export default Timeline;