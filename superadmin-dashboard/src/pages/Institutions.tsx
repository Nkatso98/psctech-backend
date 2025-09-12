import { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { Institution } from '../types';
import { apiClient } from '../lib/api-client';

export default function Institutions() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    loadInstitutions();
  }, []);

  const loadInstitutions = async () => {
    try {
      setLoading(true);

      // Fetch real data from the main school management project
      const data = await apiClient.getInstitutions();
      setInstitutions(data);
    } catch (error) {
      console.error('Error loading institutions:', error);

      // Fallback to mock data if API fails
      const mockInstitutions: Institution[] = [
        {
          id: '1',
          name: 'St. Mary\'s Academy',
          type: 'Secondary',
          district: 'Johannesburg Central',
          address: '123 Main Street, Johannesburg',
          registeredOn: '2024-01-15',
          status: 'Active',
          subscriptionPlan: 'Premium',
          subscriptionStatus: 'Active',
          subscriptionEndDate: '2025-01-15',
          totalStudents: 450,
          totalTeachers: 35,
          totalParents: 420,
          performance: {
            averageScore: 78.5,
            attendanceRate: 94.2,
            completionRate: 89.1
          },
          lastActivity: '2024-08-27T10:30:00Z'
        },
        {
          id: '2',
          name: 'City High School',
          type: 'Secondary',
          district: 'Cape Town Central',
          address: '456 Oak Avenue, Cape Town',
          registeredOn: '2024-02-20',
          status: 'Active',
          subscriptionPlan: 'Enterprise',
          subscriptionStatus: 'Active',
          subscriptionEndDate: '2025-02-20',
          totalStudents: 320,
          totalTeachers: 28,
          totalParents: 300,
          performance: {
            averageScore: 82.1,
            attendanceRate: 96.8,
            completionRate: 92.3
          },
          lastActivity: '2024-08-27T09:15:00Z'
        },
        {
          id: '3',
          name: 'Sunrise Primary School',
          type: 'Primary',
          district: 'Durban North',
          address: '789 Beach Road, Durban',
          registeredOn: '2024-03-10',
          status: 'Pending',
          subscriptionPlan: 'Basic',
          subscriptionStatus: 'Trial',
          subscriptionEndDate: '2024-09-10',
          totalStudents: 180,
          totalTeachers: 15,
          totalParents: 170,
          performance: {
            averageScore: 75.2,
            attendanceRate: 91.5,
            completionRate: 85.7
          },
          lastActivity: '2024-08-26T16:45:00Z'
        }
      ];

      setInstitutions(mockInstitutions);
    } finally {
      setLoading(false);
    }
  };

  

  const filteredInstitutions = institutions.filter(institution => {
    const matchesSearch = institution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          institution.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || institution.status === statusFilter;
    const matchesType = typeFilter === 'all' || institution.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </span>;
      case 'Suspended':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger-100 text-danger-800">
          <XCircle className="w-3 h-3 mr-1" />
          Suspended
        </span>;
      case 'Pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {status}
        </span>;
    }
  };

  const getSubscriptionBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
          Active
        </span>;
      case 'Expired':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger-100 text-danger-800">
          Expired
        </span>;
      case 'Trial':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
          Trial
        </span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {status}
        </span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Institutions</h1>
          <p className="text-gray-600">Manage all registered schools and their status</p>
        </div>
        <button className="btn-primary">
          <Building2 className="w-4 h-4 mr-2" />
          Add Institution
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search institutions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Types</option>
              <option value="Primary">Primary</option>
              <option value="Secondary">Secondary</option>
              <option value="Combined">Combined</option>
            </select>
          </div>
        </div>
      </div>

      {/* Institutions Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Institution
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Activity
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInstitutions.map((institution) => (
                <tr key={institution.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{institution.name}</div>
                      <div className="text-sm text-gray-500">{institution.district}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {institution.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(institution.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{institution.subscriptionPlan}</div>
                      {getSubscriptionBadge(institution.subscriptionStatus)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="space-y-1">
                      <div>Students: {institution.totalStudents}</div>
                      <div>Teachers: {institution.totalTeachers}</div>
                      <div>Parents: {institution.totalParents}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div>Score: {institution.performance.averageScore}%</div>
                      <div>Attendance: {institution.performance.attendanceRate}%</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(institution.lastActivity).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-primary-600 hover:text-primary-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-warning-600 hover:text-warning-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-danger-600 hover:text-danger-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}




