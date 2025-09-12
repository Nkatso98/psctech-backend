import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  CalendarIcon,
  UsersIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
  DownloadIcon,
  FilterIcon,
  SearchIcon
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function Attendance() {
  const { user, institution } = useAuth();
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAttendanceData();
  }, [selectedDate, selectedClass]);

  const loadAttendanceData = async () => {
    setLoading(true);
    // Simulate API call - replace with actual API
    setTimeout(() => {
      const mockData = generateMockAttendanceData();
      setAttendanceData(mockData);
      setLoading(false);
    }, 500);
  };

  const generateMockAttendanceData = () => {
    const students = [
      { id: '1', name: 'Alice Johnson', grade: '10A', status: 'Present', time: '07:45' },
      { id: '2', name: 'Bob Smith', grade: '10A', status: 'Present', time: '07:52' },
      { id: '3', name: 'Carol Davis', grade: '10A', status: 'Late', time: '08:15' },
      { id: '4', name: 'David Wilson', grade: '10A', status: 'Absent', time: '-' },
      { id: '5', name: 'Eva Brown', grade: '10A', status: 'Present', time: '07:48' },
    ];
    return students;
  };

  const markAttendance = (studentId: string, status: string) => {
    setAttendanceData(prev => 
      prev.map(student => 
        student.id === studentId 
          ? { ...student, status, time: status === 'Present' ? new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-' }
          : student
      )
    );
  };

  const exportAttendance = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Name,Grade,Status,Time\n" +
      attendanceData.map(row => `${row.name},${row.grade},${row.status},${row.time}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Late': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Absent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Present': return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'Late': return <ClockIcon className="h-4 w-4 text-yellow-600" />;
      case 'Absent': return <XCircleIcon className="h-4 w-4 text-red-600" />;
      default: return <AlertTriangleIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <AuthLayout>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Attendance Management</h1>
              <p className="text-muted-foreground">
                Track and manage student attendance for {institution?.name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={exportAttendance}>
                <DownloadIcon className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{attendanceData.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                <CheckCircleIcon className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {attendanceData.filter(s => s.status === 'Present').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Late</CardTitle>
                <ClockIcon className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {attendanceData.filter(s => s.status === 'Late').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Absent</CardTitle>
                <XCircleIcon className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {attendanceData.filter(s => s.status === 'Absent').length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="class">Class</Label>
                  <Input
                    id="class"
                    placeholder="Enter class name"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance for {new Date(selectedDate).toLocaleDateString()}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {attendanceData.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.grade}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(student.status)}>
                          {getStatusIcon(student.status)}
                          <span className="ml-2">{student.status}</span>
                        </Badge>
                        {student.time !== '-' && (
                          <span className="text-sm text-muted-foreground">{student.time}</span>
                        )}
                        
                        {user?.role === 'Teacher' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={student.status === 'Present' ? 'default' : 'outline'}
                              onClick={() => markAttendance(student.id, 'Present')}
                            >
                              Present
                            </Button>
                            <Button
                              size="sm"
                              variant={student.status === 'Late' ? 'default' : 'outline'}
                              onClick={() => markAttendance(student.id, 'Late')}
                            >
                              Late
                            </Button>
                            <Button
                              size="sm"
                              variant={student.status === 'Absent' ? 'default' : 'outline'}
                              onClick={() => markAttendance(student.id, 'Absent')}
                            >
                              Absent
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthLayout>
  );
}











