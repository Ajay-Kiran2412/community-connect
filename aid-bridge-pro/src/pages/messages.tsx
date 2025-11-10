import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Send, MoreVertical } from "lucide-react";

type Message = { 
  id: string; 
  from: string; 
  text: string; 
  timestamp: number;
  read: boolean;
};

type Conversation = {
  id: string;
  name: string;
  avatar: string | null;
  lastMessage: string;
  timestamp: number;
  unread: number;
  online: boolean;
};

// Mock data outside component to avoid recreation on re-renders
const initialConversations: Conversation[] = [
  { 
    id: "u1", 
    name: "Priya Sharma", 
    avatar: null, 
    lastMessage: "Can you help with O+ blood?", 
    timestamp: Date.now() - 600000,
    unread: 2,
    online: true
  },
  { 
    id: "u2", 
    name: "Helping Hands NGO", 
    avatar: null, 
    lastMessage: "Clothes distribution on Saturday", 
    timestamp: Date.now() - 3600000,
    unread: 0,
    online: false
  },
  { 
    id: "u3", 
    name: "Community Kitchen", 
    avatar: null, 
    lastMessage: "Thanks for the food donation!", 
    timestamp: Date.now() - 86400000,
    unread: 1,
    online: true
  }
];

const initialMessages: Record<string, Message[]> = {
  u1: [
    { id: "m1", from: "u1", text: "Hi, I saw your post about blood donation", timestamp: Date.now() - 1200000, read: true },
    { id: "m2", from: "me", text: "Yes, I can help with O+ blood", timestamp: Date.now() - 900000, read: true },
    { id: "m3", from: "u1", text: "Can you come to City Hospital tomorrow?", timestamp: Date.now() - 600000, read: false },
    { id: "m4", from: "u1", text: "The surgery is scheduled for 2 PM", timestamp: Date.now() - 300000, read: false }
  ],
  u2: [
    { id: "m5", from: "u2", text: "We're organizing a clothes drive this weekend", timestamp: Date.now() - 3600000, read: true }
  ],
  u3: [
    { id: "m6", from: "u3", text: "Thanks for the food donation!", timestamp: Date.now() - 86400000, read: false }
  ]
};

const Messages = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([
    { 
      id: "u1", 
      name: "Priya Sharma", 
      avatar: null, 
      lastMessage: "Can you help with O+ blood?", 
      timestamp: Date.now() - 600000,
      unread: 2,
      online: true
    },
    { 
      id: "u2", 
      name: "Helping Hands NGO", 
      avatar: null, 
      lastMessage: "Clothes distribution on Saturday", 
      timestamp: Date.now() - 3600000,
      unread: 0,
      online: false
    },
    { 
      id: "u3", 
      name: "Community Kitchen", 
      avatar: null, 
      lastMessage: "Thanks for the food donation!", 
      timestamp: Date.now() - 86400000,
      unread: 1,
      online: true
    }
  ]);
  
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    u1: [
      { id: "m1", from: "u1", text: "Hi, I saw your post about blood donation", timestamp: Date.now() - 1200000, read: true },
      { id: "m2", from: "me", text: "Yes, I can help with O+ blood", timestamp: Date.now() - 900000, read: true },
      { id: "m3", from: "u1", text: "Can you come to City Hospital tomorrow?", timestamp: Date.now() - 600000, read: false },
      { id: "m4", from: "u1", text: "The surgery is scheduled for 2 PM", timestamp: Date.now() - 300000, read: false }
    ],
    u2: [
      { id: "m5", from: "u2", text: "We're organizing a clothes drive this weekend", timestamp: Date.now() - 3600000, read: true }
    ],
    u3: [
      { id: "m6", from: "u3", text: "Thanks for the food donation!", timestamp: Date.now() - 86400000, read: false }
    ]
  });
  
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate incoming messages
    const interval = setInterval(() => {
      if (activeConversation && Math.random() > 0.7) {
        const convo = activeConversation;
        const newMsg: Message = {
          id: String(Date.now()),
          from: convo,
          text: "Thanks for your help! (Auto)",
          timestamp: Date.now(),
          read: false
        };
        
        setMessages(prev => ({
          ...prev,
          [convo]: [...(prev[convo] || []), newMsg]
        }));

        // Update conversation last message
        setConversations(prev => 
          prev.map(c => 
            c.id === convo 
              ? { ...c, lastMessage: newMsg.text, timestamp: newMsg.timestamp, unread: c.unread + 1 }
              : c
          )
        );
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeConversation]);

  const sendMessage = () => {
    if (!activeConversation || !newMessage.trim()) return;
    
    const message: Message = {
      id: String(Date.now()),
      from: "me",
      text: newMessage.trim(),
      timestamp: Date.now(),
      read: true
    };

    setMessages(prev => ({
      ...prev,
      [activeConversation]: [...(prev[activeConversation] || []), message]
    }));

    // Update conversation
    setConversations(prev => 
      prev.map(c => 
        c.id === activeConversation 
          ? { ...c, lastMessage: message.text, timestamp: message.timestamp }
          : c
      )
    );

    setNewMessage("");
  };

  const markAsRead = (conversationId: string) => {
    setConversations(prev => 
      prev.map(c => 
        c.id === conversationId ? { ...c, unread: 0 } : c
      )
    );
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return "now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold flex-1">Messages</h1>
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto">
        {!activeConversation ? (
          // Conversations List
          <div className="p-4 space-y-3">
            {conversations.map(conversation => (
              <Card 
                key={conversation.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  conversation.unread > 0 ? "border-primary/20 bg-primary/5" : ""
                }`}
                onClick={() => {
                  setActiveConversation(conversation.id);
                  markAsRead(conversation.id);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white">
                          {conversation.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.online && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold truncate">{conversation.name}</h3>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(conversation.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage}
                      </p>
                    </div>
                    
                    {conversation.unread > 0 && (
                      <Badge variant="default" className="ml-2">
                        {conversation.unread}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Chat Interface
          <div className="flex flex-col h-[calc(100vh-140px)]">
            {/* Chat Header */}
            <div className="border-b bg-card p-4">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setActiveConversation(null)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white">
                    {conversations.find(c => c.id === activeConversation)?.name[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h2 className="font-semibold">
                    {conversations.find(c => c.id === activeConversation)?.name}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {conversations.find(c => c.id === activeConversation)?.online ? "Online" : "Offline"}
                  </p>
                </div>
                
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {(messages[activeConversation] || []).map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.from === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      message.from === "me"
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.from === "me" ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t bg-card p-4">
              <div className="flex items-center gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!newMessage.trim()}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Messages;