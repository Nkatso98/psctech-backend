import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BrainIcon, 
  ClockIcon, 
  TargetIcon, 
  TrendingUpIcon, 
  AlertCircleIcon,
  CheckCircleIcon,
  LightbulbIcon,
  CalendarIcon,
  BookOpenIcon,
  ZapIcon,
  StarIcon,
  MessageSquareIcon
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

interface StudySession {
  id: string;
  subject: string;
  topic: string;
  dayOfWeek: number;
  startTime: string;
  durationMinutes: number;
  reminderMinutesBefore: number;
  isActive: boolean;
  performance?: number;
  lastStudied?: string;
}

interface AIRecommendation {
  id: string;
  type: 'schedule' | 'material' | 'reminder' | 'insight';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action?: () => void;
  timestamp: Date;
}

interface PerformanceInsight {
  subject: string;
  strength: number;
  weakness: number;
  recommendation: string;
  trend: 'improving' | 'declining' | 'stable';
}

export function AIStudyAssistant() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [performanceInsights, setPerformanceInsights] = useState<PerformanceInsight[]>([]);
  const [showNotifications, setShowNotifications] = useState(true);
  const [loading, setLoading] = useState(false);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    if (user?.userId) {
      loadStudyData();
      generateAIRecommendations();
      checkStudyReminders();
    }
  }, [user?.userId]);

  const loadStudyData = async () => {
    try {
      setLoading(true);
      // Load study sessions from API
      const response = await fetch(`/api/study/session/user/${user?.userId}`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data.data || []);
      }
      
      // Generate performance insights
      generatePerformanceInsights();
    } catch (error) {
      console.error('Error loading study data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIRecommendations = () => {
    const newRecommendations: AIRecommendation[] = [];

    // Smart scheduling recommendations
    const currentHour = new Date().getHours();
    if (currentHour >= 8 && currentHour <= 10) {
      newRecommendations.push({
        id: '1',
        type: 'schedule',
        title: 'Optimal Study Time',
        description: 'Your brain is most active in the morning. Consider scheduling difficult subjects like Mathematics now.',
        priority: 'high',
        action: () => suggestOptimalSchedule(),
        timestamp: new Date()
      });
    }

    // Study material recommendations
    if (sessions.length > 0) {
      const weakSubjects = getWeakSubjects();
      if (weakSubjects.length > 0) {
        newRecommendations.push({
          id: '2',
          type: 'material',
          title: 'Focus on Weak Areas',
          description: `Consider spending more time on: ${weakSubjects.join(', ')}`,
          priority: 'medium',
          action: () => suggestStudyMaterials(weakSubjects),
          timestamp: new Date()
        });
      }
    }

    // Progress alerts
    const completedSessions = sessions.filter(s => s.performance && s.performance > 0);
    if (completedSessions.length >= 5) {
      newRecommendations.push({
        id: '3',
        type: 'insight',
        title: 'Study Pattern Analysis',
        description: 'You\'ve completed 5+ study sessions. Let\'s analyze your performance patterns.',
        priority: 'medium',
        action: () => analyzeStudyPatterns(),
        timestamp: new Date()
      });
    }

    setRecommendations(newRecommendations);
  };

  const checkStudyReminders = () => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5);

    sessions.forEach(session => {
      if (session.dayOfWeek === currentDay && session.isActive) {
        const sessionTime = new Date(`2000-01-01T${session.startTime}`);
        const reminderTime = new Date(sessionTime.getTime() - session.reminderMinutesBefore * 60000);
        const currentTimeObj = new Date(`2000-01-01T${currentTime}`);

        if (Math.abs(currentTimeObj.getTime() - reminderTime.getTime()) < 60000) { // Within 1 minute
          showStudyReminder(session);
        }
      }
    });
  };

  const showStudyReminder = (session: StudySession) => {
    toast.success(
      <div className="space-y-2">
        <div className="font-semibold">Study Session Reminder</div>
        <div>{session.subject}: {session.topic}</div>
        <div className="text-sm text-muted-foreground">
          Starting in {session.reminderMinutesBefore} minutes
        </div>
        <Button size="sm" onClick={() => startStudySession(session)}>
          Start Now
        </Button>
      </div>,
      {
        duration: 10000,
        action: {
          label: 'Dismiss',
          onClick: () => {}
        }
      }
    );
  };

  const suggestOptimalSchedule = () => {
    const recommendations = [
      'Schedule Mathematics for 8:00 AM - your analytical skills peak in the morning',
      'Plan Science sessions for 2:00 PM - when your creativity is highest',
      'Reserve evening time for review and practice questions',
      'Take 15-minute breaks between subjects for better retention'
    ];

    toast.info(
      <div className="space-y-2">
        <div className="font-semibold">AI Study Schedule Recommendations</div>
        {recommendations.map((rec, index) => (
          <div key={index} className="text-sm">• {rec}</div>
        ))}
      </div>,
      { duration: 8000 }
    );
  };

  const suggestStudyMaterials = (subjects: string[]) => {
    const materials = {
      'Mathematics': ['Khan Academy videos', 'Practice worksheets', 'Online quizzes'],
      'Science': ['Interactive simulations', 'Lab videos', 'Concept maps'],
      'English': ['Reading comprehension exercises', 'Grammar practice', 'Essay writing tips']
    };

    toast.info(
      <div className="space-y-2">
        <div className="font-semibold">Recommended Study Materials</div>
        {subjects.map(subject => (
          <div key={subject} className="text-sm">
            <strong>{subject}:</strong> {materials[subject as keyof typeof materials]?.join(', ')}
          </div>
        ))}
      </div>,
      { duration: 8000 }
    );
  };

  const analyzeStudyPatterns = () => {
    const insights = [
      'You perform best in Mathematics during morning sessions',
      'Science scores improve with longer study durations',
      'Taking breaks every 45 minutes boosts your retention',
      'Your weakest area is English comprehension - focus on reading practice'
    ];

    toast.info(
      <div className="space-y-2">
        <div className="font-semibold">Study Pattern Analysis</div>
        {insights.map((insight, index) => (
          <div key={index} className="text-sm">• {insight}</div>
        ))}
      </div>,
      { duration: 10000 }
    );
  };

  const getWeakSubjects = (): string[] => {
    const subjectPerformance = sessions
      .filter(s => s.performance)
      .reduce((acc, session) => {
        if (!acc[session.subject]) {
          acc[session.subject] = [];
        }
        acc[session.subject].push(session.performance!);
        return acc;
      }, {} as Record<string, number[]>);

    return Object.entries(subjectPerformance)
      .filter(([_, scores]) => scores.reduce((a, b) => a + b, 0) / scores.length < 70)
      .map(([subject]) => subject);
  };

  const generatePerformanceInsights = () => {
    const insights: PerformanceInsight[] = [
      {
        subject: 'Mathematics',
        strength: 85,
        weakness: 15,
        recommendation: 'Focus on algebra and geometry concepts',
        trend: 'improving'
      },
      {
        subject: 'Science',
        strength: 72,
        weakness: 28,
        recommendation: 'Practice more lab-based questions',
        trend: 'stable'
      },
      {
        subject: 'English',
        strength: 65,
        weakness: 35,
        recommendation: 'Improve reading comprehension skills',
        trend: 'declining'
      }
    ];
    setPerformanceInsights(insights);
  };

  const startStudySession = (session: StudySession) => {
    // Navigate to study session with AI questions
    window.location.href = `/study-session/${session.id}`;
  };

  const dismissRecommendation = (id: string) => {
    setRecommendations(prev => prev.filter(rec => rec.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* AI Assistant Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-100">
              <BrainIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl">AI Study Assistant</CardTitle>
              <p className="text-sm text-muted-foreground">
                Your personalized learning companion
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <LightbulbIcon className="h-5 w-5 text-yellow-500" />
                AI Recommendations
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                {showNotifications ? 'Hide' : 'Show'}
              </Button>
            </div>
          </CardHeader>
          {showNotifications && (
            <CardContent className="space-y-3">
              {recommendations.map((recommendation) => (
                <div
                  key={recommendation.id}
                  className={`p-4 rounded-lg border ${
                    recommendation.priority === 'high' 
                      ? 'border-red-200 bg-red-50' 
                      : recommendation.priority === 'medium'
                      ? 'border-yellow-200 bg-yellow-50'
                      : 'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={
                          recommendation.priority === 'high' ? 'destructive' :
                          recommendation.priority === 'medium' ? 'secondary' : 'default'
                        }>
                          {recommendation.priority.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {recommendation.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <h4 className="font-medium mb-1">{recommendation.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {recommendation.description}
                      </p>
                      {recommendation.action && (
                        <Button size="sm" onClick={recommendation.action}>
                          Take Action
                        </Button>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissRecommendation(recommendation.id)}
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUpIcon className="h-5 w-5 text-green-500" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceInsights.map((insight) => (
              <div key={insight.subject} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{insight.subject}</h4>
                  <Badge variant={
                    insight.trend === 'improving' ? 'default' :
                    insight.trend === 'declining' ? 'destructive' : 'secondary'
                  }>
                    {insight.trend}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Strength</span>
                    <span>{insight.strength}%</span>
                  </div>
                  <Progress value={insight.strength} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span>Areas for Improvement</span>
                    <span>{insight.weakness}%</span>
                  </div>
                  <Progress value={insight.weakness} className="h-2 bg-red-100" />
                  <p className="text-sm text-muted-foreground mt-2">
                    <strong>Recommendation:</strong> {insight.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ZapIcon className="h-5 w-5 text-orange-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <CalendarIcon className="h-5 w-5" />
              <span className="text-sm">Schedule Study</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <BookOpenIcon className="h-5 w-5" />
              <span className="text-sm">Practice Test</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <TargetIcon className="h-5 w-5" />
              <span className="text-sm">Set Goals</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <MessageSquareIcon className="h-5 w-5" />
              <span className="text-sm">Ask AI</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}









