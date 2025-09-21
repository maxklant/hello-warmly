import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, ArrowLeft, Activity, Users, Clock } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { friendshipService, FriendUser } from "@/services/friendship";
import { useToast } from "@/hooks/use-toast";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useAuth } from "@/hooks/useAuth";
import { supabase as _supabase } from "@/lib/supabase";

// Cast supabase client to bypass typing issues for messages
const supabase = _supabase as any;

interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  type: 'text' | 'check-in-reaction' | 'image' | 'system';
  is_read: boolean;
  created_at: string;
}

interface ChatMessageWithSender extends ChatMessage {
  sender: FriendUser;
}

const Chat = () => {
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [messages, setMessages] = useState<ChatMessageWithSender[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFriend, setSelectedFriend] = useState<FriendUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const markMessagesAsRead = useCallback(async (friendId: string) => {
    if (!user?.id) return;

    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', friendId)
        .eq('receiver_id', user.id)
        .eq('is_read', false);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [user?.id]);

  const loadFriends = useCallback(async () => {
    try {
      const friendsData = await friendshipService.getFriends();
      setFriends(friendsData);
    } catch (error) {
      console.error('Error loading friends:', error);
      toast({
        title: "Error",
        description: "Failed to load friends",
        variant: "destructive",
      });
    }
  }, [toast]);

  const loadMessages = useCallback(async (friendId: string) => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(*)
        `)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);

      // Mark messages as read
      await markMessagesAsRead(friendId);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, toast, markMessagesAsRead]);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  useEffect(() => {
    if (selectedFriend) {
      loadMessages(selectedFriend.id);
    }
  }, [selectedFriend, loadMessages]);

  useEffect(() => {
    // Check if we need to open a specific chat
    const friendId = searchParams.get("friend");
    if (friendId && friends.length > 0) {
      const friend = friends.find(f => f.id === friendId);
      if (friend) {
        setSelectedFriend(friend);
      }
    }
  }, [searchParams, friends]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedFriend || !user?.id) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: selectedFriend.id,
          message: newMessage.trim(),
          type: 'text'
        });

      if (error) throw error;

      setNewMessage("");
      // Reload messages to show the new one
      await loadMessages(selectedFriend.id);

      toast({
        title: "Success",
        description: "Message sent!",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const getLastMessageWithFriend = async (friend: FriendUser) => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friend.id}),and(sender_id.eq.${friend.id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error getting last message:', error);
      return null;
    }
  };

  const getUnreadCount = async (friend: FriendUser) => {
    if (!user?.id) return 0;

    try {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_id', friend.id)
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins < 1 ? 'now' : `${diffMins}m`;
    } else if (diffDays < 1) {
      return `${diffHours}h`;
    } else if (diffDays < 7) {
      return `${diffDays}d`;
    } else {
      return date.toLocaleDateString('nl-NL', { month: 'short', day: 'numeric' });
    }
  };

  if (selectedFriend) {
    return (
      <div className="min-h-screen bg-background pb-20">
        {/* Chat Header */}
        <div className="sticky top-0 bg-card border-b border-border/50 px-4 py-3 z-10">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFriend(null)}
              className="p-1"
            >
              <ArrowLeft size={20} />
            </Button>
            
            <Avatar className="w-8 h-8">
              <AvatarImage src={selectedFriend.avatar_url || undefined} />
              <AvatarFallback>
                {getInitials(selectedFriend.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-foreground">{selectedFriend.name}</h2>
                {selectedFriend.username && (
                  <span className="text-sm text-muted-foreground">@{selectedFriend.username}</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Online • Chat via Check-in app
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 px-4">
          <ScrollArea className="h-[calc(100vh-200px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading messages...</div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium text-foreground mb-2">No messages yet</h3>
                <p className="text-sm text-muted-foreground">
                  Start the conversation with {selectedFriend.name}!
                </p>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-3 py-2 ${
                        message.sender_id === user?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender_id === user?.id
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                      }`}>
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Message Input */}
        <div className="sticky bottom-20 bg-background border-t border-border/50 px-4 py-3">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message ${selectedFriend.name}...`}
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button
              onClick={sendMessage}
              size="sm"
              disabled={!newMessage.trim()}
            >
              <Send size={16} />
            </Button>
          </div>
        </div>

        <Navigation />
      </div>
    );
  }

  // Friends List View
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="pt-12 pb-8 px-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Chat
        </h1>
        <p className="text-muted-foreground">
          Chat with your friends
        </p>
      </div>

      <div className="px-6">
        {friends.length === 0 ? (
          <Card className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium text-foreground mb-2">No friends to chat with</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add friends first to start chatting
            </p>
            <Button onClick={() => navigate('/settings?tab=friends')}>
              Add Friends
            </Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {friends.map((friend) => (
              <Card
                key={friend.id}
                className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedFriend(friend)}
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={friend.avatar_url || undefined} />
                    <AvatarFallback>{getInitials(friend.name)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground truncate">{friend.name}</h3>
                      {friend.username && (
                        <span className="text-sm text-muted-foreground">@{friend.username}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <Activity className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-muted-foreground">Online</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="secondary" className="text-xs">
                      Friend
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Navigation />
    </div>
  );
};

export default Chat;