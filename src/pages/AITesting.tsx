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
import { Progress } from '@/components/ui/progress';
import { 
  BrainIcon, 
  PlayIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  BarChart3Icon,
  TargetIcon,
  AwardIcon,
  DownloadIcon,
  PlusIcon,
  EditIcon,
  EyeIcon,
  SearchIcon,
  FilterIcon,
  UsersIcon,
  BookOpenIcon
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function AITesting() {
  const { user, institution } = useAuth();
  const [aiTests, setAiTests] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('tests');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTest, setNewTest] = useState({
    title: '',
    subject: '',
    difficulty: '',
    description: '',
    duration: 30,
    questionCount: 10
  });

  useEffect(() => {
    loadAITests();
  }, [selectedSubject, selectedDifficulty]);

  const loadAITests = async () => {
    setLoading(true);
    // Simulate API call - replace with actual API
    setTimeout(() => {
      const mockData = generateMockAITests();
      setAiTests(mockData);
      setLoading(false);
    }, 500);
  };

  const generateMockAITests = () => {
    const subjects = ['Mathematics', 'English', 'Science', 'History', 'Geography'];
    const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
    const testTypes = ['Adaptive Quiz', 'Problem Solving', 'Concept Check', 'Exam Prep'];
    
    const mockTests = [];
    for (let i = 1; i <= 20; i++) {
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      const testType = testTypes[Math.floor(Math.random() * testTypes.length)];
      const duration = Math.floor(Math.random() * 45) + 15; // 15-60 minutes
      const questionCount = Math.floor(Math.random() * 20) + 5; // 5-25 questions
      const attempts = Math.floor(Math.random() * 50) + 10;
      const avgScore = Math.floor(Math.random() * 40) + 60; // 60-100
      
      mockTests.push({
        id: i.toString(),
        title: `AI ${testType} - ${subject}`,
        subject,
        difficulty,
        testType,
        description: `An AI-powered ${testType.toLowerCase()} designed to assess understanding of ${subject} concepts. The test adapts to student performance in real-time.`,
        duration,
        questionCount,
        attempts,
        avgScore,
        createdBy: `Teacher ${Math.floor(Math.random() * 5) + 1}`,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: Math.random() > 0.2 ? 'Active' : 'Draft',
        tags: [testType, difficulty, 'AI-Powered'],
        aiFeatures: ['Adaptive Difficulty', 'Real-time Feedback', 'Performance Analytics']
      });
    }
    return mockTests;
  };

  const createAITest = () => {
    if (newTest.title && newTest.subject && newTest.difficulty) {
      const testToAdd = {
        ...newTest,
        id: (aiTests.length + 1).toString(),
        testType: 'Custom Test',
        attempts: 0,
        avgScore: 0,
        createdBy: user?.fullName || 'Unknown',
        createdAt: new Date().toISOString(),
        status: 'Draft',
        tags: [newTest.difficulty, 'AI-Powered', 'Custom'],
        aiFeatures: ['Adaptive Difficulty', 'Real-time Feedback']
      };
      
      setAiTests([testToAdd, ...aiTests]);
      setNewTest({
        title: '',
        subject: '',
        difficulty: '',
        description: '',
        duration: 30,
        questionCount: 10
      });
      setShowCreateForm(false);
    }
  };

  const startTest = (testId: string) => {
    // Simulate starting a test
    console.log(`Starting test: ${testId}`);
    // In a real app, this would navigate to the test interface
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const filteredTests = aiTests.filter(test => {
    if (selectedSubject !== 'All' && test.subject !== selectedSubject) return false;
    if (selectedDifficulty !== 'All' && test.difficulty !== selectedDifficulty) return false;
    return true;
  });

  const exportTests = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Title,Subject,Difficulty,Test Type,Duration,Question Count,Attempts,Average Score,Status\n" +
      filteredTests.map(row => `${row.title},${row.subject},${row.difficulty},${row.testType},${row.duration}min,${row.questionCount},${row.attempts},${row.avgScore}%,${row.status}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ai_tests_${selectedSubject}_${selectedDifficulty}.csv`);
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
              <h1 className="text-3xl font-bold tracking-tight">AI Testing Platform</h1>
              <p className="text-muted-foreground">
                AI-powered educational testing and assessment at {institution?.name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {user?.role === 'Teacher' && (
                <Button onClick={() => setShowCreateForm(true)}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create AI Test
                </Button>
              )}
              <Button variant="outline" onClick={exportTests}>
                <DownloadIcon className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total AI Tests</CardTitle>
                <BrainIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{aiTests.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {aiTests.reduce((sum, test) => sum + test.attempts, 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {aiTests.length > 0 
                    ? Math.round(aiTests.reduce((sum, test) => sum + test.avgScore, 0) / aiTests.length)
                    : 0
                  }%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Tests</CardTitle>
                <CheckCircleIcon className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {aiTests.filter(test => test.status === 'Active').length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Test Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
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
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Difficulties</SelectItem>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tests">AI Tests</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="features">AI Features</TabsTrigger>
            </TabsList>

            <TabsContent value="tests" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Available AI Tests</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {filteredTests.map((test) => (
                        <Card key={test.id} className="hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <BrainIcon className="h-5 w-5 text-primary" />
                              </div>
                              <Badge className={getStatusColor(test.status)}>
                                {test.status}
                              </Badge>
                            </div>
                            <CardTitle className="text-lg line-clamp-2">{test.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">{test.subject}</p>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {test.description}
                              </p>
                              
                              <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-1">
                                  <ClockIcon className="h-4 w-4" />
                                  {test.duration} min
                                </span>
                                <span className="flex items-center gap-1">
                                  <BookOpenIcon className="h-4 w-4" />
                                  {test.questionCount} questions
                                </span>
                              </div>
                              
                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>Attempts: {test.attempts}</span>
                                <span>Avg: {test.avgScore}%</span>
                              </div>
                              
                              <div className="flex flex-wrap gap-1">
                                {test.tags.map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              
                              <div className="flex gap-2 pt-2">
                                <Button size="sm" className="flex-1" onClick={() => startTest(test.id)}>
                                  <PlayIcon className="h-4 w-4 mr-1" />
                                  Start Test
                                </Button>
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
                  
                  {filteredTests.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No AI tests found
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Test Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Performance by Subject</h3>
                      {['Mathematics', 'English', 'Science', 'History', 'Geography'].map((subject) => {
                        const subjectTests = aiTests.filter(test => test.subject === subject);
                        const avgScore = subjectTests.length > 0 
                          ? Math.round(subjectTests.reduce((sum, test) => sum + test.avgScore, 0) / subjectTests.length)
                          : 0;
                        
                        return (
                          <div key={subject} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>{subject}</span>
                              <span className="font-medium">{avgScore}%</span>
                            </div>
                            <Progress value={avgScore} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Performance by Difficulty</h3>
                      {['Beginner', 'Intermediate', 'Advanced'].map((difficulty) => {
                        const difficultyTests = aiTests.filter(test => test.difficulty === difficulty);
                        const avgScore = difficultyTests.length > 0 
                          ? Math.round(difficultyTests.reduce((sum, test) => sum + test.avgScore, 0) / difficultyTests.length)
                          : 0;
                        
                        return (
                          <div key={difficulty} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>{difficulty}</span>
                              <span className="font-medium">{avgScore}%</span>
                            </div>
                            <Progress value={avgScore} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI-Powered Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="border-2 border-primary/20">
                      <CardHeader>
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                          <BrainIcon className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-lg">Adaptive Difficulty</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Questions automatically adjust based on student performance, ensuring optimal challenge level.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-2 border-blue-200">
                      <CardHeader>
                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-2">
                          <ClockIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <CardTitle className="text-lg">Real-time Feedback</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Instant feedback and explanations help students learn from mistakes immediately.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-2 border-green-200">
                      <CardHeader>
                        <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-2">
                          <BarChart3Icon className="h-6 w-6 text-green-600" />
                        </div>
                        <CardTitle className="text-lg">Performance Analytics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Detailed analytics provide insights into learning patterns and areas for improvement.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Create Test Form */}
          {showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create New AI Test</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="title">Test Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter test title"
                      value={newTest.title}
                      onChange={(e) => setNewTest({...newTest, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Select value={newTest.subject} onValueChange={(value) => setNewTest({...newTest, subject: value})}>
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
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select value={newTest.difficulty} onValueChange={(value) => setNewTest({...newTest, difficulty: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="30"
                      value={newTest.duration}
                      onChange={(e) => setNewTest({...newTest, duration: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="questionCount">Question Count</Label>
                    <Input
                      id="questionCount"
                      type="number"
                      placeholder="10"
                      value={newTest.questionCount}
                      onChange={(e) => setNewTest({...newTest, questionCount: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter test description"
                      value={newTest.description}
                      onChange={(e) => setNewTest({...newTest, description: e.target.value})}
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={createAITest}>Create Test</Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </AuthLayout>
  );
}











