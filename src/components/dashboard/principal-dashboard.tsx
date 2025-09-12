import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  UsersIcon, 
  UserPlusIcon, 
  PlusIcon, 
  SearchIcon,
  CheckCircleIcon,
  TargetIcon,
  FileTextIcon,
  EyeIcon,
  EditIcon
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { learnerStore } from '@/lib/store';
import { teacherStore } from '@/lib/store';
import { userStore } from '@/lib/store';
import { jsPDF } from 'jspdf';
import { useNavigate } from 'react-router-dom';
import { consistentDataService } from '@/lib/consistent-data-service';

interface DashboardData {
  totalStudents: number;
  totalTeachers: number;
  averageAttendance: number;
  averagePerformance: number;
  recentAnnouncements: Array<{
    id: string;
    title: string;
    date: string;
    priority: string;
  }>;
}

export default function PrincipalDashboard() {
  const { user, institution } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalStudents: 0,
    totalTeachers: 0,
    averageAttendance: 0,
    averagePerformance: 0,
    recentAnnouncements: []
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load local data for demo
      const localData = loadLocalData();
      
      // In a real app, you would make API calls here
      // const response = await apiClient.getDashboardData(institution?.id);
      // if (response.data) {
      //   setDashboardData(response.data);
      // }
      
      setDashboardData(localData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLocalData = (): DashboardData => {
    const students = learnerStore.getAll();
    const teachers = teacherStore.getAll();
    
    // Generate mock announcements
    const announcements = [
      { id: '1', title: 'Parent-Teacher Meeting', date: '2024-01-15', priority: 'High' },
      { id: '2', title: 'Sports Day Event', date: '2024-01-20', priority: 'Medium' },
      { id: '3', title: 'Exam Schedule Update', date: '2024-01-25', priority: 'Low' }
    ];

    // Use consistent data service for all metrics
    const attendances = students.map(student => 
      consistentDataService.getStudentAttendance(student.learnerId)
    );

    const performances = students.map(student => 
      consistentDataService.getStudentPerformance(student.learnerId)
    );

    return {
      totalStudents: students.length,
      totalTeachers: teachers.length,
      averageAttendance: students.length > 0 ? Math.round(attendances.reduce((a, b) => a + b, 0) / students.length) : 0,
      averagePerformance: students.length > 0 ? Math.round(performances.reduce((a, b) => a + b, 0) / students.length) : 0,
      recentAnnouncements: announcements
    };
  };

  const filteredStudents = learnerStore.getAll().filter(learner => {
    const user = userStore.getById(learner.userId);
    const name = user?.fullName || '';
    const grade = learner.grade?.toString() || '';
    const className = learner.class || '';
    
    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
           className.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredTeachers = teacherStore.getAll().filter(teacher => {
    const user = userStore.getById(teacher.userId);
    const name = user?.fullName || '';
    const subject = teacher.subject || '';
    
    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           subject.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 95) return 'text-green-600';
    if (attendance >= 85) return 'text-blue-600';
    if (attendance >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const exportSchoolReportsPDF = () => {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      // Add header
      pdf.setFillColor(245, 245, 245);
      pdf.rect(0, 0, pageWidth, 30, 'F');
      
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(31, 41, 55);
      pdf.setFontSize(20);
      const schoolName = institution?.name || 'PSC Tech School';
      pdf.text(schoolName, 20, 20);
      
      pdf.setFontSize(16);
      pdf.text('School Reports & Analytics', 20, 28);
      
      // Add content
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Academic Performance Reports', 20, 50);
      pdf.text('Student attendance and performance analytics', 20, 60);
      
      pdf.text('Teacher Performance Reports', 20, 80);
      pdf.text('Staff evaluation and performance metrics', 20, 90);
      
      pdf.text('Financial Reports', 20, 110);
      pdf.text('Budget and expenditure analysis', 20, 120);
      
      pdf.text('Enrollment Reports', 20, 140);
      pdf.text('Student registration and class allocation', 20, 150);
      
      // Add footer
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on ${new Date().toLocaleDateString()} by ${user?.fullName || 'User'}`, pageWidth / 2, 280, { align: 'center' });
      
      pdf.save('school_reports.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Principal Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.fullName || 'Principal'}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={exportSchoolReportsPDF}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <FileTextIcon className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <UserPlusIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalTeachers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getAttendanceColor(dashboardData.averageAttendance)}`}>
              {dashboardData.averageAttendance}%
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2%</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Performance</CardTitle>
            <TargetIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(dashboardData.averagePerformance)}`}>
              {dashboardData.averagePerformance}%
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> from last term
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students, teachers, or classes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates from your school</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.recentAnnouncements.map((announcement) => (
                    <div key={announcement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{announcement.title}</p>
                        <p className="text-sm text-muted-foreground">{announcement.date}</p>
                      </div>
                      <Badge variant={announcement.priority === 'High' ? 'destructive' : announcement.priority === 'Medium' ? 'secondary' : 'outline'}>
                        {announcement.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/add-student')}
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add New Student
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/add-teacher')}
                  >
                    <UserPlusIcon className="h-4 w-4 mr-2" />
                    Add New Teacher
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/announcements')}
                  >
                    <FileTextIcon className="h-4 w-4 mr-2" />
                    Create Announcement
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Management</CardTitle>
              <CardDescription>View and manage student information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredStudents.map((learner) => {
                  const user = userStore.getById(learner.userId);
                  return (
                    <div key={learner.learnerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">
                            {user?.fullName?.charAt(0) || 'S'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user?.fullName || 'Unknown Student'}</p>
                          <p className="text-sm text-muted-foreground">
                            Grade {learner.grade} - Class {learner.class}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <EditIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                
                {filteredStudents.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No students found.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teachers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Teacher Management</CardTitle>
              <CardDescription>View and manage teacher information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTeachers.map((teacher) => {
                  const user = userStore.getById(teacher.userId);
                  return (
                    <div key={teacher.teacherId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-green-600">
                            {user?.fullName?.charAt(0) || 'T'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user?.fullName || 'Unknown Teacher'}</p>
                          <p className="text-sm text-muted-foreground">
                            {teacher.subject} - Grade {teacher.grade}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <EditIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                
                {filteredTeachers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No teachers found.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports & Analytics</CardTitle>
              <CardDescription>Generate and view various school reports</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                onClick={() => exportSchoolReportsPDF()}
              >
                <FileTextIcon className="h-4 w-4 mr-2" />
                Export School Reports
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}



