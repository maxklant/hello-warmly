import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Phone, AlertCircle, User, VolumeX, MoreVertical, Edit, Volume2, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Navigation from "@/components/Navigation";
import { useNavigate } from "react-router-dom";
import { Contact, STORAGE_KEYS } from "@/types";

const Timeline = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    // Load contacts from localStorage
    const savedContacts = localStorage.getItem(STORAGE_KEYS.USER_CONTACTS);
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    }
  }, []);

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

  const handleRemoveContact = (contactId: string) => {
    const updatedContacts = contacts.filter(contact => contact.id !== contactId);
    setContacts(updatedContacts);
    localStorage.setItem(STORAGE_KEYS.USER_CONTACTS, JSON.stringify(updatedContacts));
  };

  const handleChatWithContact = (contact: Contact) => {
    navigate(`/chat?contact=${contact.id}`);
  };

  const handleEditContact = (contact: Contact) => {
    navigate(`/settings`);
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return "";
    // Simple Dutch phone number formatting
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{2})(\d{3})/, '$1 $2 $3 $4');
    } else if (cleaned.length === 11 && cleaned.startsWith('31')) {
      return `+${cleaned.substring(0, 2)} ${cleaned.substring(2, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7, 9)} ${cleaned.substring(9)}`;
    }
    return phone;
  };

  const getRandomStatus = () => {
    const statuses = [
      { text: "Alles oké", class: "status-ok", recent: true },
      { text: "Druk bezig", class: "status-busy", recent: Math.random() > 0.5 },
      { text: "Bel me later", class: "status-call", recent: Math.random() > 0.3 },
    ];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  const getRandomTime = () => {
    const times = [
      "2 uur geleden",
      "4 uur geleden", 
      "1 dag geleden",
      "3 dagen geleden",
      "1 week geleden"
    ];
    return times[Math.floor(Math.random() * times.length)];
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="pt-12 pb-8 px-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Timeline
        </h1>
        <p className="text-muted-foreground">
          Overzicht van alle check-ins van je contacten
        </p>
      </div>

      {/* Contacts List */}
      <div className="px-6 space-y-4">
        {contacts.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <User size={64} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">Nog geen contacten</p>
            <p className="text-sm mb-6">Voeg contacten toe om hun check-ins te volgen</p>
            <Button 
              onClick={() => navigate('/settings')}
              className="rounded-xl"
            >
              Contacten toevoegen
            </Button>
          </div>
        ) : (
          contacts.map((contact) => {
            const isMuted = isContactMuted(contact);
            const status = getRandomStatus();
            const time = getRandomTime();
            
            return (
              <Card 
                key={contact.id} 
                className={`p-4 contact-card transition-colors ${isMuted ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <User size={24} className="text-primary" />
                      </div>
                      {!status.recent && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center">
                          <AlertCircle size={10} className="text-destructive-foreground" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{contact.name}</p>
                        {isMuted && (
                          <VolumeX size={14} className="text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`status-badge ${status.class} text-xs`}>
                          {status.text}
                        </div>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{time}</span>
                      </div>
                      {contact.email && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {contact.email}
                        </p>
                      )}
                      {contact.phone && (
                        <p className="text-xs text-muted-foreground">
                          {formatPhoneNumber(contact.phone)}
                        </p>
                      )}
                      {isMuted && contact.mutedUntil && (
                        <p className="text-xs text-orange-500 mt-1">
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
                      size="sm"
                      variant="ghost"
                      className="w-9 h-9 rounded-full p-0 text-primary hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChatWithContact(contact);
                      }}
                    >
                      <MessageCircle size={16} />
                    </Button>
                    
                    {contact.phone && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-9 h-9 rounded-full p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`tel:${contact.phone}`, '_self');
                        }}
                      >
                        <Phone size={16} />
                      </Button>
                    )}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          size="sm"
                          variant="ghost" 
                          className="w-9 h-9 rounded-full p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
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
                          onClick={() => handleRemoveContact(contact.id)}
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

      {/* Quick Actions */}
      {contacts.length > 0 && (
        <div className="px-6 mt-8">
          <Card className="p-4 contact-card text-center">
            <p className="text-muted-foreground mb-4">
              Wil je meer mensen uitnodigen voor Check-in?
            </p>
            <Button 
              variant="outline" 
              className="rounded-xl"
              onClick={() => navigate('/settings')}
            >
              Contacten uitnodigen
            </Button>
          </Card>
        </div>
      )}

      <Navigation />
    </div>
  );
};

export default Timeline;