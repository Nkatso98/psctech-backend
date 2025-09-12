/**
 * API Client for PSC Tech School Management Portal
 * This module handles communication with the backend API
 */
import { User, Institution, Learner, Subscription, Test, TestSession, TestResult } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

type ApiHeaders = {
  'Content-Type': string;
  Authorization?: string;
};

/**
 * Get authentication token from local storage
 */
const getToken = (): string | null => {
  return localStorage.getItem('authToken');
};

/**
 * Create headers for API requests
 */
const createHeaders = (): ApiHeaders => {
  const headers: ApiHeaders = {
    'Content-Type': 'application/json',
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Handle API response and extract data
 */
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error: ${response.status}`);
  }
  return response.json();
};

/**
 * PSC Tech API Client
 */
export const apiClient = {
  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  // Learner Authentication
  async learnerLogin(username: string, password: string): Promise<{ user: any; token: string }> {
    const response = await fetch(`${API_URL}/auth/learner-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse(response);
  },

  // Users
  async getUsers(): Promise<User[]> {
    const response = await fetch(`${API_URL}/users`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  async getUserById(id: string): Promise<User> {
    const response = await fetch(`${API_URL}/users/${id}`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  // Institutions (Legacy)
  async getInstitutionsLegacy(): Promise<Institution[]> {
    const response = await fetch(`${API_URL}/institutions`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  async getInstitutionById(id: string): Promise<Institution> {
    const response = await fetch(`${API_URL}/institutions/${id}`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  // Learners
  async getLearnersByParentId(parentId: string): Promise<Learner[]> {
    const response = await fetch(`${API_URL}/learners?parentId=${parentId}`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  // Subscriptions
  async createSubscription(subscription: Partial<Subscription>): Promise<Subscription> {
    const response = await fetch(`${API_URL}/subscriptions`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(subscription),
    });
    return handleResponse(response);
  },

  async getSubscriptionsByLearnerId(learnerId: string): Promise<Subscription[]> {
    const response = await fetch(`${API_URL}/subscriptions?learnerId=${learnerId}`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  // Vouchers
  async redeemVoucher(code: string, userId: string): Promise<{ success: boolean; credits: number }> {
    const response = await fetch(`${API_URL}/vouchers/redeem`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ code, userId }),
    });
    return handleResponse(response);
  },

  // AI Test Generation
  async generateTest(
    subject: string,
    grade: string,
    topics: string[],
    numberOfQuestions: number
  ): Promise<Test> {
    const response = await fetch(`${API_URL}/ai/generate-test`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ subject, grade, topics, numberOfQuestions }),
    });
    return handleResponse(response);
  },

  async createTestSession(testSession: Partial<TestSession>): Promise<TestSession> {
    const response = await fetch(`${API_URL}/test-sessions`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(testSession),
    });
    return handleResponse(response);
  },

  async updateTestSession(id: string, updates: Partial<TestSession>): Promise<TestSession> {
    const response = await fetch(`${API_URL}/test-sessions/${id}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  },

  async submitTestAnswers(
    sessionId: string,
    answers: Record<string, string>
  ): Promise<TestResult> {
    const response = await fetch(`${API_URL}/test-sessions/${sessionId}/submit`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ answers }),
    });
    return handleResponse(response);
  },

  async getTestResultsByLearnerId(learnerId: string): Promise<TestResult[]> {
    const response = await fetch(`${API_URL}/test-results?learnerId=${learnerId}`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },
  
  // Health check
  async healthCheck(): Promise<{ status: string }> {
    const response = await fetch(`${API_URL}/health`);
    return handleResponse(response);
  },

  // Teacher Management APIs
  async getTeachers(): Promise<any[]> {
    const response = await fetch(`${API_URL}/principal/teachers`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  // Student/Learner Management APIs
  async getStudents(): Promise<any[]> {
    const response = await fetch(`${API_URL}/principal/students`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  async createStudent(studentData: any): Promise<any> {
    const response = await fetch(`${API_URL}/principal/students`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(studentData),
    });
    return handleResponse(response);
  },

  // Homework Management APIs
  async getHomeworkByClass(className: string): Promise<any[]> {
    const response = await fetch(`${API_URL}/principal/homework/${className}`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  async createHomework(homeworkData: any): Promise<any> {
    const response = await fetch(`${API_URL}/principal/homework`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(homeworkData),
    });
    return handleResponse(response);
  },

  // AI Test Generation APIs
  async getAITestsByClassSubject(className: string, subject: string): Promise<any[]> {
    const response = await fetch(`${API_URL}/principal/ai-tests/${className}/${subject}`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  async generateAITest(testData: any): Promise<any> {
    const response = await fetch(`${API_URL}/principal/ai-tests/generate`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(testData),
    });
    return handleResponse(response);
  },

  async createTeacher(teacherData: any): Promise<any> {
    const response = await fetch(`${API_URL}/principal/teachers`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(teacherData),
    });
    return handleResponse(response);
  },

  async getClassAllocations(): Promise<any[]> {
    const response = await fetch(`${API_URL}/principal/class-allocations`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  async updateClassAllocation(id: string, allocationData: any): Promise<any> {
    const response = await fetch(`${API_URL}/principal/class-allocations/${id}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(allocationData),
    });
    return handleResponse(response);
  },

  async getAttendanceData(params?: any): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    const response = await fetch(`${API_URL}/principal/attendance${queryString}`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  async getSpecificClassAttendance(className: string, subject: string, period: string, date?: string): Promise<any> {
    const queryString = date ? `?date=${date}` : '';
    const response = await fetch(`${API_URL}/principal/attendance/${className}/${subject}/${period}${queryString}`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  // Teacher Attendance APIs
  async getTeacherClasses(): Promise<any[]> {
    const response = await fetch(`${API_URL}/teacher/my-classes`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  async getAttendanceForm(classId: string, date?: string): Promise<any> {
    const queryString = date ? `?date=${date}` : '';
    const response = await fetch(`${API_URL}/teacher/attendance/${classId}${queryString}`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  async markAttendance(attendanceData: any): Promise<any> {
    const response = await fetch(`${API_URL}/teacher/attendance`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(attendanceData),
    });
    return handleResponse(response);
  },

  async updateAttendance(id: string, attendanceData: any): Promise<any> {
    const response = await fetch(`${API_URL}/teacher/attendance/${id}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(attendanceData),
    });
    return handleResponse(response);
  },

  async getAttendanceHistory(params?: any): Promise<any[]> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    const response = await fetch(`${API_URL}/teacher/attendance-history${queryString}`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  // Superadmin APIs
  async getInstitutions(): Promise<any[]> {
    const response = await fetch(`${API_URL}/superadmin/institutions`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  async updateInstitutionStatus(id: string, status: string, reason?: string): Promise<any> {
    const response = await fetch(`${API_URL}/superadmin/institutions/${id}/status`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify({ status, reason }),
    });
    return handleResponse(response);
  },

  async getPlatformStats(): Promise<any> {
    const response = await fetch(`${API_URL}/superadmin/platform-stats`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  async getRecentActivities(): Promise<any[]> {
    const response = await fetch(`${API_URL}/superadmin/recent-activities`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  // Learner Dashboard APIs
  async getLearnerHomework(learnerId: string): Promise<any[]> {
    const response = await fetch(`${API_URL}/learner/homework/${learnerId}`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  async getLearnerAITests(learnerId: string, subject?: string): Promise<any[]> {
    const queryString = subject ? `?subject=${subject}` : '';
    const response = await fetch(`${API_URL}/learner/ai-tests/${learnerId}${queryString}`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  async submitAITest(testId: string, answers: any): Promise<any> {
    const response = await fetch(`${API_URL}/learner/ai-tests/${testId}/submit`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ answers }),
    });
    return handleResponse(response);
  },

  async getLearnerPerformance(learnerId: string): Promise<any> {
    const response = await fetch(`${API_URL}/learner/performance/${learnerId}`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  }
};

export default apiClient;