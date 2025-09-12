import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpenIcon, 
  ClockIcon,
  StarIcon,
  PlayIcon,
  DownloadIcon,
  SearchIcon,
  FilterIcon,
  PlusIcon,
  BrainIcon,
  TargetIcon,
  TrendingUpIcon,
  CalendarIcon,
  LightbulbIcon,
  ZapIcon
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { AIStudyAssistant } from '@/components/ai-study/ai-study-assistant';
import { AIStudySession } from '@/components/ai-study/ai-study-session';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function StudyZone() {
  const { user, institution } = useAuth();
  const navigate = useNavigate();
  const [studyMaterials, setStudyMaterials] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ai-assistant');

  // Timetable state
  const [sessions, setSessions] = useState<any[]>([]);
  const [newSession, setNewSession] = useState({
    subject: 'Mathematics',
    topic: 'Algebra',
    dayOfWeek: 2,
    startTime: '13:00',
    durationMinutes: 60,
    reminderMinutesBefore: 10,
  });
  const [runState, setRunState] = useState<{ runId?: string; questions?: any[]; results?: any[] }>({});

  useEffect(() => {
    loadStudyMaterials();
  }, [selectedSubject, selectedType]);

  useEffect(() => {
    if (activeTab === 'timetable' && user) {
      fetchSessions();
    }
  }, [activeTab, user]);

  const apiBase = '/api/study';

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${apiBase}/session/user/${user?.id}`);
      if (res.ok) {
        const json = await res.json();
        setSessions(json.data || []);
      }
    } catch {}
  };

  const createSession = async () => {
    if (!user) return;
    const payload = {
      userId: user.id,
      institutionId: institution?.id ?? '',
      subject: newSession.subject,
      topic: newSession.topic,
      dayOfWeek: Number(newSession.dayOfWeek),
      startTime: newSession.startTime,
      durationMinutes: Number(newSession.durationMinutes),
      reminderMinutesBefore: Number(newSession.reminderMinutesBefore),
    };
    const res = await fetch(`${apiBase}/session`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) {
      await fetchSessions();
      toast.success('Study session created successfully!');
    }
  };

  const startRun = async (sessionId: string) => {
    // Navigate to AI study session
    navigate(`/study-session/${sessionId}`);
  };

  const loadStudyMaterials = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockMaterials = [
        {
          id: '1',
          title: 'Introduction to Algebra',
          subject: 'Mathematics',
          type: 'Video',
          difficulty: 'Beginner',
          duration: 45,
          rating: 4.5,
          views: 1200,
          description: 'Learn the fundamentals of algebraic expressions and equations.',
          progress: 0
        },
        {
          id: '2',
          title: 'Chemical Reactions',
          subject: 'Science',
          type: 'Document',
          difficulty: 'Intermediate',
          duration: 30,
          rating: 4.2,
          views: 800,
          description: 'Understanding chemical reactions and their applications.',
          progress: 60
        },
        {
          id: '3',
          title: 'Essay Writing Techniques',
          subject: 'English',
          type: 'Video',
          difficulty: 'Advanced',
          duration: 60,
          rating: 4.8,
          views: 1500,
          description: 'Master the art of essay writing with proven techniques.',
          progress: 25
        }
      ];
      setStudyMaterials(mockMaterials);
      setLoading(false);
    }, 1000);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Video':
        return <PlayIcon className="h-5 w-5" />;
      case 'Document':
        return <BookOpenIcon className="h-5 w-5" />;
      default:
        return <BookOpenIcon className="h-5 w-5" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredMaterials = studyMaterials.filter(material => {
    const matchesSubject = selectedSubject === 'All' || material.subject === selectedSubject;
    const matchesType = selectedType === 'All' || material.type === selectedType;
    const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesType && matchesSearch;
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <AuthLayout>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Study Zone</h1>
              <p className="text-muted-foreground">
                AI-powered learning resources and study sessions
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => setActiveTab('ai-assistant')}>
                <BrainIcon className="h-4 w-4 mr-2" />
                AI Assistant
              </Button>
              <Button variant="outline" onClick={() => setActiveTab('timetable')}>
                <CalendarIcon className="h-4 w-4 mr-2" />
                Schedule Study
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="ai-assistant" className="flex items-center gap-2">
                <BrainIcon className="h-4 w-4" />
                AI Assistant
              </TabsTrigger>
              <TabsTrigger value="materials">Study Materials</TabsTrigger>
              <TabsTrigger value="timetable">Weekly Planner</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>
            
            {/* AI Assistant Tab */}
            <TabsContent value="ai-assistant" className="space-y-4">
              <AIStudyAssistant />
            </TabsContent>

            {/* Study Materials Tab */}
            <TabsContent value="materials" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Available Study Materials</CardTitle>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search materials..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                      <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Subjects</SelectItem>
                          <SelectItem value="Mathematics">Mathematics</SelectItem>
                          <SelectItem value="Science">Science</SelectItem>
                          <SelectItem value="English">English</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Types</SelectItem>
                          <SelectItem value="Video">Video</SelectItem>
                          <SelectItem value="Document">Document</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : filteredMaterials.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {filteredMaterials.map((material) => (
                        <Card key={material.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                {getTypeIcon(material.type)}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium text-sm leading-tight mb-1">{material.title}</h3>
                                <p className="text-xs text-muted-foreground mb-2">{material.subject}</p>
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className={getDifficultyColor(material.difficulty)}>
                                    {material.difficulty}
                                  </Badge>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <ClockIcon className="h-3 w-3" />
                                    {material.duration}m
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                              {material.description}
                            </p>
                            
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <StarIcon className="h-3 w-3 text-yellow-500" />
                                {material.rating}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {material.views} views
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button size="sm" className="flex-1">
                                {material.type === 'Video' ? (
                                  <>
                                    <PlayIcon className="h-4 w-4 mr-1" />
                                    Watch
                                  </>
                                ) : (
                                  <>
                                    <BookOpenIcon className="h-4 w-4 mr-1" />
                                    Study
                                  </>
                                )}
                              </Button>
                              <Button size="sm" variant="outline">
                                <DownloadIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No study materials found
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Weekly Planner Tab */}
            <TabsContent value="timetable" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Study Planner</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                    <div className="space-y-2">
                      <Label>Subject</Label>
                      <Input value={newSession.subject} onChange={(e)=>setNewSession(s=>({...s,subject:e.target.value}))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Topic</Label>
                      <Input value={newSession.topic} onChange={(e)=>setNewSession(s=>({...s,topic:e.target.value}))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Day</Label>
                      <Select value={String(newSession.dayOfWeek)} onValueChange={(v)=>setNewSession(s=>({...s,dayOfWeek:Number(v)}))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {dayNames.map((d,i)=>(<SelectItem key={i} value={String(i)}>{d}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Start</Label>
                      <Input value={newSession.startTime} onChange={(e)=>setNewSession(s=>({...s,startTime:e.target.value}))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Duration (min)</Label>
                      <Input type="number" value={newSession.durationMinutes} onChange={(e)=>setNewSession(s=>({...s,durationMinutes:Number(e.target.value)}))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Reminder (min before)</Label>
                      <Input type="number" value={newSession.reminderMinutesBefore} onChange={(e)=>setNewSession(s=>({...s,reminderMinutesBefore:Number(e.target.value)}))} />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={createSession}>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Session
                    </Button>
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {dayNames.map((d,i)=> (
                      <div key={i} className="border rounded p-2">
                        <div className="font-semibold mb-2">{d}</div>
                        <div className="space-y-2">
                          {sessions.filter(s=>s.dayOfWeek===i).map(s=> (
                            <div key={s.id} className="p-2 rounded bg-primary/5 flex items-center justify-between">
                              <div>
                                <div className="font-medium text-sm">{s.subject}</div>
                                <div className="text-xs text-muted-foreground">{s.topic} • {s.startTime} • {s.durationMinutes}m</div>
                              </div>
                              <Button size="sm" onClick={()=>startRun(s.id)}>
                                <PlayIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Progress Tab */}
            <TabsContent value="progress" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Learning Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {studyMaterials.filter(m => m.progress > 0).map((material) => (
                      <div key={material.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          {getTypeIcon(material.type)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{material.title}</h3>
                          <p className="text-sm text-muted-foreground">{material.subject}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">{material.progress}%</div>
                          <Progress value={material.progress} className="w-24 h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Favorites Tab */}
            <TabsContent value="favorites" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Favorite Materials</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    No favorite materials yet. Star materials to add them here.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </AuthLayout>
  );
}











