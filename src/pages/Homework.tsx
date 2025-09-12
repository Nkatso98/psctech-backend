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
  BookOpenIcon, 
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  PlusIcon,
  EditIcon,
  EyeIcon,
  DownloadIcon,
  FilterIcon,
  CalendarIcon,
  UsersIcon,
  FileTextIcon,
  TargetIcon,
  TrendingUpIcon
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function Homework() {
  const { user, institution } = useAuth();
  const [homework, setHomework] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHomework, setNewHomework] = useState({
    title: '',
    subject: '',
    description: '',
    dueDate: '',
    grade: '',
    attachments: []
  });

  useEffect(() => {
    loadHomework();
  }, [selectedSubject, selectedStatus]);

  const loadHomework = async () => {
    setLoading(true);
    // Simulate API call - replace with actual API
    setTimeout(() => {
      const mockData = generateMockHomework();
      setHomework(mockData);
      setLoading(false);
    }, 500);
  };

  const generateMockHomework = () => {
    const subjects = ['Mathematics', 'English', 'Science', 'History', 'Geography'];
    const grades = ['10A', '10B', '11A', '11B', '12A', '12B'];
    const statuses = ['Pending', 'In Progress', 'Completed', 'Overdue'];
    
    const mockHomework = [];
    for (let i = 1; i <= 15; i++) {
      mockHomework.push({
        id: i.toString(),
        title: `Homework Assignment ${i}`,
        subject: subjects[Math.floor(Math.random() * subjects.length)],
        description: `This is a comprehensive assignment covering key concepts from ${subjects[Math.floor(Math.random() * subjects.length)]}. Students should complete all questions and submit by the due date.`,
        dueDate: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        grade: grades[Math.floor(Math.random() * grades.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        assignedBy: `Teacher ${Math.floor(Math.random() * 5) + 1}`,
        assignedDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        submissions: Math.floor(Math.random() * 30) + 5,
        totalStudents: 30,
        attachments: ['assignment.pdf', 'resources.zip']
      });
    }
    return mockHomework;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'In Progress': return <ClockIcon className="h-4 w-4 text-blue-600" />;
      case 'Pending': return <ClockIcon className="h-4 w-4 text-yellow-600" />;
      case 'Overdue': return <AlertCircleIcon className="h-4 w-4 text-red-600" />;
      default: return <ClockIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleAddHomework = () => {
    if (newHomework.title && newHomework.subject && newHomework.description && newHomework.dueDate && newHomework.grade) {
      const homeworkToAdd = {
        ...newHomework,
        id: (homework.length + 1).toString(),
        status: 'Pending',
        assignedBy: user?.fullName || 'Unknown',
        assignedDate: new Date().toISOString().split('T')[0],
        submissions: 0,
        totalStudents: 30,
        attachments: []
      };
      
      setHomework([homeworkToAdd, ...homework]);
      setNewHomework({
        title: '',
        subject: '',
        description: '',
        dueDate: '',
        grade: '',
        attachments: []
      });
      setShowAddForm(false);
    }
  };

  const filteredHomework = homework.filter(hw => {
    if (selectedSubject !== 'All' && hw.subject !== selectedSubject) return false;
    if (selectedStatus !== 'All' && hw.status !== selectedStatus) return false;
    return true;
  });

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <AuthLayout>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Homework Management</h1>
              <p className="text-muted-foreground">
                Manage and track homework assignments for {institution?.name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {user?.role === 'Teacher' && (
                <Button onClick={() => setShowAddForm(true)}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Homework
                </Button>
              )}
              <Button variant="outline">
                <DownloadIcon className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
                <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{homework.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <ClockIcon className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {homework.filter(hw => hw.status === 'Pending').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircleIcon className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {homework.filter(hw => hw.status === 'Completed').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <AlertCircleIcon className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {homework.filter(hw => isOverdue(hw.dueDate)).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add Homework Form */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Homework Assignment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter homework title"
                      value={newHomework.title}
                      onChange={(e) => setNewHomework({...newHomework, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Select value={newHomework.subject} onValueChange={(value) => setNewHomework({...newHomework, subject: value})}>
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
                    <Label htmlFor="grade">Grade</Label>
                    <Select value={newHomework.grade} onValueChange={(value) => setNewHomework({...newHomework, grade: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10A">Grade 10A</SelectItem>
                        <SelectItem value="10B">Grade 10B</SelectItem>
                        <SelectItem value="11A">Grade 11A</SelectItem>
                        <SelectItem value="11B">Grade 11B</SelectItem>
                        <SelectItem value="12A">Grade 12A</SelectItem>
                        <SelectItem value="12B">Grade 12B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newHomework.dueDate}
                      onChange={(e) => setNewHomework({...newHomework, dueDate: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter homework description"
                      value={newHomework.description}
                      onChange={(e) => setNewHomework({...newHomework, description: e.target.value})}
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={handleAddHomework}>Add Homework</Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="subject-filter">Subject</Label>
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
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status-filter">Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Statuses</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Overdue">Overdue</SelectItem>
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

          {/* Homework List */}
          <Card>
            <CardHeader>
              <CardTitle>Homework Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredHomework.map((hw) => (
                    <Card key={hw.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold">{hw.title}</h3>
                              <Badge className={getStatusColor(hw.status)}>
                                {getStatusIcon(hw.status)}
                                <span className="ml-2">{hw.status}</span>
                              </Badge>
                              {isOverdue(hw.dueDate) && (
                                <Badge variant="destructive">Overdue</Badge>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Subject:</span> {hw.subject}
                              </div>
                              <div>
                                <span className="font-medium">Grade:</span> {hw.grade}
                              </div>
                              <div>
                                <span className="font-medium">Due Date:</span> {new Date(hw.dueDate).toLocaleDateString()}
                              </div>
                              <div>
                                <span className="font-medium">Assigned:</span> {hw.assignedBy}
                              </div>
                            </div>
                            
                            <p className="text-muted-foreground line-clamp-2">
                              {hw.description}
                            </p>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <UsersIcon className="h-4 w-4" />
                                {hw.submissions}/{hw.totalStudents} submissions
                              </span>
                              <span className="flex items-center gap-1">
                                <FileTextIcon className="h-4 w-4" />
                                {hw.attachments.length} attachments
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            <Button size="sm" variant="outline">
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            {user?.role === 'Teacher' && (
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
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthLayout>
  );
}











