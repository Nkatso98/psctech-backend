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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CalendarIcon, 
  ClockIcon,
  UsersIcon,
  MapPinIcon,
  PlusIcon,
  EditIcon,
  EyeIcon,
  TrashIcon,
  SearchIcon,
  FilterIcon,
  VideoIcon,
  PhoneIcon,
  FileTextIcon,
  CheckCircleIcon,
  AlertCircleIcon
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function Meetings() {
  const { user, institution } = useAuth();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    type: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    attendees: [],
    agenda: ''
  });

  useEffect(() => {
    loadMeetings();
  }, [selectedType, selectedStatus]);

  const loadMeetings = async () => {
    setLoading(true);
    // Simulate API call - replace with actual API
    setTimeout(() => {
      const mockData = generateMockMeetings();
      setMeetings(mockData);
      setLoading(false);
    }, 500);
  };

  const generateMockMeetings = () => {
    const types = ['Staff Meeting', 'Parent-Teacher Conference', 'SGB Meeting', 'Department Meeting', 'Training Session'];
    const statuses = ['Scheduled', 'In Progress', 'Completed', 'Cancelled'];
    const locations = ['Conference Room A', 'Conference Room B', 'Staff Room', 'Library', 'Online', 'Auditorium'];
    
    const mockMeetings = [];
    for (let i = 1; i <= 20; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const date = new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000);
      const startTime = `${Math.floor(Math.random() * 12) + 8}:${Math.random() > 0.5 ? '00' : '30'}`;
      const endTime = `${Math.floor(Math.random() * 12) + 9}:${Math.random() > 0.5 ? '00' : '30'}`;
      const attendees = Math.floor(Math.random() * 20) + 5;
      const isOnline = location === 'Online';
      
      mockMeetings.push({
        id: i.toString(),
        title: `${type} ${i}`,
        type,
        description: `This is a ${type.toLowerCase()} to discuss important matters related to school operations and student progress.`,
        date: date.toISOString().split('T')[0],
        startTime,
        endTime,
        location,
        isOnline,
        attendees,
        maxAttendees: Math.floor(Math.random() * 10) + 20,
        organizer: `User ${Math.floor(Math.random() * 5) + 1}`,
        status,
        agenda: `1. Welcome and introductions\n2. Review of previous meeting minutes\n3. Discussion of current issues\n4. Planning for upcoming events\n5. Any other business\n6. Adjournment`,
        minutes: status === 'Completed' ? 'Meeting minutes have been recorded and distributed to all attendees.' : '',
        attachments: Math.random() > 0.7 ? ['agenda.pdf', 'presentation.pptx'] : [],
        reminderSent: Math.random() > 0.5
      });
    }
    return mockMeetings;
  };

  const addMeeting = () => {
    if (newMeeting.title && newMeeting.type && newMeeting.date && newMeeting.startTime && newMeeting.endTime) {
      const meetingToAdd = {
        ...newMeeting,
        id: (meetings.length + 1).toString(),
        isOnline: newMeeting.location === 'Online',
        attendees: 0,
        maxAttendees: 30,
        organizer: user?.fullName || 'Unknown',
        status: 'Scheduled',
        agenda: newMeeting.agenda || 'Agenda to be determined',
        minutes: '',
        attachments: [],
        reminderSent: false
      };
      
      setMeetings([meetingToAdd, ...meetings]);
      setNewMeeting({
        title: '',
        type: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        attendees: [],
        agenda: ''
      });
      setShowAddForm(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Staff Meeting': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Parent-Teacher Conference': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'SGB Meeting': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Department Meeting': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Training Session': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const filteredMeetings = meetings.filter(meeting => {
    if (selectedType !== 'All' && meeting.type !== selectedType) return false;
    if (selectedStatus !== 'All' && meeting.status !== selectedStatus) return false;
    if (searchQuery && !meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !meeting.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const upcomingMeetings = filteredMeetings.filter(meeting => 
    meeting.status === 'Scheduled' && new Date(meeting.date) >= new Date()
  );

  const pastMeetings = filteredMeetings.filter(meeting => 
    meeting.status === 'Completed' || new Date(meeting.date) < new Date()
  );

  const isToday = (date: string) => {
    const today = new Date().toISOString().split('T')[0];
    return date === today;
  };

  const isUpcoming = (date: string) => {
    return new Date(date) > new Date();
  };

  return (
    <AuthLayout>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Meetings</h1>
              <p className="text-muted-foreground">
                Schedule and manage school meetings at {institution?.name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {user?.role === 'Principal' && (
                <Button onClick={() => setShowAddForm(true)}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{meetings.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                <ClockIcon className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {upcomingMeetings.length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today</CardTitle>
                <CalendarIcon className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {meetings.filter(m => isToday(m.date)).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {pastMeetings.length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Meeting Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <Label htmlFor="type">Meeting Type</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Types</SelectItem>
                      <SelectItem value="Staff Meeting">Staff Meeting</SelectItem>
                      <SelectItem value="Parent-Teacher Conference">Parent-Teacher Conference</SelectItem>
                      <SelectItem value="SGB Meeting">SGB Meeting</SelectItem>
                      <SelectItem value="Department Meeting">Department Meeting</SelectItem>
                      <SelectItem value="Training Session">Training Session</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Statuses</SelectItem>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative">
                  <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search meetings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div className="flex items-end">
                  <Button variant="outline" className="w-full">
                    <FilterIcon className="h-4 w-4 mr-2" />
                    Apply Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Meetings</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingMeetings.map((meeting) => (
                        <Card key={meeting.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                  <h3 className="text-lg font-semibold">{meeting.title}</h3>
                                  <Badge className={getTypeColor(meeting.type)}>
                                    {meeting.type}
                                  </Badge>
                                  <Badge className={getStatusColor(meeting.status)}>
                                    {meeting.status}
                                  </Badge>
                                  {isToday(meeting.date) && (
                                    <Badge variant="destructive">Today</Badge>
                                  )}
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium">Date:</span> {new Date(meeting.date).toLocaleDateString()}
                                  </div>
                                  <div>
                                    <span className="font-medium">Time:</span> {meeting.startTime} - {meeting.endTime}
                                  </div>
                                  <div>
                                    <span className="font-medium">Location:</span> {meeting.location}
                                  </div>
                                  <div>
                                    <span className="font-medium">Organizer:</span> {meeting.organizer}
                                  </div>
                                </div>
                                
                                <p className="text-muted-foreground line-clamp-2">
                                  {meeting.description}
                                </p>
                                
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <UsersIcon className="h-4 w-4" />
                                    {meeting.attendees}/{meeting.maxAttendees} attendees
                                  </span>
                                  {meeting.isOnline && (
                                    <span className="flex items-center gap-1">
                                      <VideoIcon className="h-4 w-4" />
                                      Online Meeting
                                    </span>
                                  )}
                                  {meeting.reminderSent && (
                                    <span className="flex items-center gap-1">
                                      <CheckCircleIcon className="h-4 w-4" />
                                      Reminder Sent
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex gap-2 ml-4">
                                <Button size="sm" variant="outline">
                                  <EyeIcon className="h-4 w-4" />
                                </Button>
                                {user?.role === 'Principal' && (
                                  <>
                                    <Button size="sm" variant="outline">
                                      <EditIcon className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="outline">
                                      <TrashIcon className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {upcomingMeetings.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No upcoming meetings found
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="today" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Today's Meetings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {meetings.filter(m => isToday(m.date)).map((meeting) => (
                      <Card key={meeting.id} className="border-2 border-green-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-semibold">{meeting.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {meeting.startTime} - {meeting.endTime} • {meeting.location}
                              </p>
                            </div>
                            <Button>Join Meeting</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {meetings.filter(m => isToday(m.date)).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No meetings scheduled for today
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="past" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Past Meetings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pastMeetings.map((meeting) => (
                      <Card key={meeting.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold">{meeting.title}</h3>
                                <Badge className={getTypeColor(meeting.type)}>
                                  {meeting.type}
                                </Badge>
                                <Badge className={getStatusColor(meeting.status)}>
                                  {meeting.status}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Date:</span> {new Date(meeting.date).toLocaleDateString()}
                                </div>
                                <div>
                                  <span className="font-medium">Time:</span> {meeting.startTime} - {meeting.endTime}
                                </div>
                                <div>
                                  <span className="font-medium">Location:</span> {meeting.location}
                                </div>
                                <div>
                                  <span className="font-medium">Attendees:</span> {meeting.attendees}
                                </div>
                              </div>
                              
                              {meeting.minutes && (
                                <div className="bg-muted p-3 rounded-lg">
                                  <p className="text-sm font-medium mb-2">Meeting Minutes:</p>
                                  <p className="text-sm text-muted-foreground">{meeting.minutes}</p>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex gap-2 ml-4">
                              <Button size="sm" variant="outline">
                                <EyeIcon className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <FileTextIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Add Meeting Form */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>Schedule New Meeting</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="title">Meeting Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter meeting title"
                      value={newMeeting.title}
                      onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Meeting Type</Label>
                    <Select value={newMeeting.type} onValueChange={(value) => setNewMeeting({...newMeeting, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Staff Meeting">Staff Meeting</SelectItem>
                        <SelectItem value="Parent-Teacher Conference">Parent-Teacher Conference</SelectItem>
                        <SelectItem value="SGB Meeting">SGB Meeting</SelectItem>
                        <SelectItem value="Department Meeting">Department Meeting</SelectItem>
                        <SelectItem value="Training Session">Training Session</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newMeeting.date}
                      onChange={(e) => setNewMeeting({...newMeeting, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={newMeeting.startTime}
                      onChange={(e) => setNewMeeting({...newMeeting, startTime: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={newMeeting.endTime}
                      onChange={(e) => setNewMeeting({...newMeeting, endTime: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Conference Room A"
                      value={newMeeting.location}
                      onChange={(e) => setNewMeeting({...newMeeting, location: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter meeting description"
                      value={newMeeting.description}
                      onChange={(e) => setNewMeeting({...newMeeting, description: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="agenda">Agenda</Label>
                    <Textarea
                      id="agenda"
                      placeholder="Enter meeting agenda"
                      value={newMeeting.agenda}
                      onChange={(e) => setNewMeeting({...newMeeting, agenda: e.target.value})}
                      rows={4}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={addMeeting}>Schedule Meeting</Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </AuthLayout>
  );
}










