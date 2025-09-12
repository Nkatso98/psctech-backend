import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  TrendingUp, 
  TrendingDown, 
  BookOpen, 
  Trophy, 
  Award, 
  Star,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Users,
  BarChart3,
  Target
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { performanceStore, learnerStore, teacherStore, userStore } from '@/lib/store';
import { consistentDataService } from '@/lib/consistent-data-service';

interface PerformanceMetrics {
  totalStudents: number;
  averageScore: number;
  topPerformers: number;
  needsImprovement: number;
  attendanceRate: number;
  subjectPerformance: Array<{
    subject: string;
    averageScore: number;
    totalStudents: number;
    improvement: number;
  }>;
  classPerformance: Array<{
    className: string;
    averageScore: number;
    totalStudents: number;
    rank: number;
  }>;
}

interface StudentData {
  id: string;
  name: string;
  grade: string;
  class: string;
  averageScore: number;
  attendance: number;
  subjects: string[];
  lastAssessment: string;
  status: string;
}

interface TeacherData {
  id: string;
  name: string;
  subject: string;
  grade: string;
  class: string;
  studentsCount: number;
  averageClassScore: number;
  performance: 'Excellent' | 'Good' | 'Satisfactory' | 'Needs Improvement';
}

export default function OverallAcademicPerformance() {
  const { user, institution } = useAuth();
  const [selectedTerm, setSelectedTerm] = useState('Term 1');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [performanceData, setPerformanceData] = useState<PerformanceMetrics | null>(null);
  const [studentsList, setStudentsList] = useState<StudentData[]>([]);
  const [teachersList, setTeachersList] = useState<TeacherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [activeTab, setActiveTab] = useState('overview');

  const terms = ['Term 1', 'Term 2', 'Term 3', 'Term 4'];
  const grades = ['All', '8', '9', '10', '11', '12'];
  const statuses = ['All', 'Excellent', 'Good', 'Satisfactory', 'Needs Improvement', 'Poor'];

  useEffect(() => {
    loadPerformanceData();
    loadStudentsData();
    loadTeachersData();
  }, [selectedTerm, selectedGrade]);

  const loadPerformanceData = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        const mockData = generateMockPerformanceData();
        setPerformanceData(mockData);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error loading performance data:', error);
      setLoading(false);
    }
  };

  const loadStudentsData = async () => {
    try {
      const learners = learnerStore.getAll();
      const users = userStore.getAll();
      
      const studentsData: StudentData[] = learners.map(learner => {
        const user = users.find(u => u.userId === learner.userId);
        const averageScore = consistentDataService.getStudentPerformance(learner.learnerId);
        const attendance = consistentDataService.getStudentAttendance(learner.learnerId);
        
        return {
          id: learner.learnerId,
          name: user?.fullName || 'Unknown Student',
          grade: learner.grade.toString(),
          class: learner.class,
          averageScore,
          attendance,
          subjects: ['Mathematics', 'English', 'Science', 'History', 'Geography'],
          lastAssessment: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          status: getStatusFromScore(averageScore)
        };
      });

      setStudentsList(studentsData);
    } catch (error) {
      console.error('Error loading students data:', error);
    }
  };

  const loadTeachersData = async () => {
    try {
      const teachers = teacherStore.getAll();
      const users = userStore.getAll();
      
      const teachersData: TeacherData[] = teachers.map(teacher => {
        const user = users.find(u => u.userId === teacher.userId);
        const studentsCount = consistentDataService.getClassEnrollment(teacher.class);
        const averageClassScore = consistentDataService.getTeacherPerformance(teacher.teacherId);
        
        return {
          id: teacher.teacherId,
          name: user?.fullName || 'Unknown Teacher',
          subject: teacher.subject,
          grade: teacher.grade.toString(),
          class: teacher.class,
          studentsCount,
          averageClassScore,
          performance: getPerformanceFromScore(averageClassScore)
        };
      });

      setTeachersList(teachersData);
    } catch (error) {
      console.error('Error loading teachers data:', error);
    }
  };

  const generateMockPerformanceData = (): PerformanceMetrics => {
    const actualStudents = learnerStore.getAll();
    const actualTeachers = teacherStore.getAll();
    
    return {
      totalStudents: actualStudents.length,
      averageScore: actualStudents.length > 0 ? 83 : 0,
      topPerformers: Math.floor(actualStudents.length * 0.2),
      needsImprovement: Math.floor(actualStudents.length * 0.15),
      attendanceRate: 90,
      subjectPerformance: [
        { subject: 'Mathematics', averageScore: 78, totalStudents: actualStudents.length, improvement: 5 },
        { subject: 'English', averageScore: 82, totalStudents: actualStudents.length, improvement: 3 },
        { subject: 'Science', averageScore: 75, totalStudents: actualStudents.length, improvement: 7 },
        { subject: 'History', averageScore: 80, totalStudents: actualStudents.length, improvement: 2 },
        { subject: 'Geography', averageScore: 77, totalStudents: actualStudents.length, improvement: 4 }
      ],
      classPerformance: actualStudents.length > 0 ? [
        { className: '10A', averageScore: 85, totalStudents: Math.min(actualStudents.length, 30), rank: 1 },
        { className: '11B', averageScore: 83, totalStudents: Math.min(actualStudents.length, 28), rank: 2 },
        { className: '12A', averageScore: 81, totalStudents: Math.min(actualStudents.length, 25), rank: 3 },
        { className: '10B', averageScore: 79, totalStudents: Math.min(actualStudents.length, 32), rank: 4 },
        { className: '11A', averageScore: 77, totalStudents: Math.min(actualStudents.length, 29), rank: 5 }
      ] : []
    };
  };

  const getStatusFromScore = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Satisfactory';
    return 'Needs Improvement';
  };

  const getPerformanceFromScore = (score: number): 'Excellent' | 'Good' | 'Satisfactory' | 'Needs Improvement' => {
    if (score >= 85) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 65) return 'Satisfactory';
    return 'Needs Improvement';
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'Excellent': 'bg-green-100 text-green-800',
      'Good': 'bg-blue-100 text-blue-800',
      'Satisfactory': 'bg-yellow-100 text-yellow-800',
      'Needs Improvement': 'bg-red-100 text-red-800'
    };
    return <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{status}</Badge>;
  };

  const getPerformanceBadgeForTeacher = (performance: string) => {
    const colors = {
      'Excellent': 'bg-green-100 text-green-800',
      'Good': 'bg-blue-100 text-blue-800',
      'Satisfactory': 'bg-yellow-100 text-yellow-800',
      'Needs Improvement': 'bg-red-100 text-red-800'
    };
    return <Badge className={colors[performance as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{performance}</Badge>;
  };

  const getPerformanceColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 70) return <Badge className="bg-blue-100 text-blue-800">Good</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Satisfactory</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>;
  };

  const filteredStudents = studentsList.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || student.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <AuthLayout>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DashboardLayout>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Overall Academic Performance</h1>
            <p className="text-muted-foreground">
              Comprehensive view of student and teacher performance across all subjects and classes
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceData?.totalStudents}</div>
                <p className="text-xs text-muted-foreground">
                  Enrolled this term
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceData?.averageScore}%</div>
                <p className="text-xs text-muted-foreground">
                  Across all subjects
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceData?.topPerformers}</div>
                <p className="text-xs text-muted-foreground">
                  Students with 80%+
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Needs Improvement</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceData?.needsImprovement}</div>
                <p className="text-xs text-muted-foreground">
                  Below 60%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="students">Students List</TabsTrigger>
              <TabsTrigger value="teachers">Teachers List</TabsTrigger>
              <TabsTrigger value="subjects">Subjects</TabsTrigger>
              <TabsTrigger value="classes">Classes</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Performance Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Performance Trends
                    </CardTitle>
                    <CardDescription>Recent academic performance indicators</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Attendance Rate</span>
                      <span className="font-semibold text-green-600">{performanceData?.attendanceRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Average Score</span>
                      <span className="font-semibold text-blue-600">{performanceData?.averageScore}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Top Performers</span>
                      <span className="font-semibold text-green-600">{performanceData?.topPerformers}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>Latest performance updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Mathematics scores improved by 5%</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>New assessment completed for Grade 10</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span>Attendance monitoring system updated</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="students" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Student Performance
                  </CardTitle>
                  <CardDescription>
                    Individual student performance and progress tracking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredStudents.map((student, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {student.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-lg">{student.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                Grade {student.grade} • Class {student.class}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">{student.averageScore}%</div>
                            <div className="text-sm text-muted-foreground">Overall Score</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-white rounded-lg">
                            <div className="text-lg font-semibold text-green-600">{student.attendance}%</div>
                            <div className="text-xs text-muted-foreground">Attendance</div>
                          </div>
                          <div className="text-center p-3 bg-white rounded-lg">
                            <div className="text-lg font-semibold text-purple-600">{student.subjects.length}</div>
                            <div className="text-xs text-muted-foreground">Subjects</div>
                          </div>
                          <div className="text-center p-3 bg-white rounded-lg">
                            <div className="text-lg font-semibold text-orange-600">{student.lastAssessment}</div>
                            <div className="text-xs text-muted-foreground">Last Assessment</div>
                          </div>
                          <div className="text-center p-3 bg-white rounded-lg">
                            {getStatusBadge(student.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="teachers" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Teacher Performance & Rating
                  </CardTitle>
                  <CardDescription>
                    Teacher performance metrics and rating system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teachersList.map((teacher, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-green-100 text-green-600">
                                {teacher.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-lg">{teacher.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {teacher.subject} • Grade {teacher.grade} • Class {teacher.class}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">{teacher.averageClassScore}%</div>
                            <div className="text-sm text-muted-foreground">Class Performance</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-white rounded-lg">
                            <div className="text-lg font-semibold text-blue-600">{teacher.studentsCount}</div>
                            <div className="text-xs text-muted-foreground">Students</div>
                          </div>
                          <div className="text-center p-3 bg-white rounded-lg">
                            <div className="text-lg font-semibold text-purple-600">{teacher.subject}</div>
                            <div className="text-xs text-muted-foreground">Subject</div>
                          </div>
                          <div className="text-center p-3 bg-white rounded-lg">
                            {getPerformanceBadgeForTeacher(teacher.performance)}
                          </div>
                          <div className="text-center p-3 bg-white rounded-lg">
                            <Button size="sm" variant="outline">
                              <Star className="h-4 w-4 mr-1" />
                              Rate Teacher
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subjects" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Subject Performance Analysis</CardTitle>
                  <CardDescription>
                    Detailed breakdown by subject area
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {performanceData?.subjectPerformance.map((subject, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                          <span className="font-medium">{subject.subject}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-semibold">{subject.averageScore}%</div>
                            <div className="text-xs text-muted-foreground">
                              {subject.totalStudents} students
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {subject.improvement > 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                            <span className={`text-sm ${subject.improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {Math.abs(subject.improvement)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="classes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Class Performance Rankings</CardTitle>
                  <CardDescription>
                    Performance comparison across all classes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {performanceData?.classPerformance.map((classData, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {classData.rank === 1 && <Trophy className="h-5 w-5 text-yellow-500" />}
                          {classData.rank === 2 && <Award className="h-5 w-5 text-gray-400" />}
                          {classData.rank === 3 && <Star className="h-5 w-5 text-orange-500" />}
                          {classData.rank > 3 && <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-white">{classData.rank}</div>}
                          <span className="font-medium">{classData.className}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className={`font-semibold ${getPerformanceColor(classData.averageScore)}`}>
                              {classData.averageScore}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {classData.totalStudents} students
                            </div>
                          </div>
                          {getPerformanceBadge(classData.averageScore)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </AuthLayout>
  );
}
