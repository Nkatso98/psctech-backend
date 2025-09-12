import { useState, useEffect } from 'react';
import {
  institutionStore,
  userStore,
  learnerStore,
  teacherStore,
  attendanceStore,
  performanceStore
} from '@/lib/store';
import { Institution, User, Teacher, Learner } from '@/lib/types';

// Define combined types for teachers and students with their details
interface TeacherWithDetails extends User, Teacher {}
interface LearnerWithDetails extends User, Learner {}

export function useStore() {
  const [schoolData, setSchoolData] = useState<Institution | null>(null);
  const [teachers, setTeachers] = useState<TeacherWithDetails[]>([]);
  const [students, setStudents] = useState<LearnerWithDetails[]>([]);
  
  useEffect(() => {
    // Get all institutions
    const institutions = institutionStore.getAll();
    if (institutions.length > 0) {
      setSchoolData(institutions[0]);
      
      // Get users
      const users = userStore.getAllByInstitution(institutions[0].institutionId);
      
      // Get teachers
      const teacherUsers = users.filter(user => user.role === 'Teacher');
      const teacherData = teacherUsers.map(teacher => {
        const teacherDetails = teacherStore.getByField('userId', teacher.userId)[0];
        return {
          ...teacher,
          ...teacherDetails
        };
      });
      setTeachers(teacherData);
      
      // Get students
      const studentUsers = users.filter(user => user.role === 'Learner');
      const studentData = studentUsers.map(student => {
        const studentDetails = learnerStore.getByField('userId', student.userId)[0];
        return {
          ...student,
          ...studentDetails
        };
      });
      setStudents(studentData);
    }
  }, []);
  
  return { schoolData, teachers, students };
}