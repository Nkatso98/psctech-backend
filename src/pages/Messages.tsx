import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquareIcon, 
  SendIcon,
  SearchIcon,
  FilterIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  ReplyIcon,
  ForwardIcon,
  StarIcon,
  MoreHorizontalIcon,
  UserIcon,
  BellIcon
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function Messages() {
  const { user, institution } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('inbox');

  useEffect(() => {
    loadMessages();
    loadContacts();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    // Simulate API call - replace with actual API
    setTimeout(() => {
      const mockData = generateMockMessages();
      setMessages(mockData);
      setLoading(false);
    }, 500);
  };

  const loadContacts = async () => {
    // Simulate API call - replace with actual API
    setTimeout(() => {
      const mockContacts = generateMockContacts();
      setContacts(mockContacts);
    }, 300);
  };

  const generateMockMessages = () => {
    const messageTypes = ['inbox', 'sent', 'draft', 'archived'];
    const subjects = [
      'Parent-Teacher Meeting Reminder',
      'Homework Assignment Update',
      'Student Performance Report',
      'School Event Announcement',
      'Attendance Notification',
      'Exam Schedule Update'
    ];
    
    const mockMessages = [];
    for (let i = 1; i <= 20; i++) {
      mockMessages.push({
        id: i.toString(),
        type: messageTypes[Math.floor(Math.random() * messageTypes.length)],
        subject: subjects[Math.floor(Math.random() * subjects.length)],
        content: `This is message content ${i}. It contains important information about school activities and student progress.`,
        sender: `User ${Math.floor(Math.random() * 5) + 1}`,
        recipient: user?.fullName || 'Unknown',
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        isRead: Math.random() > 0.3,
        isStarred: Math.random() > 0.7,
        attachments: Math.random() > 0.8 ? ['document.pdf'] : [],
        priority: Math.random() > 0.8 ? 'High' : 'Normal'
      });
    }
    return mockMessages;
  };

  const generateMockContacts = () => {
    const roles = ['Teacher', 'Parent', 'Principal', 'Learner'];
    const names = [
      'Mrs. Johnson', 'Mr. Smith', 'Ms. Davis', 'Mr. Wilson', 'Mrs. Brown',
      'Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Eva Brown'
    ];
    
    return names.map((name, index) => ({
      id: index.toString(),
      name,
      role: roles[Math.floor(Math.random() * roles.length)],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      lastSeen: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      isOnline: Math.random() > 0.7,
      unreadCount: Math.floor(Math.random() * 5)
    }));
  };

  const sendMessage = () => {
    if (newMessage.trim() && selectedContact) {
      const messageToSend = {
        id: (messages.length + 1).toString(),
        type: 'sent',
        subject: `Message to ${selectedContact.name}`,
        content: newMessage,
        sender: user?.fullName || 'Unknown',
        recipient: selectedContact.name,
        timestamp: new Date().toISOString(),
        isRead: false,
        isStarred: false,
        attachments: [],
        priority: 'Normal'
      };
      
      setMessages([messageToSend, ...messages]);
      setNewMessage('');
    }
  };

  const markAsRead = (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, isRead: true } : msg
      )
    );
  };

  const toggleStar = (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, isStarred: !msg.isStarred } : msg
      )
    );
  };

  const filteredMessages = messages.filter(message => {
    if (activeTab !== 'all' && message.type !== activeTab) return false;
    if (searchQuery && !message.subject.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !message.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <AuthLayout>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
              <p className="text-muted-foreground">
                Communicate with teachers, parents, and students at {institution?.name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                New Message
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                <MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{messages.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unread</CardTitle>
                <BellIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {messages.filter(m => !m.isRead).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Starred</CardTitle>
                <StarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {messages.filter(m => m.isStarred).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contacts</CardTitle>
                <UserIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{contacts.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Contacts Sidebar */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Contacts</CardTitle>
                <div className="relative">
                  <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search contacts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedContact?.id === contact.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => setSelectedContact(contact)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={contact.avatar} />
                        <AvatarFallback>{contact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{contact.name}</p>
                          {contact.isOnline && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{contact.role}</p>
                      </div>
                      {contact.unreadCount > 0 && (
                        <Badge variant="secondary" className="ml-auto">
                          {contact.unreadCount}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Messages Area */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="inbox">Inbox</TabsTrigger>
                    <TabsTrigger value="sent">Sent</TabsTrigger>
                    <TabsTrigger value="draft">Drafts</TabsTrigger>
                    <TabsTrigger value="archived">Archived</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="flex items-center gap-2 mt-4">
                  <div className="relative flex-1">
                    <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search messages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <FilterIcon className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${
                          !message.isRead ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' : ''
                        }`}
                        onClick={() => markAsRead(message.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              <h3 className="font-medium">{message.subject}</h3>
                              {message.priority !== 'Normal' && (
                                <Badge className={getPriorityColor(message.priority)}>
                                  {message.priority}
                                </Badge>
                              )}
                              {message.attachments.length > 0 && (
                                <Badge variant="outline">📎 {message.attachments.length}</Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>From: {message.sender}</span>
                              <span>To: {message.recipient}</span>
                              <span>{new Date(message.timestamp).toLocaleDateString()}</span>
                            </div>
                            
                            <p className="text-muted-foreground line-clamp-2">
                              {message.content}
                            </p>
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleStar(message.id);
                              }}
                            >
                              <StarIcon className={`h-4 w-4 ${message.isStarred ? 'text-yellow-500 fill-current' : ''}`} />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <ReplyIcon className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <MoreHorizontalIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {filteredMessages.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No messages found
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Compose Message */}
          {selectedContact && (
            <Card>
              <CardHeader>
                <CardTitle>Compose Message to {selectedContact.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Type your message here..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      <SendIcon className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedContact(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </AuthLayout>
  );
}











