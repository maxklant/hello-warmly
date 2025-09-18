import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MessageCircle, Phone, Target, Clock } from "lucide-react";

const mockContactData: Record<string, {
  name: string;
  avatar: string;
  status: string;
  statusType: string;
  lastCheckIn: string;
  history: Array<{ status: string; time: string }>;
}> = {
  "1": { 
    name: "Mama", 
    avatar: "👩", 
    status: "Alles oké",
    statusType: "ok",
    lastCheckIn: "2 uur geleden",
    history: [
      { status: "Alles oké", time: "2 uur geleden" },
      { status: "Druk bezig", time: "1 dag geleden" },
      { status: "Alles oké", time: "3 dagen geleden" },
    ]
  },
  "2": { 
    name: "Papa", 
    avatar: "👨", 
    status: "Druk bezig",
    statusType: "busy", 
    lastCheckIn: "4 uur geleden",
    history: [
      { status: "Druk bezig", time: "4 uur geleden" },
      { status: "Alles oké", time: "2 dagen geleden" },
      { status: "Bel me later", time: "5 dagen geleden" },
    ]
  },
};

const ContactDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const contact = mockContactData[id || ""];

  if (!contact) {
    return <div>Contact niet gevonden</div>;
  }

  const getStatusClass = (statusType: string) => {
    switch (statusType) {
      case "ok": return "status-ok";
      case "busy": return "status-busy";
      case "call": return "status-call";
      default: return "status-ok";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 pt-12 pb-6 px-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full p-0"
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-xl font-bold text-foreground">
          {contact.name}
        </h1>
      </div>

      {/* Profile Section */}
      <div className="px-6 mb-8">
        <Card className="p-8 contact-card text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-4xl">
            {contact.avatar}
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {contact.name}
          </h2>
          
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4 ${getStatusClass(contact.statusType)}`}>
            <Clock size={14} />
            {contact.status} • {contact.lastCheckIn}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Button className="rounded-xl flex-1 max-w-[140px]">
              <MessageCircle size={16} className="mr-2" />
              Bericht
            </Button>
            
            <Button variant="outline" className="rounded-xl flex-1 max-w-[140px]">
              <Phone size={16} className="mr-2" />
              Bellen
            </Button>
          </div>
        </Card>
      </div>

      {/* Challenge Section */}
      <div className="px-6 mb-8">
        <Card className="p-6 contact-card">
          <div className="flex items-center gap-3 mb-4">
            <Target className="text-accent-foreground" size={20} />
            <h3 className="font-semibold text-foreground">Challenge sturen</h3>
          </div>
          
          <p className="text-muted-foreground mb-4 text-sm">
            Stuur een vriendelijke herinnering om contact te houden
          </p>
          
          <Button variant="outline" className="w-full rounded-xl">
            Bel me binnen 3 dagen
          </Button>
        </Card>
      </div>

      {/* Check-in History */}
      <div className="px-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Recente check-ins
        </h3>
        
        <div className="space-y-3">
          {contact.history.map((item, index) => (
            <Card key={index} className="p-4 contact-card">
              <div className="flex items-center justify-between">
                <div className="status-badge status-ok">
                  {item.status}
                </div>
                <span className="text-sm text-muted-foreground">
                  {item.time}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactDetail;