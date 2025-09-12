import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  BookOpen, 
  Calendar,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { performanceAnalysisService, PerformanceMetrics, PerformanceData, AttendanceData } from '@/lib/performance-analysis-service';

// Using interfaces from the service

interface PerformanceAnalysisProps {
  userType: 'principal' | 'teacher' | 'learner' | 'parent';
  userId?: string;
  classId?: string;
}

export const PerformanceAnalysisDashboard: React.FC<PerformanceAnalysisProps> = ({
  userType,
  userId,
  classId
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPerformanceData();
  }, [selectedPeriod, selectedSubject]);

  const loadPerformanceData = async () => {
    setLoading(true);
    try {
      const metrics = await performanceAnalysisService.analyzePerformance(userType, userId, classId);
      setPerformanceMetrics(metrics);
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
    }
  };



  const getTopPerformingClasses = () => {
    if (!performanceMetrics) return [];
    return performanceMetrics.topPerformingClasses;
  };

  const getBestSubjectPerformance = () => {
    if (!performanceMetrics) return [];
    return performanceMetrics.subjectPerformanceRankings;
  };

  const getAttendanceRankings = () => {
    if (!performanceMetrics) return [];
    return performanceMetrics.bestAttendanceClasses;
  };

  const getClassesWithMostAbsentLearners = () => {
    if (!performanceMetrics) return [];
    return performanceMetrics.classesWithMostAbsentLearners;
  };

  const getOverallSchoolPerformance = () => {
    if (!performanceMetrics) return null;
    return performanceMetrics.overallSchoolPerformance;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!performanceMetrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No performance data available</p>
          <Button onClick={loadPerformanceData} variant="outline">
            Refresh Data
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Performance Analysis</h2>
          <p className="text-muted-foreground">
            AI-powered insights from assignments and teacher feedback
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              <SelectItem value="mathematics">Mathematics</SelectItem>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="science">Science</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Class</CardTitle>
                <Award className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getTopPerformingClasses()[0]?.className || 'N/A'}</div>
                <p className="text-xs text-muted-foreground">
                  Score: {getTopPerformingClasses()[0]?.averageScore.toFixed(1) || 'N/A'}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Best Attendance</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getAttendanceRankings()[0]?.className || 'N/A'}</div>
                <p className="text-xs text-muted-foreground">
                  {getAttendanceRankings()[0]?.attendanceRate.toFixed(1) || 'N/A'}% present
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Most Assignments</CardTitle>
                <BookOpen className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {getOverallSchoolPerformance()?.totalAssignments || 0}
                </div>
                <p className="text-xs text-muted-foreground">Total assignments completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Feedback</CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {getBestSubjectPerformance().length}
                </div>
                <p className="text-xs text-muted-foreground">AI assessments provided</p>
              </CardContent>
            </Card>
          </div>

          {/* Overall School Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Overall School Performance</CardTitle>
              <CardDescription>Summary of key metrics across all classes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {getOverallSchoolPerformance()?.averageScore.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Average Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {getOverallSchoolPerformance()?.totalAssignments}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Assignments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {getOverallSchoolPerformance()?.averageAttendanceRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Attendance</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {getOverallSchoolPerformance()?.totalClasses}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Classes</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Classes</CardTitle>
                <CardDescription>Based on AI assignment scores and teacher feedback</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {getTopPerformingClasses().map((classData, index) => (
                  <div key={classData.classId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant={index === 0 ? "default" : "secondary"}>
                        #{index + 1}
                      </Badge>
                      <span className="font-medium">{classData.className}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{classData.averageScore.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">
                        {classData.totalAssignments} assignments
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attendance Leaders</CardTitle>
                <CardDescription>Classes with highest attendance rates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {getAttendanceRankings().map((classData, index) => (
                  <div key={classData.classId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant={index === 0 ? "default" : "secondary"}>
                        #{index + 1}
                      </Badge>
                      <span className="font-medium">{classData.className}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{classData.attendanceRate.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">
                        {classData.presentCount}/{classData.totalLearners} present
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Class Performance Rankings</CardTitle>
              <CardDescription>
                Comprehensive analysis combining AI assignment scores, completion rates, and teacher ratings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getTopPerformingClasses().map((classData, index) => (
                  <div key={classData.classId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant={index === 0 ? "default" : "secondary"}>
                          #{index + 1}
                        </Badge>
                        <h3 className="text-lg font-semibold">{classData.className}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {classData.averageScore.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Average Score</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Completion Rate</div>
                        <div className="text-lg font-semibold">{classData.completionRate.toFixed(1)}%</div>
                        <Progress value={classData.completionRate} className="mt-2" />
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Attendance Rate</div>
                        <div className="text-lg font-semibold">{classData.attendanceRate.toFixed(1)}%</div>
                        <Progress value={classData.attendanceRate} className="mt-2" />
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Teacher Rating</div>
                        <div className="text-lg font-semibold">{classData.teacherRating}/5</div>
                        <div className="flex justify-center mt-2">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-3 h-3 rounded-full mx-0.5 ${
                                i < Math.floor(classData.teacherRating)
                                  ? 'bg-yellow-400'
                                  : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Assignments</div>
                        <div className="text-lg font-semibold">{classData.totalAssignments}</div>
                        <div className="text-xs text-muted-foreground">Completed</div>
                      </div>
                    </div>

                    {/* Subject Performance */}
                    <div className="border-t pt-3">
                      <h4 className="font-medium mb-2">Subject Performance</h4>
                      <div className="space-y-2">
                        {classData.subjectPerformance.map(subject => (
                          <div key={subject.subjectId} className="flex items-center justify-between p-2 bg-muted rounded">
                            <span className="font-medium">{subject.subjectName}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-sm">{subject.averageScore.toFixed(1)}%</span>
                              <span className="text-xs text-muted-foreground">
                                {subject.totalAssignments} assignments
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Best Attendance Classes</CardTitle>
                <CardDescription>Classes with highest attendance rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getAttendanceRankings().map((classData, index) => (
                    <div key={classData.classId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant={index === 0 ? "default" : "secondary"}>
                          #{index + 1}
                        </Badge>
                        <span className="font-medium">{classData.className}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          {classData.attendanceRate.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {classData.presentCount}/{classData.totalLearners}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Classes with Most Absent Learners</CardTitle>
                <CardDescription>Classes needing attendance improvement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getClassesWithMostAbsentLearners().map((classData, index) => (
                      <div key={classData.classId} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="destructive">#{index + 1}</Badge>
                          <span className="font-medium">{classData.className}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-red-600">
                            {classData.absentCount} absent
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {((classData.absentCount / classData.totalLearners) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Attendance Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Attendance Analysis</CardTitle>
              <CardDescription>Comprehensive breakdown by class</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getAttendanceRankings().map(classData => (
                  <div key={classData.classId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold">{classData.className}</h3>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {classData.attendanceRate.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Attendance Rate</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{classData.presentCount}</div>
                        <div className="text-sm text-muted-foreground">Present</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{classData.absentCount}</div>
                        <div className="text-sm text-muted-foreground">Absent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{classData.lateCount}</div>
                        <div className="text-sm text-muted-foreground">Late</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{classData.totalLearners}</div>
                        <div className="text-sm text-muted-foreground">Total</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2 text-green-600">Most Present Learners</h4>
                        <div className="space-y-1">
                          {classData.mostPresentLearners.slice(0, 3).map((learner, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm">{learner}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 text-red-600">Most Absent Learners</h4>
                        <div className="space-y-1">
                          {classData.mostAbsentLearners.slice(0, 3).map((learner, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                              <span className="text-sm">{learner}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subjects Tab */}
        <TabsContent value="subjects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subject Performance Analysis</CardTitle>
              <CardDescription>
                Best performing classes per subject based on AI assignments and teacher feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {getBestSubjectPerformance().map(subject => (
                  <div key={subject.subjectName} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold">{subject.subjectName}</h3>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary">
                          {subject.averageScore.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Average Score</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{subject.classes}</div>
                        <div className="text-sm text-muted-foreground">Classes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{subject.totalAssignments}</div>
                        <div className="text-sm text-muted-foreground">Total Assignments</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {(subject.totalAssignments / subject.classes).toFixed(1)}
                        </div>
                        <div className="text-sm text-muted-foreground">Avg per Class</div>
                      </div>
                    </div>

                    {/* Top Classes in this Subject */}
                    <div>
                      <h4 className="font-medium mb-3">Top Performing Classes</h4>
                      <div className="space-y-2">
                        {getTopPerformingClasses()
                          .filter(classData => 
                            classData.subjectPerformance.some(sp => sp.subjectName === subject.subjectName)
                          )
                          .sort((a, b) => {
                            const aScore = a.subjectPerformance.find(sp => sp.subjectName === subject.subjectName)?.averageScore || 0;
                            const bScore = b.subjectPerformance.find(sp => sp.subjectName === subject.subjectName)?.averageScore || 0;
                            return bScore - aScore;
                          })
                          .slice(0, 3)
                          .map((classData, index) => {
                            const subjectData = classData.subjectPerformance.find(sp => sp.subjectName === subject.subjectName);
                            if (!subjectData) return null;
                            
                            return (
                              <div key={classData.classId} className="flex items-center justify-between p-2 bg-muted rounded">
                                <div className="flex items-center gap-3">
                                  <Badge variant={index === 0 ? "default" : "secondary"}>
                                    #{index + 1}
                                  </Badge>
                                  <span className="font-medium">{classData.className}</span>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold">{subjectData.averageScore.toFixed(1)}%</div>
                                  <div className="text-xs text-muted-foreground">
                                    {subjectData.totalAssignments} assignments
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};


