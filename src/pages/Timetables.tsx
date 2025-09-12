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
  CalendarIcon, 
  ClockIcon,
  UsersIcon,
  BookOpenIcon,
  MapPinIcon,
  PlusIcon,
  EditIcon,
  EyeIcon,
  DownloadIcon,
  FilterIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
  SettingsIcon
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function Timetables() {
  const { user, institution } = useAuth();
  const [timetables, setTimetables] = useState<any[]>([]);
  const [selectedGrade, setSelectedGrade] = useState('10A');
  const [selectedTeacher, setSelectedTeacher] = useState('All');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('weekly');
  const [showAddForm, setShowAddForm] = useState(false);

  const timeSlots = [
    '07:30 - 08:15', '08:15 - 09:00', '09:00 - 09:45', '09:45 - 10:30',
    '10:45 - 11:30', '11:30 - 12:15', '12:15 - 13:00',
    '13:30 - 14:15', '14:15 - 15:00', '15:00 - 15:45'
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    loadTimetables();
  }, [selectedGrade, selectedTeacher, currentWeek]);

  const loadTimetables = async () => {
    setLoading(true);
    // Simulate API call - replace with actual API
    setTimeout(() => {
      const mockData = generateMockTimetables();
      setTimetables(mockData);
      setLoading(false);
    }, 500);
  };

  const generateMockTimetables = () => {
    const subjects = ['Mathematics', 'English', 'Science', 'History', 'Geography', 'Physical Education', 'Art', 'Music'];
    const teachers = ['Mrs. Johnson', 'Mr. Smith', 'Ms. Davis', 'Mr. Wilson', 'Mrs. Brown'];
    const rooms = ['Room 101', 'Room 102', 'Room 103', 'Lab A', 'Lab B', 'Gym', 'Art Room', 'Music Room'];
    
    const mockTimetables = [];
    
    days.forEach((day, dayIndex) => {
      timeSlots.forEach((timeSlot, timeIndex) => {
        if (Math.random() > 0.2) { // 80% chance of having a class
          mockTimetables.push({
            id: `${dayIndex}-${timeIndex}`,
            day,
            timeSlot,
            subject: subjects[Math.floor(Math.random() * subjects.length)],
            teacher: teachers[Math.floor(Math.random() * teachers.length)],
            room: rooms[Math.floor(Math.random() * rooms.length)],
            grade: selectedGrade,
            type: Math.random() > 0.7 ? 'Practical' : 'Theory',
            color: getRandomColor(),
            capacity: 30,
            enrolled: Math.floor(Math.random() * 30) + 15,
            notes: Math.random() > 0.8 ? 'Special equipment required' : ''
          });
        }
      });
    });
    
    return mockTimetables;
  };

  const getRandomColor = () => {
    const colors = ['bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-purple-100 text-purple-800', 
                   'bg-orange-100 text-orange-800', 'bg-pink-100 text-pink-800', 'bg-indigo-100 text-indigo-800'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay() + 1); // Monday
    
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const current = new Date(start);
      current.setDate(start.getDate() + i);
      dates.push(current);
    }
    return dates;
  };

  const previousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
  };

  const exportTimetable = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Day,Time,Subject,Teacher,Room,Grade,Type,Capacity,Enrolled\n" +
      timetables.map(row => `${row.day},${row.timeSlot},${row.subject},${row.teacher},${row.room},${row.grade},${row.type},${row.capacity},${row.enrolled}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `timetable_${selectedGrade}_${currentWeek.toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const weekDates = getWeekDates(currentWeek);

  const filteredTimetables = timetables.filter(timetable => {
    if (selectedTeacher !== 'All' && timetable.teacher !== selectedTeacher) return false;
    return true;
  });

  return (
    <AuthLayout>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Class Timetables</h1>
              <p className="text-muted-foreground">
                Manage and view class schedules for {institution?.name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {user?.role === 'Teacher' && (
                <Button onClick={() => setShowAddForm(true)}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Class
                </Button>
              )}
              <Button variant="outline" onClick={exportTimetable}>
                <DownloadIcon className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{timetables.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subjects</CardTitle>
                <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Set(timetables.map(t => t.subject)).size}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Teachers</CardTitle>
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Set(timetables.map(t => t.teacher)).size}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rooms</CardTitle>
                <MapPinIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Set(timetables.map(t => t.room)).size}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Week Navigation */}
          <Card>
            <CardHeader>
              <CardTitle>Timetable Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <Label htmlFor="grade">Grade</Label>
                  <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10A">Grade 10A</SelectItem>
                      <SelectItem value="10B">Grade 10B</SelectItem>
                      <SelectItem value="11A">Grade 11A</SelectItem>
                      <SelectItem value="11B">Grade 11B</SelectItem>
                      <SelectItem value="12A">Grade 12A</SelectItem>
                      <SelectItem value="12B">Grade 12B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="teacher">Teacher</Label>
                  <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Teachers</SelectItem>
                      <SelectItem value="Mrs. Johnson">Mrs. Johnson</SelectItem>
                      <SelectItem value="Mr. Smith">Mr. Smith</SelectItem>
                      <SelectItem value="Ms. Davis">Ms. Davis</SelectItem>
                      <SelectItem value="Mr. Wilson">Mr. Wilson</SelectItem>
                      <SelectItem value="Mrs. Brown">Mrs. Brown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" className="w-full">
                    <FilterIcon className="h-4 w-4 mr-2" />
                    Apply Filters
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={previousWeek}>
                    <ChevronLeftIcon className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    Week of {weekDates[0].toLocaleDateString()} - {weekDates[4].toLocaleDateString()}
                  </span>
                  <Button variant="outline" size="sm" onClick={nextWeek}>
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timetable View */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Timetable for Grade {selectedGrade}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'weekly' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('weekly')}
                  >
                    Weekly View
                  </Button>
                  <Button
                    variant={viewMode === 'daily' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('daily')}
                  >
                    Daily View
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : viewMode === 'weekly' ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border p-2 font-medium bg-muted">Time</th>
                        {days.map(day => (
                          <th key={day} className="border p-2 font-medium bg-muted">
                            {day}
                            <div className="text-xs text-muted-foreground font-normal">
                              {weekDates[days.indexOf(day)].toLocaleDateString()}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {timeSlots.map(timeSlot => (
                        <tr key={timeSlot}>
                          <td className="border p-2 text-sm font-medium bg-muted">
                            {timeSlot}
                          </td>
                          {days.map(day => {
                            const classData = filteredTimetables.find(t => t.day === day && t.timeSlot === timeSlot);
                            return (
                              <td key={day} className="border p-2 min-h-[100px]">
                                {classData ? (
                                  <div className={`p-2 rounded-lg ${classData.color} border`}>
                                    <div className="font-medium text-sm">{classData.subject}</div>
                                    <div className="text-xs opacity-75">{classData.teacher}</div>
                                    <div className="text-xs opacity-75">{classData.room}</div>
                                    <Badge variant="secondary" className="mt-1 text-xs">
                                      {classData.type}
                                    </Badge>
                                    {classData.notes && (
                                      <div className="text-xs mt-1 p-1 bg-yellow-100 text-yellow-800 rounded">
                                        {classData.notes}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="h-[100px] flex items-center justify-center text-muted-foreground text-sm">
                                    -
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="space-y-4">
                  {days.map(day => {
                    const dayClasses = filteredTimetables.filter(t => t.day === day);
                    return (
                      <Card key={day}>
                        <CardHeader>
                          <CardTitle className="text-lg">
                            {day} - {weekDates[days.indexOf(day)].toLocaleDateString()}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {dayClasses.length > 0 ? (
                              dayClasses.map(classData => (
                                <div key={classData.id} className="flex items-center justify-between p-3 border rounded-lg">
                                  <div className="flex items-center gap-4">
                                    <div className="text-sm font-medium text-muted-foreground w-24">
                                      {classData.timeSlot}
                                    </div>
                                    <div className={`px-3 py-1 rounded-full ${classData.color} border`}>
                                      <span className="font-medium">{classData.subject}</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {classData.teacher}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {classData.room}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {classData.enrolled}/{classData.capacity} students
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Badge variant="secondary">{classData.type}</Badge>
                                    <Button size="sm" variant="outline">
                                      <EyeIcon className="h-4 w-4" />
                                    </Button>
                                    {user?.role === 'Teacher' && (
                                      <Button size="sm" variant="outline">
                                        <EditIcon className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8 text-muted-foreground">
                                No classes scheduled for this day
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add Class Form */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Class</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="History">History</SelectItem>
                        <SelectItem value="Geography">Geography</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="day">Day</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {days.map(day => (
                          <SelectItem key={day} value={day}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="time">Time Slot</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map(time => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="room">Room</Label>
                    <Input placeholder="Enter room number" />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button>Add Class</Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </AuthLayout>
  );
}











