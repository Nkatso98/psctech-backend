import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  UserIcon,
  AlertCircleIcon,
  BellIcon,
  CalendarIcon,
  BookOpenIcon,
  SendIcon,
  SaveIcon
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
import { notificationService, type AttendanceNotification as ServiceNotification } from '@/lib/notification-service';

interface Learner {
  learnerId: string;
  firstName: string;
  lastName: string;
  grade: string;
  parentId: string;
  parentName: string;
  parentPhone?: string;
  parentEmail?: string;
}

interface AttendanceRecord {
  id: string;
  learnerId: string;
  classId: string;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  markedBy: string;
  markedAt: Date;
  notes?: string;
}

interface ClassSchedule {
  classId: string;
  className: string;
  grade: string;
  subject: string;
  startTime: string;
  endTime: string;
  room: string;
  learners: Learner[];
}

export function AttendanceMarking() {
  const { user, institution } = useAuth();
  const [selectedClass, setSelectedClass] = useState<ClassSchedule | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isMarking, setIsMarking] = useState(false);
  const [activeTab, setActiveTab] = useState('mark-attendance');
  const [notificationsSent, setNotificationsSent] = useState<string[]>([]);

  useEffect(() => {
    if (user && institution) {
      loadClassSchedule();
    }
  }, [user, institution]);

  const loadClassSchedule = () => {
    // This would load from the store or API
    // For now, using mock data
    const mockClasses: ClassSchedule[] = [
      {
        classId: 'class-1',
        className: 'Grade 10A',
        grade: '10',
        subject: 'Mathematics',
        startTime: '08:00',
        endTime: '09:00',
        room: 'Room 102',
        learners: [
          {
            learnerId: 'learner-1',
            firstName: 'Emma',
            lastName: 'Smith',
            grade: '10',
            parentId: 'parent-1',
            parentName: 'Mrs. Sarah Smith',
            parentPhone: '+27123456789',
            parentEmail: 'sarah.smith@email.com'
          },
          {
            learnerId: 'learner-2',
            firstName: 'James',
            lastName: 'Johnson',
            grade: '10',
            parentId: 'parent-2',
            parentName: 'Mr. David Johnson',
            parentPhone: '+27123456790',
            parentEmail: 'david.johnson@email.com'
          },
          {
            learnerId: 'learner-3',
            firstName: 'Lisa',
            lastName: 'Brown',
            grade: '10',
            parentId: 'parent-3',
            parentName: 'Mrs. Mary Brown',
            parentPhone: '+27123456791',
            parentEmail: 'mary.brown@email.com'
          }
        ]
      },
      {
        classId: 'class-2',
        className: 'Grade 9C',
        grade: '9',
        subject: 'Mathematics',
        startTime: '09:30',
        endTime: '10:30',
        room: 'Room 203',
        learners: [
          {
            learnerId: 'learner-4',
            firstName: 'Michael',
            lastName: 'Wilson',
            grade: '9',
            parentId: 'parent-4',
            parentName: 'Mr. Robert Wilson',
            parentPhone: '+27123456792',
            parentEmail: 'robert.wilson@email.com'
          }
        ]
      }
    ];

    setSelectedClass(mockClasses[0]);
  };

  const markAttendance = (learnerId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    if (!selectedClass) return;

    const existingRecord = attendanceRecords.find(
      record => record.learnerId === learnerId && 
      record.classId === selectedClass.classId &&
      format(record.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    );

    if (existingRecord) {
      setAttendanceRecords(prev => 
        prev.map(record => 
          record.id === existingRecord.id 
            ? { ...record, status, markedAt: new Date() }
            : record
        )
      );
    } else {
      const newRecord: AttendanceRecord = {
        id: `attendance-${Date.now()}-${learnerId}`,
        learnerId,
        classId: selectedClass.classId,
        date: new Date(),
        status,
        markedBy: user!.userId,
        markedAt: new Date()
      };
      setAttendanceRecords(prev => [...prev, newRecord]);
    }
  };

  const getAttendanceStatus = (learnerId: string) => {
    if (!selectedClass) return null;
    
    return attendanceRecords.find(
      record => record.learnerId === learnerId && 
      record.classId === selectedClass.classId &&
      format(record.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    );
  };

  const getAttendanceStats = () => {
    if (!selectedClass) return { total: 0, present: 0, absent: 0, late: 0, excused: 0 };

    const todayRecords = attendanceRecords.filter(
      record => record.classId === selectedClass.classId &&
      format(record.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    );

    return {
      total: selectedClass.learners.length,
      present: todayRecords.filter(r => r.status === 'present').length,
      absent: todayRecords.filter(r => r.status === 'absent').length,
      late: todayRecords.filter(r => r.status === 'late').length,
      excused: todayRecords.filter(r => r.status === 'excused').length
    };
  };

  const sendNotifications = async () => {
    if (!selectedClass) return;

    const todayRecords = attendanceRecords.filter(
      record => record.classId === selectedClass.classId &&
      format(record.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    );

    const notifications: ServiceNotification[] = [];
    const parentContacts = new Map();

    for (const learner of selectedClass.learners) {
      const record = todayRecords.find(r => r.learnerId === learner.learnerId);
      const status = record?.status || 'absent';

      if (status === 'absent' || status === 'late') {
        const notification: ServiceNotification = {
          id: `notif-${Date.now()}-${learner.learnerId}`,
          parentId: learner.parentId,
          learnerId: learner.learnerId,
          learnerName: `${learner.firstName} ${learner.lastName}`,
          status,
          classInfo: `${selectedClass.subject} - ${selectedClass.className}`,
          date: new Date(),
          message: notificationService.generateNotificationMessage(
            `${learner.firstName} ${learner.lastName}`,
            status,
            selectedClass.subject,
            selectedClass.className,
            new Date(),
            selectedClass.startTime
          )
        };

        notifications.push(notification);
        
        // Add parent contact info
        parentContacts.set(learner.parentId, {
          parentId: learner.parentId,
          parentName: learner.parentName,
          email: learner.parentEmail,
          phone: learner.parentPhone
        });
      }
    }

    if (notifications.length > 0) {
      try {
        const result = await notificationService.sendBulkNotifications(notifications, parentContacts);
        
        setNotificationsSent(prev => [...prev, selectedClass.classId]);
        
        alert(`Notifications sent successfully! ${result.success} delivered, ${result.failed} failed.`);
      } catch (error) {
        console.error('Error sending notifications:', error);
        alert('Error sending notifications. Please try again.');
      }
    } else {
      alert('No notifications to send. All learners are present or excused.');
    }
  };

  const saveAttendance = async () => {
    if (!selectedClass) return;

    const todayRecords = attendanceRecords.filter(
      record => record.classId === selectedClass.classId &&
      format(record.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    );

    // In a real app, this would save to the database
    console.log('Saving attendance records:', todayRecords);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('Attendance saved successfully!');
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

  const stats = getAttendanceStats();

  if (!selectedClass) {
    return (
      <div className="text-center py-8">
        <BookOpenIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No classes available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Attendance Marking</h2>
          <p className="text-muted-foreground">
            Mark attendance for your classes and notify parents
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={saveAttendance}>
            <SaveIcon className="h-4 w-4 mr-2" />
            Save Attendance
          </Button>
          <Button onClick={sendNotifications} disabled={notificationsSent.includes(selectedClass.classId)}>
            <BellIcon className="h-4 w-4 mr-2" />
            Send Notifications
          </Button>
        </div>
      </div>

      {/* Class Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Class</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                classId: 'class-1',
                className: 'Grade 10A',
                grade: '10',
                subject: 'Mathematics',
                startTime: '08:00',
                endTime: '09:00',
                room: 'Room 102'
              },
              {
                classId: 'class-2',
                className: 'Grade 9C',
                grade: '9',
                subject: 'Mathematics',
                startTime: '09:30',
                endTime: '10:30',
                room: 'Room 203'
              }
            ].map((cls) => (
              <button
                key={cls.classId}
                onClick={() => setSelectedClass({
                  ...cls,
                  learners: cls.classId === 'class-1' ? [
                    {
                      learnerId: 'learner-1',
                      firstName: 'Emma',
                      lastName: 'Smith',
                      grade: '10',
                      parentId: 'parent-1',
                      parentName: 'Mrs. Sarah Smith',
                      parentPhone: '+27123456789',
                      parentEmail: 'sarah.smith@email.com'
                    },
                    {
                      learnerId: 'learner-2',
                      firstName: 'James',
                      lastName: 'Johnson',
                      grade: '10',
                      parentId: 'parent-2',
                      parentName: 'Mr. David Johnson',
                      parentPhone: '+27123456790',
                      parentEmail: 'david.johnson@email.com'
                    },
                    {
                      learnerId: 'learner-3',
                      firstName: 'Lisa',
                      lastName: 'Brown',
                      grade: '10',
                      parentId: 'parent-3',
                      parentName: 'Mrs. Mary Brown',
                      parentPhone: '+27123456791',
                      parentEmail: 'mary.brown@email.com'
                    }
                  ] : [
                    {
                      learnerId: 'learner-4',
                      firstName: 'Michael',
                      lastName: 'Wilson',
                      grade: '9',
                      parentId: 'parent-4',
                      parentName: 'Mr. Robert Wilson',
                      parentPhone: '+27123456792',
                      parentEmail: 'robert.wilson@email.com'
                    }
                  ]
                })}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  selectedClass?.classId === cls.classId
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <div className="font-medium">{cls.className}</div>
                <div className="text-sm text-muted-foreground">{cls.subject}</div>
                <div className="text-xs text-muted-foreground">
                  {cls.startTime} - {cls.endTime} • {cls.room}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedClass && (
        <>
          {/* Class Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div>
                  {selectedClass.className} - {selectedClass.subject}
                  <div className="text-sm font-normal text-muted-foreground">
                    {selectedClass.startTime} - {selectedClass.endTime} • {selectedClass.room}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Today</div>
                  <div className="font-medium">{formatDate(new Date(), 'MMM dd, yyyy')}</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-5">
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-xs text-muted-foreground">Total Learners</div>
                </div>
                <div className="text-center p-3 border rounded-lg bg-green-50 border-green-200">
                  <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                  <div className="text-xs text-muted-foreground">Present</div>
                </div>
                <div className="text-center p-3 border rounded-lg bg-red-50 border-red-200">
                  <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                  <div className="text-xs text-muted-foreground">Absent</div>
                </div>
                <div className="text-center p-3 border rounded-lg bg-yellow-50 border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
                  <div className="text-xs text-muted-foreground">Late</div>
                </div>
                <div className="text-center p-3 border rounded-lg bg-blue-50 border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">{stats.excused}</div>
                  <div className="text-xs text-muted-foreground">Excused</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="mark-attendance">
                <UserIcon className="h-4 w-4 mr-2" />
                Mark Attendance
              </TabsTrigger>
              <TabsTrigger value="attendance-history">
                <CalendarIcon className="h-4 w-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mark-attendance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Mark Today's Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedClass.learners.map((learner) => {
                      const attendance = getAttendanceStatus(learner.learnerId);
                      const status = attendance?.status || 'unmarked';

                      return (
                        <div
                          key={learner.learnerId}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <UserIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {learner.firstName} {learner.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Parent: {learner.parentName}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={status === 'unmarked' ? 'outline' : 'default'}
                              className={`${
                                status !== 'unmarked' ? getStatusColor(status) : ''
                              }`}
                            >
                              {status === 'unmarked' ? (
                                <>
                                  <UserIcon className="h-4 w-4 mr-1" />
                                  Unmarked
                                </>
                              ) : (
                                <>
                                  {getStatusIcon(status)}
                                  <span className="ml-1 capitalize">{status}</span>
                                </>
                              )}
                            </Badge>
                          </div>

                          <div className="flex items-center space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAttendance(learner.learnerId, 'present')}
                              className={status === 'present' ? 'bg-green-100 border-green-300' : ''}
                            >
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              Present
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAttendance(learner.learnerId, 'absent')}
                              className={status === 'absent' ? 'bg-red-100 border-red-300' : ''}
                            >
                              <XCircleIcon className="h-4 w-4 mr-1" />
                              Absent
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAttendance(learner.learnerId, 'late')}
                              className={status === 'late' ? 'bg-yellow-100 border-yellow-300' : ''}
                            >
                              <ClockIcon className="h-4 w-4 mr-1" />
                              Late
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAttendance(learner.learnerId, 'excused')}
                              className={status === 'excused' ? 'bg-blue-100 border-blue-300' : ''}
                            >
                              <AlertCircleIcon className="h-4 w-4 mr-1" />
                              Excused
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attendance-history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {attendanceRecords
                      .filter(record => record.classId === selectedClass.classId)
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 10)
                      .map((record) => {
                        const learner = selectedClass.learners.find(l => l.learnerId === record.learnerId);
                        return (
                          <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Badge className={getStatusColor(record.status)}>
                                {getStatusIcon(record.status)}
                                <span className="ml-1 capitalize">{record.status}</span>
                              </Badge>
                              <div>
                                <div className="font-medium">
                                  {learner ? `${learner.firstName} ${learner.lastName}` : 'Unknown Learner'}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {formatDate(record.date, 'MMM dd, yyyy')} at {formatDate(record.markedAt, 'HH:mm')}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    
                    {attendanceRecords.filter(record => record.classId === selectedClass.classId).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No attendance records found for this class
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}


