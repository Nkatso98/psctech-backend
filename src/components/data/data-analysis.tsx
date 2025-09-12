import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileDown, BarChart3, PieChart, LineChart, Users, BookOpen, School } from 'lucide-react';
import { PDFGenerator } from '@/components/pdf/pdf-generator';
import { PDFReportGenerator } from '@/components/pdf/pdf-report-generator';
import { useStore } from '@/hooks/use-store';

// Type definitions for analysis data
interface ClassAttendance {
  className: string;
  averageAttendance: number;
  studentCount: number;
  dates: Record<string, number>; // date -> attendance count
}

interface SubjectPerformance {
  subjectName: string;
  averageScore: number;
  classBreakdown: Record<string, number>; // className -> average score
}

export function DataAnalysis() {
  const { teachers, students, schoolData } = useStore();
  const [selectedPeriod, setSelectedPeriod] = useState('term1');
  const [selectedClass, setSelectedClass] = useState('all');
  const [attendanceData, setAttendanceData] = useState<ClassAttendance[]>([]);
  const [performanceData, setPerformanceData] = useState<SubjectPerformance[]>([]);
  const [pdfPreparingAttendance, setPdfPreparingAttendance] = useState(false);
  const [pdfPreparingPerformance, setPdfPreparingPerformance] = useState(false);

  // Extract unique class names
  const classNames = [...new Set(students?.map(student => student.class) || [])];
  
  // Periods for selection
  const periods = [
    { value: 'term1', label: 'Term 1 (Jan-Mar)' },
    { value: 'term2', label: 'Term 2 (Apr-Jun)' },
    { value: 'term3', label: 'Term 3 (Jul-Sep)' },
    { value: 'term4', label: 'Term 4 (Oct-Dec)' },
  ];

  // Generate sample data for reports
  useEffect(() => {
    if (!teachers || !students) return;

    // Generate attendance data
    const attendanceByClass: Record<string, ClassAttendance> = {};
    
    // Initialize data structure
    classNames.forEach(className => {
      attendanceByClass[className] = {
        className,
        averageAttendance: 0,
        studentCount: 0,
        dates: {},
      };
    });

    // Simulate attendance data for the past 30 days
    const today = new Date();
    const daysToSimulate = 30;
    
    students.forEach(student => {
      if (!attendanceByClass[student.class]) {
        attendanceByClass[student.class] = {
          className: student.class,
          averageAttendance: 0,
          studentCount: 0,
          dates: {},
        };
      }
      
      attendanceByClass[student.class].studentCount++;
      
      // Generate random attendance for each student
      let studentAttendanceDays = 0;
      
      for (let i = 0; i < daysToSimulate; i++) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        if (!attendanceByClass[student.class].dates[dateString]) {
          attendanceByClass[student.class].dates[dateString] = 0;
        }
        
        // 90% chance of attendance
        if (Math.random() < 0.9) {
          attendanceByClass[student.class].dates[dateString]++;
          studentAttendanceDays++;
        }
      }
    });
    
    // Calculate average attendance per class
    Object.values(attendanceByClass).forEach(classData => {
      if (classData.studentCount > 0) {
        // Calculate average from the dates
        const totalDays = Object.keys(classData.dates).length;
        const totalPresent = Object.values(classData.dates).reduce((sum, present) => sum + present, 0);
        const maxPossible = totalDays * classData.studentCount;
        classData.averageAttendance = (totalPresent / maxPossible) * 100;
      }
    });

    // Generate subject performance data
    const subjects = ['Mathematics', 'English', 'Science', 'History', 'Geography', 'Art', 'Physical Education'];
    const subjectPerformance: Record<string, SubjectPerformance> = {};
    
    subjects.forEach(subject => {
      subjectPerformance[subject] = {
        subjectName: subject,
        averageScore: 0,
        classBreakdown: {},
      };
      
      // Initialize class breakdown
      classNames.forEach(className => {
        subjectPerformance[subject].classBreakdown[className] = 0;
      });
    });
    
    // Simulate student performance and generate subject/class scores
    students.forEach(student => {
      // Generate random scores for each subject
      subjects.forEach(subject => {
        const score = Math.floor(40 + Math.random() * 60); // Range 40-100
        
        // Add to subject average
        if (!subjectPerformance[subject].classBreakdown[student.class]) {
          subjectPerformance[subject].classBreakdown[student.class] = 0;
        }
        
        // Accumulate to subject class breakdown for averaging later
        subjectPerformance[subject].classBreakdown[student.class] += score;
      });
    });
    
    // Calculate average scores for subjects
    Object.values(subjectPerformance).forEach(subject => {
      let totalStudentsInSubject = 0;
      let totalScoreInSubject = 0;
      
      Object.entries(subject.classBreakdown).forEach(([className, totalScore]) => {
        const studentsInClass = students.filter(s => s.class === className).length;
        if (studentsInClass > 0) {
          subject.classBreakdown[className] = totalScore / studentsInClass;
          totalStudentsInSubject += studentsInClass;
          totalScoreInSubject += totalScore;
        }
      });
      
      if (totalStudentsInSubject > 0) {
        subject.averageScore = totalScoreInSubject / totalStudentsInSubject;
      }
    });
    
    // Update state with generated data
    setAttendanceData(Object.values(attendanceByClass));
    setPerformanceData(Object.values(subjectPerformance));
    
  }, [students, teachers, selectedPeriod, selectedClass, classNames]);

  // Export attendance report to PDF
  const exportAttendancePDF = async () => {
    setPdfPreparingAttendance(true);
    
    try {
      // Create and download PDF
      await PDFReportGenerator.generateAttendanceReport(
        schoolData?.name || "School Name",
        attendanceData,
        periods.find(p => p.value === selectedPeriod)?.label || 'All Periods',
        students?.length || 0,
        classNames
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setPdfPreparingAttendance(false);
    }
  };
  
  // Export performance report to PDF
  const exportPerformancePDF = async () => {
    setPdfPreparingPerformance(true);
    
    try {
      // Create and download PDF
      await PDFReportGenerator.generatePerformanceReport(
        schoolData?.name || "School Name",
        performanceData,
        periods.find(p => p.value === selectedPeriod)?.label || 'All Periods',
        classNames,
        students || []
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setPdfPreparingPerformance(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">School Data Analysis</h2>
          <p className="text-muted-foreground">
            Comprehensive analytics on attendance and performance
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {periods.map((period) => (
                <SelectItem key={period.value} value={period.value}>{period.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classNames.map((className) => (
                <SelectItem key={className} value={className}>{className}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="attendance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Attendance Analysis</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Performance Analysis</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-4">
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={exportAttendancePDF}
              disabled={pdfPreparingAttendance}
            >
              <FileDown className="h-4 w-4" />
              <span>{pdfPreparingAttendance ? "Generating PDF..." : "Export Report"}</span>
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School className="h-4 w-4" />
                  <span>Overall Attendance</span>
                </CardTitle>
                <CardDescription>School-wide attendance average</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {attendanceData.length 
                    ? (attendanceData.reduce((sum, cls) => sum + cls.averageAttendance, 0) / attendanceData.length).toFixed(2) 
                    : 0}%
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Based on {students?.length || 0} students across {classNames.length} classes
                </div>
                <div className="h-4 w-full bg-muted rounded-full mt-4 overflow-hidden">
                  <div 
                    className="h-full bg-primary" 
                    style={{ 
                      width: `${attendanceData.length 
                        ? (attendanceData.reduce((sum, cls) => sum + cls.averageAttendance, 0) / attendanceData.length) 
                        : 0}%` 
                    }}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-4 w-4" />
                  <span>Attendance Trend</span>
                </CardTitle>
                <CardDescription>Last 7 days trend</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[150px] flex items-end justify-between gap-1">
                  {/* Simple bar chart visualization */}
                  {[...Array(7)].map((_, i) => {
                    const height = 70 + Math.random() * 30;
                    return (
                      <div key={i} className="flex flex-col items-center gap-1 flex-1">
                        <div 
                          className="w-full bg-primary rounded-t-sm" 
                          style={{ height: `${height}px` }}
                        />
                        <span className="text-xs text-muted-foreground">{i+1}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="text-xs text-center mt-2 text-muted-foreground">
                  Days ago
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  <span>Attendance by Class</span>
                </CardTitle>
                <CardDescription>Comparison across classes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {attendanceData.map(cls => (
                    <div key={cls.className} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{cls.className}</span>
                        <span className="font-medium">{cls.averageAttendance.toFixed(2)}%</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            cls.averageAttendance > 90 ? 'bg-green-500' : 
                            cls.averageAttendance > 80 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${cls.averageAttendance}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Attendance Detail</CardTitle>
              <CardDescription>
                Detailed breakdown by class and date
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left font-medium">Class</th>
                      <th className="p-2 text-left font-medium">Students</th>
                      <th className="p-2 text-left font-medium">Average Attendance</th>
                      <th className="p-2 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.map((cls, i) => (
                      <tr key={cls.className} className={i % 2 === 0 ? 'bg-muted/20' : ''}>
                        <td className="p-2">{cls.className}</td>
                        <td className="p-2">{cls.studentCount}</td>
                        <td className="p-2">{cls.averageAttendance.toFixed(2)}%</td>
                        <td className="p-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            cls.averageAttendance > 90 ? 'bg-green-100 text-green-800' : 
                            cls.averageAttendance > 80 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {cls.averageAttendance > 90 ? 'Excellent' : 
                             cls.averageAttendance > 80 ? 'Good' : 'Needs Improvement'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-4">Monthly Attendance Trend</h4>
                <div className="h-[250px] flex items-end justify-between gap-2">
                  {/* Simulate monthly trend */}
                  {[...Array(12)].map((_, i) => {
                    const height = 60 + Math.random() * 40;
                    const month = new Date(2025, i, 1).toLocaleString('default', { month: 'short' });
                    return (
                      <div key={i} className="flex flex-col items-center gap-1 flex-1">
                        <div 
                          className="w-full bg-primary/80 rounded-t-sm" 
                          style={{ height: `${height}%` }}
                        />
                        <span className="text-xs text-muted-foreground">{month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={exportPerformancePDF}
              disabled={pdfPreparingPerformance}
            >
              <FileDown className="h-4 w-4" />
              <span>{pdfPreparingPerformance ? "Generating PDF..." : "Export Report"}</span>
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Overall Performance</span>
                </CardTitle>
                <CardDescription>School-wide average score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {performanceData.length 
                    ? (performanceData.reduce((sum, subject) => sum + subject.averageScore, 0) / performanceData.length).toFixed(2) 
                    : 0}%
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Based on {performanceData.length} subjects across {classNames.length} classes
                </div>
                <div className="h-4 w-full bg-muted rounded-full mt-4 overflow-hidden">
                  <div 
                    className="h-full bg-primary" 
                    style={{ 
                      width: `${performanceData.length 
                        ? (performanceData.reduce((sum, subject) => sum + subject.averageScore, 0) / performanceData.length) 
                        : 0}%` 
                    }}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Subject Performance</span>
                </CardTitle>
                <CardDescription>Average score by subject</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceData.slice(0, 5).map(subject => (
                    <div key={subject.subjectName} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{subject.subjectName}</span>
                        <span className="font-medium">{subject.averageScore.toFixed(2)}%</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            subject.averageScore > 75 ? 'bg-green-500' : 
                            subject.averageScore > 60 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${subject.averageScore}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Class Performance</span>
                </CardTitle>
                <CardDescription>Average score by class</CardDescription>
              </CardHeader>
              <CardContent>
                {classNames.length > 0 ? (
                  <div className="space-y-4">
                    {classNames.map(className => {
                      // Calculate average score for this class across all subjects
                      const classScores = performanceData.map(subject => subject.classBreakdown[className] || 0);
                      const classAverage = classScores.reduce((sum, score) => sum + score, 0) / classScores.length;
                      
                      return (
                        <div key={className} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{className}</span>
                            <span className="font-medium">{classAverage.toFixed(2)}%</span>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                classAverage > 75 ? 'bg-green-500' : 
                                classAverage > 60 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${classAverage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No class data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Subject Performance Detail</CardTitle>
                <CardDescription>
                  Detailed breakdown by subject and class
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-2 text-left font-medium">Subject</th>
                        <th className="p-2 text-left font-medium">Average Score</th>
                        <th className="p-2 text-left font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {performanceData.map((subject, i) => (
                        <tr key={subject.subjectName} className={i % 2 === 0 ? 'bg-muted/20' : ''}>
                          <td className="p-2">{subject.subjectName}</td>
                          <td className="p-2">{subject.averageScore.toFixed(2)}%</td>
                          <td className="p-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              subject.averageScore > 75 ? 'bg-green-100 text-green-800' : 
                              subject.averageScore > 60 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {subject.averageScore > 75 ? 'Excellent' : 
                               subject.averageScore > 60 ? 'Good' : 'Needs Improvement'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Class Performance Detail</CardTitle>
                <CardDescription>
                  Detailed breakdown by class and subject
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-2 text-left font-medium">Class</th>
                        {performanceData.slice(0, 5).map(subject => (
                          <th key={subject.subjectName} className="p-2 text-left font-medium">{subject.subjectName}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {classNames.map((className, i) => (
                        <tr key={className} className={i % 2 === 0 ? 'bg-muted/20' : ''}>
                          <td className="p-2 font-medium">{className}</td>
                          {performanceData.slice(0, 5).map(subject => (
                            <td key={`${className}-${subject.subjectName}`} className="p-2">
                              {subject.classBreakdown[className]?.toFixed(2) || '0.00'}%
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}