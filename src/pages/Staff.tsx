import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  UsersIcon, 
  UserPlusIcon, 
  PlusIcon, 
  SearchIcon,
  FilterIcon,
  MoreHorizontalIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  BookOpenIcon,
  AwardIcon,
  ClockIcon
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { AuthLayout } from '@/components/layout/auth-layout';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function Staff() {
  const { user, institution } = useAuth();

  // Mock data for staff
  const staff = [
    {
      id: 1,
      name: "Mrs. Sarah Johnson",
      role: "Mathematics Teacher",
      email: "sarah.johnson@school.com",
      phone: "+27 82 123 4567",
      department: "Mathematics",
      experience: "8 years",
      status: "Active",
      avatar: "/avatars/sarah.jpg",
      subjects: ["Mathematics", "Advanced Math"],
      classes: ["Grade 8A", "Grade 9B"],
      joinDate: "2016-01-15",
      qualifications: ["BSc Mathematics", "PGCE"]
    },
    {
      id: 2,
      name: "Mr. David Smith",
      role: "English Teacher",
      email: "david.smith@school.com",
      phone: "+27 82 234 5678",
      department: "Languages",
      experience: "12 years",
      status: "Active",
      avatar: "/avatars/david.jpg",
      subjects: ["English", "Literature"],
      classes: ["Grade 9B", "Grade 10A"],
      joinDate: "2012-03-20",
      qualifications: ["BA English", "PGCE", "MA Literature"]
    },
    {
      id: 3,
      name: "Ms. Lisa Brown",
      role: "Science Teacher",
      email: "lisa.brown@school.com",
      phone: "+27 82 345 6789",
      department: "Sciences",
      experience: "6 years",
      status: "Active",
      avatar: "/avatars/lisa.jpg",
      subjects: ["Physics", "Chemistry"],
      classes: ["Grade 10A", "Grade 11B"],
      joinDate: "2018-08-10",
      qualifications: ["BSc Physics", "PGCE"]
    },
    {
      id: 4,
      name: "Dr. Michael Wilson",
      role: "Biology Teacher",
      email: "michael.wilson@school.com",
      phone: "+27 82 456 7890",
      department: "Sciences",
      experience: "15 years",
      status: "Active",
      avatar: "/avatars/michael.jpg",
      subjects: ["Biology", "Life Sciences"],
      classes: ["Grade 11B", "Grade 12A"],
      joinDate: "2009-01-05",
      qualifications: ["PhD Biology", "PGCE"]
    },
    {
      id: 5,
      name: "Prof. Emily Davis",
      role: "Business Studies Teacher",
      email: "emily.davis@school.com",
      phone: "+27 82 567 8901",
      department: "Commerce",
      experience: "18 years",
      status: "Active",
      avatar: "/avatars/emily.jpg",
      subjects: ["Business Studies", "Economics"],
      classes: ["Grade 10A", "Grade 11B"],
      joinDate: "2006-09-01",
      qualifications: ["BCom Business", "PGCE", "MBA"]
    }
  ];

  return (
    <AuthLayout>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
              <p className="text-muted-foreground">
                Manage your school staff, view profiles, and handle administrative tasks
              </p>
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add New Staff
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff members..."
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <FilterIcon className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Staff Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {staff.map((staffMember) => (
              <Card key={staffMember.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={staffMember.avatar} alt={staffMember.name} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                          {staffMember.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{staffMember.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{staffMember.role}</p>
                      </div>
                    </div>
                    <Badge className={`${
                      staffMember.status === 'Active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {staffMember.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <MailIcon className="h-4 w-4" />
                      <span>{staffMember.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <PhoneIcon className="h-4 w-4" />
                      <span>{staffMember.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <MapPinIcon className="h-4 w-4" />
                      <span>{staffMember.department}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Joined {new Date(staffMember.joinDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Subjects */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Subjects:</p>
                    <div className="flex flex-wrap gap-1">
                      {staffMember.subjects.map((subject, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Classes */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Classes:</p>
                    <div className="flex flex-wrap gap-1">
                      {staffMember.classes.map((className, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-indigo-200 text-indigo-600 dark:border-indigo-700 dark:text-indigo-400">
                          {className}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Qualifications */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Qualifications:</p>
                    <div className="flex flex-wrap gap-1">
                      {staffMember.qualifications.map((qual, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-green-200 text-green-600 dark:border-green-700 dark:text-green-400">
                          {qual}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1 border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-900/30">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-900/30">
                      <EditIcon className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30">
                      <MoreHorizontalIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions Section */}
          <Card className="border-0 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50">
            <CardHeader>
              <CardTitle className="text-xl text-emerald-800 dark:text-emerald-200">Quick Actions</CardTitle>
              <CardDescription className="text-emerald-700 dark:text-emerald-300">
                Common tasks for staff management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Button variant="outline" className="h-20 flex-col gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/30">
                  <UserPlusIcon className="h-6 w-6" />
                  <span className="text-sm">Hire Staff</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/30">
                  <BookOpenIcon className="h-6 w-6" />
                  <span className="text-sm">Assign Classes</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/30">
                  <AwardIcon className="h-6 w-6" />
                  <span className="text-sm">Performance Review</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/30">
                  <ClockIcon className="h-6 w-6" />
                  <span className="text-sm">Attendance</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthLayout>
  );
}






