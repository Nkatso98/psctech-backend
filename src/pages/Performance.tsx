import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUpIcon, 
  TrendingDownIcon,
  BarChart3Icon,
  TargetIcon,
  AwardIcon,
  ClockIcon,
  BookOpenIcon,
  UsersIcon,
  CalendarIcon,
  DownloadIcon,
  FilterIcon,
  EyeIcon,
  EditIcon,
  StarIcon,
  AlertTriangleIcon,
  CheckCircleIcon
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Label } from '@/components/ui/label';
import { consistentDataService } from '@/lib/consistent-data-service';

export default function Performance() {
  const { user, institution } = useAuth();
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [selectedTerm, setSelectedTerm] = useState('Term 1');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadPerformanceData();
  }, [selectedTerm, selectedSubject]);

  const loadPerformanceData = async () => {
    setLoading(true);
    // Simulate API call - replace with actual API
    setTimeout(() => {
      const mockData = generateMockPerformanceData();
      setPerformanceData(mockData);
      setLoading(false);
    }, 500);
  };

  const generateMockPerformanceData = () => {
    const subjects = ['Mathematics', 'English', 'Science', 'History', 'Geography'];
    const terms = ['Term 1', 'Term 2', 'Term 3', 'Term 4'];
    
    const mockData = [];
    for (let i = 1; i <= 20; i++) {
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      const term = terms[Math.floor(Math.random() * terms.length)];
      const mark = consistentDataService.getSubjectPerformance(subject);
      
      mockData.push({
        id: i.toString(),
        subject,
        term,
        mark,
        level: Math.floor(mark / 15) + 1, // Consistent level based on performance
        previousMark: Math.max(0, mark + Math.floor(Math.random() * 20) - 10), // Previous mark with variation
        target: 80,
        improvement: mark - (Math.max(0, mark + Math.floor(Math.random() * 20) - 10)),
        assessmentType: Math.random() > 0.5 ? 'Test' : 'Assignment',
        date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        teacher: `Teacher ${Math.floor(Math.random() * 5) + 1}`,
        comments: getRandomComment(mark),
        strengths: getRandomStrengths(),
        areasForImprovement: getRandomAreasForImprovement()
      });
    }
    return mockData;
  };

  const getRandomComment = (mark: number) => {
    if (mark >= 80) return 'Excellent work! Shows outstanding understanding of concepts.';
    if (mark >= 70) return 'Good performance with room for improvement in complex topics.';
    if (mark >= 60) return 'Satisfactory work, needs more practice with challenging problems.';
    return 'Requires additional support and practice to meet expectations.';
  };

  const getRandomStrengths = () => {
    const strengths = ['Problem-solving skills', 'Conceptual understanding', 'Critical thinking', 'Analytical skills', 'Creativity'];
    return strengths.slice(0, 3); // Consistent 3 strengths
  };

  const getRandomAreasForImprovement = () => {
    const areas = ['Time management', 'Attention to detail', 'Complex problem solving', 'Written communication', 'Research skills'];
    return areas.slice(0, 2); // Consistent 2 areas
  };

  const getLevelColor = (level: number) => {
    if (level >= 7) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (level >= 5) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    if (level >= 4) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const getMarkColor = (mark: number) => {
    if (mark >= 80) return 'text-green-600 dark:text-green-400';
    if (mark >= 70) return 'text-blue-600 dark:text-blue-400';
    if (mark >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getTrendIcon = (improvement: number) => {
    if (improvement > 0) return <TrendingUpIcon className="h-4 w-4 text-green-600" />;
    if (improvement < 0) return <TrendingDownIcon className="h-4 w-4 text-red-600" />;
    return <TargetIcon className="h-4 w-4 text-blue-600" />;
  };

  const exportPerformance = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Subject,Term,Mark,Level,Previous Mark,Improvement,Assessment Type,Date,Teacher\n" +
      performanceData.map(row => `${row.subject},${row.term},${row.mark}%,${row.level},${row.previousMark}%,${row.improvement},${row.assessmentType},${row.date},${row.teacher}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `performance_${selectedTerm}_${selectedSubject}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredData = performanceData.filter(item => {
    if (selectedSubject !== 'All' && item.subject !== selectedSubject) return false;
    return true;
  });

  const averageMark = filteredData.length > 0 
    ? Math.round(filteredData.reduce((sum, item) => sum + item.mark, 0) / filteredData.length)
    : 0;

  const topPerformers = filteredData.filter(item => item.mark >= 80).length;
  const needsSupport = filteredData.filter(item => item.mark < 60).length;

  return (
    <AuthLayout>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Academic Performance</h1>
              <p className="text-muted-foreground">
                Track and analyze academic performance at {institution?.name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={exportPerformance}>
                <DownloadIcon className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Mark</CardTitle>
                <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageMark}%</div>
                <p className="text-xs text-muted-foreground">
                  Across all subjects
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
                <AwardIcon className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{topPerformers}</div>
                <p className="text-xs text-muted-foreground">
                  Students with 80%+
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Needs Support</CardTitle>
                <AlertTriangleIcon className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{needsSupport}</div>
                <p className="text-xs text-muted-foreground">
                  Students below 60%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
                <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredData.length}</div>
                <p className="text-xs text-muted-foreground">
                  This term
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="term">Term</Label>
                  <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Term 1">Term 1</SelectItem>
                      <SelectItem value="Term 2">Term 2</SelectItem>
                      <SelectItem value="Term 3">Term 3</SelectItem>
                      <SelectItem value="Term 4">Term 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="subjects">By Subject</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="details">Detailed View</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {filteredData.slice(0, 10).map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                              <BookOpenIcon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-medium">{item.subject}</h3>
                              <p className="text-sm text-muted-foreground">
                                {item.term} • {item.assessmentType}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <div className={`text-2xl font-bold ${getMarkColor(item.mark)}`}>
                                {item.mark}%
                              </div>
                              <Badge className={getLevelColor(item.level)}>
                                Level {item.level}
                              </Badge>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground">Previous</div>
                              <div className="text-lg font-medium">{item.previousMark}%</div>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground">Target</div>
                              <div className="text-lg font-medium">{item.target}%</div>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground">Progress</div>
                              <Progress value={(item.mark / item.target) * 100} className="w-20 h-2" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subjects" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance by Subject</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {['Mathematics', 'English', 'Science', 'History', 'Geography'].map((subject) => {
                      const subjectData = filteredData.filter(item => item.subject === subject);
                      const avgMark = subjectData.length > 0 
                        ? Math.round(subjectData.reduce((sum, item) => sum + item.mark, 0) / subjectData.length)
                        : 0;
                      
                      return (
                        <Card key={subject} className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <CardTitle className="text-lg">{subject}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="text-center">
                                <div className={`text-3xl font-bold ${getMarkColor(avgMark)}`}>
                                  {avgMark}%
                                </div>
                                <p className="text-sm text-muted-foreground">Average Mark</p>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="text-center">
                                  <div className="font-medium">{subjectData.length}</div>
                                  <div className="text-muted-foreground">Assessments</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium">
                                    {subjectData.filter(item => item.mark >= 80).length}
                                  </div>
                                  <div className="text-muted-foreground">Top Performers</div>
                                </div>
                              </div>
                              
                              <Progress value={(avgMark / 100) * 100} className="h-2" />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredData.slice(0, 15).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            {getTrendIcon(item.improvement)}
                          </div>
                          <div>
                            <h3 className="font-medium">{item.subject}</h3>
                            <p className="text-sm text-muted-foreground">
                              {item.term} • {new Date(item.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Current</div>
                            <div className={`text-lg font-bold ${getMarkColor(item.mark)}`}>
                              {item.mark}%
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Previous</div>
                            <div className="text-lg font-medium">{item.previousMark}%</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Change</div>
                            <div className={`text-lg font-medium ${
                              item.improvement > 0 ? 'text-green-600' : 
                              item.improvement < 0 ? 'text-red-600' : 'text-blue-600'
                            }`}>
                              {item.improvement > 0 ? '+' : ''}{item.improvement}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Performance Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {filteredData.map((item) => (
                      <Card key={item.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">{item.subject}</CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {item.term} • {item.assessmentType} • {new Date(item.date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className={`text-3xl font-bold ${getMarkColor(item.mark)}`}>
                                {item.mark}%
                              </div>
                              <Badge className={getLevelColor(item.level)}>
                                Level {item.level}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-3">
                              <div>
                                <Label className="text-sm font-medium">Teacher Comments</Label>
                                <p className="text-sm text-muted-foreground mt-1">{item.comments}</p>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium">Strengths</Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {item.strengths.map((strength, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {strength}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <div>
                                <Label className="text-sm font-medium">Areas for Improvement</Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {item.areasForImprovement.map((area, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {area}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium">Performance vs Target</Label>
                                <div className="mt-2">
                                  <Progress value={(item.mark / item.target) * 100} className="h-2" />
                                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                    <span>Current: {item.mark}%</span>
                                    <span>Target: {item.target}%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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













