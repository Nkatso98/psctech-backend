import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  CalendarIcon, 
  FileTextIcon, 
  BellIcon,
  UsersIcon,
  ClipboardListIcon,
  BriefcaseIcon
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Badge } from '@/components/ui/badge';

export function SGBDashboard() {
  const { user, institution } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">SGB Dashboard</h2>
        <p className="text-muted-foreground">Welcome, {user?.fullName.split(' ')[0]}!</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Meetings</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Next: Budget Review (Friday)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Documents</CardTitle>
            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Requires your approval
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">School Announcements</CardTitle>
            <BellIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              2 new since last login
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="meetings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="meetings" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Meetings</CardTitle>
                <CardDescription>
                  Schedule and information for upcoming SGB meetings
                </CardDescription>
              </div>
              <Button>
                <CalendarIcon className="mr-2 h-4 w-4" />
                Schedule Meeting
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted/20 p-4 rounded-lg border">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Budget Review Meeting</h3>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Friday, 9 August 2025</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    16:00 - 18:00 | Principal's Office
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <ClipboardListIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Review quarterly budget allocation</span>
                    </div>
                    <div className="flex items-center">
                      <ClipboardListIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Discuss fundraising initiatives</span>
                    </div>
                    <div className="flex items-center">
                      <UsersIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">7 attendees confirmed</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted/20 p-4 rounded-lg border">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Infrastructure Committee Meeting</h3>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Wednesday, 14 August 2025</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    15:00 - 16:30 | Conference Room
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <ClipboardListIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Review renovation proposals</span>
                    </div>
                    <div className="flex items-center">
                      <ClipboardListIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Discuss maintenance schedule</span>
                    </div>
                    <div className="flex items-center">
                      <UsersIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">5 attendees confirmed</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <Button variant="outline">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    View Full Calendar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Important Documents</CardTitle>
              <CardDescription>
                Review and manage school governance documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Pending Approval</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-amber-100 p-2 rounded-md mr-4">
                          <FileTextIcon className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Budget Amendment Proposal</h4>
                          <p className="text-sm text-muted-foreground">Submitted on 3 August 2025</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View</Button>
                        <Button size="sm">Approve</Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-amber-100 p-2 rounded-md mr-4">
                          <FileTextIcon className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Staff Hiring Policy</h4>
                          <p className="text-sm text-muted-foreground">Submitted on 1 August 2025</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View</Button>
                        <Button size="sm">Approve</Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-amber-100 p-2 rounded-md mr-4">
                          <FileTextIcon className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Maintenance Contract Renewal</h4>
                          <p className="text-sm text-muted-foreground">Submitted on 30 July 2025</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View</Button>
                        <Button size="sm">Approve</Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Document Repository</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-muted/20 p-2 rounded-md mr-4">
                          <BriefcaseIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-medium">School Policies</h4>
                          <p className="text-sm text-muted-foreground">12 documents</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">Browse</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-muted/20 p-2 rounded-md mr-4">
                          <BriefcaseIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-medium">Financial Records</h4>
                          <p className="text-sm text-muted-foreground">8 documents</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">Browse</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-muted/20 p-2 rounded-md mr-4">
                          <BriefcaseIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-medium">Meeting Minutes</h4>
                          <p className="text-sm text-muted-foreground">24 documents</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">Browse</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="announcements" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>School Announcements</CardTitle>
                <CardDescription>
                  View and manage school-wide announcements
                </CardDescription>
              </div>
              <Button>
                <BellIcon className="mr-2 h-4 w-4" />
                New Announcement
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4 py-2">
                  <div className="flex justify-between">
                    <h4 className="font-medium">Term 2 Report Cards Ready</h4>
                    <span className="text-xs text-muted-foreground">2 hours ago</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Term 2 report cards have been finalized and are ready for distribution. Parents can access them through the portal.
                  </p>
                  <div className="flex items-center justify-end mt-2">
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
                
                <div className="border-l-4 border-primary pl-4 py-2">
                  <div className="flex justify-between">
                    <h4 className="font-medium">School Infrastructure Upgrade</h4>
                    <span className="text-xs text-muted-foreground">Yesterday</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    We're pleased to announce that renovations to the science labs will begin next month. Classes will be temporarily relocated.
                  </p>
                  <div className="flex items-center justify-end mt-2">
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
                
                <div className="border-l-4 border-primary pl-4 py-2">
                  <div className="flex justify-between">
                    <h4 className="font-medium">Parent-Teacher Conference</h4>
                    <span className="text-xs text-muted-foreground">2 days ago</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    The upcoming parent-teacher conference will be held on Friday, 9 August from 4:00 PM to 6:00 PM in the Main Hall.
                  </p>
                  <div className="flex items-center justify-end mt-2">
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}