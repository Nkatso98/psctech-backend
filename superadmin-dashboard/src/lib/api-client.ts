import { Institution, Subscription, PerformanceReport, Competition, PlatformStats, RecentActivity } from '../types';

// Base URL for the main school management project
const BASE_URL = 'http://localhost:3000'; // Adjust this to match your main project's API endpoint

// Generic API client
class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Institution Management
  async getInstitutions(): Promise<Institution[]> {
    return this.request<Institution[]>('/api/institutions');
  }

  async getInstitutionById(id: string): Promise<Institution> {
    return this.request<Institution>(`/api/institutions/${id}`);
  }

  async updateInstitutionStatus(id: string, status: 'Active' | 'Suspended' | 'Pending'): Promise<void> {
    return this.request<void>(`/api/institutions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Subscription Management
  async getSubscriptions(): Promise<Subscription[]> {
    return this.request<Subscription[]>('/api/institutions/subscriptions/all');
  }

  async getSubscriptionsByInstitution(institutionId: string): Promise<Subscription[]> {
    return this.request<Subscription[]>(`/api/institutions/${institutionId}/subscriptions`);
  }

  async updateSubscription(id: string, updates: Partial<Subscription>): Promise<void> {
    return this.request<void>(`/api/institutions/subscriptions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Performance Reports
  async getPerformanceReports(): Promise<PerformanceReport[]> {
    return this.request<PerformanceReport[]>('/api/performance-reports');
  }

  async generatePerformanceReport(institutionId: string, period: string): Promise<PerformanceReport> {
    return this.request<PerformanceReport>('/api/performance-reports/generate', {
      method: 'POST',
      body: JSON.stringify({ institutionId, period }),
    });
  }

  // Competition Management
  async getCompetitions(): Promise<Competition[]> {
    return this.request<Competition[]>('/api/competitions');
  }

  async createCompetition(competition: Omit<Competition, 'id' | 'createdAt' | 'createdBy'>): Promise<Competition> {
    return this.request<Competition>('/api/competitions', {
      method: 'POST',
      body: JSON.stringify(competition),
    });
  }

  async updateCompetition(id: string, updates: Partial<Competition>): Promise<void> {
    return this.request<void>(`/api/competitions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteCompetition(id: string): Promise<void> {
    return this.request<void>(`/api/competitions/${id}`, {
      method: 'DELETE',
    });
  }

  // Competition Requests
  async getCompetitionRequests(): Promise<any[]> {
    return this.request<any[]>('/api/competitions/requests/all');
  }

  async approveCompetitionRequest(requestId: string, approved: boolean, comments?: string): Promise<void> {
    return this.request<void>(`/api/competitions/requests/${requestId}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ approved, comments }),
    });
  }

  // Platform Statistics
  async getPlatformStats(): Promise<PlatformStats> {
    return this.request<PlatformStats>('/api/platform-stats');
  }

  async getRecentActivities(): Promise<RecentActivity[]> {
    return this.request<RecentActivity[]>('/api/recent-activities');
  }

  // User Management
  async getUsersByInstitution(institutionId: string): Promise<any[]> {
    return this.request<any[]>(`/api/institutions/${institutionId}/users`);
  }

  async getUserStats(): Promise<{ totalStudents: number; totalTeachers: number; totalParents: number }> {
    return this.request<{ totalStudents: number; totalTeachers: number; totalParents: number }>('/api/institutions/stats/users');
  }
}

export const apiClient = new ApiClient();
export default apiClient;




