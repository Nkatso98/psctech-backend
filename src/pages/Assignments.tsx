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
  SearchIcon,
  UsersIcon,
  FileTextIcon,
  TargetIcon,
  TrendingUpIcon,
  CalendarIcon
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function Assignments() {
  const { user, institution } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    subject: '',
    description: '',
    dueDate: '',
    grade: '',
    type: 'Homework',
    points: 100
  });

  useEffect(() => {
    loadAssignments();
  }, [selectedSubject, selectedStatus, selectedGrade]);

  const loadAssignments = async () => {
    setLoading(true);
    // Simulate API call - replace with actual API
    setTimeout(() => {
      const mockData = generateMockAssignments();
      setAssignments(mockData);
      setLoading(false);
    }, 500);
  };

  const generateMockAssignments = () => {
    const subjects = ['Mathematics', 'English', 'Science', 'History', 'Geography'];
    const grades = ['Grade 10', 'Grade 11', 'Grade 12'];
    const types = ['Homework', 'Project', 'Quiz', 'Essay', 'Presentation'];
    const statuses = ['Active', 'Overdue', 'Completed', 'Draft'];
    
    const mockAssignments = [];
    for (let i = 1; i <= 25; i++) {
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      const grade = grades[Math.floor(Math.random() * grades.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const dueDate = new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000);
      const assignedDate = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      const submissions = Math.floor(Math.random() * 30) + 5;
      const totalStudents = 30;
      
      mockAssignments.push({
        id: i.toString(),
        title: `${type} Assignment ${i} - ${subject}`,
        subject,
        grade,
        type,
        description: `This is a comprehensive ${type.toLowerCase()} covering key concepts from ${subject}. Students should complete all requirements and submit by the due date.`,
        dueDate: dueDate.toISOString().split('T')[0],
        assignedDate: assignedDate.toISOString().split('T')[0],
        status,
        points: Math.floor(Math.random() * 50) + 50, // 50-100 points
        submissions,
        totalStudents,
        assignedBy: `Teacher ${Math.floor(Math.random() * 5) + 1}`,
        attachments: Math.random() > 0.7 ? ['assignment.pdf', 'resources.zip'] : [],
        rubric: Math.random() > 0.5 ? 'Available' : 'Not Available',
        feedback: Math.random() > 0.6 ? 'Enabled' : 'Disabled'
      });
    }
    return mockAssignments;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <ClockIcon className="h-4 w-4 text-green-600" />;
      case 'Overdue': return <AlertCircleIcon className="h-4 w-4 text-red-600" />;
      case 'Completed': return <CheckCircleIcon className="h-4 w-4 text-blue-600" />;
      case 'Draft': return <FileTextIcon className="h-4 w-4 text-gray-600" />;
      default: return <ClockIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Homework': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Project': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Quiz': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Essay': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Presentation': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSubject = selectedSubject === 'All' || assignment.subject === selectedSubject;
    const matchesStatus = selectedStatus === 'All' || assignment.status === selectedStatus;
    const matchesGrade = selectedGrade === 'All' || assignment.grade === selectedGrade;
    return matchesSubject && matchesStatus && matchesGrade;
  });

  const exportAssignments = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Title,Subject,Grade,Type,Status,Due Date,Points,Submissions\n" +
      filteredAssignments.map(row => 
        `${row.title},${row.subject},${row.grade},${row.type},${row.status},${row.dueDate},${row.points},${row.submissions}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `assignments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
              <p className="text-muted-foreground">
                Manage and track student assignments across all subjects and grades
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportAssignments}>
                <DownloadIcon className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={() => setShowAddForm(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                New Assignment
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Subject" />
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
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Grades</SelectItem>
                <SelectItem value="Grade 10">Grade 10</SelectItem>
                <SelectItem value="Grade 11">Grade 11</SelectItem>
                <SelectItem value="Grade 12">Grade 12</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assignments List */}
          <div className="space-y-4">
            {filteredAssignments.map((assignment) => (
              <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpenIcon className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={getTypeColor(assignment.type)}>
                          {assignment.type}
                        </Badge>
                        <Badge className={getStatusColor(assignment.status)}>
                          {getStatusIcon(assignment.status)}
                          <span className="ml-1">{assignment.status}</span>
                        </Badge>
                        <Badge variant="outline">
                          {assignment.points} points
                        </Badge>
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
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-4">{assignment.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Subject:</span> {assignment.subject}
                    </div>
                    <div>
                      <span className="font-medium">Grade:</span> {assignment.grade}
                    </div>
                    <div>
                      <span className="font-medium">Due Date:</span> {assignment.dueDate}
                    </div>
                    <div>
                      <span className="font-medium">Submissions:</span> {assignment.submissions}/{assignment.totalStudents}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredAssignments.length === 0 && (
              <Card className="text-center py-12">
                <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Assignments Found</h3>
                <p className="text-gray-500 mb-4">
                  No assignments match the current filters.
                </p>
                <Button onClick={() => setShowAddForm(true)}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create First Assignment
                </Button>
              </Card>
            )}
          </div>
        </div>
      </DashboardLayout>
    </AuthLayout>
  );
}










