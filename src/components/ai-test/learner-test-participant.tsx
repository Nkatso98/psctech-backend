import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { 
  BrainIcon, 
  Send, 
  Clock, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  Trophy 
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Learner, TestSession, Question, TestMessage, AITest, TestResult } from '@/lib/types';
import aiTestingSystem from '@/lib/ai-testing-system';
import { learnerStore } from '@/lib/store';

export function LearnerTestParticipant() {
  const { user, institution } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get learner details
  const [learner, setLearner] = useState<Learner | null>(null);
  
  // State for joining a test
  const [sessionCode, setSessionCode] = useState('');
  const [availableSessions, setAvailableSessions] = useState<{ test: AITest, session: TestSession }[]>([]);
  
  // State for active test
  const [activeSession, setActiveSession] = useState<TestSession | null>(null);
  const [activeTest, setActiveTest] = useState<AITest | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for results
  const [testResults, setTestResults] = useState<{ result: TestResult, test: AITest }[]>([]);
  const [myResult, setMyResult] = useState<TestResult | null>(null);
  
  // Load learner data and available tests
  useEffect(() => {
    if (user && institution) {
      const learnerData = learnerStore.getByField('userId', user.userId)[0];
      if (learnerData) {
        setLearner(learnerData);
        
        // Load available test sessions
        const sessions = aiTestingSystem.getAvailableTestSessionsForLearner(
          learnerData.grade,
          institution.institutionId
        );
        setAvailableSessions(sessions);
        
        // Load past results
        const results = aiTestingSystem.getTestResultsForLearner(learnerData.learnerId);
        setTestResults(results);
      }
    }
  }, [user, institution]);
  
  // Scroll to bottom of messages when new ones arrive
  useEffect(() => {
    if (messagesEndRef.current && activeSession) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeSession?.messages]);
  
  // Join a test session
  const handleJoinSession = (sessionId: string) => {
    if (!learner || !user) return;
    
    try {
      // If sessionId is from input, it's only the first 8 chars, so find the full ID
      let fullSessionId = sessionId;
      if (sessionId.length <= 8) {
        const matchingSession = aiTestingSystem.testSessionStore.getAll().find(
          s => s.sessionId.substring(0, 8).toUpperCase() === sessionId.toUpperCase()
        );
        
        if (!matchingSession) {
          toast({
            title: "Session Not Found",
            description: "The test session code is invalid or expired.",
            variant: "destructive"
          });
          return;
        }
        
        fullSessionId = matchingSession.sessionId;
      }
      
      const success = aiTestingSystem.joinTestSession(
        fullSessionId,
        learner.learnerId,
        user.fullName
      );
      
      if (success) {
        const session = aiTestingSystem.testSessionStore.getById(fullSessionId);
        if (session) {
          const test = aiTestingSystem.aiTestStore.getById(session.testId);
          if (test) {
            setActiveSession(session);
            setActiveTest(test);
            
            toast({
              title: "Joined Test Session",
              description: `You have joined the ${test.subject}: ${test.topic} test.`,
            });
            
            // Get the first question
            setTimeout(() => {
              const result = aiTestingSystem.sendNextQuestion(fullSessionId);
              if (result) {
                setCurrentQuestion(result.question);
              }
            }, 1000);
          }
        }
      } else {
        toast({
          title: "Cannot Join",
          description: "This test session is no longer active or not available for your grade.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join the test session. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Submit an answer
  const handleSubmitAnswer = () => {
    if (!activeSession || !currentQuestion || !learner || !user || !answer.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const result = aiTestingSystem.submitAnswer(
        activeSession.sessionId,
        learner.learnerId,
        currentQuestion.questionId,
        answer,
        user.fullName
      );
      
      if (result) {
        // Clear the answer field
        setAnswer('');
        
        // After a delay, get the next question
        setTimeout(() => {
          const nextResult = aiTestingSystem.sendNextQuestion(
            activeSession.sessionId,
            currentQuestion.questionId
          );
          
          if (nextResult) {
            setCurrentQuestion(nextResult.question);
          } else {
            // No more questions, check for results
            const updatedSession = aiTestingSystem.testSessionStore.getById(activeSession.sessionId);
            if (updatedSession && !updatedSession.isActive) {
              // Test has ended
              const myResults = aiTestingSystem.testResultStore.getByField('learnerId', learner.learnerId)
                .filter(r => r.sessionId === activeSession.sessionId)[0];
              
              if (myResults) {
                setMyResult(myResults);
              }
            }
            
            // No next question, but test might still be active
            setCurrentQuestion(null);
          }
          
          setIsSubmitting(false);
        }, 1500);
      } else {
        toast({
          title: "Error",
          description: "Failed to submit your answer. Please try again.",
          variant: "destructive"
        });
        setIsSubmitting(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit your answer. Please try again.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };
  
  // Leave the test session
  const handleLeaveSession = () => {
    setActiveSession(null);
    setActiveTest(null);
    setCurrentQuestion(null);
    setAnswer('');
    
    // Reload available sessions
    if (learner && institution) {
      const sessions = aiTestingSystem.getAvailableTestSessionsForLearner(
        learner.grade,
        institution.institutionId
      );
      setAvailableSessions(sessions);
    }
    
    toast({
      title: "Left Test Session",
      description: "You have left the test session.",
    });
  };
  
  // Format a question for display
  const formatQuestionContent = (question: Question) => {
    if (!question) return '';
    
    let content = question.content;
    
    if (question.type === 'MultipleChoice' && question.options) {
      content += '\n\n';
      question.options.forEach((option, index) => {
        content += `${String.fromCharCode(65 + index)}. ${option}\n`;
      });
    }
    
    return content;
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BrainIcon className="h-5 w-5 mr-2 text-primary" />
          AI Test Zone
        </CardTitle>
        <CardDescription>
          Join interactive AI-powered tests and track your performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!activeSession ? (
          <Tabs defaultValue="available">
            <TabsList className="mb-4">
              <TabsTrigger value="available">Available Tests</TabsTrigger>
              <TabsTrigger value="join">Join by Code</TabsTrigger>
              <TabsTrigger value="results">Your Results</TabsTrigger>
            </TabsList>
            
            <TabsContent value="available" className="space-y-4">
              <div className="rounded-md border">
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">Available Tests</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Join an active test session from your teachers
                  </p>
                  
                  {availableSessions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>There are no active test sessions available for you right now.</p>
                      <p className="text-sm mt-2">Check back later or ask your teacher for a session code.</p>
                    </div>
                  )}
                  
                  {availableSessions.length > 0 && (
                    <div className="space-y-4">
                      {availableSessions.map(({ test, session }) => (
                        <div key={session.sessionId} className="p-4 border rounded-lg bg-card">
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
                            <Button size="sm" onClick={() => handleJoinSession(session.sessionId)}>
                              Join Test
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="join" className="space-y-4">
              <div className="rounded-md border">
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">Join Test by Code</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enter the session code provided by your teacher
                  </p>
                  
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Enter 8-character code"
                      value={sessionCode}
                      onChange={(e) => setSessionCode(e.target.value)}
                      maxLength={8}
                      className="font-mono uppercase"
                    />
                    <Button onClick={() => handleJoinSession(sessionCode)} disabled={!sessionCode}>
                      Join
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="rounded-md border bg-muted/20 p-4">
                <h4 className="font-medium mb-2">How to Join a Test</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Ask your teacher for the 8-character test session code</li>
                  <li>Enter the code in the field above</li>
                  <li>Click "Join" to enter the test session</li>
                  <li>Answer each question when prompted by the AI assistant</li>
                  <li>Your results will be shown at the end of the test</li>
                </ol>
              </div>
            </TabsContent>
            
            <TabsContent value="results" className="space-y-4">
              <div className="rounded-md border">
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">Your Test Results</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    History of your performance in AI tests
                  </p>
                  
                  {testResults.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>You haven't completed any tests yet.</p>
                      <p className="text-sm mt-2">Join a test session to see your results here.</p>
                    </div>
                  )}
                  
                  {testResults.length > 0 && (
                    <div className="space-y-4">
                      {testResults.map(({ result, test }) => (
                        <div key={result.resultId} className="p-4 border rounded-lg bg-card">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{test.subject}: {test.topic}</h4>
                              <div className="flex items-center text-sm text-muted-foreground space-x-3 mt-1">
                                <span>{new Date(result.completedAt).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>{result.correctAnswers}/{result.totalQuestions} correct</span>
                              </div>
                            </div>
                            <Badge variant={
                              result.score >= 80 ? 'default' : 
                              result.score >= 50 ? 'secondary' : 
                              'outline'
                            }>
                              {result.score}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">
                  {activeTest.subject}: {activeTest.topic}
                </h3>
                <p className="text-sm text-muted-foreground">
                  AI-powered test session
                </p>
              </div>
              <div className="flex items-center gap-2">
                {activeSession.isActive ? (
                  <>
                    <Badge className="bg-green-600" variant="default">
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-white mr-1 animate-pulse"></div>
                        Live
                      </div>
                    </Badge>
                    <Button variant="outline" size="sm" onClick={handleLeaveSession}>
                      Leave Test
                    </Button>
                  </>
                ) : (
                  <>
                    <Badge variant="outline">Completed</Badge>
                    <Button variant="outline" size="sm" onClick={handleLeaveSession}>
                      Exit
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-muted-foreground" />
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
                      <CheckCircle className="h-5 w-5 mr-2 text-muted-foreground" />
                      <span>Questions</span>
                    </div>
                    <Badge variant="outline">{activeTest.questions.length}</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                      <span>Duration</span>
                    </div>
                    <Badge variant="outline">{activeTest.duration} min</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="border-2">
              <CardContent className="p-0">
                <ScrollArea className="h-[400px] p-4">
                  <div className="space-y-4">
                    {activeSession.messages.map((message) => (
                      <div key={message.messageId} className={`mb-3 ${
                        message.senderId === learner?.learnerId ? 'text-right' : ''
                      }`}>
                        <div className={`flex items-start ${
                          message.senderId === learner?.learnerId ? 'justify-end' : ''
                        }`}>
                          {message.senderId !== learner?.learnerId && (
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
                          )}
                          <div className={`max-w-[80%] ${
                            message.senderId === learner?.learnerId
                              ? 'bg-primary text-primary-foreground'
                              : message.senderId === 'AI'
                                ? 'bg-muted'
                                : 'bg-muted/50'
                          } rounded-lg px-3 py-2`}>
                            {message.senderId !== learner?.learnerId && (
                              <div className="font-medium text-xs mb-1">{message.senderName}</div>
                            )}
                            <p className="text-sm whitespace-pre-line">{message.content}</p>
                            {message.type === 'Answer' && message.isCorrect !== undefined && (
                              <div className={`mt-1 flex justify-end ${
                                message.isCorrect ? 'text-green-500' : 'text-red-500'
                              }`}>
                                {message.isCorrect ? (
                                  <CheckCircle className="h-3 w-3" />
                                ) : (
                                  <AlertCircle className="h-3 w-3" />
                                )}
                              </div>
                            )}
                          </div>
                          {message.senderId === learner?.learnerId && (
                            <div className="rounded-full w-8 h-8 flex items-center justify-center ml-2 bg-primary text-primary-foreground">
                              {message.senderName.charAt(0)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </CardContent>
              
              {activeSession.isActive && currentQuestion && (
                <CardFooter className="p-4 border-t flex flex-col gap-4">
                  {currentQuestion.type === 'MultipleChoice' && currentQuestion.options && (
                    <div className="w-full">
                      <RadioGroup value={answer} onValueChange={setAnswer}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {currentQuestion.options.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2 border rounded-md p-2">
                              <RadioGroupItem 
                                value={String.fromCharCode(65 + index)} 
                                id={`option-${index}`} 
                              />
                              <Label htmlFor={`option-${index}`} className="flex-1">
                                {String.fromCharCode(65 + index)}. {option}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                  
                  {currentQuestion.type === 'TrueFalse' && (
                    <div className="w-full">
                      <RadioGroup value={answer} onValueChange={setAnswer}>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center space-x-2 border rounded-md p-2">
                            <RadioGroupItem value="True" id="true" />
                            <Label htmlFor="true">True</Label>
                          </div>
                          <div className="flex items-center space-x-2 border rounded-md p-2">
                            <RadioGroupItem value="False" id="false" />
                            <Label htmlFor="false">False</Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                  
                  {currentQuestion.type === 'ShortAnswer' && (
                    <Input
                      placeholder="Type your answer here..."
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      className="w-full"
                    />
                  )}
                  
                  <div className="flex justify-end w-full">
                    <Button 
                      onClick={handleSubmitAnswer} 
                      disabled={isSubmitting || !answer.trim()}
                      className="gap-2"
                    >
                      Submit Answer
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              )}
              
              {(!activeSession.isActive || !currentQuestion) && myResult && (
                <CardFooter className="p-4 border-t">
                  <div className="w-full space-y-4">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-2">
                        <Trophy className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold">Test Completed!</h3>
                      <p className="text-muted-foreground mb-4">Here's how you did:</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="pt-6 text-center">
                          <p className="text-sm text-muted-foreground">Your Score</p>
                          <p className="text-3xl font-bold mt-1">{myResult.score}%</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-6 text-center">
                          <p className="text-sm text-muted-foreground">Correct Answers</p>
                          <p className="text-3xl font-bold mt-1">{myResult.correctAnswers}/{myResult.totalQuestions}</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="flex justify-center">
                      <Button onClick={handleLeaveSession}>
                        Exit Test
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              )}
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}