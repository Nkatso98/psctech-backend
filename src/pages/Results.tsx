import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3Icon, 
  TrendingUpIcon, 
  TrendingDownIcon,
  AwardIcon,
  BookOpenIcon,
  DownloadIcon,
  FilterIcon,
  SearchIcon,
  EyeIcon,
  EditIcon,
  PlusIcon,
  UsersIcon,
  CalendarIcon,
  TargetIcon
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { consistentDataService } from '@/lib/consistent-data-service';

export default function Results() {
  const { user, institution } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [selectedTerm, setSelectedTerm] = useState('Term 1');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('table');

  useEffect(() => {
    loadResults();
  }, [selectedTerm, selectedSubject, selectedGrade]);

  const loadResults = async () => {
    setLoading(true);
    // Simulate API call - replace with actual API
    setTimeout(() => {
      const mockData = generateMockResults();
      setResults(mockData);
      setLoading(false);
    }, 500);
  };

  const generateMockResults = () => {
    const subjects = ['Mathematics', 'English', 'Science', 'History', 'Geography'];
    const grades = ['10A', '10B', '11A', '11B', '12A', '12B'];
    
    const mockResults = [];
    for (let i = 1; i <= 25; i++) {
      mockResults.push({
        id: i.toString(),
        studentName: `Student ${i}`,
        grade: grades[Math.floor(Math.random() * grades.length)],
        subject: subjects[Math.floor(Math.random() * subjects.length)],
        term: selectedTerm,
        mark: consistentDataService.getStudentPerformance(`student-${i}`),
        percentage: consistentDataService.getStudentPerformance(`student-${i}`),
        level: Math.floor(consistentDataService.getStudentPerformance(`student-${i}`) / 15) + 1, // Consistent level based on performance
        comment: getRandomComment(),
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString() // 7 days ago consistently
      });
    }
    return mockResults;
  };

  const getRandomComment = () => {
    const comments = [
      'Excellent work! Shows great understanding of concepts.',
      'Good effort, but needs more practice with complex problems.',
      'Satisfactory performance, room for improvement.',
      'Outstanding achievement in this subject.',
      'Good progress, continue working hard.'
    ];
    return comments[Math.floor(Math.random() * comments.length)];
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

  const exportResults = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Student,Grade,Subject,Term,Mark,Percentage,Level,Comment,Date\n" +
      results.map(row => `${row.studentName},${row.grade},${row.subject},${row.term},${row.mark},${row.percentage}%,${row.level},${row.comment},${row.date}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `results_${selectedTerm}_${selectedSubject}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredResults = results.filter(result => {
    if (selectedSubject !== 'All' && result.subject !== selectedSubject) return false;
    if (selectedGrade !== 'All' && result.grade !== selectedGrade) return false;
    return true;
  });

  return (
    <AuthLayout>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Academic Results</h1>
              <p className="text-muted-foreground">
                View and manage student academic performance for {institution?.name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={exportResults}>
                <DownloadIcon className="h-4 w-4 mr-2" />
                Export Results
              </Button>
              {user?.role === 'Teacher' && (
                <Button>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Results
                </Button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Results</CardTitle>
                <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredResults.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Mark</CardTitle>
                <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredResults.length > 0 
                    ? Math.round(filteredResults.reduce((sum, r) => sum + r.mark, 0) / filteredResults.length)
                    : 0
                  }%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
                <AwardIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {filteredResults.filter(r => r.mark >= 80).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Needs Support</CardTitle>
                <TargetIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {filteredResults.filter(r => r.mark < 60).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
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
                <div>
                  <Label htmlFor="grade">Grade</Label>
                  <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Grades</SelectItem>
                      <SelectItem value="10A">Grade 10A</SelectItem>
                      <SelectItem value="10B">Grade 10B</SelectItem>
                      <SelectItem value="11A">Grade 11A</SelectItem>
                      <SelectItem value="11B">Grade 11B</SelectItem>
                      <SelectItem value="12A">Grade 12A</SelectItem>
                      <SelectItem value="12B">Grade 12B</SelectItem>
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

          {/* Results Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Results for {selectedTerm}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                  >
                    Table View
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    Grid View
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : viewMode === 'table' ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">Student</th>
                        <th className="text-left p-3 font-medium">Grade</th>
                        <th className="text-left p-3 font-medium">Subject</th>
                        <th className="text-left p-3 font-medium">Mark</th>
                        <th className="text-left p-3 font-medium">Level</th>
                        <th className="text-left p-3 font-medium">Comment</th>
                        <th className="text-left p-3 font-medium">Date</th>
                        <th className="text-left p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResults.map((result) => (
                        <tr key={result.id} className="border-b hover:bg-muted/50">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-xs font-medium text-primary">
                                  {result.studentName.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <span className="font-medium">{result.studentName}</span>
                            </div>
                          </td>
                          <td className="p-3">{result.grade}</td>
                          <td className="p-3">{result.subject}</td>
                          <td className="p-3">
                            <span className={`font-bold ${getMarkColor(result.mark)}`}>
                              {result.mark}%
                            </span>
                          </td>
                          <td className="p-3">
                            <Badge className={getLevelColor(result.level)}>
                              Level {result.level}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground max-w-xs truncate">
                            {result.comment}
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {result.date}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <EyeIcon className="h-4 w-4" />
                              </Button>
                              {user?.role === 'Teacher' && (
                                <Button size="sm" variant="outline">
                                  <EditIcon className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredResults.map((result) => (
                    <Card key={result.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {result.studentName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <Badge className={getLevelColor(result.level)}>
                            Level {result.level}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{result.studentName}</CardTitle>
                        <p className="text-sm text-muted-foreground">{result.grade} • {result.subject}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Mark:</span>
                            <span className={`text-lg font-bold ${getMarkColor(result.mark)}`}>
                              {result.mark}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Term:</span>
                            <span className="text-sm">{result.term}</span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {result.comment}
                          </p>
                          <div className="flex gap-2 pt-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              <EyeIcon className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {user?.role === 'Teacher' && (
                              <Button size="sm" variant="outline" className="flex-1">
                                <EditIcon className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthLayout>
  );
}













