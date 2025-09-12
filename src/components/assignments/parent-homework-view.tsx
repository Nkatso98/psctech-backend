import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpenIcon, 
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  BarChart3Icon,
  UsersIcon,
  TargetIcon,
  TrendingUpIcon,
  CalendarIcon,
  BookmarkIcon,
  EyeIcon,
  AlertTriangleIcon,
  LightbulbIcon
} from 'lucide-react';
import { 
  Assignment, 
  AssignmentSubmission,
  TopicStruggleAnalysis
} from '@/lib/types';
import { useAuth } from '@/lib/auth-context';

export function ParentHomeworkView() {
  const { user, institution } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedChild, setSelectedChild] = useState<string | null>(null);

  useEffect(() => {
    if (user && institution) {
      loadData();
    }
  }, [user, institution]);

  const loadData = () => {
    // This would load from the store or API
    // For now, using mock data
    const mockChildren = [
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

    const mockAssignments: Assignment[] = [
      {
        assignmentId: 'assign-1',
        title: 'Algebra Fundamentals Quiz',
        description: 'Basic algebra concepts and problem solving',
        subject: 'Mathematics',
        topic: 'Linear Equations',
        grade: '10',
        curriculum: 'CAPS',
        teacherId: 'teacher-1',
        institutionId: institution!.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        totalMarks: 100,
        timeLimit: 60,
        isActive: true,
        isPublished: true,
        assignedLearners: ['learner-1'],
        questions: [],
        learningObjectives: ['Solve linear equations', 'Understand algebraic expressions'],
        difficulty: 'Medium',
        cognitiveLevels: ['Understand', 'Apply'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        assignmentId: 'assign-2',
        title: 'English Literature Analysis',
        description: 'Analyze themes and characters in selected texts',
        subject: 'English',
        topic: 'Shakespeare',
        grade: '10',
        curriculum: 'CAPS',
        teacherId: 'teacher-2',
        institutionId: institution!.id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        totalMarks: 80,
        timeLimit: 90,
        isActive: true,
        isPublished: true,
        assignedLearners: ['learner-1'],
        questions: [],
        learningObjectives: ['Analyze literary themes', 'Character development'],
        difficulty: 'Hard',
        cognitiveLevels: ['Analyze', 'Evaluate'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    setChildren(mockChildren);
    setAssignments(mockAssignments);
    setSelectedChild(mockChildren[0]?.learnerId || null);
  };

  const getChildAssignments = (childId: string) => {
    return assignments.filter(assign => assign.assignedLearners.includes(childId));
  };

  const getChildSubmissions = (childId: string) => {
    const childAssignments = getChildAssignments(childId);
    return submissions.filter(sub => 
      childAssignments.some(assign => assign.assignmentId === sub.assignmentId)
    );
  };

  const getChildPerformance = (childId: string) => {
    const childAssignments = getChildAssignments(childId);
    const childSubmissions = getChildSubmissions(childId);
    
    if (childAssignments.length === 0) return null;

    const completedAssignments = childSubmissions.filter(sub => sub.isCompleted);
    const totalMarks = childAssignments.reduce((sum, assign) => sum + assign.totalMarks, 0);
    const earnedMarks = completedAssignments.reduce((sum, sub) => sum + sub.totalScore, 0);
    
    return {
      totalAssignments: childAssignments.length,
      completedAssignments: completedAssignments.length,
      completionRate: Math.round((completedAssignments.length / childAssignments.length) * 100),
      averageScore: completedAssignments.length > 0 ? Math.round(earnedMarks / totalMarks * 100) : 0,
      totalMarks,
      earnedMarks
    };
  };

  const getStrugglingTopics = (childId: string) => {
    // This would analyze actual performance data
    // For now, using mock data
    return [
      {
        topic: 'Complex Numbers',
        subject: 'Mathematics',
        difficulty: 'High',
        attempts: 3,
        averageScore: 45,
        recommendations: [
          'Review basic number theory concepts',
          'Practice with step-by-step problem solving',
          'Use visual aids for complex number operations'
        ]
      },
      {
        topic: 'Trigonometry',
        subject: 'Mathematics',
        difficulty: 'Medium',
        attempts: 2,
        averageScore: 62,
        recommendations: [
          'Focus on understanding unit circle',
          'Practice with real-world applications',
          'Review basic trigonometric identities'
        ]
      }
    ];
  };

  const getDueDateStatus = (dueDate: Date) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 1) return 'due-soon';
    if (diffDays <= 3) return 'due-this-week';
    return 'due-later';
  };

  const getDueDateColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'text-red-600';
      case 'due-soon': return 'text-orange-600';
      case 'due-this-week': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  const getDueDateIcon = (status: string) => {
    switch (status) {
      case 'overdue': return <AlertCircleIcon className="h-4 w-4" />;
      case 'due-soon': return <ClockIcon className="h-4 w-4" />;
      case 'due-this-week': return <CalendarIcon className="h-4 w-4" />;
      default: return <BookmarkIcon className="h-4 w-4" />;
    }
  };

  const getOverallStats = () => {
    let totalAssignments = 0;
    let totalCompleted = 0;
    let totalMarks = 0;
    let totalEarned = 0;

    children.forEach(child => {
      const performance = getChildPerformance(child.learnerId);
      if (performance) {
        totalAssignments += performance.totalAssignments;
        totalCompleted += performance.completedAssignments;
        totalMarks += performance.totalMarks;
        totalEarned += performance.earnedMarks;
      }
    });

    return {
      totalChildren: children.length,
      totalAssignments,
      totalCompleted,
      overallCompletionRate: totalAssignments > 0 ? Math.round((totalCompleted / totalAssignments) * 100) : 0,
      overallAverageScore: totalMarks > 0 ? Math.round((totalEarned / totalMarks) * 100) : 0
    };
  };

  const overallStats = getOverallStats();

  if (children.length === 0) {
    return (
      <div className="text-center py-8">
        <UsersIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
        <h2 className="text-3xl font-bold tracking-tight">Homework Overview</h2>
        <p className="text-muted-foreground">
          Monitor your children's homework progress and performance
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

      {/* Overall Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Children</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalChildren}</div>
            <p className="text-xs text-muted-foreground">
              Registered
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalAssignments}</div>
            <p className="text-xs text-muted-foreground">
              Across all children
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{overallStats.totalCompleted}</div>
            <p className="text-xs text-muted-foreground">
              Assignments done
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TargetIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.overallCompletionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Overall progress
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.overallAverageScore}%</div>
            <p className="text-xs text-muted-foreground">
              Performance
            </p>
          </CardContent>
        </Card>
      </div>

      {selectedChild && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">
              <BarChart3Icon className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="assignments">
              <BookOpenIcon className="h-4 w-4 mr-2" />
              Assignments
            </TabsTrigger>
            <TabsTrigger value="struggling">
              <AlertTriangleIcon className="h-4 w-4 mr-2" />
              Struggling Topics
            </TabsTrigger>
            <TabsTrigger value="recommendations">
              <LightbulbIcon className="h-4 w-4 mr-2" />
              Recommendations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const performance = getChildPerformance(selectedChild);
                  if (!performance) {
                    return (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No assignments assigned yet</p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{performance.totalAssignments}</div>
                        <div className="text-sm text-muted-foreground">Total Assignments</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{performance.completedAssignments}</div>
                        <div className="text-sm text-muted-foreground">Completed</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{performance.completionRate}%</div>
                        <div className="text-sm text-muted-foreground">Completion Rate</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{performance.averageScore}%</div>
                        <div className="text-sm text-muted-foreground">Average Score</div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const childAssignments = getChildAssignments(selectedChild);
                  if (childAssignments.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <BookOpenIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No assignments assigned yet</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {childAssignments.map((assignment) => {
                        const dueStatus = getDueDateStatus(assignment.dueDate);
                        const submission = submissions.find(sub => sub.assignmentId === assignment.assignmentId);
                        
                        return (
                          <div
                            key={assignment.assignmentId}
                            className={`border rounded-lg p-4 ${
                              submission?.isCompleted 
                                ? 'bg-green-50 border-green-200' 
                                : 'hover:bg-muted/50'
                            } transition-colors`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h4 className="font-medium">{assignment.title}</h4>
                                  <Badge variant={submission?.isCompleted ? "default" : "outline"}>
                                    {submission?.isCompleted ? "Completed" : "Pending"}
                                  </Badge>
                                  <Badge variant="outline">{assignment.subject}</Badge>
                                  <Badge variant="outline">Grade {assignment.grade}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {assignment.description}
                                </p>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                                  <span>Topic: {assignment.topic}</span>
                                  <span>{assignment.totalMarks} marks</span>
                                  {assignment.timeLimit && (
                                    <span>{assignment.timeLimit} min limit</span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className={`flex items-center space-x-1 ${getDueDateColor(dueStatus)}`}>
                                    {getDueDateIcon(dueStatus)}
                                    <span className="text-sm">
                                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                  {submission && (
                                    <Badge variant="outline">
                                      Score: {submission.totalScore}/{assignment.totalMarks}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="struggling" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Areas for Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const strugglingTopics = getStrugglingTopics(selectedChild);
                  if (strugglingTopics.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <CheckCircleIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No struggling topics identified</p>
                        <p className="text-sm text-muted-foreground">
                          Your child is performing well across all subjects!
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {strugglingTopics.map((topic, index) => (
                        <div key={index} className="border rounded-lg p-4 bg-red-50 border-red-200">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-red-800">{topic.topic}</h4>
                              <p className="text-sm text-red-600">{topic.subject}</p>
                            </div>
                            <Badge variant="destructive">{topic.difficulty}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                            <div>
                              <span className="text-red-600">Attempts:</span>
                              <div className="font-medium">{topic.attempts}</div>
                            </div>
                            <div>
                              <span className="text-red-600">Average Score:</span>
                              <div className="font-medium">{topic.averageScore}%</div>
                            </div>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-red-800">Recommendations:</span>
                            <ul className="mt-2 space-y-1">
                              {topic.recommendations.map((rec, recIndex) => (
                                <li key={recIndex} className="text-sm text-red-700 flex items-start">
                                  <span className="mr-2">•</span>
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Support Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">Study Schedule</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Establish a consistent homework routine with dedicated study time each day.
                    </p>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Set aside 1-2 hours daily for homework</li>
                      <li>• Create a quiet, distraction-free study environment</li>
                      <li>• Break large assignments into smaller, manageable tasks</li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                    <h4 className="font-medium text-green-800 mb-2">Subject Support</h4>
                    <p className="text-sm text-green-700 mb-3">
                      Focus on providing additional support for challenging subjects.
                    </p>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Review completed assignments together</li>
                      <li>• Encourage questions and discussion about difficult concepts</li>
                      <li>• Consider additional tutoring for struggling subjects</li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4 bg-purple-50 border-purple-200">
                    <h4 className="font-medium text-purple-800 mb-2">Communication</h4>
                    <p className="text-sm text-purple-700 mb-3">
                      Maintain open communication with teachers about your child's progress.
                    </p>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• Attend parent-teacher meetings regularly</li>
                      <li>• Ask about specific areas where your child needs support</li>
                      <li>• Discuss strategies for improvement with teachers</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}


