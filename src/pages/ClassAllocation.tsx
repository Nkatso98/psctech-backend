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
  DownloadIcon,
  UserPlusIcon,
  UserMinusIcon,
  SettingsIcon,
  BarChart3Icon
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function ClassAllocation() {
  const { user, institution } = useAuth();
  const [classAllocations, setClassAllocations] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [selectedTeacher, setSelectedTeacher] = useState('All');
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAllocation, setNewAllocation] = useState({
    className: '',
    grade: '',
    teacher: '',
    capacity: 30,
    room: '',
    subjects: []
  });

  useEffect(() => {
    loadData();
  }, [selectedGrade, selectedTeacher]);

  const loadData = async () => {
    setLoading(true);
    // Simulate API call - replace with actual API
    setTimeout(() => {
      const mockAllocations = generateMockClassAllocations();
      const mockStudents = generateMockStudents();
      const mockTeachers = generateMockTeachers();
      
      setClassAllocations(mockAllocations);
      setStudents(mockStudents);
      setTeachers(mockTeachers);
      setLoading(false);
    }, 500);
  };

  const generateMockClassAllocations = () => {
    const grades = ['Grade 10', 'Grade 11', 'Grade 12'];
    const classNames = ['A', 'B', 'C', 'D'];
    const teacherNames = ['Mrs. Johnson', 'Mr. Smith', 'Ms. Davis', 'Mr. Wilson', 'Mrs. Brown'];
    const rooms = ['Room 101', 'Room 102', 'Room 103', 'Room 104', 'Room 105'];
    const subjects = ['Mathematics', 'English', 'Science', 'History', 'Geography'];
    
    const mockAllocations = [];
    for (let i = 1; i <= 12; i++) {
      const grade = grades[Math.floor(Math.random() * grades.length)];
      const className = classNames[Math.floor(Math.random() * classNames.length)];
      const teacher = teacherNames[Math.floor(Math.random() * teacherNames.length)];
      const room = rooms[Math.floor(Math.random() * rooms.length)];
      const capacity = 30;
      const enrolled = Math.floor(Math.random() * 20) + 15; // 15-35 students
      
      mockAllocations.push({
        id: i.toString(),
        className: `${grade}${className}`,
        grade,
        teacher,
        room,
        capacity,
        enrolled,
        subjects: subjects.slice(0, Math.floor(Math.random() * 3) + 3), // 3-5 subjects
        academicYear: '2024-2025',
        status: enrolled >= capacity ? 'Full' : 'Open',
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    return mockAllocations;
  };

  const generateMockStudents = () => {
    const names = [
      'Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Eva Brown',
      'Frank Miller', 'Grace Lee', 'Henry Taylor', 'Ivy Chen', 'Jack Anderson',
      'Kate Martinez', 'Liam O\'Connor', 'Maya Patel', 'Noah Rodriguez', 'Olivia Thompson'
    ];
    
    return names.map((name, index) => ({
      id: (index + 1).toString(),
      name,
      grade: `Grade ${Math.floor(Math.random() * 3) + 10}`,
      currentClass: `Grade ${Math.floor(Math.random() * 3) + 10}${['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)]}`,
      academicPerformance: Math.floor(Math.random() * 40) + 60, // 60-100
      attendance: Math.floor(Math.random() * 20) + 80, // 80-100
      specialNeeds: Math.random() > 0.9 ? 'Learning Support' : 'None',
      parentContact: `parent${index + 1}@email.com`
    }));
  };

  const generateMockTeachers = () => {
    const names = ['Mrs. Johnson', 'Mr. Smith', 'Ms. Davis', 'Mr. Wilson', 'Mrs. Brown'];
    const subjects = ['Mathematics', 'English', 'Science', 'History', 'Geography'];
    
    return names.map((name, index) => ({
      id: (index + 1).toString(),
      name,
      subjects: [subjects[index % subjects.length]],
      experience: Math.floor(Math.random() * 20) + 5, // 5-25 years
      qualification: Math.random() > 0.5 ? 'Masters' : 'Bachelors',
      currentClasses: Math.floor(Math.random() * 3) + 1, // 1-3 classes
      maxClasses: 4
    }));
  };

  const addClassAllocation = () => {
    if (newAllocation.className && newAllocation.grade && newAllocation.teacher) {
      const allocationToAdd = {
        ...newAllocation,
        id: (classAllocations.length + 1).toString(),
        enrolled: 0,
        status: 'Open',
        academicYear: '2024-2025',
        createdAt: new Date().toISOString()
      };
      
      setClassAllocations([allocationToAdd, ...classAllocations]);
      setNewAllocation({
        className: '',
        grade: '',
        teacher: '',
        capacity: 30,
        room: '',
        subjects: []
      });
      setShowAddForm(false);
    }
  };

  const removeStudentFromClass = (studentId: string, className: string) => {
    setStudents(prev => 
      prev.map(student => 
        student.id === studentId 
          ? { ...student, currentClass: 'Unassigned' }
          : student
      )
    );
    
    setClassAllocations(prev => 
      prev.map(allocation => 
        allocation.className === className 
          ? { ...allocation, enrolled: Math.max(0, allocation.enrolled - 1) }
          : allocation
      )
    );
  };

  const addStudentToClass = (studentId: string, className: string) => {
    setStudents(prev => 
      prev.map(student => 
        student.id === studentId 
          ? { ...student, currentClass: className }
          : student
      )
    );
    
    setClassAllocations(prev => 
      prev.map(allocation => 
        allocation.className === className 
          ? { ...allocation, enrolled: allocation.enrolled + 1 }
          : allocation
      )
    );
  };

  const filteredAllocations = classAllocations.filter(allocation => {
    if (selectedGrade !== 'All' && allocation.grade !== selectedGrade) return false;
    if (selectedTeacher !== 'All' && allocation.teacher !== selectedTeacher) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Full': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Almost Full': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const exportAllocations = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Class,Grade,Teacher,Room,Capacity,Enrolled,Status,Subjects\n" +
      filteredAllocations.map(row => `${row.className},${row.grade},${row.teacher},${row.room},${row.capacity},${row.enrolled},${row.status},${row.subjects.join(';')}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `class_allocations_${selectedGrade}_${selectedTeacher}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AuthLayout>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Class Allocation</h1>
              <p className="text-muted-foreground">
                Manage class assignments and student placements at {institution?.name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {user?.role === 'Principal' && (
                <Button onClick={() => setShowAddForm(true)}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Class
                </Button>
              )}
              <Button variant="outline" onClick={exportAllocations}>
                <DownloadIcon className="h-4 w-4 mr-2" />
                Export
              </Button>
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
                <div className="text-2xl font-bold">{classAllocations.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{students.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teachers.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Spots</CardTitle>
                <MapPinIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {classAllocations.reduce((sum, c) => sum + (c.capacity - c.enrolled), 0)}
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
              <div className="grid gap-4 md:grid-cols-3">
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
                  <Label htmlFor="teacher">Teacher</Label>
                  <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Teachers</SelectItem>
                      {teachers.map(teacher => (
                        <SelectItem key={teacher.id} value={teacher.name}>{teacher.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
          <Tabs defaultValue="classes" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="classes">Classes</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="teachers">Teachers</TabsTrigger>
            </TabsList>

            <TabsContent value="classes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Class Allocations</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredAllocations.map((allocation) => (
                        <Card key={allocation.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <BookOpenIcon className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold">{allocation.className}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {allocation.grade} • {allocation.teacher} • {allocation.room}
                                  </p>
                                  <div className="flex gap-2 mt-2">
                                    {allocation.subjects.map((subject, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {subject}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-6">
                                <div className="text-center">
                                  <div className="text-2xl font-bold">{allocation.enrolled}</div>
                                  <div className="text-sm text-muted-foreground">Enrolled</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-medium">{allocation.capacity}</div>
                                  <div className="text-sm text-muted-foreground">Capacity</div>
                                </div>
                                <div className="text-center">
                                  <Badge className={getStatusColor(allocation.status)}>
                                    {allocation.status}
                                  </Badge>
                                </div>
                                <div className="flex gap-2">
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
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="students" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Student Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {students.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium">{student.name}</h3>
                            <p className="text-sm text-muted-foreground">{student.grade}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                Performance: {student.academicPerformance}%
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Attendance: {student.attendance}%
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-sm font-medium">Current Class</div>
                            <div className="text-lg font-semibold">{student.currentClass}</div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            {user?.role === 'Principal' && (
                              <Button size="sm" variant="outline">
                                <EditIcon className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="teachers" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Teacher Workload</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teachers.map((teacher) => (
                      <div key={teacher.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {teacher.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium">{teacher.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {teacher.qualification} • {teacher.experience} years experience
                            </p>
                            <div className="flex gap-2 mt-1">
                              {teacher.subjects.map((subject, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {subject}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold">{teacher.currentClasses}</div>
                            <div className="text-sm text-muted-foreground">Current Classes</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-medium">{teacher.maxClasses}</div>
                            <div className="text-sm text-muted-foreground">Max Classes</div>
                          </div>
                          <div className="text-center">
                            <Badge className={
                              teacher.currentClasses >= teacher.maxClasses 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }>
                              {teacher.currentClasses >= teacher.maxClasses ? 'At Capacity' : 'Available'}
                            </Badge>
                          </div>
                        </div>
                      </div>
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
                    <Label htmlFor="className">Class Name</Label>
                    <Input
                      id="className"
                      placeholder="e.g., Grade 10A"
                      value={newAllocation.className}
                      onChange={(e) => setNewAllocation({...newAllocation, className: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="grade">Grade</Label>
                    <Select value={newAllocation.grade} onValueChange={(value) => setNewAllocation({...newAllocation, grade: value})}>
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
                    <Label htmlFor="teacher">Teacher</Label>
                    <Select value={newAllocation.teacher} onValueChange={(value) => setNewAllocation({...newAllocation, teacher: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map(teacher => (
                          <SelectItem key={teacher.id} value={teacher.name}>{teacher.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="room">Room</Label>
                    <Input
                      id="room"
                      placeholder="e.g., Room 101"
                      value={newAllocation.room}
                      onChange={(e) => setNewAllocation({...newAllocation, room: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      placeholder="30"
                      value={newAllocation.capacity}
                      onChange={(e) => setNewAllocation({...newAllocation, capacity: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={addClassAllocation}>Add Class</Button>
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











