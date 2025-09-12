import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth-context';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { v4 as uuidv4 } from 'uuid';

type Message = {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  receiverId: string;
  receiverName: string;
  content: string;
  timestamp: number;
  read: boolean;
};

type ChatContact = {
  id: string;
  name: string;
  role: string;
  lastMessage?: string;
  unreadCount: number;
  lastActivity: number;
};

export function LiveChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useLocalStorage<Message[]>('chat-messages', []);
  const [contacts, setContacts] = useLocalStorage<ChatContact[]>('chat-contacts', []);
  const [activeContact, setActiveContact] = useState<ChatContact | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [chatFilter, setChatFilter] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Populate initial contacts if none exist
    if (contacts.length === 0 && user) {
      const initialContacts = generateInitialContacts();
      setContacts(initialContacts);
    }
  }, [contacts, user, setContacts]);

  useEffect(() => {
    scrollToBottom();
  }, [activeContact, messages]);

  const generateInitialContacts = () => {
    if (!user) return [];
    
    // Generate demo contacts based on user role
    const demoContacts: ChatContact[] = [];
    
    if (user.role === 'PARENT') {
      // For parents, add their children's teachers
      demoContacts.push(
        {
          id: 'teacher-1',
          name: 'Ms. Johnson',
          role: 'TEACHER',
          lastActivity: Date.now(),
          unreadCount: 0
        },
        {
          id: 'teacher-2',
          name: 'Mr. Smith',
          role: 'TEACHER',
          lastActivity: Date.now() - 86400000, // 1 day ago
          unreadCount: 0
        }
      );
    } else if (user.role === 'TEACHER') {
      // For teachers, add some parents
      demoContacts.push(
        {
          id: 'parent-1',
          name: 'Mrs. Davis',
          role: 'PARENT',
          lastActivity: Date.now(),
          unreadCount: 0
        },
        {
          id: 'parent-2',
          name: 'Mr. Wilson',
          role: 'PARENT',
          lastActivity: Date.now() - 172800000, // 2 days ago
          unreadCount: 0
        },
        {
          id: 'parent-3',
          name: 'Ms. Thompson',
          role: 'PARENT',
          lastActivity: Date.now() - 259200000, // 3 days ago
          unreadCount: 0
        }
      );
    }
    
    return demoContacts;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !user || !activeContact) return;
    
    const newMessage: Message = {
      id: uuidv4(),
      senderId: user.id,
      senderName: user.fullName,
      senderRole: user.role,
      receiverId: activeContact.id,
      receiverName: activeContact.name,
      content: messageInput,
      timestamp: Date.now(),
      read: false
    };
    
    setMessages([...messages, newMessage]);
    
    // Update contact's last message
    const updatedContacts = contacts.map(contact => {
      if (contact.id === activeContact.id) {
        return {
          ...contact,
          lastMessage: messageInput,
          lastActivity: Date.now()
        };
      }
      return contact;
    });
    
    setContacts(updatedContacts);
    setMessageInput('');
    
    // Simulate receiving a response after a short delay
    setTimeout(() => {
      const responses = [
        "I'll look into that and get back to you.",
        "Thank you for letting me know.",
        "That's great progress!",
        "Can we schedule a meeting to discuss this further?",
        "I'll make a note of that for our records."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const responseMessage: Message = {
        id: uuidv4(),
        senderId: activeContact.id,
        senderName: activeContact.name,
        senderRole: activeContact.role,
        receiverId: user.id,
        receiverName: user.fullName,
        content: randomResponse,
        timestamp: Date.now(),
        read: true
      };
      
      setMessages(prevMessages => [...prevMessages, responseMessage]);
      
      // Update contact's last message
      setContacts(prevContacts => 
        prevContacts.map(contact => {
          if (contact.id === activeContact.id) {
            return {
              ...contact,
              lastMessage: randomResponse,
              lastActivity: Date.now()
            };
          }
          return contact;
        })
      );
      
      toast({
        title: `New message from ${activeContact.name}`,
        description: randomResponse,
      });
    }, 2000 + Math.random() * 3000); // Random delay between 2-5 seconds
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const selectContact = (contact: ChatContact) => {
    setActiveContact(contact);
    
    // Mark messages from this contact as read
    const updatedMessages = messages.map(msg => {
      if (msg.senderId === contact.id && !msg.read) {
        return { ...msg, read: true };
      }
      return msg;
    });
    
    setMessages(updatedMessages);
    
    // Reset unread count
    setContacts(contacts.map(c => {
      if (c.id === contact.id) {
        return { ...c, unreadCount: 0 };
      }
      return c;
    }));
  };

  const getActiveContactMessages = () => {
    if (!activeContact) return [];
    
    return messages.filter(msg => 
      (msg.senderId === user?.id && msg.receiverId === activeContact.id) || 
      (msg.receiverId === user?.id && msg.senderId === activeContact.id)
    ).sort((a, b) => a.timestamp - b.timestamp);
  };

  const getFilteredContacts = () => {
    return contacts
      .filter(contact => 
        contact.name.toLowerCase().includes(chatFilter.toLowerCase())
      )
      .sort((a, b) => b.lastActivity - a.lastActivity);
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!user) {
    return <div className="p-4 text-center">Please login to use the chat feature</div>;
  }

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex justify-between items-center">
          <div>Messages {activeContact && `- ${activeContact.name}`}</div>
          {activeContact && (
            <Button 
              variant="ghost" 
              className="text-sm" 
              onClick={() => setActiveContact(null)}
            >
              Back
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex flex-grow overflow-hidden p-0">
        {!activeContact ? (
          <div className="flex flex-col w-full h-full">
            <div className="p-4">
              <Input
                placeholder="Search contacts..."
                value={chatFilter}
                onChange={(e) => setChatFilter(e.target.value)}
                className="mb-2"
              />
            </div>
            <ScrollArea className="flex-grow">
              <div className="divide-y">
                {getFilteredContacts().map(contact => (
                  <div
                    key={contact.id}
                    className="p-3 cursor-pointer hover:bg-muted flex items-center justify-between"
                    onClick={() => selectContact(contact)}
                  >
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarFallback>
                          {contact.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{contact.name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {contact.lastMessage || `${contact.role.charAt(0) + contact.role.slice(1).toLowerCase()}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground flex flex-col items-end">
                      <div>{formatTimestamp(contact.lastActivity)}</div>
                      {contact.unreadCount > 0 && (
                        <div className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center mt-1">
                          {contact.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {getFilteredContacts().length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    No contacts found
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="flex flex-col w-full h-full">
            <ScrollArea className="flex-grow p-4">
              {getActiveContactMessages().length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No messages yet. Start a conversation!
                </div>
              ) : (
                <div className="space-y-4">
                  {getActiveContactMessages().map(message => {
                    const isCurrentUser = message.senderId === user.id;
                    
                    return (
                      <div 
                        key={message.id}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="flex items-end gap-2 max-w-[80%]">
                          {!isCurrentUser && (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {message.senderName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div>
                            <div 
                              className={`rounded-2xl px-4 py-2 text-sm ${
                                isCurrentUser 
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              {message.content}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {formatTimestamp(message.timestamp)}
                              {isCurrentUser && message.read && ' • Read'}
                            </div>
                          </div>
                          {isCurrentUser && (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {message.senderName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </CardContent>
      
      {activeContact && (
        <CardFooter className="p-3 border-t">
          <div className="flex w-full gap-2">
            <Input
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
              Send
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}