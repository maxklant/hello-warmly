import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User as UserIcon, MessageCircle, Send, ArrowLeft, Smile, Activity, Eye, EyeOff, Clock, Filter, Lightbulb, Heart, ThumbsUp, Users, User, ArrowRight, VolumeX } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { 
  ChatMessage, 
  Contact, 
  User as UserType, 
  CheckInData,
  STORAGE_KEYS 
} from "@/types";

const Chat = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Load contacts from localStorage
    const savedContacts = localStorage.getItem(STORAGE_KEYS.USER_CONTACTS);
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    }

    // Load messages from localStorage
    const savedMessages = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }

    // Check if we need to open a specific chat
    const contactId = searchParams.get("contact");
    if (contactId && savedContacts) {
      const contact = JSON.parse(savedContacts).find((c: Contact) => c.id === contactId);
      if (contact) {
        setSelectedContact(contact);
      }
    }
  }, [searchParams]);

  const getCurrentUser = (): UserType => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.CHECK_IN_USER);
    return savedUser ? JSON.parse(savedUser) : { name: "Jij", email: "user@example.com" };
  };

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

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return;

    const currentUser = getCurrentUser();
    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUser.email,
      receiverId: selectedContact.email,
      message: newMessage,
      timestamp: new Date().toLocaleString("nl-NL"),
      type: 'text'
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(updatedMessages));
    setNewMessage("");
  };

  const getMessagesWithContact = (contact: Contact) => {
    const currentUser = getCurrentUser();
    return messages.filter(msg => 
      (msg.senderId === currentUser.email && msg.receiverId === contact.email) ||
      (msg.senderId === contact.email && msg.receiverId === currentUser.email)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const getLastMessageWithContact = (contact: Contact) => {
    const contactMessages = getMessagesWithContact(contact);
    return contactMessages[contactMessages.length - 1];
  };

  const getContactCheckIn = (contact: Contact) => {
    // Get real check-in data if available, otherwise use demo data
    const savedCheckInData = localStorage.getItem(`checkIn_${contact.id}`);
    if (savedCheckInData) {
      return JSON.parse(savedCheckInData);
    }
    
    // Demo check-in data for different contacts
    const demoCheckIns: Record<string, {
      status: string;
      mood: number;
      emotions: string[];
      currentActivity: string;
      todayActivities: string;
      timestamp: string;
    }> = {
      'demo_1': {
        status: "Alles oké",
        mood: 8,
        emotions: ["happy", "calm"],
        currentActivity: "Aan het koken",
        todayActivities: "Boodschappen gedaan, gewerkt",
        timestamp: "1 uur geleden"
      },
      'demo_2': {
        status: "Druk bezig",
        mood: 6,
        emotions: ["busy", "focused"],
        currentActivity: "Vergadering",
        todayActivities: "Hele dag meetings gehad",
        timestamp: "30 min geleden"
      },
      'demo_3': {
        status: "Bel me later",
        mood: 5,
        emotions: ["tired"],
        currentActivity: "Rust uit",
        todayActivities: "Sport en werk",
        timestamp: "2 uur geleden"
      }
    };
    
    // Use contact ID to get consistent demo data, or default
    const demoKeys = Object.keys(demoCheckIns);
    const key = demoKeys[parseInt(contact.id) % demoKeys.length] || 'demo_1';
    return demoCheckIns[key];
  };

  const reactToCheckIn = (contact: Contact, reaction: string) => {
    if (!selectedContact) return;

    const currentUser = getCurrentUser();
    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUser.email,
      receiverId: contact.email,
      message: `${reaction} op je check-in van vandaag`,
      timestamp: new Date().toLocaleString("nl-NL"),
      type: 'check-in-reaction'
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(updatedMessages));
  };

  if (selectedContact) {
    const contactMessages = getMessagesWithContact(selectedContact);
    const currentUser = getCurrentUser();
    const checkIn = getContactCheckIn(selectedContact);
    const isMuted = isContactMuted(selectedContact);

    return (
      <div className="min-h-screen bg-background pb-20">
        {/* Chat Header */}
        <div className="sticky top-0 bg-card border-b border-border/50 px-4 py-3 z-10">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedContact(null)}
              className="p-1"
            >
              <ArrowLeft size={20} />
            </Button>
            
            <Avatar className="w-8 h-8">
              <AvatarFallback>
                {selectedContact.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-foreground">{selectedContact.name}</h2>
                {isMuted && (
                  <VolumeX size={14} className="text-muted-foreground" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {checkIn.status} • {checkIn.timestamp}
                {isMuted && selectedContact.mutedUntil && (
                  <span className="ml-2 text-orange-500">
                    • Gedempt tot {new Date(selectedContact.mutedUntil).toLocaleString('nl-NL', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Check-in Summary */}
        <div className="px-4 py-3 border-b border-border/20">
          <Card className="p-3 contact-card">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Laatste check-in</h4>
              <span className="text-xs text-muted-foreground">{checkIn.timestamp}</span>
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">
                {checkIn.mood <= 3 ? "😔" : checkIn.mood <= 6 ? "😐" : checkIn.mood <= 8 ? "🙂" : "😄"}
              </span>
              <span className="font-medium">{checkIn.status}</span>
              <span className="text-sm text-muted-foreground">({checkIn.mood}/10)</span>
            </div>
            
            {checkIn.currentActivity && (
              <p className="text-sm text-muted-foreground mb-3">
                Nu: {checkIn.currentActivity}
              </p>
            )}
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => reactToCheckIn(selectedContact, "❤️")}
                className="rounded-full h-8 px-3"
              >
                <Heart size={14} className="mr-1" />
                ❤️
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => reactToCheckIn(selectedContact, "👍")}
                className="rounded-full h-8 px-3"
              >
                <ThumbsUp size={14} className="mr-1" />
                👍
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => reactToCheckIn(selectedContact, "😊")}
                className="rounded-full h-8 px-3"
              >
                <Smile size={14} className="mr-1" />
                😊
              </Button>
            </div>
          </Card>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 py-3 h-[calc(100vh-280px)]">
          <div className="space-y-3">
            {contactMessages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p>Nog geen berichten</p>
                <p className="text-sm">Begin een gesprek!</p>
              </div>
            ) : (
              contactMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === currentUser.email ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-xl ${
                      message.senderId === currentUser.email
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    } ${
                      message.type === 'check-in-reaction' 
                        ? "border border-border/50" 
                        : ""
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <p className={`text-xs mt-1 ${
                      message.senderId === currentUser.email 
                        ? "text-primary-foreground/70" 
                        : "text-muted-foreground"
                    }`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="sticky bottom-20 bg-background border-t border-border/50 px-4 py-3">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Typ een bericht..."
              className="rounded-xl flex-1"
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              size="sm"
              className="rounded-xl px-4"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>

        <Navigation />
      </div>
    );
  }

  // Chat List View
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="pt-12 pb-8 px-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Chats 💬
        </h1>
        <p className="text-muted-foreground">
          Chat met je contacten over hun check-ins
        </p>
      </div>

      {/* Chat List */}
      <div className="px-6">
        <div className="space-y-3">
          {contacts.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <User size={48} className="mx-auto mb-4 opacity-50" />
              <p>Nog geen contacten</p>
              <p className="text-sm">Voeg contacten toe om te chatten</p>
            </div>
          ) : (
            contacts.map((contact) => {
              const lastMessage = getLastMessageWithContact(contact);
              const checkIn = getContactCheckIn(contact);
              const isMuted = isContactMuted(contact);
              
              return (
                <Card
                  key={contact.id}
                  className={`p-4 contact-card cursor-pointer hover:bg-muted/50 transition-colors ${isMuted ? 'opacity-60' : ''}`}
                  onClick={() => setSelectedContact(contact)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback>
                        {contact.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground truncate">
                            {contact.name}
                          </h3>
                          {isMuted && (
                            <VolumeX size={14} className="text-muted-foreground" />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {lastMessage ? lastMessage.timestamp.split(' ')[1] : checkIn.timestamp}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">
                          {checkIn.mood <= 3 ? "😔" : checkIn.mood <= 6 ? "😐" : checkIn.mood <= 8 ? "🙂" : "😄"}
                        </span>
                        <span className="text-sm text-muted-foreground truncate">
                          {checkIn.status}
                        </span>
                      </div>
                      
                      {lastMessage ? (
                        <p className="text-sm text-muted-foreground truncate">
                          {lastMessage.type === 'check-in-reaction' && "💫 "}
                          {lastMessage.message}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Nog geen berichten
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <MessageCircle size={16} className="text-muted-foreground" />
                      {lastMessage && (
                        <div className="w-2 h-2 bg-primary rounded-full mt-1" />
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default Chat;