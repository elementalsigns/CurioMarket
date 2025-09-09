import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageCircle, 
  Send, 
  Paperclip, 
  Search, 
  Star,
  Clock,
  User,
  Image as ImageIcon,
  AlertTriangle,
  MoreHorizontal,
  Inbox,
  SendIcon,
  Trash2,
  MoreVertical
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  attachments?: string[];
  timestamp: string;
  isRead: boolean;
}

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  listingId?: string;
  listingTitle?: string;
  listingImage?: string;
}

interface MessagingSystemProps {
  listingId?: string;
  sellerId?: string;
}

export default function MessagingSystem({ listingId, sellerId }: MessagingSystemProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [selectedConversations, setSelectedConversations] = useState<Set<string>>(new Set());
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get conversations
  // Get received conversations 
  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ["/api/messages/conversations"],
    enabled: activeTab === 'received',
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Get sent conversations
  const { data: sentConversations, isLoading: sentConversationsLoading } = useQuery({
    queryKey: ["/api/messages/sent-conversations"],
    enabled: activeTab === 'sent',
    refetchInterval: 30000,
  });

  // Get messages for selected conversation
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/messages/conversation", selectedConversation],
    enabled: !!selectedConversation,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      return await apiRequest("POST", "/api/messages/send", messageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversation", selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
      setMessageText("");
      setIsComposing(false);
      scrollToBottom();
    },
    onError: (error) => {
      toast({
        title: "Message Failed",
        description: "Could not send your message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Start new conversation mutation
  const startConversationMutation = useMutation({
    mutationFn: async (conversationData: any) => {
      return await apiRequest("POST", "/api/messages/conversations", conversationData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
      setSelectedConversation(data.id);
      setMessageText("");
      setIsComposing(false);
      toast({
        title: "Message Sent",
        description: "Your conversation has been started successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Message Failed",
        description: "Could not start conversation. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mark messages as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      return await apiRequest("PUT", `/api/messages/conversations/${conversationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
    },
  });

  // Delete conversation mutation
  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      return await apiRequest("DELETE", `/api/messages/conversations/${conversationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/sent-conversations"] });
      toast({
        title: "Conversation Deleted",
        description: "The conversation has been deleted successfully.",
      });
      if (selectedConversation) {
        setSelectedConversation(null);
      }
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: "Could not delete conversation. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Bulk delete conversations mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (conversationIds: string[]) => {
      return await apiRequest("DELETE", "/api/messages/conversations/bulk", { conversationIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/sent-conversations"] });
      setSelectedConversations(new Set());
      setShowBulkDelete(false);
      toast({
        title: "Conversations Deleted",
        description: `${selectedConversations.size} conversations have been deleted successfully.`,
      });
      if (selectedConversation && selectedConversations.has(selectedConversation)) {
        setSelectedConversation(null);
      }
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: "Could not delete conversations. Please try again.",
        variant: "destructive",
      });
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedConversation) {
      markAsReadMutation.mutate(selectedConversation);
    }
  }, [selectedConversation]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    if (selectedConversation) {
      // Send message to existing conversation
      sendMessageMutation.mutate({
        conversationId: selectedConversation,
        content: messageText,
      });
    } else if (sellerId) {
      // Start new conversation
      startConversationMutation.mutate({
        recipientId: sellerId,
        content: messageText,
        listingId,
      });
    } else {
      toast({
        title: "Cannot Send Message",
        description: "Missing conversation or seller information.",
        variant: "destructive",
      });
    }
  };

  // Handle conversation selection for bulk delete
  const handleConversationSelect = (conversationId: string, checked: boolean) => {
    const newSelected = new Set(selectedConversations);
    if (checked) {
      newSelected.add(conversationId);
    } else {
      newSelected.delete(conversationId);
    }
    setSelectedConversations(newSelected);
  };

  // Handle select all/none
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(filteredConversations.map((conv: Conversation) => conv.id));
      setSelectedConversations(allIds);
    } else {
      setSelectedConversations(new Set());
    }
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedConversations.size === 0) return;
    bulkDeleteMutation.mutate(Array.from(selectedConversations));
  };

  // Choose the right conversations based on active tab
  const activeConversations = activeTab === 'received' ? conversations : sentConversations;
  const activeLoading = activeTab === 'received' ? conversationsLoading : sentConversationsLoading;

  const filteredConversations = activeConversations?.filter((conv: Conversation) =>
    conv.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.listingTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="grid lg:grid-cols-3 gap-6 h-[600px] max-w-6xl mx-auto">
      {/* Conversations List */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>Messages</span>
            <Badge variant="secondary" className="bg-red-600 text-white">
              {activeTab === 'received' 
                ? (conversations?.reduce((acc: number, conv: Conversation) => acc + conv.unreadCount, 0) || 0)
                : 0
              }
            </Badge>
          </CardTitle>
          
          {/* Tabs for Received/Sent */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'received' | 'sent')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
              <TabsTrigger value="received" className="flex items-center gap-2">
                <Inbox size={16} />
                Received
              </TabsTrigger>
              <TabsTrigger value="sent" className="flex items-center gap-2">
                <SendIcon size={16} />
                Sent
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={16} />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          {/* Bulk Delete Controls */}
          {filteredConversations.length > 0 && (
            <div className="mt-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedConversations.size === filteredConversations.length && filteredConversations.length > 0}
                  onCheckedChange={handleSelectAll}
                  className="border-zinc-600"
                />
                <span className="text-sm text-zinc-400">
                  {selectedConversations.size === 0 
                    ? "Select conversations" 
                    : `${selectedConversations.size} selected`}
                </span>
              </div>
              
              {selectedConversations.size > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={bulkDeleteMutation.isPending}
                      data-testid="button-bulk-delete"
                    >
                      <Trash2 size={14} className="mr-1" />
                      Delete ({selectedConversations.size})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">Delete Conversations</AlertDialogTitle>
                      <AlertDialogDescription className="text-zinc-400">
                        Are you sure you want to delete {selectedConversations.size} conversation{selectedConversations.size > 1 ? 's' : ''}? 
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleBulkDelete}
                        className="bg-red-600 text-white hover:bg-red-700"
                        data-testid="button-confirm-bulk-delete"
                      >
                        Delete {selectedConversations.size} Conversations
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {activeLoading ? (
            <div className="space-y-4 p-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex space-x-4">
                  <div className="w-12 h-12 bg-zinc-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-zinc-700 rounded w-3/4"></div>
                    <div className="h-3 bg-zinc-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              {filteredConversations.map((conversation: Conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 border-b border-zinc-700 hover:bg-zinc-800 transition-colors ${
                    selectedConversation === conversation.id ? "bg-zinc-800" : ""
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {/* Checkbox for bulk selection */}
                    <Checkbox
                      checked={selectedConversations.has(conversation.id)}
                      onCheckedChange={(checked) => handleConversationSelect(conversation.id, checked as boolean)}
                      className="border-zinc-600"
                      onClick={(e) => e.stopPropagation()}
                    />
                    
                    <Avatar
                      className="cursor-pointer"
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <AvatarImage src={conversation.participantAvatar} />
                      <AvatarFallback className="bg-zinc-700 text-white">
                        {conversation.participantName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium truncate">
                            {conversation.participantName}
                          </h4>
                          <p className="text-xs text-zinc-500">
                            {activeTab === 'received' ? 'Shop Owner' : 'Buyer'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {conversation.unreadCount > 0 && activeTab === 'received' && (
                            <Badge variant="destructive" className="text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                          <span className="text-xs text-zinc-400">
                            {formatDistanceToNow(new Date(conversation.lastMessageTime), { addSuffix: true })}
                          </span>
                          
                          {/* Individual delete button */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-zinc-400 hover:text-red-400 hover:bg-red-600/10"
                                onClick={(e) => e.stopPropagation()}
                                data-testid={`button-delete-conversation-${conversation.id}`}
                              >
                                <Trash2 size={12} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-white">Delete Conversation</AlertDialogTitle>
                                <AlertDialogDescription className="text-zinc-400">
                                  Are you sure you want to delete your conversation with {conversation.participantName}? 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteConversationMutation.mutate(conversation.id)}
                                  className="bg-red-600 text-white hover:bg-red-700"
                                  data-testid={`button-confirm-delete-conversation-${conversation.id}`}
                                >
                                  Delete Conversation
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      
                      <p className="text-zinc-400 text-sm truncate">
                        {conversation.lastMessage}
                      </p>
                      
                      {conversation.listingTitle && (
                        <div className="flex items-center mt-2 p-2 bg-zinc-800 rounded-lg">
                          {conversation.listingImage && (
                            <img 
                              src={conversation.listingImage}
                              alt={conversation.listingTitle}
                              className="w-8 h-8 object-cover rounded mr-2"
                            />
                          )}
                          <span className="text-xs text-zinc-400 truncate">
                            About: {conversation.listingTitle}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <MessageCircle size={48} className="text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400">
                {activeTab === 'received' ? 'No messages received yet' : 'No messages sent yet'}
              </p>
              {activeTab === 'received' && (
                <p className="text-zinc-500 text-sm mt-2">
                  Start a conversation by messaging a seller from their product page
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Thread */}
      <div className="lg:col-span-2">
        <Card className="glass-effect h-full flex flex-col">
          {selectedConversation ? (
            <>
              {/* Message Header */}
              <CardHeader className="border-b border-zinc-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={activeConversations?.find((c: Conversation) => c.id === selectedConversation)?.participantAvatar} />
                      <AvatarFallback className="bg-zinc-700 text-white">
                        {activeConversations?.find((c: Conversation) => c.id === selectedConversation)?.participantName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-white font-medium">
                        {activeConversations?.find((c: Conversation) => c.id === selectedConversation)?.participantName}
                      </h3>
                      <p className="text-zinc-400 text-sm">
                        {activeTab === 'received' ? 'Shop Owner' : 'Buyer'} • Online recently
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-zinc-400 border-zinc-600">
                      {activeTab === 'received' ? 'From Seller' : 'To Buyer'}
                    </Badge>
                    <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                      <MoreHorizontal size={20} />
                    </Button>
                  </div>
                </div>
                
                {/* Show product context if available */}
                {activeConversations?.find((c: Conversation) => c.id === selectedConversation)?.listingTitle && (
                  <div className="mt-3 p-3 bg-zinc-800 rounded-lg flex items-center gap-3">
                    {activeConversations?.find((c: Conversation) => c.id === selectedConversation)?.listingImage && (
                      <img 
                        src={activeConversations?.find((c: Conversation) => c.id === selectedConversation)?.listingImage}
                        alt="Product"
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div>
                      <p className="text-white text-sm font-medium">
                        Discussion about:
                      </p>
                      <p className="text-zinc-300 text-sm">
                        {activeConversations?.find((c: Conversation) => c.id === selectedConversation)?.listingTitle}
                      </p>
                    </div>
                  </div>
                )}
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messagesLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                        <div className="animate-pulse">
                          <div className="h-4 bg-zinc-700 rounded w-48 mb-2"></div>
                          <div className="h-3 bg-zinc-700 rounded w-24"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : messages?.length > 0 ? (
                  <>
                    {messages.map((message: Message, index: number) => {
                      const isOwn = message.senderId === user?.id;
                      const showAvatar = index === 0 || messages[index - 1]?.senderId !== message.senderId;
                      
                      return (
                        <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-xs lg:max-w-md ${isOwn ? "order-1" : ""}`}>
                            <div className={`flex items-end space-x-2 ${isOwn ? "flex-row-reverse space-x-reverse" : ""}`}>
                              {showAvatar && !isOwn && (
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={message.senderAvatar} />
                                  <AvatarFallback className="bg-zinc-700 text-white text-xs">
                                    {message.senderName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              
                              <div className={`px-4 py-2 rounded-lg ${
                                isOwn 
                                  ? "bg-red-600 text-white" 
                                  : "bg-zinc-800 text-white"
                              } ${!showAvatar && !isOwn ? "ml-10" : ""}`}>
                                <p className="text-sm">{message.content}</p>
                                
                                {message.attachments && message.attachments.length > 0 && (
                                  <div className="mt-2 space-y-1">
                                    {message.attachments.map((attachment, idx) => (
                                      <img
                                        key={idx}
                                        src={attachment}
                                        alt="Attachment"
                                        className="max-w-full h-auto rounded cursor-pointer"
                                        onClick={() => window.open(attachment, '_blank')}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className={`mt-1 text-xs text-zinc-400 ${isOwn ? "text-right" : "text-left"} ${!showAvatar && !isOwn ? "ml-10" : ""}`}>
                              {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle size={48} className="text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-400">Start the conversation</p>
                  </div>
                )}
              </CardContent>

              {/* Message Input */}
              <div className="p-4 border-t border-zinc-700">
                <div className="flex items-end space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-zinc-400 hover:text-white"
                  >
                    <Paperclip size={20} />
                  </Button>
                  
                  <div className="flex-1">
                    <Textarea
                      placeholder="Type your message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="bg-zinc-800 border-zinc-700 text-white resize-none"
                      rows={1}
                    />
                  </div>
                  
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sendMessageMutation.isPending}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Send size={16} />
                  </Button>
                </div>
                
                <p className="text-xs text-zinc-400 mt-2">
                  Press Enter to send, Shift + Enter for new line
                </p>
              </div>
            </>
          ) : isComposing || sellerId ? (
            // New message composer
            <>
              <CardHeader>
                <CardTitle className="text-white">New Message</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 mb-4">
                  <Textarea
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white h-32"
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsComposing(false);
                      setMessageText("");
                    }}
                    className="text-zinc-300 border-zinc-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || startConversationMutation.isPending}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {startConversationMutation.isPending ? "Sending..." : "Send Message"}
                  </Button>
                </div>
              </CardContent>
            </>
          ) : (
            // Empty state
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle size={64} className="text-zinc-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">Select a conversation</h3>
                <p className="text-zinc-400 mb-6">Choose a conversation to start messaging</p>
                <Button
                  onClick={() => setIsComposing(true)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Start New Conversation
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}