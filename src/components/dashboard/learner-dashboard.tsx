import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpenIcon, 
  CalendarIcon, 
  FileTextIcon, 
  ClipboardIcon,
  BrainIcon,
  LightbulbIcon,
  ClockIcon,
  CheckCircle2Icon,
  TrendingUpIcon,
  TrendingDownIcon,
  AwardIcon,
  MapPinIcon,
  BarChart3,
  MessageSquareIcon,
  TargetIcon,
  ZapIcon,
  EyeIcon,
  EditIcon,
  PlusIcon,
  UsersIcon,
  GraduationCapIcon,
  BellIcon,
  StarIcon,
  PlayIcon,
  BookmarkIcon,
  AlertCircleIcon,
  DownloadIcon
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { LearnerTestParticipant } from '@/components/ai-test/learner-test-participant';
import { apiClient } from '@/lib/api-client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export function LearnerDashboard() {
  const { user, institution } = useAuth();
  
  // State management
  const [homework, setHomework] = useState<any[]>([]);
  const [aiTests, setAiTests] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [activeTest, setActiveTest] = useState<any>(null);
  const [testAnswers, setTestAnswers] = useState<Record<string, string>>({});
  const [testResults, setTestResults] = useState<any>(null);

  // Load learner data on component mount
  useEffect(() => {
    if (user?.userId) {
      loadLearnerData();
    }
  }, [user?.userId]);

  const loadLearnerData = async () => {
    try {
      setLoading(true);
      const [homeworkData, testsData, performanceData] = await Promise.all([
        apiClient.getLearnerHomework(user.userId),
        apiClient.getLearnerAITests(user.userId),
        apiClient.getLearnerPerformance(user.userId)
      ]);
      
      setHomework(homeworkData || []);
      setAiTests(testsData || []);
      setPerformance(performanceData || []);
      
      // Mock timetable data based on user's class
      const mockTimetable = [
        {
          id: 't1',
          time: '08:00',
          subject: 'Mathematics',
          room: 'Room 101',
          teacher: 'Mrs. Johnson',
          status: 'completed'
        },
        {
          id: 't2',
          time: '09:00',
          subject: 'Science',
          room: 'Room 102',
          teacher: 'Mr. Davis',
          status: 'active'
        },
        {
          id: 't3',
          time: '10:00',
          subject: 'English',
          room: 'Room 201',
          teacher: 'Miss Smith',
          status: 'upcoming'
        },
        {
          id: 't4',
          time: '11:00',
          subject: 'History',
          room: 'Room 103',
          teacher: 'Mr. Wilson',
          status: 'upcoming'
        },
        {
          id: 't5',
          time: '12:00',
          subject: 'Lunch Break',
          room: 'Cafeteria',
          teacher: '',
          status: 'break'
        },
        {
          id: 't6',
          time: '13:00',
          subject: 'Physical Education',
          room: 'Gym',
          teacher: 'Coach Brown',
          status: 'upcoming'
        }
      ];
      setTimetable(mockTimetable);
    } catch (error) {
      console.error('Error loading learner data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const startTest = (test: any) => {
    setActiveTest(test);
    setTestAnswers({});
    setTestResults(null);
  };

  const submitTest = async () => {
    if (!activeTest || !user?.userId) return;
    
    try {
      setLoading(true);
      const result = await apiClient.submitAITest(activeTest.id, {
        learnerId: user.userId,
        answers: testAnswers,
        timeTaken: 0 // In real app, track actual time
      });
      
      setTestResults(result);
      setActiveTest(null);
      toast.success('Test submitted successfully!');
      
      // Refresh performance data
      const performanceData = await apiClient.getLearnerPerformance(user.userId);
      setPerformance(performanceData || []);
    } catch (error) {
      console.error('Error submitting test:', error);
      toast.error('Failed to submit test');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setTestAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Student Dashboard</h2>
        <p className="text-muted-foreground">Welcome, {user?.fullName.split(' ')[0]}!</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Average</CardTitle>
            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75%</div>
            <p className="text-xs text-muted-foreground">
              +2% from last term
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Tests</CardTitle>
            <ClipboardIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Next: Science (Friday)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Homework Due</CardTitle>
            <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Math assignment due tomorrow
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Study Progress</CardTitle>
            <BrainIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45%</div>
            <p className="text-xs text-muted-foreground">
              3 subjects in progress
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ai-tests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ai-tests">
            <div className="flex items-center">
              <BrainIcon className="h-4 w-4 mr-1" />
              AI Tests
            </div>
          </TabsTrigger>
          <TabsTrigger value="study-zone">Study Zone</TabsTrigger>
          <TabsTrigger value="homework">Homework</TabsTrigger>
          <TabsTrigger value="timetable">Timetable</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ai-tests" className="space-y-4">
          <LearnerTestParticipant />
        </TabsContent>
        
        <TabsContent value="study-zone" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BrainIcon className="h-5 w-5 mr-2 text-primary" />
                AI-Powered Study Zone
              </CardTitle>
              <CardDescription>
                Personalized learning resources and practice exercises
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Recommended Study Sessions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-auto py-4 px-4 flex flex-col items-center justify-center gap-2">
                      <div className="rounded-full bg-primary/10 p-3">
                        <LightbulbIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-center">
                        <h4 className="font-medium">Science</h4>
                        <p className="text-xs text-muted-foreground">
                          Biology: Ecosystems
                        </p>
                      </div>
                      <Badge variant="outline" className="mt-2">30 min</Badge>
                    </Button>
                    
                    <Button variant="outline" className="h-auto py-4 px-4 flex flex-col items-center justify-center gap-2">
                      <div className="rounded-full bg-primary/10 p-3">
                        <LightbulbIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-center">
                        <h4 className="font-medium">Mathematics</h4>
                        <p className="text-xs text-muted-foreground">
                          Algebra: Equations
                        </p>
                      </div>
                      <Badge variant="outline" className="mt-2">25 min</Badge>
                    </Button>
                    
                    <Button variant="outline" className="h-auto py-4 px-4 flex flex-col items-center justify-center gap-2">
                      <div className="rounded-full bg-primary/10 p-3">
                        <LightbulbIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-center">
                        <h4 className="font-medium">English</h4>
                        <p className="text-xs text-muted-foreground">
                          Essay Writing
                        </p>
                      </div>
                      <Badge variant="outline" className="mt-2">20 min</Badge>
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Your Study Progress</h3>
                  <div className="space-y-4">
                    <div className="bg-muted/20 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Science</h4>
                        <span className="text-sm text-muted-foreground">65% complete</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                    
                    <div className="bg-muted/20 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Mathematics</h4>
                        <span className="text-sm text-muted-foreground">42% complete</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '42%' }}></div>
                      </div>
                    </div>
                    
                    <div className="bg-muted/20 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">English</h4>
                        <span className="text-sm text-muted-foreground">28% complete</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '28%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <Button className="w-full sm:w-auto">
                    <BrainIcon className="mr-2 h-4 w-4" />
                    Start New Study Session
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="homework" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Homework & Assignments</CardTitle>
                <CardDescription>
                  Track your homework and submission deadlines
                </CardDescription>
              </div>
              <Button variant="outline">
                <ClipboardIcon className="mr-2 h-4 w-4" />
                Mark as Complete
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Due Soon</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-amber-50 border-amber-200">
                      <div className="flex items-center">
                        <div className="bg-amber-100 p-2 rounded-md mr-4">
                          <ClockIcon className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Mathematics Assignment</h4>
                          <p className="text-sm text-muted-foreground">Due tomorrow, 2:00 PM</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-muted/20 p-2 rounded-md mr-4">
                          <ClockIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-medium">Science Project</h4>
                          <p className="text-sm text-muted-foreground">Due in 3 days</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-muted/20 p-2 rounded-md mr-4">
                          <ClockIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-medium">English Essay</h4>
                          <p className="text-sm text-muted-foreground">Due next Monday</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Recently Completed</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200">
                      <div className="flex items-center">
                        <div className="bg-green-100 p-2 rounded-md mr-4">
                          <CheckCircle2Icon className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">History Research</h4>
                          <p className="text-sm text-muted-foreground">Submitted yesterday</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">View Feedback</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timetable" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Class Schedule</CardTitle>
              <CardDescription>
                Your weekly timetable and class information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Today's Classes</h3>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Wednesday, 6 August 2025</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center">
                      <div className="bg-primary/10 text-primary p-2 rounded-md mr-4 text-sm font-medium">
                        08:00
                      </div>
                      <div>
                        <h4 className="font-medium">Mathematics</h4>
                        <p className="text-sm text-muted-foreground">Mrs. Mary Teacher - Room 102</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center">
                      <div className="bg-primary/10 text-primary p-2 rounded-md mr-4 text-sm font-medium">
                        09:30
                      </div>
                      <div>
                        <h4 className="font-medium">English</h4>
                        <p className="text-sm text-muted-foreground">Mr. John English - Room 203</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center">
                      <div className="bg-primary/10 text-primary p-2 rounded-md mr-4 text-sm font-medium">
                        11:00
                      </div>
                      <div>
                        <h4 className="font-medium">Science</h4>
                        <p className="text-sm text-muted-foreground">Ms. Sarah Science - Room 305</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center">
                      <div className="bg-primary/10 text-primary p-2 rounded-md mr-4 text-sm font-medium">
                        13:30
                      </div>
                      <div>
                        <h4 className="font-medium">History</h4>
                        <p className="text-sm text-muted-foreground">Mr. Peter History - Room 204</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center">
                      <div className="bg-primary/10 text-primary p-2 rounded-md mr-4 text-sm font-medium">
                        15:00
                      </div>
                      <div>
                        <h4 className="font-medium">Physical Education</h4>
                        <p className="text-sm text-muted-foreground">Coach James - Sports Hall</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <Button variant="outline">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    View Full Week Schedule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Academic Performance</CardTitle>
              <CardDescription>
                Track your results and academic progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Term Progress</h3>
                  <div className="border rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Overall Average</p>
                        <p className="text-2xl font-bold">75%</p>
                        <p className="text-xs text-muted-foreground">+2% from last term</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Class Rank</p>
                        <p className="text-2xl font-bold">12 / 34</p>
                        <p className="text-xs text-muted-foreground">Top 35%</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Recent Test Results</h3>
                  <div className="space-y-3">
                    <div className="bg-muted/20 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-medium">Mathematics Quiz</h4>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">82%</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        4 August 2025 - Algebra and Equations
                      </p>
                      <div className="h-2 bg-muted rounded-full">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '82%' }}></div>
                      </div>
                    </div>
                    
                    <div className="bg-muted/20 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-medium">English Essay</h4>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">75%</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        1 August 2025 - Creative Writing Assignment
                      </p>
                      <div className="h-2 bg-muted rounded-full">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    
                    <div className="bg-muted/20 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-medium">Science Test</h4>
                        <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium">68%</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        28 July 2025 - Biology and Ecosystems
                      </p>
                      <div className="h-2 bg-muted rounded-full">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '68%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <Button variant="outline">
                    <FileTextIcon className="mr-2 h-4 w-4" />
                    View All Results
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}