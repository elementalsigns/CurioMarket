import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function MessagingSystemSimple() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  // No mock data - show empty conversations
  const conversations: any[] = [];

  // No mock messages - show empty messages
  const messages: any[] = [];

  const handleDelete = (conversationId: string, participantName: string) => {
    if (window.confirm(`Delete conversation with ${participantName}?`)) {
      alert(`Conversation with ${participantName} would be deleted (demo mode)`);
    }
  };

  const currentMessages = selectedConversation ? 
    messages.filter(msg => msg.conversationId === selectedConversation) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Conversations List */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="text-white">Messages</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-4 border-b border-zinc-700 hover:bg-zinc-800 transition-colors ${
                  selectedConversation === conversation.id ? "bg-zinc-800" : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Avatar
                    className="cursor-pointer"
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <AvatarFallback className="bg-zinc-700 text-white">
                      {conversation.participantName?.charAt(0) || '?'}
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
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-400">
                          {formatDistanceToNow(new Date(conversation.lastMessageTime), { addSuffix: true })}
                        </span>
                        
                        {/* DELETE BUTTON - ALWAYS VISIBLE */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-xs text-red-400 border-red-600 hover:bg-red-600 hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(conversation.id, conversation.participantName);
                          }}
                        >
                          🗑️ Delete
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-zinc-400 text-sm truncate">
                      {conversation.lastMessage}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Message Thread */}
      <div className="lg:col-span-2">
        <Card className="glass-effect h-full flex flex-col">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b border-zinc-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback className="bg-zinc-700 text-white">
                        {conversations.find(c => c.id === selectedConversation)?.participantName?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-white font-medium">
                        {conversations.find(c => c.id === selectedConversation)?.participantName}
                      </h3>
                      <p className="text-zinc-400 text-sm">Online recently</p>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentMessages.length > 0 ? (
                  currentMessages.map((message) => (
                    <div key={message.id} className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.isOwn 
                          ? "bg-red-600 text-white" 
                          : "bg-zinc-800 text-white"
                      }`}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-zinc-400">No messages yet</p>
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-zinc-400">Select a conversation to view messages</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}