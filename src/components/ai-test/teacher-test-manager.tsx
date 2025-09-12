import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BrainIcon, CheckCircleIcon, ClockIcon, UsersIcon, ArrowRightIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Teacher, AITest, TestSession, TestResult } from '@/lib/types';
import aiTestingSystem from '@/lib/ai-testing-system';
import { teacherStore } from '@/lib/store';

export function TeacherTestManager() {
  const { user, institution } = useAuth();
  const { toast } = useToast();
  
  // Get teacher details
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  
  // State for test creation
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState<number>(0);
  const [className, setClassName] = useState('');
  const [duration, setDuration] = useState(30);
  const [questionCount, setQuestionCount] = useState(5);
  
  // State for test management
  const [tests, setTests] = useState<AITest[]>([]);
  const [selectedTest, setSelectedTest] = useState<AITest | null>(null);
  const [activeSession, setActiveSession] = useState<TestSession | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  
  // Load teacher data
  useEffect(() => {
    if (user) {
      const teacherData = teacherStore.getByField('userId', user.userId)[0];
      if (teacherData) {
        setTeacher(teacherData);
        // Initialize subject and class from teacher data
        setSubject(teacherData.subject);
        setGrade(teacherData.grade);
        setClassName(teacherData.class);
        
        // Load tests created by this teacher
        const teacherTests = aiTestingSystem.getActiveTestsForTeacher(teacherData.teacherId);
        setTests(teacherTests);
      }
    }
  }, [user]);
  
  // Create a new test
  const handleCreateTest = () => {
    if (!teacher || !institution) return;
    
    if (!subject || !topic || !grade || !className || !duration || !questionCount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to create a test.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const newTest = aiTestingSystem.createTest(
        teacher.teacherId,
        institution.institutionId,
        subject,
        topic,
        grade,
        className,
        duration,
        questionCount
      );
      
      toast({
        title: "Test Created",
        description: `Your ${subject} test on ${topic} has been created successfully.`,
      });
      
      // Update the tests list
      setTests([newTest, ...tests]);
      
      // Reset form
      setTopic('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create the test. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Start a test session
  const handleStartTest = (test: AITest) => {
    try {
      const session = aiTestingSystem.startTestSession(test.testId);
      
      if (session) {
        setSelectedTest(test);
        setActiveSession(session);
        
        toast({
          title: "Test Started",
          description: "Learners can now join this test session.",
        });
        
        // Update the test in the list
        const updatedTests = tests.map(t => 
          t.testId === test.testId ? { ...t, status: 'Active' } : t
        );
        setTests(updatedTests);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start the test session. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // End a test session
  const handleEndTest = () => {
    if (!activeSession) return;
    
    try {
      const results = aiTestingSystem.endTestSession(activeSession.sessionId);
      setTestResults(results);
      
      // Add results message to the session
      aiTestingSystem.addResultsMessage(activeSession.sessionId, results);
      
      toast({
        title: "Test Ended",
        description: `Test completed with ${results.length} participants.`,
      });
      
      // Update the test in the list
      if (selectedTest) {
        const updatedTests = tests.map(t => 
          t.testId === selectedTest.testId ? { ...t, status: 'Completed' } : t
        );
        setTests(updatedTests.filter(t => t.status !== 'Completed'));
        
        // Reset active session and test
        setActiveSession(null);
        setSelectedTest(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to end the test session. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BrainIcon className="h-5 w-5 mr-2 text-primary" />
          AI Test Manager
        </CardTitle>
        <CardDescription>
          Create and manage AI-powered tests for your classes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="create">
          <TabsList className="mb-4">
            <TabsTrigger value="create">Create Test</TabsTrigger>
            <TabsTrigger value="manage">Manage Tests</TabsTrigger>
            {activeSession && (
              <TabsTrigger value="active">Active Test</TabsTrigger>
            )}
            {testResults.length > 0 && (
              <TabsTrigger value="results">Results</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="create" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select 
                  value={subject}
                  onValueChange={setSubject}
                >
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="History">History</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input 
                  id="topic" 
                  placeholder="e.g., Algebra, Ecosystems, Essay Writing" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Select
                  value={grade.toString()}
                  onValueChange={(value) => setGrade(parseInt(value))}
                >
                  <SelectTrigger id="grade">
                    <SelectValue placeholder="Select Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => (
                      <SelectItem key={g} value={g.toString()}>Grade {g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="class">Class</Label>
                <Input 
                  id="class" 
                  placeholder="e.g., 8A, 10C" 
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={5}
                  max={120}
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="questions">Number of Questions</Label>
                <Input
                  id="questions"
                  type="number"
                  min={1}
                  max={10}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button onClick={handleCreateTest}>
                <BrainIcon className="h-4 w-4 mr-2" />
                Generate AI Test
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="manage" className="space-y-4">
            <div className="rounded-md border">
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">Your Tests</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start a test to allow learners to join the session
                </p>
                
                {tests.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>You haven't created any tests yet.</p>
                    <Button variant="link" onClick={() => document.querySelector('[data-value="create"]')?.click()}>
                      Create your first test
                    </Button>
                  </div>
                )}
                
                {tests.length > 0 && (
                  <ScrollArea className="h-[400px] rounded-md border">
                    <div className="p-4 space-y-4">
                      {tests.map((test) => (
                        <div key={test.testId} className="p-4 border rounded-lg bg-card">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{test.subject}: {test.topic}</h4>
                              <div className="flex items-center text-sm text-muted-foreground space-x-3 mt-1">
                                <span>Grade {test.grade} {test.class}</span>
                                <span>•</span>
                                <span>{test.questions.length} questions</span>
                                <span>•</span>
                                <span>{test.duration} min</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={test.status === 'Active' ? "default" : "outline"}>
                                {test.status}
                              </Badge>
                              {test.status === 'Pending' && (
                                <Button size="sm" onClick={() => handleStartTest(test)}>
                                  Start Test
                                </Button>
                              )}
                              {test.status === 'Active' && (
                                <Button size="sm" variant="outline" onClick={() => {
                                  setSelectedTest(test);
                                  const session = aiTestingSystem.testSessionStore.getByField('testId', test.testId)[0];
                                  if (session) {
                                    setActiveSession(session);
                                    document.querySelector('[data-value="active"]')?.click();
                                  }
                                }}>
                                  View Session
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>
          </TabsContent>
          
          {activeSession && (
            <TabsContent value="active" className="space-y-4">
              <div className="rounded-md border">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        Active Test: {selectedTest?.subject} - {selectedTest?.topic}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Grade {selectedTest?.grade} {selectedTest?.class} • Started at {new Date(activeSession.startedAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-600" variant="default">
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-white mr-1 animate-pulse"></div>
                          Live
                        </div>
                      </Badge>
                      <Button variant="destructive" size="sm" onClick={handleEndTest}>
                        End Test
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <UsersIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                            <span>Participants</span>
                          </div>
                          <Badge variant="outline">{activeSession.participants.length}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <CheckCircleIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                            <span>Questions</span>
                          </div>
                          <Badge variant="outline">{selectedTest?.questions.length}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <ClockIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                            <span>Duration</span>
                          </div>
                          <Badge variant="outline">{selectedTest?.duration} min</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="rounded-md border">
                    <div className="p-4">
                      <h4 className="font-semibold mb-2">Session Code</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Share this code with your learners to join the test:
                      </p>
                      <div className="bg-muted p-3 rounded-md flex items-center justify-between">
                        <code className="text-lg font-bold">{activeSession.sessionId.substring(0, 8).toUpperCase()}</code>
                        <Button variant="ghost" size="sm" onClick={() => {
                          navigator.clipboard.writeText(activeSession.sessionId.substring(0, 8).toUpperCase());
                          toast({
                            title: "Copied!",
                            description: "Session code copied to clipboard"
                          });
                        }}>
                          Copy
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Live Chat</h4>
                    <ScrollArea className="h-[300px] border rounded-md p-4">
                      {activeSession.messages.map((message) => (
                        <div key={message.messageId} className="mb-3">
                          <div className="flex items-start">
                            <div className={`rounded-full w-8 h-8 flex items-center justify-center mr-2 ${
                              message.senderId === 'AI' 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted'
                            }`}>
                              {message.senderId === 'AI' ? (
                                <BrainIcon className="h-4 w-4" />
                              ) : (
                                message.senderName.charAt(0)
                              )}
                            </div>
                            <div>
                              <div className="flex items-center">
                                <span className="font-medium">{message.senderName}</span>
                                <span className="text-xs text-muted-foreground ml-2">
                                  {new Date(message.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-sm mt-1 whitespace-pre-line">{message.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}
          
          {testResults.length > 0 && (
            <TabsContent value="results" className="space-y-4">
              <div className="rounded-md border">
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">Test Results</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Performance summary for the last test
                  </p>
                  
                  <div className="rounded-md border mb-4">
                    <div className="p-4">
                      <h4 className="font-semibold mb-2">Top Performers</h4>
                      <div className="space-y-2">
                        {testResults.slice(0, Math.min(10, testResults.length)).map((result, index) => (
                          <div key={result.resultId} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                            <div className="flex items-center">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                                index === 0 ? 'bg-yellow-400 text-yellow-950' :
                                index === 1 ? 'bg-slate-300 text-slate-950' :
                                index === 2 ? 'bg-amber-600 text-amber-50' :
                                'bg-muted text-muted-foreground'
                              }`}>
                                {index + 1}
                              </div>
                              <span className="font-medium">Learner {index + 1}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={result.score >= 80 ? 'default' : result.score >= 50 ? 'secondary' : 'outline'}>
                                {result.score}%
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {result.correctAnswers}/{result.totalQuestions} correct
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Average Score</p>
                          <p className="text-2xl font-bold mt-1">
                            {testResults.length > 0 
                              ? Math.round(testResults.reduce((acc, result) => acc + result.score, 0) / testResults.length)
                              : 0}%
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Highest Score</p>
                          <p className="text-2xl font-bold mt-1">
                            {testResults.length > 0 
                              ? Math.max(...testResults.map(result => result.score))
                              : 0}%
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Lowest Score</p>
                          <p className="text-2xl font-bold mt-1">
                            {testResults.length > 0 
                              ? Math.min(...testResults.map(result => result.score))
                              : 0}%
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Participants</p>
                          <p className="text-2xl font-bold mt-1">{testResults.length}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={() => {
                      setTestResults([]);
                      document.querySelector('[data-value="manage"]')?.click();
                    }}>
                      Return to Test Manager
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}