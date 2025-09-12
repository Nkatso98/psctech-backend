// Core type definitions for PSC Tech School Management System

export type SchoolType = 'Primary' | 'Secondary' | 'Combined';
export type UserRole = 'Superadmin' | 'Principal' | 'Teacher' | 'Parent' | 'Learner' | 'SGB';
export type SubscriptionStatus = 'Active' | 'Expired' | 'None';
export type QuestionType = 'MultipleChoice' | 'TrueFalse' | 'ShortAnswer';
export type TestStatus = 'Pending' | 'Active' | 'Completed';

export interface Institution {
  institutionId: string;
  name: string;
  type: SchoolType;
  district: string;
  address: string;
  registeredOn: string; // ISO date string
}

export interface User {
  userId: string;
  institutionId: string;
  role: UserRole;
  fullName: string;
  username: string;
  passwordHash: string; // In a real app, passwords would never be stored in frontend
  linkedIdNumber: string;
  status: 'Active' | 'Inactive';
  email?: string; // Added email field for verification
}

export interface Learner {
  learnerId: string;
  userId: string;
  institutionId: string;
  grade: number;
  class: string;
  parentUserId: string;
  dateOfBirth: string; // ISO date string
  subscriptionStatus?: SubscriptionStatus;
  subscriptionEndDate?: string; // ISO date string
}

export interface Teacher {
  teacherId: string;
  userId: string;
  institutionId: string;
  subject: string;
  grade: number;
  class: string;
  companyNumber: string;
}

export interface Attendance {
  attendanceId: string;
  learnerId: string;
  teacherId: string;
  date: string; // ISO date string
  period: string;
  status: 'Present' | 'Absent';
}

export interface Performance {
  performanceId: string;
  learnerId: string;
  subject: string;
  term: string;
  mark: number;
  comment: string;
  dateEntered: string; // ISO date string
}

export interface Timetable {
  timetableId: string;
  institutionId: string;
  role: UserRole;
  grade: number;
  class: string;
  dayOfWeek: string;
  period: string;
  subject: string;
}

export interface Homework {
  homeworkId: string;
  subject: string;
  grade: number;
  class: string;
  description: string;
  dueDate: string; // ISO date string
  uploadedBy: string; // teacherId
}

export interface Announcement {
  announcementId: string;
  institutionId: string;
  title: string;
  body: string;
  targetRole: UserRole | 'All';
  datePosted: string; // ISO date string
}

export interface SGBMember {
  sgbId: string;
  userId: string;
  institutionId: string;
  title: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
}

export interface Subscription {
  subscriptionId: string;
  learnerId: string;
  parentUserId: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  status: SubscriptionStatus;
  amountPaid: number; // in Rands
}

export interface Voucher {
  voucherId: string;
  code: string;
  credits: number;
  isRedeemed: boolean;
  redeemedBy?: string; // userId
  redeemedOn?: string; // ISO date string
}

export interface Question {
  questionId: string;
  content: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface AITest {
  testId: string;
  teacherId: string;
  institutionId: string;
  subject: string;
  topic: string;
  grade: number;
  class: string;
  questions: Question[];
  createdAt: string; // ISO date string
  scheduledFor?: string; // ISO date string
  duration: number; // in minutes
  status: TestStatus;
}

export interface TestSession {
  sessionId: string;
  testId: string;
  startedAt: string; // ISO date string
  endedAt?: string; // ISO date string
  participants: string[]; // learnerIds
  isActive: boolean;
  messages: TestMessage[];
}

export interface TestMessage {
  messageId: string;
  senderId: string; // userId or 'AI' for system messages
  senderName: string; // fullName or 'AI Assistant'
  content: string;
  timestamp: string; // ISO date string
  type: 'Question' | 'Answer' | 'Info' | 'Result';
  questionId?: string; // Reference to the question being answered
  isCorrect?: boolean; // For answer messages
}

export interface TestResult {
  resultId: string;
  sessionId: string;
  learnerId: string;
  testId: string;
  score: number;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  completedAt: string; // ISO date string
}

export interface AuthContextType {
  user: User | null;
  institution: Institution | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}