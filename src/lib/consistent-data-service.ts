import { learnerStore, teacherStore, userStore } from './store';

// Centralized data service to ensure consistency across all pages
export class ConsistentDataService {
  private static instance: ConsistentDataService;
  
  private constructor() {}
  
  public static getInstance(): ConsistentDataService {
    if (!ConsistentDataService.instance) {
      ConsistentDataService.instance = new ConsistentDataService();
    }
    return ConsistentDataService.instance;
  }

  // Get consistent student count
  public getStudentCount(): number {
    return learnerStore.getAll().length;
  }

  // Get consistent teacher count
  public getTeacherCount(): number {
    return teacherStore.getAll().length;
  }

  // Get consistent attendance rate based on student ID
  public getStudentAttendance(studentId: string): number {
    const lastChar = studentId.slice(-1);
    const baseAttendance = 85;
    const variation = parseInt(lastChar) * 3;
    return Math.min(100, Math.max(70, baseAttendance + variation));
  }

  // Get consistent performance score based on student ID
  public getStudentPerformance(studentId: string): number {
    const lastChar = studentId.slice(-1);
    const baseScore = 75;
    const variation = parseInt(lastChar) * 8;
    return Math.min(100, Math.max(50, baseScore + variation));
  }

  // Get consistent teacher performance based on teacher ID
  public getTeacherPerformance(teacherId: string): number {
    const lastChar = teacherId.slice(-1);
    const baseScore = 70;
    const variation = parseInt(lastChar) * 10;
    return Math.min(100, Math.max(50, baseScore + variation));
  }

  // Get consistent class enrollment based on class name
  public getClassEnrollment(className: string): number {
    const studentCount = this.getStudentCount();
    if (studentCount === 0) return 0;
    
    // Distribute students across classes consistently
    const classIndex = className.charCodeAt(className.length - 1) - 65; // A=0, B=1, etc.
    const baseEnrollment = Math.floor(studentCount / 3);
    return Math.max(1, baseEnrollment + (classIndex * 2));
  }

  // Get consistent subject performance
  public getSubjectPerformance(subject: string): number {
    const subjects = ['Mathematics', 'English', 'Science', 'History', 'Geography'];
    const index = subjects.indexOf(subject);
    if (index === -1) return 75;
    
    const baseScore = 75;
    const variation = index * 5;
    return Math.min(95, Math.max(65, baseScore + variation));
  }

  // Get consistent assessment count
  public getAssessmentCount(): number {
    return 5; // Consistent 5 assessments
  }

  // Get consistent meeting attendees
  public getMeetingAttendees(): number {
    const teacherCount = this.getTeacherCount();
    return Math.max(5, Math.floor(teacherCount * 2) + 3);
  }

  // Get consistent document stats
  public getDocumentStats(): { size: number; downloads: number } {
    return {
      size: 2048, // 2MB consistently
      downloads: 150 // 150 downloads consistently
    };
  }

  // Get consistent homework submissions
  public getHomeworkSubmissions(): number {
    const studentCount = this.getStudentCount();
    return Math.max(5, Math.floor(studentCount * 0.8)); // 80% submission rate
  }

  // Get consistent test duration
  public getTestDuration(): number {
    return 45; // 45 minutes consistently
  }

  // Get consistent question count
  public getQuestionCount(): number {
    return 15; // 15 questions consistently
  }

  // Get consistent user names
  public getUserName(userId: string): string {
    const user = userStore.getById(userId);
    return user?.fullName || 'Unknown User';
  }

  // Get consistent teacher subject
  public getTeacherSubject(teacherId: string): string {
    const subjects = ['Mathematics', 'English', 'Science', 'History', 'Geography'];
    const lastChar = teacherId.slice(-1);
    const index = parseInt(lastChar) % subjects.length;
    return subjects[index];
  }

  // Get consistent class schedule
  public getClassSchedule(className: string): string {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const classIndex = className.charCodeAt(className.length - 1) - 65; // A=0, B=1, etc.
    const dayIndex = classIndex % days.length;
    const hour = 8 + (classIndex * 2);
    return `${days[dayIndex]} ${hour}:00`;
  }
}

export const consistentDataService = ConsistentDataService.getInstance();
