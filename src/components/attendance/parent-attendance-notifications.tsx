import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BellIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  AlertCircleIcon,
  CalendarIcon,
  UserIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
  InfoIcon
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
// Simple date formatting function to replace date-fns
const formatDate = (date: Date, formatStr: string): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();
  const hours = d.getHours();
  const minutes = d.getMinutes();
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return formatStr
    .replace('yyyy', year.toString())
    .replace('MMM', monthNames[month])
    .replace('dd', day.toString().padStart(2, '0'))
    .replace('HH', hours.toString().padStart(2, '0'))
    .replace('mm', minutes.toString().padStart(2, '0'));
};

interface AttendanceNotification {
  id: string;
  parentId: string;
  learnerId: string;
  learnerName: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  classInfo: string;
  date: Date;
  message: string;
  isRead: boolean;
}

interface AttendanceRecord {
  id: string;
  learnerId: string;
  classId: string;
  className: string;
  subject: string;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  markedBy: string;
  markedAt: Date;
}

interface Child {
  learnerId: string;
  firstName: string;
  lastName: string;
  grade: string;
  subjects: string[];
}

export function ParentAttendanceNotifications() {
  const { user, institution } = useAuth();
  const [notifications, setNotifications] = useState<AttendanceNotification[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('notifications');

  useEffect(() => {
    if (user && institution) {
      loadData();
    }
  }, [user, institution]);

  const loadData = () => {
    // This would load from the store or API
    // For now, using mock data
    const mockChildren: Child[] = [
      {
        learnerId: 'learner-1',
        firstName: 'Emma',
        lastName: 'Smith',
        grade: '10',
        subjects: ['Mathematics', 'English', 'Science', 'History']
      },
      {
        learnerId: 'learner-2',
        firstName: 'James',
        lastName: 'Smith',
        grade: '8',
        subjects: ['Mathematics', 'English', 'Science', 'Geography']
      }
    ];

    const mockNotifications: AttendanceNotification[] = [
      {
        id: 'notif-1',
        parentId: user!.userId,
        learnerId: 'learner-1',
        learnerName: 'Emma Smith',
        status: 'absent',
        classInfo: 'Mathematics - Grade 10A',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        message: 'Emma Smith was absent for Mathematics class today (Aug 06, 2025) at 08:00.',
        isRead: false
      },
      {
        id: 'notif-2',
        parentId: user!.userId,
        learnerId: 'learner-1',
        learnerName: 'Emma Smith',
        status: 'late',
        classInfo: 'English - Grade 10A',
        date: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        message: 'Emma Smith was late for English class today (Aug 06, 2025) at 09:30.',
        isRead: true
      }
    ];

    const mockAttendanceRecords: AttendanceRecord[] = [
      {
        id: 'att-1',
        learnerId: 'learner-1',
        classId: 'class-1',
        className: 'Grade 10A',
        subject: 'Mathematics',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'absent',
        markedBy: 'teacher-1',
        markedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 'att-2',
        learnerId: 'learner-1',
        classId: 'class-2',
        className: 'Grade 10A',
        subject: 'English',
        date: new Date(Date.now() - 1 * 60 * 60 * 1000),
        status: 'late',
        markedBy: 'teacher-2',
        markedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      },
      {
        id: 'att-3',
        learnerId: 'learner-1',
        classId: 'class-3',
        className: 'Grade 10A',
        subject: 'Science',
        date: new Date(Date.now() - 3 * 60 * 60 * 1000),
        status: 'present',
        markedBy: 'teacher-3',
        markedAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
      }
    ];

    setChildren(mockChildren);
    setNotifications(mockNotifications);
    setAttendanceRecords(mockAttendanceRecords);
    setSelectedChild(mockChildren[0]?.learnerId || null);
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      )
    );
  };

  const getChildNotifications = (childId: string) => {
    return notifications.filter(notif => notif.learnerId === childId);
  };

  const getChildAttendanceRecords = (childId: string) => {
    return attendanceRecords.filter(record => record.learnerId === childId);
  };

  const getAttendanceStats = (childId: string) => {
    const records = getChildAttendanceRecords(childId);
    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const late = records.filter(r => r.status === 'late').length;
    const excused = records.filter(r => r.status === 'excused').length;
    const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, late, excused, attendanceRate };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 border-green-200';
      case 'absent': return 'bg-red-100 text-red-800 border-red-200';
      case 'late': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'excused': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircleIcon className="h-4 w-4" />;
      case 'absent': return <XCircleIcon className="h-4 w-4" />;
      case 'late': return <ClockIcon className="h-4 w-4" />;
      case 'excused': return <AlertCircleIcon className="h-4 w-4" />;
      default: return <UserIcon className="h-4 w-4" />;
    }
  };

  const getUnreadCount = () => {
    return notifications.filter(notif => !notif.isRead).length;
  };

  const unreadCount = getUnreadCount();

  if (children.length === 0) {
    return (
      <div className="text-center py-8">
        <UserIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No children registered</p>
        <p className="text-sm text-muted-foreground">
          Contact your school administrator to link your account to your children
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Attendance Notifications</h2>
        <p className="text-muted-foreground">
          Stay informed about your children's attendance and class participation
        </p>
      </div>

      {/* Child Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Child</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            {children.map((child) => (
              <button
                key={child.learnerId}
                onClick={() => setSelectedChild(child.learnerId)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  selectedChild === child.learnerId
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border hover:bg-muted'
                }`}
              >
                {child.firstName} {child.lastName} (Grade {child.grade})
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedChild && (
        <>
          {/* Attendance Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {(() => {
              const stats = getAttendanceStats(selectedChild);
              return (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.total}</div>
                      <p className="text-xs text-muted-foreground">
                        This week
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Present</CardTitle>
                      <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                      <p className="text-xs text-muted-foreground">
                        Attended
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Absent</CardTitle>
                      <XCircleIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                      <p className="text-xs text-muted-foreground">
                        Missed
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Late</CardTitle>
                      <ClockIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
                      <p className="text-xs text-muted-foreground">
                        Arrived late
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                      <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">{stats.attendanceRate}%</div>
                      <p className="text-xs text-muted-foreground">
                        Overall
                      </p>
                    </CardContent>
                  </Card>
                </>
              );
            })()}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="notifications">
                <BellIcon className="h-4 w-4 mr-2" />
                Notifications ({unreadCount})
              </TabsTrigger>
              <TabsTrigger value="attendance-history">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Attendance History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const childNotifications = getChildNotifications(selectedChild);
                    if (childNotifications.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <BellIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No notifications yet</p>
                          <p className="text-sm text-muted-foreground">
                            You'll receive notifications when attendance is marked
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        {childNotifications
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((notification) => (
                            <div
                              key={notification.id}
                              className={`border rounded-lg p-4 transition-colors ${
                                notification.isRead 
                                  ? 'bg-muted/30' 
                                  : 'bg-blue-50 border-blue-200'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <Badge className={getStatusColor(notification.status)}>
                                      {getStatusIcon(notification.status)}
                                      <span className="ml-1 capitalize">{notification.status}</span>
                                    </Badge>
                                    {!notification.isRead && (
                                      <Badge variant="secondary" className="text-xs">
                                        New
                                      </Badge>
                                    )}
                                  </div>
                                  <h4 className="font-medium mb-1">{notification.learnerName}</h4>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {notification.classInfo}
                                  </p>
                                  <p className="text-sm mb-2">{notification.message}</p>
                                  <div className="text-xs text-muted-foreground">
                                    {formatDate(notification.date, 'MMM dd, yyyy HH:mm')}
                                  </div>
                                </div>
                                
                                {!notification.isRead && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => markNotificationAsRead(notification.id)}
                                  >
                                    Mark as Read
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attendance-history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Records</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const childRecords = getChildAttendanceRecords(selectedChild);
                    if (childRecords.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No attendance records found</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        {childRecords
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((record) => (
                            <div key={record.id} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <Badge className={getStatusColor(record.status)}>
                                    {getStatusIcon(record.status)}
                                    <span className="ml-1 capitalize">{record.status}</span>
                                  </Badge>
                                  <div>
                                    <div className="font-medium">
                                      {record.subject} - {record.className}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {formatDate(record.date, 'MMM dd, yyyy')} at {formatDate(record.markedAt, 'HH:mm')}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Notification Settings Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-800">
            <InfoIcon className="h-5 w-5 mr-2" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-blue-700 space-y-2">
            <p>You will automatically receive notifications when:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Your child is marked absent from class</li>
              <li>Your child arrives late to class</li>
              <li>Attendance is marked for any of your children's classes</li>
            </ul>
            <p className="mt-3">
              <strong>Note:</strong> Notifications are sent in real-time as teachers mark attendance. 
              You can view the full attendance history in the "Attendance History" tab.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


