import { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Trophy
} from 'lucide-react';
import { PlatformStats, RecentActivity } from '../types';
import { apiClient } from '../lib/api-client';

export default function Dashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch real data from the main school management project
      const [platformStats, activities] = await Promise.all([
        apiClient.getPlatformStats(),
        apiClient.getRecentActivities()
      ]);

      setStats(platformStats);
      setRecentActivities(activities);
    } catch (error) {
      console.error('Error loading dashboard data:', error);

      // Fallback to mock data if API fails
      const mockStats: PlatformStats = {
        totalInstitutions: 156,
        totalUsers: 2847,
        totalStudents: 1892,
        totalTeachers: 423,
        totalParents: 532,
        activeSubscriptions: 142,
        totalRevenue: 284700,
        averageInstitutionRating: 4.6,
        systemUptime: 99.8,
        lastUpdated: new Date().toISOString()
      };

      const mockActivities: RecentActivity[] = [
        {
          id: '1',
          type: 'Institution Registration',
          description: 'New school "St. Mary\'s Academy" registered',
          institutionName: 'St. Mary\'s Academy',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          severity: 'Success'
        },
        {
          id: '2',
          type: 'Subscription Renewal',
          description: 'Premium subscription renewed for "City High School"',
          institutionName: 'City High School',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          severity: 'Info'
        },
        {
          id: '3',
          type: 'Performance Update',
          description: 'Monthly performance report generated for 45 schools',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          severity: 'Info'
        },
        {
          id: '4',
          type: 'System Alert',
          description: 'Database backup completed successfully',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          severity: 'Success'
        }
      ];

      setStats(mockStats);
      setRecentActivities(mockActivities);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Success':
        return <CheckCircle className="w-5 h-5 text-success-600" />;
      case 'Warning':
        return <AlertCircle className="w-5 h-5 text-warning-600" />;
      case 'Error':
        return <AlertCircle className="w-5 h-5 text-danger-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
        <p className="text-gray-600">Monitor the overall health and performance of the PSC Tech platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Institutions</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.totalInstitutions}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-success-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-warning-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Subscriptions</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.activeSubscriptions}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-info-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-info-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats?.totalRevenue || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Distribution</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Students</span>
              <span className="text-sm font-medium text-gray-900">{stats?.totalStudents}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Teachers</span>
              <span className="text-sm font-medium text-gray-900">{stats?.totalTeachers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Parents</span>
              <span className="text-sm font-medium text-gray-900">{stats?.totalParents}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Health</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">System Uptime</span>
              <span className="text-sm font-medium text-success-600">{stats?.systemUptime}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Average Rating</span>
              <span className="text-sm font-medium text-warning-600">{stats?.averageInstitutionRating}/5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Last Updated</span>
              <span className="text-sm font-medium text-gray-900">
                {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-3">
            {recentActivities.slice(0, 3).map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                {getSeverityIcon(activity.severity)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.type}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-primary">
            <Building2 className="w-4 h-4 mr-2" />
            Add New Institution
          </button>
          <button className="btn-secondary">
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </button>
          <button className="btn-secondary">
            <Trophy className="w-4 h-4 mr-2" />
            Create Competition
          </button>
        </div>
      </div>
    </div>
  );
}




