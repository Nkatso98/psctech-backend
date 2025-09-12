import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpenIcon, 
  PlusIcon, 
  SearchIcon,
  FilterIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  BarChart3Icon,
  UsersIcon,
  ClockIcon,
  TargetIcon,
  TrendingUpIcon,
  AlertCircleIcon
} from 'lucide-react';
import { 
  Assignment, 
  AssignmentSubmission,
  TeacherAssignmentDashboard
} from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { CreateAssignmentForm } from './create-assignment-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function TeacherAssignmentDashboard() {
  const { user, institution } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'published' | 'draft'>('all');
  const [activeTab, setActiveTab] = useState('assignments');

  useEffect(() => {
    if (user && institution) {
      loadData();
    }
  }, [user, institution]);

  const loadData = () => {
    // This would load from the store or API
    // For now, using mock data
    const mockAssignments: Assignment[] = [
      {
        assignmentId: 'assign-1',
        title: 'Algebra Fundamentals Quiz',
        description: 'Basic algebra concepts and problem solving',
        subject: 'Mathematics',
        topic: 'Linear Equations',
        grade: '10',
        curriculum: 'CAPS',
        teacherId: user!.userId,
        institutionId: institution!.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        totalMarks: 100,
        timeLimit: 60,
        isActive: true,
        isPublished: true,
        assignedLearners: ['learner-1', 'learner-2'],
        questions: [],
        learningObjectives: ['Solve linear equations', 'Understand algebraic expressions'],
        difficulty: 'Medium',
        cognitiveLevels: ['Understand', 'Apply'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    setAssignments(mockAssignments);
  };

  const createAssignment = (assignment: Assignment) => {
    setAssignments(prev => [...prev, assignment]);
    setShowCreateForm(false);
  };

  const publishAssignment = (assignmentId: string) => {
    setAssignments(prev => 
      prev.map(assign => 
        assign.assignmentId === assignmentId 
          ? { ...assign, isPublished: true }
          : assign
      )
    );
  };

  const deleteAssignment = (assignmentId: string) => {
    if (confirm('Are you sure you want to delete this assignment?')) {
      setAssignments(prev => prev.filter(assign => assign.assignmentId !== assignmentId));
    }
  };

  const getFilteredAssignments = () => {
    let filtered = assignments;

    if (searchTerm) {
      filtered = filtered.filter(assign => 
        assign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assign.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assign.topic.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    switch (filterStatus) {
      case 'active':
        filtered = filtered.filter(assign => assign.isActive);
        break;
      case 'published':
        filtered = filtered.filter(assign => assign.isPublished);
        break;
      case 'draft':
        filtered = filtered.filter(assign => !assign.isPublished);
        break;
      default:
        break;
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getAssignmentStats = () => {
    const total = assignments.length;
    const published = assignments.filter(a => a.isPublished).length;
    const active = assignments.filter(a => a.isActive).length;
    const totalLearners = assignments.reduce((sum, a) => sum + a.assignedLearners.length, 0);

    return { total, published, active, totalLearners };
  };

  const getLearnerPerformance = () => {
    // This would calculate from actual submissions
    return [
      {
        learnerId: 'learner-1',
        learnerName: 'Emma Smith',
        grade: '10',
        totalAssignments: 5,
        averageScore: 85,
        completionRate: 100,
        strugglingTopics: ['Complex Numbers', 'Trigonometry']
      }
    ];
  };

  const getClassPerformance = () => {
    // This would calculate from actual submissions
    return assignments.map(assignment => ({
      assignmentId: assignment.assignmentId,
      assignmentTitle: assignment.title,
      averageScore: 78,
      completionRate: 85,
      totalLearners: assignment.assignedLearners.length,
      completedLearners: Math.floor(assignment.assignedLearners.length * 0.85)
    }));
  };

  const stats = getAssignmentStats();

  if (showCreateForm) {
    return (
      <CreateAssignmentForm
        onSave={createAssignment}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Assignment Management</h2>
          <p className="text-muted-foreground">
            Create, manage, and track assignments for your learners
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Assignment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Across all subjects
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <TargetIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
            <p className="text-xs text-muted-foreground">
              Active assignments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Learners</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLearners}</div>
            <p className="text-xs text-muted-foreground">
              Assigned to assignments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              Average completion
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="assignments">
            <BookOpenIcon className="h-4 w-4 mr-2" />
            Assignments
          </TabsTrigger>
          <TabsTrigger value="performance">
            <BarChart3Icon className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUpIcon className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Assignments</CardTitle>
              <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-sm">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search assignments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                  <SelectTrigger className="w-32">
                    <FilterIcon className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {getFilteredAssignments().length === 0 ? (
                <div className="text-center py-8">
                  <BookOpenIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No assignments yet</p>
                  <p className="text-sm text-muted-foreground">
                    Create your first assignment to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getFilteredAssignments().map((assignment) => (
                    <div
                      key={assignment.assignmentId}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium">{assignment.title}</h4>
                          <Badge variant={assignment.isPublished ? "default" : "secondary"}>
                            {assignment.isPublished ? "Published" : "Draft"}
                          </Badge>
                          <Badge variant="outline">{assignment.subject}</Badge>
                          <Badge variant="outline">Grade {assignment.grade}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {assignment.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Topic: {assignment.topic}</span>
                          <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                          <span>{assignment.assignedLearners.length} learners</span>
                          <span>{assignment.totalMarks} marks</span>
                          {assignment.timeLimit && (
                            <span>{assignment.timeLimit} min limit</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedAssignment(assignment)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedAssignment(assignment)}
                        >
                          <EditIcon className="h-4 w-4" />
                        </Button>
                        {!assignment.isPublished && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => publishAssignment(assignment.assignmentId)}
                          >
                            Publish
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteAssignment(assignment.assignmentId)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Learner Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Learner Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getLearnerPerformance().map((learner) => (
                    <div key={learner.learnerId} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{learner.learnerName}</h4>
                        <Badge variant="outline">Grade {learner.grade}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Assignments:</span>
                          <div className="font-medium">{learner.totalAssignments}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Avg Score:</span>
                          <div className="font-medium">{learner.averageScore}%</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Completion:</span>
                          <div className="font-medium">{learner.completionRate}%</div>
                        </div>
                      </div>
                      {learner.strugglingTopics.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs text-muted-foreground">Struggling with:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {learner.strugglingTopics.map((topic, index) => (
                              <Badge key={index} variant="destructive" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Class Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Class Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getClassPerformance().map((performance) => (
                    <div key={performance.assignmentId} className="border rounded-lg p-3">
                      <h4 className="font-medium mb-2">{performance.assignmentTitle}</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Avg Score:</span>
                          <div className="font-medium">{performance.averageScore}%</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Completion:</span>
                          <div className="font-medium">{performance.completionRate}%</div>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {performance.completedLearners} of {performance.totalLearners} learners completed
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">78%</div>
                  <div className="text-sm text-muted-foreground">Average Score</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">85%</div>
                  <div className="text-sm text-muted-foreground">Completion Rate</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">12</div>
                  <div className="text-sm text-muted-foreground">Active Learners</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">45 min</div>
                  <div className="text-sm text-muted-foreground">Avg Time Spent</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600">3</div>
                  <div className="text-sm text-muted-foreground">Struggling Topics</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">92%</div>
                  <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


