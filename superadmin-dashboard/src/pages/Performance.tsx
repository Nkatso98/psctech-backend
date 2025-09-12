import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Search } from 'lucide-react';
import { PerformanceReport } from '../types';

export default function Performance() {
  const [reports, setReports] = useState<PerformanceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState<string>('all');

  useEffect(() => {
    // Mock data - replace with actual Firebase calls
    const mockReports: PerformanceReport[] = [
      {
        id: '1',
        institutionId: '1',
        institutionName: 'St. Mary\'s Academy',
        period: 'August 2024',
        metrics: {
          totalStudents: 450,
          averageAttendance: 94.2,
          averagePerformance: 78.5,
          completionRate: 89.1,
          satisfactionScore: 4.2
        },
        trends: {
          attendance: 'increasing',
          performance: 'stable',
          engagement: 'increasing'
        },
        generatedAt: '2024-08-27T10:00:00Z'
      },
      {
        id: '2',
        institutionId: '2',
        institutionName: 'City High School',
        period: 'August 2024',
        metrics: {
          totalStudents: 320,
          averageAttendance: 96.8,
          averagePerformance: 82.1,
          completionRate: 92.3,
          satisfactionScore: 4.5
        },
        trends: {
          attendance: 'stable',
          performance: 'increasing',
          engagement: 'stable'
        },
        generatedAt: '2024-08-27T09:30:00Z'
      }
    ];

    setReports(mockReports);
    setLoading(false);
  }, []);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.institutionName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPeriod = periodFilter === 'all' || report.period === periodFilter;
    
    return matchesSearch && matchesPeriod;
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-success-600" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-danger-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Performance Reports</h1>
        <p className="text-gray-600">Monitor institution performance and identify trends</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Periods</option>
              <option value="August 2024">August 2024</option>
              <option value="July 2024">July 2024</option>
              <option value="June 2024">June 2024</option>
            </select>
          </div>
        </div>
      </div>

      {/* Performance Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredReports.map((report) => (
          <div key={report.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{report.institutionName}</h3>
                <p className="text-sm text-gray-500">{report.period}</p>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(report.generatedAt).toLocaleDateString()}
              </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-600">{report.metrics.totalStudents}</div>
                <div className="text-xs text-gray-500">Students</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-success-600">{report.metrics.averageAttendance}%</div>
                <div className="text-xs text-gray-500">Attendance</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-warning-600">{report.metrics.averagePerformance}%</div>
                <div className="text-xs text-gray-500">Performance</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-info-600">{report.metrics.completionRate}%</div>
                <div className="text-xs text-gray-500">Completion</div>
              </div>
            </div>

            {/* Trends */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Trends</h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center space-x-1">
                  {getTrendIcon(report.trends.attendance)}
                  <span>Attendance</span>
                </div>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(report.trends.performance)}
                  <span>Performance</span>
                </div>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(report.trends.engagement)}
                  <span>Engagement</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <button className="btn-secondary text-sm py-1 px-3">
                  View Details
                </button>
                <button className="btn-primary text-sm py-1 px-3">
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}




