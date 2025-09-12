import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrophyIcon, 
  TrendingUpIcon, 
  UsersIcon, 
  StarIcon,
  AwardIcon,
  TargetIcon,
  BarChart3Icon
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface PerformanceRankingsProps {}

interface SchoolPerformance {
  institutionId: number;
  institutionName: string;
  institutionLogo: string;
  subject: string;
  grade: string;
  totalLearners: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  excellentCount: number;
  goodCount: number;
  satisfactoryCount: number;
  needsImprovementCount: number;
  rank: number;
}

export function PerformanceRankings({}: PerformanceRankingsProps) {
  const { user } = useAuth();
  const [rankings, setRankings] = useState<SchoolPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('month');
  const [activeTab, setActiveTab] = useState('overall');

  const availableSubjects = [
    'Mathematics', 'Physical Sciences', 'Life Sciences', 'English', 
    'Afrikaans', 'History', 'Geography', 'Economics', 'Accounting',
    'Business Studies', 'Computer Applications Technology', 'Information Technology'
  ];

  const availableGrades = ['8', '9', '10', '11', '12'];
  const timeRanges = [
    { value: 'month', label: 'Last Month' },
    { value: 'quarter', label: 'Last Quarter' },
    { value: 'year', label: 'Last Year' }
  ];

  useEffect(() => {
    fetchPerformanceRankings();
  }, [selectedSubject, selectedGrade, selectedTimeRange]);

  const fetchPerformanceRankings = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        timeRange: selectedTimeRange,
        ...(selectedSubject !== 'all' && { subject: selectedSubject }),
        ...(selectedGrade !== 'all' && { grade: selectedGrade })
      });

      const response = await fetch(`/api/competitions/performance/rankings?${params}`, {
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRankings(data);
      } else {
        console.error('Failed to fetch performance rankings');
      }
    } catch (error) {
      console.error('Error fetching performance rankings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPerformanceBadge = (averageScore: number) => {
    if (averageScore >= 90) return <Badge variant="default" className="bg-green-600">Excellent</Badge>;
    if (averageScore >= 80) return <Badge variant="default" className="bg-blue-600">Good</Badge>;
    if (averageScore >= 70) return <Badge variant="secondary">Satisfactory</Badge>;
    if (averageScore >= 60) return <Badge variant="outline">Needs Improvement</Badge>;
    return <Badge variant="destructive">Poor</Badge>;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <TrophyIcon className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <AwardIcon className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <StarIcon className="h-5 w-5 text-orange-500" />;
    return <TargetIcon className="h-4 w-4 text-muted-foreground" />;
  };

  const calculateOverallRanking = () => {
    const schoolMap = new Map<number, { name: string; logo: string; totalScore: number; totalSchools: number }>();
    
    rankings.forEach(ranking => {
      if (!schoolMap.has(ranking.institutionId)) {
        schoolMap.set(ranking.institutionId, {
          name: ranking.institutionName,
          logo: ranking.institutionLogo,
          totalScore: 0,
          totalSchools: 0
        });
      }
      
      const school = schoolMap.get(ranking.institutionId)!;
      school.totalScore += ranking.averageScore;
      school.totalSchools += 1;
    });

    return Array.from(schoolMap.entries())
      .map(([id, school]) => ({
        institutionId: id,
        institutionName: school.name,
        institutionLogo: school.logo,
        averageScore: school.totalScore / school.totalSchools,
        totalSubjects: school.totalSchools
      }))
      .sort((a, b) => b.averageScore - a.averageScore)
      .map((school, index) => ({ ...school, rank: index + 1 }));
  };

  const overallRankings = calculateOverallRanking();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading performance data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3Icon className="h-5 w-5" />
            Performance Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {availableSubjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Grade</label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="All Grades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {availableGrades.map(grade => (
                    <SelectItem key={grade} value={grade}>Grade {grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Time Range</label>
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeRanges.map(range => (
                    <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <Button 
                variant="outline" 
                onClick={fetchPerformanceRankings}
                className="w-full"
              >
                Refresh Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rankings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overall">Overall Rankings</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Rankings</TabsTrigger>
        </TabsList>

        <TabsContent value="overall" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrophyIcon className="h-5 w-5" />
                Overall School Performance
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Combined performance across all subjects and grades
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overallRankings.map((school) => (
                  <div key={school.institutionId} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      {getRankIcon(school.rank)}
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        {school.institutionLogo ? (
                          <img 
                            src={school.institutionLogo} 
                            alt={school.institutionName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-semibold">
                            {school.institutionName.charAt(0)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold">{school.institutionName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {school.totalSubjects} subject{school.totalSubjects !== 1 ? 's' : ''} • 
                        Average Score: {school.averageScore.toFixed(1)}%
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">#{school.rank}</div>
                      {getPerformanceBadge(school.averageScore)}
                    </div>
                  </div>
                ))}

                {overallRankings.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No performance data available for the selected criteria.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3Icon className="h-5 w-5" />
                Detailed Subject Rankings
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Performance breakdown by subject and grade
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rankings.map((ranking) => (
                  <div key={`${ranking.institutionId}-${ranking.subject}-${ranking.grade}`} 
                       className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      {getRankIcon(ranking.rank)}
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        {ranking.institutionLogo ? (
                          <img 
                            src={ranking.institutionLogo} 
                            alt={ranking.institutionName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-semibold">
                            {ranking.institutionName.charAt(0)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold">{ranking.institutionName}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{ranking.subject}</span>
                        <span>•</span>
                        <span>Grade {ranking.grade}</span>
                        <span>•</span>
                        <span>{ranking.totalLearners} learners</span>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="text-2xl font-bold text-primary">#{ranking.rank}</div>
                      <div className="text-sm font-medium">{ranking.averageScore.toFixed(1)}%</div>
                      {getPerformanceBadge(ranking.averageScore)}
                    </div>

                    <div className="text-left text-sm space-y-1">
                      <div className="flex items-center gap-1">
                        <StarIcon className="h-3 w-3 text-green-600" />
                        <span>{ranking.excellentCount} Excellent</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUpIcon className="h-3 w-3 text-blue-600" />
                        <span>{ranking.goodCount} Good</span>
                      </div>
                    </div>
                  </div>
                ))}

                {rankings.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No detailed performance data available for the selected criteria.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Performance Insights */}
      {rankings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUpIcon className="h-5 w-5" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {rankings.filter(r => r.averageScore >= 80).length}
                </div>
                <div className="text-sm text-muted-foreground">High Performing Schools</div>
                <div className="text-xs text-muted-foreground">(80%+ Average)</div>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {rankings.filter(r => r.averageScore >= 70 && r.averageScore < 80).length}
                </div>
                <div className="text-sm text-muted-foreground">Good Performing Schools</div>
                <div className="text-xs text-muted-foreground">(70-79% Average)</div>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {rankings.filter(r => r.averageScore < 70).length}
                </div>
                <div className="text-sm text-muted-foreground">Needs Improvement</div>
                <div className="text-xs text-muted-foreground">(&lt;70% Average)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


