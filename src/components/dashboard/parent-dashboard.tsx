import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  UserIcon, 
  BookOpenIcon, 
  CalendarIcon, 
  BellIcon, 
  TrendingUpIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  MapPinIcon,
  PhoneIcon,
  MailIcon
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { PDFGenerator } from '@/components/pdf/pdf-generator';

export function ParentDashboard() {
  const { user, institution } = useAuth();

  // Mock data - in a real app this would come from the API
  const children = [
    {
      id: 1,
      name: 'Sarah Johnson',
      grade: 'Grade 10A',
      studentId: 'ST001',
      photo: null,
      attendance: 95,
      performance: 87,
      lastActivity: '2 hours ago'
    },
    {
      id: 2,
      name: 'Michael Johnson',
      grade: 'Grade 8C',
      studentId: 'ST002',
      photo: null,
      attendance: 92,
      performance: 78,
      lastActivity: '1 day ago'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'Homework Submitted',
      description: 'Sarah submitted Mathematics homework',
      timestamp: '2 hours ago',
      child: 'Sarah Johnson',
      status: 'completed'
    },
    {
      id: 2,
      type: 'Test Result',
      description: 'Michael received Science test result: 85%',
      timestamp: '1 day ago',
      child: 'Michael Johnson',
      status: 'completed'
    },
    {
      id: 3,
      type: 'Attendance Update',
      description: 'Sarah marked present in all classes today',
      timestamp: '2 days ago',
      child: 'Sarah Johnson',
      status: 'completed'
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: 'Parent-Teacher Meeting',
      date: '15 August 2025',
      time: '14:00 - 16:00',
      type: 'Meeting',
      child: 'Both Children'
    },
    {
      id: 2,
      title: 'Sports Day',
      date: '20 August 2025',
      time: '09:00 - 15:00',
      type: 'Event',
      child: 'Both Children'
    },
    {
      id: 3,
      title: 'Mathematics Test',
      date: '25 August 2025',
      time: '08:00 - 09:00',
      type: 'Test',
      child: 'Sarah Johnson'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Enhanced Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-50 via-green-100 to-emerald-100 p-8 border border-green-200">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-200">
              <UserIcon className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                Parent Dashboard
              </h2>
              <p className="text-lg text-green-700 dark:text-green-300 mt-1">
                Monitor your children's academic progress and stay connected
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-green-600 dark:text-green-400">
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              <span>Children: {children.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4" />
              <span>Active: {children.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpenIcon className="h-4 w-4" />
              <span>School: {institution?.name || 'Unknown'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
              <TrendingUpIcon className="h-4 w-4" />
              Average Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">
              {Math.round(children.reduce((sum, child) => sum + child.performance, 0) / children.length)}%
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Across all children
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4" />
              Average Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">
              {Math.round(children.reduce((sum, child) => sum + child.attendance, 0) / children.length)}%
            </div>
            <p className="text-xs text-green-600 mt-1">
              This month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
              <BellIcon className="h-4 w-4" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">3</div>
            <p className="text-xs text-purple-600 mt-1">
              New updates
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">{upcomingEvents.length}</div>
            <p className="text-xs text-orange-600 mt-1">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="children">Children</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Children Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Children Overview</CardTitle>
                <CardDescription>Quick summary of your children's status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {children.map((child) => (
                    <div key={child.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-green-100 text-green-800">
                          {child.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-medium">{child.name}</h3>
                        <p className="text-sm text-muted-foreground">{child.grade}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{child.performance}%</div>
                        <div className="text-xs text-muted-foreground">Performance</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest updates from school</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivities.slice(0, 3).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.type}</p>
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="children" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Children Details</CardTitle>
              <CardDescription>Detailed information about each child</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {children.map((child) => (
                  <div key={child.id} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarFallback className="bg-green-100 text-green-800 text-lg">
                            {child.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-xl font-semibold">{child.name}</h3>
                          <p className="text-muted-foreground">{child.grade}</p>
                          <p className="text-sm text-muted-foreground">ID: {child.studentId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">{child.performance}%</div>
                        <p className="text-sm text-muted-foreground">Performance</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-semibold text-blue-600">{child.attendance}%</div>
                        <p className="text-sm text-blue-600">Attendance</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-sm text-purple-600">{child.lastActivity}</div>
                        <p className="text-sm text-purple-600">Last Activity</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <BookOpenIcon className="h-4 w-4 mr-2" />
                        View Progress
                      </Button>
                      <Button variant="outline" size="sm">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        View Schedule
                      </Button>
                      <Button variant="outline" size="sm">
                        <MailIcon className="h-4 w-4 mr-2" />
                        Contact Teacher
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Activities</CardTitle>
              <CardDescription>Complete activity history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-green-100 rounded-full">
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.type}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">Child: {activity.child}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{activity.timestamp}</p>
                      <Badge variant="outline" className="mt-1">
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>School events and important dates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <CalendarIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">{event.date} at {event.time}</p>
                      <p className="text-xs text-muted-foreground">Child: {event.child}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{event.type}</Badge>
                      <Button variant="outline" size="sm" className="mt-2">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Add to Calendar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
