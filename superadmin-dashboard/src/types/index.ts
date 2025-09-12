export interface Institution {
  id: string;
  name: string;
  type: 'Primary' | 'Secondary' | 'Combined';
  district: string;
  address: string;
  registeredOn: string;
  status: 'Active' | 'Suspended' | 'Pending';
  subscriptionPlan: 'Basic' | 'Premium' | 'Enterprise';
  subscriptionStatus: 'Active' | 'Expired' | 'Trial';
  subscriptionEndDate: string;
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  performance: {
    averageScore: number;
    attendanceRate: number;
    completionRate: number;
  };
  lastActivity: string;
}

export interface Subscription {
  id: string;
  institutionId: string;
  institutionName: string;
  plan: 'Basic' | 'Premium' | 'Enterprise';
  status: 'Active' | 'Expired' | 'Trial';
  startDate: string;
  endDate: string;
  amount: number;
  currency: string;
  billingCycle: 'Monthly' | 'Yearly';
  autoRenew: boolean;
}

export interface PerformanceReport {
  id: string;
  institutionId: string;
  institutionName: string;
  period: string;
  metrics: {
    totalStudents: number;
    averageAttendance: number;
    averagePerformance: number;
    completionRate: number;
    satisfactionScore: number;
  };
  trends: {
    attendance: 'increasing' | 'decreasing' | 'stable';
    performance: 'increasing' | 'decreasing' | 'stable';
    engagement: 'increasing' | 'decreasing' | 'stable';
  };
  generatedAt: string;
}

export interface Competition {
  id: string;
  title: string;
  description: string;
  category: 'Academic' | 'Sports' | 'Arts' | 'Technology' | 'General';
  startDate: string;
  endDate: string;
  maxParticipants: number;
  currentParticipants: number;
  status: 'Upcoming' | 'Active' | 'Completed';
  prizes: string[];
  rules: string[];
  participants: Institution[];
  results?: {
    institutionId: string;
    institutionName: string;
    score: number;
    rank: number;
    achievements: string[];
  }[];
  createdAt: string;
  createdBy: string;
}

export interface PlatformStats {
  totalInstitutions: number;
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  activeSubscriptions: number;
  totalRevenue: number;
  averageInstitutionRating: number;
  systemUptime: number;
  lastUpdated: string;
}

export interface RecentActivity {
  id: string;
  type: 'Institution Registration' | 'Subscription Renewal' | 'Performance Update' | 'Competition Entry' | 'System Alert';
  description: string;
  institutionId?: string;
  institutionName?: string;
  timestamp: string;
  severity: 'Info' | 'Warning' | 'Error' | 'Success';
}

export interface SuperadminUser {
  id: string;
  email: string;
  fullName: string;
  role: 'Superadmin' | 'Platform Manager' | 'Support Agent';
  permissions: string[];
  lastLogin: string;
  isActive: boolean;
}
  id: string;
  name: string;
  type: 'Primary' | 'Secondary' | 'Combined';
  district: string;
  address: string;
  registeredOn: string;
  status: 'Active' | 'Suspended' | 'Pending';
  subscriptionPlan: 'Basic' | 'Premium' | 'Enterprise';
  subscriptionStatus: 'Active' | 'Expired' | 'Trial';
  subscriptionEndDate: string;
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  performance: {
    averageScore: number;
    attendanceRate: number;
    completionRate: number;
  };
  lastActivity: string;
}

export interface Subscription {
  id: string;
  institutionId: string;
  institutionName: string;
  plan: 'Basic' | 'Premium' | 'Enterprise';
  status: 'Active' | 'Expired' | 'Trial';
  startDate: string;
  endDate: string;
  amount: number;
  currency: string;
  billingCycle: 'Monthly' | 'Yearly';
  autoRenew: boolean;
}

export interface PerformanceReport {
  id: string;
  institutionId: string;
  institutionName: string;
  period: string;
  metrics: {
    totalStudents: number;
    averageAttendance: number;
    averagePerformance: number;
    completionRate: number;
    satisfactionScore: number;
  };
  trends: {
    attendance: 'increasing' | 'decreasing' | 'stable';
    performance: 'increasing' | 'decreasing' | 'stable';
    engagement: 'increasing' | 'decreasing' | 'stable';
  };
  generatedAt: string;
}

export interface Competition {
  id: string;
  title: string;
  description: string;
  category: 'Academic' | 'Sports' | 'Arts' | 'Technology' | 'General';
  startDate: string;
  endDate: string;
  maxParticipants: number;
  currentParticipants: number;
  status: 'Upcoming' | 'Active' | 'Completed';
  prizes: string[];
  rules: string[];
  participants: Institution[];
  results?: {
    institutionId: string;
    institutionName: string;
    score: number;
    rank: number;
    achievements: string[];
  }[];
  createdAt: string;
  createdBy: string;
}

export interface PlatformStats {
  totalInstitutions: number;
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  activeSubscriptions: number;
  totalRevenue: number;
  averageInstitutionRating: number;
  systemUptime: number;
  lastUpdated: string;
}

export interface RecentActivity {
  id: string;
  type: 'Institution Registration' | 'Subscription Renewal' | 'Performance Update' | 'Competition Entry' | 'System Alert';
  description: string;
  institutionId?: string;
  institutionName?: string;
  timestamp: string;
  severity: 'Info' | 'Warning' | 'Error' | 'Success';
}

export interface SuperadminUser {
  id: string;
  email: string;
  fullName: string;
  role: 'Superadmin' | 'Platform Manager' | 'Support Agent';
  permissions: string[];
  lastLogin: string;
  isActive: boolean;
}
