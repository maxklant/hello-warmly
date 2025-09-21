import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Users, 
  Activity, 
  Clock, 
  UserPlus,
  AlertCircle,
  User,
  VolumeX,
  Phone,
  Mail
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Friends from "@/components/Friends";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Contact, STORAGE_KEYS } from "@/types";
import { friendshipService, FriendUser } from "@/services/friendship";
import { useToast } from "@/hooks/use-toast";

interface Activity {
  id: string;
  type: string;
  user: { name: string; avatar_url: string | null };
  message: string;
  timestamp: string;
  location?: string;
}

const FriendsAndActivities = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Legacy contacts from localStorage for backward compatibility
  const [contacts, setContacts] = useState<Contact[]>([]);
  
  // Real friends from database
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadFriends = useCallback(async () => {
    try {
      setIsLoading(true);
      const friendsData = await friendshipService.getFriends();
      setFriends(friendsData);
    } catch (error) {
      console.error('Error loading friends:', error);
      toast({
        title: "Error",
        description: "Failed to load friends",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadRecentActivities = useCallback(async () => {
    // TODO: Implement real activity feed from database
    // For now, create mock activities from friends
    const mockActivities: Activity[] = [
      {
        id: "1",
        type: "check-in",
        user: { name: "Emma de Vries", avatar_url: null },
        message: "Just checked in at work 💼",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        location: "Amsterdam, Netherlands"
      },
      {
        id: "2", 
        type: "friend-joined",
        user: { name: "Luca Rossi", avatar_url: null },
        message: "Joined Check-in! 🎉",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      },
      {
        id: "3",
        type: "check-in",
        user: { name: "Sophie Mueller", avatar_url: null },
        message: "Coffee time ☕",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
        location: "Berlin, Germany"
      }
    ];
    
    setRecentActivities(mockActivities);
  }, []);

  useEffect(() => {
    // Load legacy contacts from localStorage for backward compatibility
    const savedContacts = localStorage.getItem(STORAGE_KEYS.USER_CONTACTS);
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    }

    // Load real friends from database
    loadFriends();
    loadRecentActivities();
  }, [loadFriends, loadRecentActivities]);

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return "";
    const cleaned = phone.replace(/\\D/g, '');
    if (cleaned.length === 10) {
      return cleaned.replace(/(\\d{2})(\\d{3})(\\d{2})(\\d{3})/, '$1 $2 $3 $4');
    } else if (cleaned.length === 11 && cleaned.startsWith('31')) {
      return `+${cleaned.substring(0, 2)} ${cleaned.substring(2, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7, 9)} ${cleaned.substring(9)}`;
    }
    return phone;
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'check-in': return <Activity className="h-4 w-4" />;
      case 'friend-joined': return <UserPlus className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'check-in': return 'bg-green-500';
      case 'friend-joined': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const handleChatWithFriend = (friend: FriendUser) => {
    navigate(`/chat?friend=${friend.id}`);
  };

  const handleChatWithContact = (contact: Contact) => {
    navigate(`/chat?contact=${contact.id}`);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="pt-12 pb-6 px-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Friends & Activities
        </h1>
        <p className="text-muted-foreground">
          Connect with friends and see what's happening
        </p>
      </div>

      <div className="px-6">
        <Tabs defaultValue="activities" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="activities" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activities
            </TabsTrigger>
            <TabsTrigger value="friends" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Friends
              {friends.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {friends.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contacts
              {contacts.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {contacts.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Activity</h2>
              <Button variant="outline" size="sm" onClick={() => loadRecentActivities()}>
                Refresh
              </Button>
            </div>

            {recentActivities.length === 0 ? (
              <Card className="p-8 text-center">
                <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium text-foreground mb-2">No recent activity</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  When your friends check in, you'll see their activity here
                </p>
                <Button onClick={() => navigate('/friends?tab=search')}>
                  Add Friends
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <Card key={activity.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full ${getActivityColor(activity.type)} flex items-center justify-center text-white`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{activity.user.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(activity.timestamp)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mt-1">
                          {activity.message}
                        </p>
                        
                        {activity.location && (
                          <p className="text-xs text-muted-foreground mt-1">
                            📍 {activity.location}
                          </p>
                        )}
                      </div>
                      
                      <Button variant="ghost" size="sm" onClick={() => navigate('/chat')}>
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Friends Tab */}
          <TabsContent value="friends" className="mt-6">
            <Friends />
          </TabsContent>

          {/* Legacy Contacts Tab */}
          <TabsContent value="contacts" className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Legacy Contacts</h2>
              <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
                Manage
              </Button>
            </div>

            {contacts.length === 0 ? (
              <Card className="p-8 text-center">
                <Phone className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium text-foreground mb-2">No contacts yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your old contacts from localStorage will appear here
                </p>
                <Button onClick={() => navigate('/settings')}>
                  Add Contacts
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {contacts.map((contact) => {
                  const isMuted = contact.isMuted && (!contact.mutedUntil || new Date(contact.mutedUntil) > new Date());
                  
                  return (
                    <Card key={contact.id} className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                            <User size={20} className="text-primary" />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">{contact.name}</p>
                            {isMuted && <VolumeX size={12} className="text-muted-foreground" />}
                          </div>
                          
                          {contact.email && (
                            <p className="text-xs text-muted-foreground">{contact.email}</p>
                          )}
                          {contact.phone && (
                            <p className="text-xs text-muted-foreground">
                              {formatPhoneNumber(contact.phone)}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleChatWithContact(contact)}
                          >
                            <MessageCircle size={16} />
                          </Button>
                          
                          {contact.phone && (
                            <Button variant="ghost" size="sm">
                              <Phone size={16} />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Navigation />
    </div>
  );
};

export default FriendsAndActivities;