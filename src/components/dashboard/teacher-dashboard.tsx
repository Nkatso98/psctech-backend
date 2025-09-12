import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircleIcon, 
  ClipboardListIcon, 
  CalendarIcon, 
  FileTextIcon,
  UserIcon,
  AlertCircleIcon,
  BrainIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  AwardIcon,
  ClockIcon,
  MapPinIcon,
  BookOpenIcon,
  BarChart3,
  MessageSquareIcon,
  TargetIcon,
  ZapIcon,
  EyeIcon,
  EditIcon,
  PlusIcon,
  UsersIcon,
  GraduationCapIcon,
  BellIcon,
  StarIcon
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { jsPDF } from 'jspdf';
import { AIHomeworkGenerator } from '@/components/ai-homework/ai-homework-generator';
import { AITestGenerator } from '@/components/ai-test/ai-test-generator';

export function TeacherDashboard() {
  const { user, institution } = useAuth();

  const exportClassReportsPDF = () => {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      // Add header
      pdf.setFillColor(245, 245, 245);
      pdf.rect(0, 0, pageWidth, 30, 'F');
      
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(31, 41, 55);
      pdf.setFontSize(20);
      const schoolName = institution?.name || 'PSC Tech School';
      pdf.text(schoolName, 20, 20);
      
      pdf.setFontSize(16);
      pdf.text('Class Reports', 20, 28);
      
      // Add content
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Performance Reports', 20, 50);
      pdf.text('Generate reports on class performance across all tests.', 20, 60);
      pdf.text('Grade 8A, Grade 9C, Grade 10A, Grade 11B, Grade 12A', 20, 70);
      
      pdf.text('Attendance Reports', 20, 90);
      pdf.text('Generate reports on class attendance patterns.', 20, 100);
      pdf.text('Grade 8A, Grade 9C, Grade 10A, Grade 11B, Grade 12A', 20, 110);
      
      pdf.text('Term Reports', 20, 130);
      pdf.text('Generate end-of-term reports for all classes.', 20, 140);
      
      // Add footer
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on ${new Date().toLocaleDateString()} by ${user?.fullName || 'User'}`, pageWidth / 2, 280, { align: 'center' });
      
      pdf.save('class_reports.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-10 via-blue-5 to-indigo-10 p-8 border border-blue-20">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-200">
              <AwardIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                Teacher Dashboard
              </h2>
              <p className="text-lg text-blue-700 dark:text-blue-300 mt-1">
                Good day, <span className="font-semibold text-blue-800 dark:text-blue-200">{user?.fullName?.split(' ')[0]}</span>! 
                {institution && (
                  <span className="ml-2 text-sm bg-blue-500/10 text-blue-700 px-2 py-1 rounded-full">
                    {institution.name}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-blue-600 dark:text-blue-400">
            <div className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4" />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-4 w-4" />
              <span>Multi-Tenant Platform</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300">Today's Classes</CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-200 dark:border-blue-800">
              <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">5</div>
            <div className="flex items-center gap-2 mt-2">
              <ClockIcon className="h-4 w-4 text-blue-600" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                First: 8A Mathematics (08:00)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300">Unmarked Tests</CardTitle>
            <div className="p-2 rounded-lg bg-green-500/10 border border-green-200 dark:border-green-800">
              <FileTextIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">3</div>
            <div className="flex items-center gap-2 mt-2">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-700 dark:text-green-300">
                Due: Grade 10 Science
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-purple-700 dark:text-purple-300">Active Students</CardTitle>
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-200 dark:border-purple-800">
              <UsersIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">127</div>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUpIcon className="h-4 w-4 text-purple-600" />
              <p className="text-sm text-purple-700 dark:text-purple-300">
                +5 this week
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-orange-700 dark:text-orange-300">Class Average</CardTitle>
            <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-200 dark:border-orange-800">
              <BarChart3 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">78%</div>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUpIcon className="h-4 w-4 text-orange-600" />
              <p className="text-sm text-orange-700 dark:text-orange-300">
                +2.5% this term
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
          <TabsTrigger value="homework">AI Homework</TabsTrigger>
          <TabsTrigger value="ai-tests">AI Tests</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <Card className="border-0 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-950/50 dark:to-indigo-900/50">
            <CardHeader>
              <CardTitle className="text-xl text-indigo-800 dark:text-indigo-200">⚡ Quick Actions</CardTitle>
              <CardDescription className="text-indigo-700 dark:text-indigo-300">
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button className="h-20 flex-col gap-2 bg-white/50 hover:bg-white/70 border border-indigo-200">
                  <CalendarIcon className="h-6 w-6 text-indigo-600" />
                  <span className="text-sm">Take Attendance</span>
                </Button>
                <Button className="h-20 flex-col gap-2 bg-white/50 hover:bg-white/70 border border-indigo-200">
                  <FileTextIcon className="h-6 w-6 text-indigo-600" />
                  <span className="text-sm">Create Test</span>
                </Button>
                <Button className="h-20 flex-col gap-2 bg-white/50 hover:bg-white/70 border border-indigo-200">
                  <BookOpenIcon className="h-6 w-6 text-indigo-600" />
                  <span className="text-sm">Assign Homework</span>
                </Button>
                <Button className="h-20 flex-col gap-2 bg-white/50 hover:bg-white/70 border border-indigo-200">
                  <BarChart3 className="h-6 w-6 text-indigo-600" />
                  <span className="text-sm">View Reports</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-blue-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest actions and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-blue-50/50">
                  <div className="p-2 rounded-full bg-blue-100">
                    <CheckCircleIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Marked Grade 10 Science Test</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                  <Badge variant="secondary">Completed</Badge>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-green-50/50">
                  <div className="p-2 rounded-full bg-green-100">
                    <BookOpenIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Assigned Mathematics Homework</p>
                    <p className="text-xs text-muted-foreground">4 hours ago</p>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-purple-50/50">
                  <div className="p-2 rounded-full bg-purple-100">
                    <UsersIcon className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Updated Class Attendance</p>
                    <p className="text-xs text-muted-foreground">Yesterday</p>
                  </div>
                  <Badge variant="secondary">Updated</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUpIcon className="h-5 w-5 text-green-600" />
                Performance Overview
              </CardTitle>
              <CardDescription>
                Class performance metrics and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{127}</div>
                  <div className="text-xs text-gray-500">Students</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-success-600">{78}%</div>
                  <div className="text-xs text-gray-500">Class Average</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-warning-600">{95}%</div>
                  <div className="text-xs text-gray-500">Attendance</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Classes</CardTitle>
                <CardDescription>
                  Manage your assigned classes and students
                </CardDescription>
              </div>
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Class
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Grade 10A - Mathematics</CardTitle>
                      <CardDescription>Advanced Mathematics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Students:</span>
                          <span className="font-medium">32</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Schedule:</span>
                          <span className="font-medium">Mon, Wed, Fri</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Time:</span>
                          <span className="font-medium">08:00 - 09:00</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Average:</span>
                          <span className="font-medium text-green-600">82%</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline">View Details</Button>
                        <Button size="sm">Take Attendance</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Grade 8C - Science</CardTitle>
                      <CardDescription>General Science</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Students:</span>
                          <span className="font-medium">28</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Schedule:</span>
                          <span className="font-medium">Tue, Thu</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Time:</span>
                          <span className="font-medium">10:00 - 11:00</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Average:</span>
                          <span className="font-medium text-blue-600">75%</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline">View Details</Button>
                        <Button size="sm">Take Attendance</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Grade 12A - Physics</CardTitle>
                      <CardDescription>Advanced Physics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Students:</span>
                          <span className="font-medium">25</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Schedule:</span>
                          <span className="font-medium">Mon, Wed, Fri</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Time:</span>
                          <span className="font-medium">14:00 - 15:00</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Average:</span>
                          <span className="font-medium text-purple-600">88%</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline">View Details</Button>
                        <Button size="sm">Take Attendance</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tests & Results</CardTitle>
                <CardDescription>
                  Manage tests, assignments, and results
                </CardDescription>
              </div>
              <Button>
                <FileTextIcon className="mr-2 h-4 w-4" />
                Create Test
              </Button>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="upcoming">
                <TabsList className="mb-4">
                  <TabsTrigger value="upcoming">Upcoming Tests</TabsTrigger>
                  <TabsTrigger value="unmarked">Unmarked Tests</TabsTrigger>
                  <TabsTrigger value="results">Test Results</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upcoming" className="space-y-4">
                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Grade 10A - Science Quiz</h4>
                        <p className="text-sm text-muted-foreground">Friday, 9 August 2025</p>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>
                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Grade 12A - Mathematics Test</h4>
                        <p className="text-sm text-muted-foreground">Monday, 12 August 2025</p>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="unmarked" className="space-y-4">
                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Grade 10 - Science Test</h4>
                        <p className="text-sm text-muted-foreground">Conducted on 4 August 2025</p>
                      </div>
                      <Button size="sm">Mark Now</Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="results" className="space-y-4">
                  <div className="text-sm text-muted-foreground p-4 border rounded-md">
                    Test results will appear here once you've marked tests
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="homework" className="space-y-6">
          <AIHomeworkGenerator />
        </TabsContent>

        <TabsContent value="ai-tests" className="space-y-6">
          <AITestGenerator />
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Class Reports</CardTitle>
                <CardDescription>
                  Generate and view reports for your classes
                </CardDescription>
              </div>
              <Button variant="outline" onClick={() => exportClassReportsPDF()}>
                <DownloadIcon className="h-4 w-4 mr-2" />
                Export Reports
              </Button>
            </CardHeader>
            <CardContent id="class-reports-content">
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-2">Performance Reports</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate reports on class performance across all tests.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">Grade 8A</Button>
                    <Button variant="outline" size="sm">Grade 9C</Button>
                    <Button variant="outline" size="sm">Grade 10A</Button>
                    <Button variant="outline" size="sm">Grade 11B</Button>
                    <Button variant="outline" size="sm">Grade 12A</Button>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-2">Attendance Reports</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate reports on class attendance patterns.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">Grade 8A</Button>
                    <Button variant="outline" size="sm">Grade 9C</Button>
                    <Button variant="outline" size="sm">Grade 10A</Button>
                    <Button variant="outline" size="sm">Grade 11B</Button>
                    <Button variant="outline" size="sm">Grade 12A</Button>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-2">Term Reports</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate end-of-term reports for all classes.
                  </p>
                  <Button>Generate Term Reports</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircleIcon className="h-5 w-5 mr-2 text-amber-500" />
            Notices
          </CardTitle>
          <CardDescription>
            Recent notices from the administration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-amber-500 pl-4 py-2">
              <div className="flex justify-between">
                <h4 className="font-medium">Staff Meeting</h4>
                <span className="text-xs text-muted-foreground">Today</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Reminder: There will be a staff meeting today at 16:30 in the staff room to discuss end-of-term assessments.
              </p>
            </div>
            <div className="border-l-4 border-amber-500 pl-4 py-2">
              <div className="flex justify-between">
                <h4 className="font-medium">Report Card Deadline</h4>
                <span className="text-xs text-muted-foreground">Yesterday</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                All term reports must be submitted by the end of this week. Please ensure all marks are entered into the system.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
