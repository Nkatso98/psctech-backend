import { useState, useEffect } from 'react';
import { Trophy, Plus, Users, Calendar, Target, MessageSquare } from 'lucide-react';
import { Competition } from '../types';
import { apiClient } from '../lib/api-client';
import { CompetitionRequestManager } from '../components/CompetitionRequestManager';

export default function Competitions() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'competitions' | 'requests'>('competitions');

  useEffect(() => {
    loadCompetitions();
  }, []);

  const loadCompetitions = async () => {
    try {
      setLoading(true);

      // Fetch real data from the main school management project
      const data = await apiClient.getCompetitions();
      setCompetitions(data);
    } catch (error) {
      console.error('Error loading competitions:', error);

      // Fallback to mock data if API fails
      const mockCompetitions: Competition[] = [
        {
          id: '1',
          title: 'Academic Excellence Challenge 2024',
          description: 'A comprehensive academic competition covering Mathematics, Science, and Languages',
          category: 'Academic',
          startDate: '2024-09-15',
          endDate: '2024-10-15',
          maxParticipants: 50,
          currentParticipants: 32,
          status: 'Upcoming',
          prizes: ['1st Place: R50,000', '2nd Place: R30,000', '3rd Place: R20,000'],
          rules: ['Open to all registered schools', 'Maximum 5 students per school', 'Online and offline components'],
          participants: [],
          createdAt: '2024-08-20',
          createdBy: 'Superadmin'
        },
        {
          id: '2',
          title: 'Innovation in Education Awards',
          description: 'Recognizing schools that implement innovative teaching methods and technologies',
          category: 'Technology',
          startDate: '2024-08-01',
          endDate: '2024-11-30',
          maxParticipants: 30,
          currentParticipants: 28,
          status: 'Active',
          prizes: ['Innovation Grant: R100,000', 'Technology Package', 'Recognition Certificate'],
          rules: ['Submit project proposal', 'Implementation timeline', 'Impact assessment'],
          participants: [],
          createdAt: '2024-07-15',
          createdBy: 'Superadmin'
        }
      ];

      setCompetitions(mockCompetitions);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Upcoming':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Upcoming
        </span>;
      case 'Active':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
          Active
        </span>;
      case 'Completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Completed
        </span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {status}
        </span>;
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      'Academic': 'bg-blue-100 text-blue-800',
      'Sports': 'bg-green-100 text-green-800',
      'Arts': 'bg-purple-100 text-purple-800',
      'Technology': 'bg-orange-100 text-orange-800',
      'General': 'bg-gray-100 text-gray-800'
    };

    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[category as keyof typeof colors] || colors.General}`}>
      {category}
    </span>;
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
          <h1 className="text-2xl font-bold text-gray-900">Competitions</h1>
          <p className="text-gray-600">Create and manage platform-wide competitions for schools</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Create Competition
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('competitions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'competitions'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4" />
              <span>Competitions</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'requests'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>Participation Requests</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'competitions' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {competitions.map((competition) => (
            <div key={competition.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{competition.title}</h3>
                  <p className="text-sm text-gray-500">{competition.description}</p>
                </div>
                {getStatusBadge(competition.status)}
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Target className="w-4 h-4 text-gray-400" />
                    <span>{getCategoryBadge(competition.category)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{competition.currentParticipants}/{competition.maxParticipants} participants</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Start: {new Date(competition.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>End: {new Date(competition.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Prizes */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Prizes</h4>
                <div className="space-y-1">
                  {competition.prizes.map((prize, index) => (
                    <div key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span>{prize}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button className="btn-secondary text-sm py-1 px-3">
                  View Details
                </button>
                <button className="btn-primary text-sm py-1 px-3">
                  Manage
                </button>
                <button className="btn-secondary text-sm py-1 px-3">
                  Results
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'requests' && (
        <CompetitionRequestManager />
      )}
    </div>
  );
}




