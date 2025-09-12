import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  BrainIcon, 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon,
  BookOpenIcon,
  TargetIcon,
  TrendingUpIcon,
  LightbulbIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  PlayIcon,
  PauseIcon,
  RotateCcwIcon
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface StudyQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  subject: string;
}

interface StudySession {
  id: string;
  subject: string;
  topic: string;
  durationMinutes: number;
  questions: StudyQuestion[];
  isActive: boolean;
}

interface Answer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
}

interface StudyResult {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  timeSpent: number;
  answers: Answer[];
  recommendations: string[];
  weakAreas: string[];
}

export function AIStudySession() {
  const { user } = useAuth();
  const { sessionId } = useParams();
  const navigate = useNavigate();
  
  const [session, setSession] = useState<StudySession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [studyResult, setStudyResult] = useState<StudyResult | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  useEffect(() => {
    if (sessionId) {
      loadStudySession();
    }
  }, [sessionId]);

  useEffect(() => {
    if (session && !isSessionComplete && !isPaused) {
      const timer = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [session, isSessionComplete, isPaused]);

  useEffect(() => {
    if (session && currentQuestionIndex < session.questions.length) {
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestionIndex, session]);

  const loadStudySession = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from API
      // For now, we'll generate mock data
      const mockSession: StudySession = {
        id: sessionId || '1',
        subject: 'Mathematics',
        topic: 'Algebra',
        durationMinutes: 30,
        questions: generateAIQuestions(),
        isActive: true
      };
      
      setSession(mockSession);
    } catch (error) {
      console.error('Error loading study session:', error);
      toast.error('Failed to load study session');
    } finally {
      setLoading(false);
    }
  };

  const generateAIQuestions = (): StudyQuestion[] => {
    return [
      {
        id: '1',
        question: 'What is the solution to the equation 2x + 5 = 13?',
        options: ['x = 4', 'x = 8', 'x = 3', 'x = 6'],
        correctAnswer: 'x = 4',
        explanation: 'To solve 2x + 5 = 13, subtract 5 from both sides: 2x = 8. Then divide both sides by 2: x = 4.',
        difficulty: 'easy',
        topic: 'Linear Equations',
        subject: 'Mathematics'
      },
      {
        id: '2',
        question: 'Factor the quadratic expression: x² - 4x + 4',
        options: ['(x - 2)²', '(x + 2)²', '(x - 2)(x + 2)', '(x - 4)(x + 1)'],
        correctAnswer: '(x - 2)²',
        explanation: 'This is a perfect square trinomial. x² - 4x + 4 = (x - 2)² because (x - 2)² = x² - 4x + 4.',
        difficulty: 'medium',
        topic: 'Factoring',
        subject: 'Mathematics'
      },
      {
        id: '3',
        question: 'Solve the system of equations: y = 2x + 1 and y = -x + 4',
        options: ['x = 1, y = 3', 'x = 2, y = 5', 'x = 3, y = 7', 'x = 0, y = 1'],
        correctAnswer: 'x = 1, y = 3',
        explanation: 'Set the equations equal: 2x + 1 = -x + 4. Add x to both sides: 3x + 1 = 4. Subtract 1: 3x = 3. Divide by 3: x = 1. Substitute: y = 2(1) + 1 = 3.',
        difficulty: 'hard',
        topic: 'Systems of Equations',
        subject: 'Mathematics'
      },
      {
        id: '4',
        question: 'What is the slope of the line passing through points (2, 3) and (4, 7)?',
        options: ['2', '1', '3', '4'],
        correctAnswer: '2',
        explanation: 'Slope = (y₂ - y₁) / (x₂ - x₁) = (7 - 3) / (4 - 2) = 4 / 2 = 2',
        difficulty: 'medium',
        topic: 'Slope',
        subject: 'Mathematics'
      },
      {
        id: '5',
        question: 'Simplify the expression: (3x²y³)²',
        options: ['9x⁴y⁶', '6x⁴y⁶', '9x²y³', '6x²y³'],
        correctAnswer: '9x⁴y⁶',
        explanation: 'When raising a power to a power, multiply the exponents: (3x²y³)² = 3²(x²)²(y³)² = 9x⁴y⁶',
        difficulty: 'medium',
        topic: 'Exponents',
        subject: 'Mathematics'
      }
    ];
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (!session || !selectedAnswer) return;

    const currentQuestion = session.questions[currentQuestionIndex];
    const timeSpentOnQuestion = Math.floor((Date.now() - questionStartTime) / 1000);
    
    const answer: Answer = {
      questionId: currentQuestion.id,
      selectedAnswer: selectedAnswer,
      isCorrect: selectedAnswer === currentQuestion.correctAnswer,
      timeSpent: timeSpentOnQuestion
    };

    setAnswers(prev => [...prev, answer]);
    setSelectedAnswer('');

    if (currentQuestionIndex + 1 < session.questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      completeStudySession();
    }
  };

  const completeStudySession = () => {
    if (!session) return;

    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const totalTime = answers.reduce((sum, a) => sum + a.timeSpent, 0);
    const score = Math.round((correctAnswers / session.questions.length) * 100);

    const result: StudyResult = {
      totalQuestions: session.questions.length,
      correctAnswers,
      score,
      timeSpent: totalTime,
      answers,
      recommendations: generateRecommendations(answers, session),
      weakAreas: identifyWeakAreas(answers, session)
    };

    setStudyResult(result);
    setIsSessionComplete(true);
    
    // Save result to backend
    saveStudyResult(result);
  };

  const generateRecommendations = (answers: Answer[], session: StudySession): string[] => {
    const recommendations = [];
    
    if (answers.filter(a => a.isCorrect).length < session.questions.length * 0.7) {
      recommendations.push('Focus on practicing more problems in this topic');
    }
    
    const slowQuestions = answers.filter(a => a.timeSpent > 60);
    if (slowQuestions.length > 0) {
      recommendations.push('Work on improving your problem-solving speed');
    }
    
    const weakTopics = identifyWeakAreas(answers, session);
    if (weakTopics.length > 0) {
      recommendations.push(`Review these specific topics: ${weakTopics.join(', ')}`);
    }
    
    return recommendations;
  };

  const identifyWeakAreas = (answers: Answer[], session: StudySession): string[] => {
    const topicPerformance: Record<string, { correct: number; total: number }> = {};
    
    answers.forEach((answer, index) => {
      const question = session.questions[index];
      if (!topicPerformance[question.topic]) {
        topicPerformance[question.topic] = { correct: 0, total: 0 };
      }
      topicPerformance[question.topic].total++;
      if (answer.isCorrect) {
        topicPerformance[question.topic].correct++;
      }
    });
    
    return Object.entries(topicPerformance)
      .filter(([_, stats]) => stats.correct / stats.total < 0.7)
      .map(([topic]) => topic);
  };

  const saveStudyResult = async (result: StudyResult) => {
    try {
      // Save to backend
      const response = await fetch('/api/study/result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userId: user?.userId,
          result
        })
      });
      
      if (response.ok) {
        toast.success('Study session completed! Results saved.');
      }
    } catch (error) {
      console.error('Error saving study result:', error);
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const resetSession = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedAnswer('');
    setIsSessionComplete(false);
    setStudyResult(null);
    setTimeSpent(0);
    setIsPaused(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Session Not Found</h2>
          <p className="text-muted-foreground mb-4">The study session you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/study-zone')}>Back to Study Zone</Button>
        </div>
      </div>
    );
  }

  if (isSessionComplete && studyResult) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">Study Session Complete!</CardTitle>
                <p className="text-muted-foreground">
                  {session.subject}: {session.topic}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Results Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{studyResult.score}%</div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{studyResult.correctAnswers}/{studyResult.totalQuestions}</div>
              <div className="text-sm text-muted-foreground">Correct Answers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{formatTime(studyResult.timeSpent)}</div>
              <div className="text-sm text-muted-foreground">Time Spent</div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TargetIcon className="h-5 w-5" />
              Detailed Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {session.questions.map((question, index) => {
              const answer = studyResult.answers[index];
              return (
                <div key={question.id} className="p-4 border rounded-lg">
                  <div className="flex items-start gap-3 mb-3">
                    {answer.isCorrect ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mt-1" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-red-500 mt-1" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">
                        Question {index + 1}: {question.question}
                      </h4>
                      <div className="space-y-2 mb-3">
                        {question.options.map((option) => (
                          <div
                            key={option}
                            className={`p-2 rounded ${
                              option === answer.selectedAnswer
                                ? answer.isCorrect
                                  ? 'bg-green-100 border-green-300'
                                  : 'bg-red-100 border-red-300'
                                : option === question.correctAnswer
                                ? 'bg-green-100 border-green-300'
                                : 'bg-gray-50'
                            } border`}
                          >
                            {option}
                            {option === question.correctAnswer && (
                              <CheckCircleIcon className="h-4 w-4 text-green-500 inline ml-2" />
                            )}
                            {option === answer.selectedAnswer && !answer.isCorrect && (
                              <XCircleIcon className="h-4 w-4 text-red-500 inline ml-2" />
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <h5 className="font-medium text-blue-800 mb-1">AI Explanation:</h5>
                        <p className="text-sm text-blue-700">{question.explanation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LightbulbIcon className="h-5 w-5 text-yellow-500" />
              AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {studyResult.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                  <LightbulbIcon className="h-4 w-4 text-yellow-600 mt-1" />
                  <p className="text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={resetSession} variant="outline">
            <RotateCcwIcon className="h-4 w-4 mr-2" />
            Retake Session
          </Button>
          <Button onClick={() => navigate('/study-zone')}>
            Back to Study Zone
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = session.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / session.questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BrainIcon className="h-5 w-5 text-blue-600" />
                AI Study Session
              </CardTitle>
              <p className="text-muted-foreground">
                {session.subject}: {session.topic}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-lg font-bold">{formatTime(timeSpent)}</div>
                <div className="text-xs text-muted-foreground">Time</div>
              </div>
              <Button variant="outline" size="sm" onClick={togglePause}>
                {isPaused ? <PlayIcon className="h-4 w-4" /> : <PauseIcon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">
              {currentQuestionIndex + 1} of {session.questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Question */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
            <Badge variant={
              currentQuestion.difficulty === 'easy' ? 'default' :
              currentQuestion.difficulty === 'medium' ? 'secondary' : 'destructive'
            }>
              {currentQuestion.difficulty.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-lg">{currentQuestion.question}</div>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <Button
                key={option}
                variant={selectedAnswer === option ? 'default' : 'outline'}
                className="w-full justify-start h-auto p-4 text-left"
                onClick={() => handleAnswerSelect(option)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm">
                    {selectedAnswer === option ? '✓' : String.fromCharCode(65 + currentQuestion.options.indexOf(option))}
                  </div>
                  <span>{option}</span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          disabled={currentQuestionIndex === 0}
          onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <Button
          disabled={!selectedAnswer}
          onClick={handleNextQuestion}
        >
          {currentQuestionIndex + 1 === session.questions.length ? 'Finish' : 'Next'}
          <ArrowRightIcon className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}









