import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CalendarIcon, 
  ClockIcon,
  UserIcon,
  BookOpenIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  SaveIcon,
  DownloadIcon,
  UsersIcon,
  MapPinIcon
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { teacherStore, learnerStore, userStore } from '@/lib/store';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
  period: number;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  grade: string;
  teacherId?: string;
}

interface Teacher {
  id: string;
  name: string;
  subjects: string[];
  maxPeriods: number;
}

interface Class {
  id: string;
  name: string;
  grade: string;
  room: string;
  capacity: number;
  learners: string[];
}

interface Lesson {
  id: string;
  subjectId: string;
  teacherId: string;
  classId: string;
  timeSlotId: string;
  day: string;
  period: number;
  room: string;
}

interface Timetable {
  id: string;
  name: string;
  grade: string;
  term: string;
  lessons: Lesson[];
  createdAt: Date;
  updatedAt: Date;
}

export function TimetableManager() {
  const { user, institution } = useAuth();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [activeTab, setActiveTab] = useState('timetables');
  const [selectedTimetable, setSelectedTimetable] = useState<Timetable | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (user && institution) {
      loadData();
    }
  }, [user, institution]);

  const loadData = () => {
    // Load actual data from stores instead of hardcoded mock data
    const teachers = teacherStore.getAll();
    const learners = learnerStore.getAll();
    const users = userStore.getAll();
    
    // Generate time slots based on standard school schedule
    const generatedTimeSlots: TimeSlot[] = [
      { id: 'ts1', startTime: '08:00', endTime: '08:45', day: 'monday', period: 1 },
      { id: 'ts2', startTime: '08:50', endTime: '09:35', day: 'monday', period: 2 },
      { id: 'ts3', startTime: '09:40', endTime: '10:25', day: 'monday', period: 3 },
      { id: 'ts4', startTime: '10:30', endTime: '11:15', day: 'monday', period: 4 },
      { id: 'ts5', startTime: '11:20', endTime: '12:05', day: 'monday', period: 5 },
      { id: 'ts6', startTime: '12:10', endTime: '12:55', day: 'monday', period: 6 },
      { id: 'ts7', startTime: '13:00', endTime: '13:45', day: 'monday', period: 7 },
      { id: 'ts8', startTime: '13:50', endTime: '14:35', day: 'monday', period: 8 }
    ];
    
    // Generate subjects based on actual teacher data
    const generatedSubjects: Subject[] = teachers.map(teacher => ({
      id: `subject-${teacher.teacherId}`,
      name: teacher.subject,
      code: teacher.subject.substring(0, 3).toUpperCase(),
      grade: teacher.grade.toString(),
      teacherId: teacher.teacherId
    }));
    
    // Generate teachers data based on store
    const generatedTeachers: Teacher[] = teachers.map(teacher => {
      const teacherUser = userStore.getById(teacher.userId);
      return {
        id: teacher.teacherId,
        name: teacherUser?.fullName || 'Unknown Teacher',
        subjects: [teacher.subject],
        maxPeriods: 8
      };
    });
    
    // Generate classes based on actual learner data
    const classMap = new Map<string, { learners: string[]; grade: number }>();
    learners.forEach(learner => {
      const key = `${learner.grade}${learner.class}`;
      if (!classMap.has(key)) {
        classMap.set(key, { learners: [], grade: learner.grade });
      }
      classMap.get(key)!.learners.push(learner.learnerId);
    });
    
    const generatedClasses: Class[] = Array.from(classMap.entries()).map(([className, data]) => ({
      id: `class-${className}`,
      name: `Grade ${data.grade}${data.grade === 10 ? 'A' : data.grade === 9 ? 'B' : 'C'}`,
      grade: data.grade.toString(),
      room: `Room ${data.grade}${data.grade === 10 ? 'A' : data.grade === 9 ? 'B' : 'C'}`,
      capacity: 30,
      learners: data.learners
    }));
    
    // Generate timetables based on actual data
    const generatedTimetables: Timetable[] = generatedClasses.map(cls => {
      const lessons: Lesson[] = [];
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      
      days.forEach((day, dayIndex) => {
        for (let period = 1; period <= 8; period++) {
          const subjectIndex = (dayIndex + period) % generatedSubjects.length;
          const teacherIndex = subjectIndex % generatedTeachers.length;
          
          if (generatedSubjects[subjectIndex] && generatedTeachers[teacherIndex]) {
            lessons.push({
              id: `lesson-${cls.id}-${day}-${period}`,
              subjectId: generatedSubjects[subjectIndex].id,
              teacherId: generatedTeachers[teacherIndex].id,
              classId: cls.id,
              timeSlotId: `ts${period}`,
              day,
              period,
              room: cls.room
            });
          }
        }
      });
      
      return {
        id: `timetable-${cls.id}`,
        name: `${cls.name} Timetable`,
        grade: cls.grade,
        term: 'Term 1',
        lessons,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });
    
    setTimeSlots(generatedTimeSlots);
    setSubjects(generatedSubjects);
    setTeachers(generatedTeachers);
    setClasses(generatedClasses);
    setTimetables(generatedTimetables);
  };

  const createTimetable = () => {
    setIsCreating(true);
    setSelectedTimetable({
      id: `tt-${Date.now()}`,
      name: 'New Timetable',
      grade: '10',
      term: 'Term 1',
      lessons: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
  };

  const saveTimetable = () => {
    if (selectedTimetable) {
      setTimetables(prev => {
        const existing = prev.find(t => t.id === selectedTimetable.id);
        if (existing) {
          return prev.map(t => t.id === selectedTimetable.id ? { ...selectedTimetable, updatedAt: new Date() } : t);
        } else {
          return [...prev, { ...selectedTimetable, updatedAt: new Date() }];
        }
      });
      setIsCreating(false);
      setSelectedTimetable(null);
    }
  };

  const addLesson = (timetableId: string, lesson: Omit<Lesson, 'id'>) => {
    const newLesson: Lesson = {
      ...lesson,
      id: `lesson-${Date.now()}`
    };

    setTimetables(prev => 
      prev.map(t => 
        t.id === timetableId 
          ? { ...t, lessons: [...t.lessons, newLesson] }
          : t
      )
    );
  };

  const removeLesson = (timetableId: string, lessonId: string) => {
    setTimetables(prev => 
      prev.map(t => 
        t.id === timetableId 
          ? { ...t, lessons: t.lessons.filter(l => l.id !== lessonId) }
          : t
      )
    );
  };

  const getTimetableGrid = (timetable: Timetable) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const periods = Array.from({ length: 8 }, (_, i) => i + 1);

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 p-2 text-left">Time</th>
              {days.map(day => (
                <th key={day} className="border border-gray-300 p-2 text-center capitalize">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map(period => {
              const timeSlot = timeSlots.find(ts => ts.period === period);
              return (
                <tr key={period}>
                  <td className="border border-gray-300 p-2 text-sm bg-gray-50">
                    {timeSlot ? `${timeSlot.startTime} - ${timeSlot.endTime}` : `Period ${period}`}
                  </td>
                  {days.map(day => {
                    const lesson = timetable.lessons.find(l => l.day === day && l.period === period);
                    return (
                      <td key={day} className="border border-gray-300 p-2 text-center min-h-[80px]">
                        {lesson ? (
                          <div className="bg-blue-100 p-2 rounded text-xs">
                            <div className="font-medium">{subjects.find(s => s.id === lesson.subjectId)?.name}</div>
                            <div className="text-gray-600">{teachers.find(t => t.id === lesson.teacherId)?.name}</div>
                            <div className="text-gray-500">{classes.find(c => c.id === lesson.classId)?.room}</div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 mt-1"
                              onClick={() => removeLesson(timetable.id, lesson.id)}
                            >
                              <TrashIcon className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => {
                              // Add lesson dialog would go here
                              console.log(`Add lesson for ${day} period ${period}`);
                            }}
                          >
                            <PlusIcon className="h-3 w-3" />
                          </Button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const exportTimetableToPDF = (timetable: Timetable) => {
    const content = `
      <div style="font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
          ${timetable.name} - ${timetable.grade} (${timetable.term})
        </h1>
        
        <div style="margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #d1d5db;">
            <thead>
              <tr style="background-color: #f9fafb;">
                <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Time</th>
                <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">Monday</th>
                <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">Tuesday</th>
                <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">Wednesday</th>
                <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">Thursday</th>
                <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">Friday</th>
              </tr>
            </thead>
            <tbody>
              ${Array.from({ length: 8 }, (_, i) => i + 1).map(period => {
                const timeSlot = timeSlots.find(ts => ts.period === period);
                return `
                  <tr>
                    <td style="border: 1px solid #d1d5db; padding: 8px; background-color: #f9fafb; font-size: 12px;">
                      ${timeSlot ? `${timeSlot.startTime} - ${timeSlot.endTime}` : `Period ${period}`}
                    </td>
                    ${['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map(day => {
                      const lesson = timetable.lessons.find(l => l.day === day && l.period === period);
                      if (lesson) {
                        const subject = subjects.find(s => s.id === lesson.subjectId);
                        const teacher = teachers.find(t => t.id === lesson.teacherId);
                        const classRoom = classes.find(c => c.id === lesson.classId);
                        return `
                          <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center; background-color: #dbeafe;">
                            <div style="font-size: 11px;">
                              <div style="font-weight: bold;">${subject?.name || 'Unknown'}</div>
                              <div style="color: #374151;">${teacher?.name || 'Unknown'}</div>
                              <div style="color: #6b7280;">${classRoom?.room || 'Unknown'}</div>
                            </div>
                          </td>
                        `;
                      }
                      return `<td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;"></td>`;
                    }).join('')}
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280;">
          <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          <p>PSC Tech School Management System</p>
        </div>
      </div>
    `;

    return content;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Timetable Management</h2>
          <p className="text-muted-foreground">
            Create and manage lesson timetables for teachers and classes
          </p>
        </div>
        <Button onClick={createTimetable}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Timetable
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="timetables">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Timetables
          </TabsTrigger>
          <TabsTrigger value="classes">
            <UsersIcon className="h-4 w-4 mr-2" />
            Class Management
          </TabsTrigger>
          <TabsTrigger value="teachers">
            <UserIcon className="h-4 w-4 mr-2" />
            Teacher Allocation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timetables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>School Timetables</CardTitle>
            </CardHeader>
            <CardContent>
              {timetables.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No timetables created yet</p>
                  <p className="text-sm text-muted-foreground">
                    Create your first timetable to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {timetables.map((timetable) => (
                    <Card key={timetable.id} className="border-2">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div>
                            {timetable.name} - Grade {timetable.grade} ({timetable.term})
                            <div className="text-sm font-normal text-muted-foreground mt-1">
                              Created: {timetable.createdAt.toLocaleDateString()}
                              {timetable.updatedAt !== timetable.createdAt && 
                                ` • Updated: ${timetable.updatedAt.toLocaleDateString()}`
                              }
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedTimetable(timetable)}
                            >
                              <EditIcon className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => exportTimetableToPDF(timetable)}
                            >
                              <DownloadIcon className="h-4 w-4 mr-2" />
                              Export PDF
                            </Button>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {getTimetableGrid(timetable)}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Class Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {classes.map((cls) => (
                  <Card key={cls.id} className="border">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div>
                          {cls.name}
                          <div className="text-sm font-normal text-muted-foreground">
                            Room {cls.room}
                          </div>
                        </div>
                        <Badge variant="outline">
                          {cls.learners.length}/{cls.capacity}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPinIcon className="h-4 w-4 mr-2" />
                          {cls.room}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <UsersIcon className="h-4 w-4 mr-2" />
                          {cls.learners.length} learners enrolled
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          Manage Learners
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teachers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Teacher Subject Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teachers.map((teacher) => (
                  <Card key={teacher.id} className="border">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div>{teacher.name}</div>
                        <Badge variant="outline">
                          {teacher.subjects.length} subjects
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          <strong>Subjects:</strong> {teacher.subjects.map(subId => 
                            subjects.find(s => s.id === subId)?.name
                          ).join(', ')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <strong>Max Periods:</strong> {teacher.maxPeriods} per week
                        </div>
                        <Button variant="outline" size="sm">
                          Edit Allocation
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Timetable Editor */}
      {selectedTimetable && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div>
                {isCreating ? 'Create New Timetable' : 'Edit Timetable'}
                <div className="text-sm font-normal text-muted-foreground mt-1">
                  {selectedTimetable.name} - Grade {selectedTimetable.grade}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={() => {
                  setIsCreating(false);
                  setSelectedTimetable(null);
                }}>
                  Cancel
                </Button>
                <Button onClick={saveTimetable}>
                  <SaveIcon className="h-4 w-4 mr-2" />
                  Save Timetable
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium">Timetable Name</label>
                  <Input
                    value={selectedTimetable.name}
                    onChange={(e) => setSelectedTimetable(prev => 
                      prev ? { ...prev, name: e.target.value } : null
                    )}
                    placeholder="Enter timetable name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Grade</label>
                  <Select 
                    value={selectedTimetable.grade} 
                    onValueChange={(value) => setSelectedTimetable(prev => 
                      prev ? { ...prev, grade: value } : null
                    )}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9">Grade 9</SelectItem>
                      <SelectItem value="10">Grade 10</SelectItem>
                      <SelectItem value="11">Grade 11</SelectItem>
                      <SelectItem value="12">Grade 12</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Term</label>
                  <Select 
                    value={selectedTimetable.term} 
                    onValueChange={(value) => setSelectedTimetable(prev => 
                      prev ? { ...prev, term: value } : null
                    )}
                  >
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
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Timetable Grid</h3>
                {getTimetableGrid(selectedTimetable)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


