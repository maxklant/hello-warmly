import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Search, Copy, Check, X, Users, Clock } from "lucide-react";
import { friendshipService, FriendUser, FriendRequest } from "@/services/friendship";
import { useToast } from "@/hooks/use-toast";

const Friends = () => {
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FriendUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentUser, setCurrentUser] = useState<FriendUser | null>(null);
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [friendsData, incomingData, outgoingData, userProfile] = await Promise.all([
          friendshipService.getFriends(),
          friendshipService.getIncomingFriendRequests(),
          friendshipService.getOutgoingFriendRequests(),
          friendshipService.getCurrentUserProfile()
        ]);

        setFriends(friendsData);
        setIncomingRequests(incomingData);
        setOutgoingRequests(outgoingData);
        setCurrentUser(userProfile);
      } catch (error) {
        console.error('Error loading friendship data:', error);
        toast({
          title: "Error",
          description: "Failed to load friendship data",
          variant: "destructive",
        });
      }
    };

    loadData();
  }, [toast]);

  const loadData = async () => {
    try {
      const [friendsData, incomingData, outgoingData, userProfile] = await Promise.all([
        friendshipService.getFriends(),
        friendshipService.getIncomingFriendRequests(),
        friendshipService.getOutgoingFriendRequests(),
        friendshipService.getCurrentUserProfile()
      ]);

      setFriends(friendsData);
      setIncomingRequests(incomingData);
      setOutgoingRequests(outgoingData);
      setCurrentUser(userProfile);
    } catch (error) {
      console.error('Error loading friendship data:', error);
      toast({
        title: "Error",
        description: "Failed to load friendship data",
        variant: "destructive",
      });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await friendshipService.searchUsers(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendFriendRequest = async (userId: string) => {
    try {
      const success = await friendshipService.sendFriendRequest(userId);
      if (success) {
        toast({
          title: "Success",
          description: "Friend request sent!",
        });
        setSearchResults([]);
        setSearchQuery("");
        setIsAddFriendOpen(false);
        loadData(); // Refresh data
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Error",
        description: "Failed to send friend request",
        variant: "destructive",
      });
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const success = await friendshipService.acceptFriendRequest(requestId);
      if (success) {
        toast({
          title: "Success",
          description: "Friend request accepted!",
        });
        loadData(); // Refresh data
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast({
        title: "Error",
        description: "Failed to accept friend request",
        variant: "destructive",
      });
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      const success = await friendshipService.declineFriendRequest(requestId);
      if (success) {
        toast({
          title: "Success",
          description: "Friend request declined",
        });
        loadData(); // Refresh data
      }
    } catch (error) {
      console.error('Error declining friend request:', error);
      toast({
        title: "Error",
        description: "Failed to decline friend request",
        variant: "destructive",
      });
    }
  };

  const copyInviteCode = () => {
    if (currentUser?.invite_code) {
      navigator.clipboard.writeText(currentUser.invite_code);
      setCopiedInvite(true);
      setTimeout(() => setCopiedInvite(false), 2000);
      toast({
        title: "Success",
        description: "Invite code copied to clipboard!",
      });
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

  return (
    <div className="space-y-6">
      {/* Header with invite code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Friends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Your invite code</p>
              <code className="text-lg font-mono">{currentUser?.invite_code || '...'}</code>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyInviteCode}
              className="gap-2"
            >
              {copiedInvite ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiedInvite ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Friend Dialog */}
      <Dialog open={isAddFriendOpen} onOpenChange={setIsAddFriendOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Friend
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Friend</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search by username or invite code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            {searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        {user.username && (
                          <p className="text-sm text-muted-foreground">@{user.username}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSendFriendRequest(user.id)}
                    >
                      Add Friend
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Tabs for different friend lists */}
      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="friends">
            Friends ({friends.length})
          </TabsTrigger>
          <TabsTrigger value="incoming">
            Requests ({incomingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="outgoing">
            Sent ({outgoingRequests.length})
          </TabsTrigger>
        </TabsList>

        {/* Friends List */}
        <TabsContent value="friends" className="space-y-4">
          {friends.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">No friends yet</p>
                <p className="text-sm text-muted-foreground">Add friends to start chatting!</p>
              </CardContent>
            </Card>
          ) : (
            friends.map((friend) => (
              <Card key={friend.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={friend.avatar_url || undefined} />
                        <AvatarFallback>{getInitials(friend.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{friend.name}</p>
                        {friend.username && (
                          <p className="text-sm text-muted-foreground">@{friend.username}</p>
                        )}
                        {friend.bio && (
                          <p className="text-sm text-muted-foreground">{friend.bio}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary">Friend</Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Incoming Requests */}
        <TabsContent value="incoming" className="space-y-4">
          {incomingRequests.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">No pending requests</p>
              </CardContent>
            </Card>
          ) : (
            incomingRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={request.requester.avatar_url || undefined} />
                        <AvatarFallback>{getInitials(request.requester.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{request.requester.name}</p>
                        {request.requester.username && (
                          <p className="text-sm text-muted-foreground">@{request.requester.username}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptRequest(request.id)}
                        className="gap-1"
                      >
                        <Check className="h-3 w-3" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeclineRequest(request.id)}
                        className="gap-1"
                      >
                        <X className="h-3 w-3" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Outgoing Requests */}
        <TabsContent value="outgoing" className="space-y-4">
          {outgoingRequests.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">No pending requests</p>
              </CardContent>
            </Card>
          ) : (
            outgoingRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={request.receiver.avatar_url || undefined} />
                        <AvatarFallback>{getInitials(request.receiver.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{request.receiver.name}</p>
                        {request.receiver.username && (
                          <p className="text-sm text-muted-foreground">@{request.receiver.username}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Sent {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Friends;