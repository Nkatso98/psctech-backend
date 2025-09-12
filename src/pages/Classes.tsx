import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  UsersIcon, 
  BookOpenIcon,
  MapPinIcon,
  PlusIcon,
  EditIcon,
  EyeIcon,
  TrashIcon,
  SearchIcon,
  FilterIcon,
  CalendarIcon,
  UserIcon,
  GraduationCapIcon,
  TargetIcon,
  TrendingUpIcon,
  AlertCircleIcon
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { consistentDataService } from '@/lib/consistent-data-service';

export default function Classes() {
  const { user, institution } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadClasses();
  }, [selectedGrade, selectedSubject]);

  const loadClasses = async () => {
    setLoading(true);
    // Simulate API call - replace with actual API
    setTimeout(() => {
      const mockData = generateMockClasses();
      setClasses(mockData);
      setLoading(false);
    }, 500);
  };

  const generateMockClasses = () => {
    const grades = ['Grade 10', 'Grade 11', 'Grade 12'];
    const subjects = ['Mathematics', 'English', 'Science', 'History', 'Geography', 'Physical Education', 'Art', 'Music'];
    const teachers = ['Mrs. Johnson', 'Mr. Smith', 'Ms. Davis', 'Mr. Wilson', 'Mrs. Brown'];
    const rooms = ['Room 101', 'Room 102', 'Room 103', 'Lab A', 'Lab B', 'Gym', 'Art Room', 'Music Room'];
    
    const mockClasses = [];
    for (let i = 1; i <= 24; i++) {
      const grade = grades[Math.floor(Math.random() * grades.length)];
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      const teacher = teachers[Math.floor(Math.random() * teachers.length)];
      const room = rooms[Math.floor(Math.random() * rooms.length)];
      const capacity = 30;
      const enrolled = consistentDataService.getClassEnrollment(grade);
      const schedule = consistentDataService.getClassSchedule(grade);
      
      mockClasses.push({
        id: i.toString(),
        name: `${grade} ${subject}`,
        grade,
        subject,
        teacher,
        room,
        capacity,
        enrolled,
        schedule,
        academicYear: '2024-2025',
        status: enrolled >= capacity ? 'Full' : 'Open',
        averagePerformance: consistentDataService.getSubjectPerformance(subject),
        attendanceRate: 90, // Consistent attendance rate
        description: `This class covers the core curriculum for ${subject} at ${grade} level. Students will develop essential skills and knowledge in this subject area.`,
        syllabus: `1. Introduction to ${subject}\n2. Core Concepts\n3. Practical Applications\n4. Assessment and Evaluation\n5. Final Project`,
        resources: ['Textbook', 'Online Materials', 'Practice Exercises'],
        assessments: consistentDataService.getAssessmentCount() // Consistent 5 assessments
      });
    }
    return mockClasses;
  };

  const addClass = () => {
    // Simulate adding a new class
    console.log('Adding new class');
    setShowAddForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Full': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Almost Full': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 80) return 'text-green-600';
    if (performance >= 70) return 'text-blue-600';
    if (performance >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredClasses = classes.filter(cls => {
    if (selectedGrade !== 'All' && cls.grade !== selectedGrade) return false;
    if (selectedSubject !== 'All' && cls.subject !== selectedSubject) return false;
    if (searchQuery && !cls.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !cls.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <AuthLayout>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
              <p className="text-muted-foreground">
                Manage and view class information at {institution?.name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {user?.role === 'Principal' && (
                <Button onClick={() => setShowAddForm(true)}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Class
                </Button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{classes.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {classes.reduce((sum, cls) => sum + cls.enrolled, 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Spots</CardTitle>
                <TargetIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {classes.reduce((sum, cls) => sum + (cls.capacity - cls.enrolled), 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Full Classes</CardTitle>
                <AlertCircleIcon className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {classes.filter(cls => cls.status === 'Full').length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Class Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <Label htmlFor="grade">Grade</Label>
                  <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Grades</SelectItem>
                      <SelectItem value="Grade 10">Grade 10</SelectItem>
                      <SelectItem value="Grade 11">Grade 11</SelectItem>
                      <SelectItem value="Grade 12">Grade 12</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Subjects</SelectItem>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="History">History</SelectItem>
                      <SelectItem value="Geography">Geography</SelectItem>
                      <SelectItem value="Physical Education">Physical Education</SelectItem>
                      <SelectItem value="Art">Art</SelectItem>
                      <SelectItem value="Music">Music</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative">
                  <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search classes..."
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
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>All Classes</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {filteredClasses.map((cls) => (
                        <Card key={cls.id} className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <BookOpenIcon className="h-5 w-5 text-primary" />
                              </div>
                              <Badge className={getStatusColor(cls.status)}>
                                {cls.status}
                              </Badge>
                            </div>
                            <CardTitle className="text-lg">{cls.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{cls.subject}</p>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="font-medium">Teacher:</span>
                                  <p className="text-muted-foreground">{cls.teacher}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Room:</span>
                                  <p className="text-muted-foreground">{cls.room}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Schedule:</span>
                                  <p className="text-muted-foreground">{cls.schedule}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Students:</span>
                                  <p className="text-muted-foreground">{cls.enrolled}/{cls.capacity}</p>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Performance</span>
                                  <span className={`font-medium ${getPerformanceColor(cls.averagePerformance)}`}>
                                    {cls.averagePerformance}%
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Attendance</span>
                                  <span className="font-medium">{cls.attendanceRate}%</span>
                                </div>
                              </div>
                              
                              <div className="flex gap-2 pt-2">
                                <Button size="sm" variant="outline" className="flex-1">
                                  <EyeIcon className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                {user?.role === 'Principal' && (
                                  <Button size="sm" variant="outline">
                                    <EditIcon className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                  
                  {filteredClasses.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No classes found
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Class Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {filteredClasses.map((cls) => (
                      <div key={cls.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <BookOpenIcon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{cls.name}</h3>
                            <p className="text-sm text-muted-foreground">{cls.teacher} • {cls.room}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Performance</div>
                            <div className={`text-lg font-bold ${getPerformanceColor(cls.averagePerformance)}`}>
                              {cls.averagePerformance}%
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Attendance</div>
                            <div className="text-lg font-medium">{cls.attendanceRate}%</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Assessments</div>
                            <div className="text-lg font-medium">{cls.assessments}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Class Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {filteredClasses.map((cls) => (
                      <Card key={cls.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">{cls.name}</CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {cls.grade} • {cls.subject} • {cls.academicYear}
                              </p>
                            </div>
                            <Badge className={getStatusColor(cls.status)}>
                              {cls.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-3">
                              <div>
                                <Label className="text-sm font-medium">Teacher</Label>
                                <p className="text-sm text-muted-foreground">{cls.teacher}</p>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium">Room</Label>
                                <p className="text-sm text-muted-foreground">{cls.room}</p>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium">Schedule</Label>
                                <p className="text-sm text-muted-foreground">{cls.schedule}</p>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium">Capacity</Label>
                                <p className="text-sm text-muted-foreground">{cls.enrolled}/{cls.capacity} students</p>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <div>
                                <Label className="text-sm font-medium">Description</Label>
                                <p className="text-sm text-muted-foreground">{cls.description}</p>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium">Resources</Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {cls.resources.map((resource, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {resource}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <Label className="text-sm font-medium">Syllabus</Label>
                            <div className="bg-muted p-3 rounded-lg mt-1">
                              <pre className="text-sm text-muted-foreground whitespace-pre-wrap">{cls.syllabus}</pre>
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

          {/* Add Class Form */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Class</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="grade">Grade</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Grade 10">Grade 10</SelectItem>
                        <SelectItem value="Grade 11">Grade 11</SelectItem>
                        <SelectItem value="Grade 12">Grade 12</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="History">History</SelectItem>
                        <SelectItem value="Geography">Geography</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="teacher">Teacher</Label>
                    <Input placeholder="Enter teacher name" />
                  </div>
                  <div>
                    <Label htmlFor="room">Room</Label>
                    <Input placeholder="Enter room number" />
                  </div>
                  <div>
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input type="number" placeholder="30" />
                  </div>
                  <div>
                    <Label htmlFor="schedule">Schedule</Label>
                    <Input placeholder="e.g., Monday 9:00 AM" />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={addClass}>Add Class</Button>
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













