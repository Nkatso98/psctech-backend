// API Configuration for PSC Tech Backend
// Normalize base URL: allow VITE_API_URL to be either the root or root + "/api"
const RAW_BASE = ((import.meta as any).env?.VITE_API_URL as string | undefined) ?? 'https://psctech-backend.onrender.com/api';
// Strip a trailing "/api" (with optional trailing slash) so endpoints like "/api/..." concatenate correctly
const NORMALIZED_BASE = RAW_BASE.replace(/\/?api\/?$/, '');

export const API_CONFIG = {
  // Backend base URL without trailing "/api"
  BASE_URL: NORMALIZED_BASE,
  
  // API Endpoints
  ENDPOINTS: {
    // Health & Status
    HEALTH: '/health',
    API_HEALTH: '/api/health',
    
    // Subscription Management
    SUBSCRIPTION: {
      BASE: '/api/subscription',
      PLANS: '/api/subscription/plans',
      INSTITUTION: (code: string) => `/api/subscription/institution/${code}`,
      BILLING: (code: string) => `/api/subscription/billing/${code}`,
      ANALYTICS: (code: string) => `/api/subscription/analytics/${code}`,
      UPGRADE: '/api/subscription/upgrade',
      CANCEL: '/api/subscription/cancel'
    },
    
    // Multi-tenant Management
    INSTITUTIONS: '/api/institutions',
    INSTITUTION: (id: string) => `/api/institutions/${id}`,
    INSTITUTION_REGISTER: '/api/institution/register',
    
    // User Management
    USERS: '/api/users',
    USER: (id: string) => `/api/users/${id}`,
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      REFRESH: '/api/auth/refresh',
      LOGOUT: '/api/auth/logout'
    },
    
    // Voucher System
    VOUCHERS: '/api/vouchers',
    VOUCHER: (id: string) => `/api/vouchers/${id}`,
    VOUCHER_REDEEM: (id: string) => `/api/vouchers/${id}/redeem`,
    
    // Student Management
    STUDENTS: '/api/students',
    STUDENT: (id: string) => `/api/students/${id}`,
    
    // Teacher Management
    TEACHERS: '/api/teachers',
    TEACHER: (id: string) => `/api/teachers/${id}`,
    
    // Competition Management
    COMPETITIONS: '/api/competitions',
    COMPETITION: (id: string) => `/api/competitions/${id}`
  }
};

// API Service Class
export class ApiService {
  private baseUrl: string;
  
  constructor(baseUrl: string = API_CONFIG.BASE_URL) {
    this.baseUrl = baseUrl;
  }
  
  // Generic GET request
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
  
  // Generic POST request
  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
  
  // Generic PUT request
  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
  
  // Generic DELETE request
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
  
  // Health check
  async healthCheck(): Promise<{ status: string }> {
    return this.get<{ status: string }>(API_CONFIG.ENDPOINTS.HEALTH);
  }
  
  // API health check
  async apiHealthCheck(): Promise<any> {
    return this.get(API_CONFIG.ENDPOINTS.API_HEALTH);
  }
  
  // Get subscription plans
  async getSubscriptionPlans(): Promise<any[]> {
    return this.get<any[]>(API_CONFIG.ENDPOINTS.SUBSCRIPTION.PLANS);
  }
  
  // Get institution subscription
  async getInstitutionSubscription(institutionCode: string): Promise<any> {
    return this.get(API_CONFIG.ENDPOINTS.SUBSCRIPTION.INSTITUTION(institutionCode));
  }
  
  // Upgrade subscription
  async upgradeSubscription(institutionCode: string, newPlan: string): Promise<any> {
    return this.post(API_CONFIG.ENDPOINTS.SUBSCRIPTION.UPGRADE, {
      institutionCode,
      newPlan
    });
  }
}

// Create default API service instance
export const apiService = new ApiService();

// Export types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: string;
  features: string[];
  limits: {
    maxStudents: number;
    maxTeachers: number;
    maxVouchersPerMonth: number;
    storageGB: number;
  };
}

export interface InstitutionSubscription {
  institutionCode: string;
  institutionName: string;
  currentPlan: string;
  status: string;
  startDate: string;
  expiryDate: string;
  autoRenew: boolean;
  billingCycle: string;
  nextBillingDate: string;
  usage: {
    currentStudents: number;
    currentTeachers: number;
    vouchersThisMonth: number;
    storageUsedGB: number;
    lastUpdated: string;
  };
}
