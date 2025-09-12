import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { apiClient } from '../lib/api-client';

interface CompetitionRequest {
  id: string;
  competitionId: string;
  competitionTitle: string;
  institutionId: string;
  institutionName: string;
  principalName: string;
  principalEmail: string;
  requestDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  comments?: string;
  responseDate?: string;
  responseComments?: string;
}

export function CompetitionRequestManager() {
  const [requests, setRequests] = useState<CompetitionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<CompetitionRequest | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [responseComments, setResponseComments] = useState('');

  useEffect(() => {
    loadCompetitionRequests();
  }, []);

  const loadCompetitionRequests = async () => {
    try {
      setLoading(true);
      // For now, using mock data until API is connected
      const mockRequests: CompetitionRequest[] = [
        {
          id: '1',
          competitionId: '1',
          competitionTitle: 'Academic Excellence Challenge 2024',
          institutionId: '1',
          institutionName: 'St. Mary\'s Academy',
          principalName: 'Dr. Sarah Johnson',
          principalEmail: 'principal@stmarys.edu.za',
          requestDate: '2024-08-25T10:30:00Z',
          status: 'Pending',
          comments: 'Our school would like to participate in this competition. We have 5 students who are very interested in the academic challenge.'
        },
        {
          id: '2',
          competitionId: '2',
          competitionTitle: 'Innovation in Education Awards',
          institutionId: '2',
          institutionName: 'City High School',
          principalName: 'Mr. David Wilson',
          principalEmail: 'principal@cityhigh.edu.za',
          requestDate: '2024-08-24T14:15:00Z',
          status: 'Approved',
          comments: 'We have an innovative project on sustainable energy that we believe would be perfect for this competition.',
          responseDate: '2024-08-26T09:00:00Z',
          responseComments: 'Approved! Your project sounds very interesting. Looking forward to seeing your submission.'
        },
        {
          id: '3',
          competitionId: '1',
          competitionTitle: 'Academic Excellence Challenge 2024',
          institutionId: '3',
          institutionName: 'Sunrise Primary School',
          principalName: 'Mrs. Lisa Thompson',
          principalEmail: 'principal@sunrise.edu.za',
          requestDate: '2024-08-23T16:45:00Z',
          status: 'Rejected',
          comments: 'We would like to participate but we are concerned about the age requirements for our students.',
          responseDate: '2024-08-25T11:30:00Z',
          responseComments: 'Unfortunately, this competition is designed for secondary school students. We will have primary school competitions available soon.'
        }
      ];
      setRequests(mockRequests);
    } catch (error) {
      console.error('Error loading competition requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      await apiClient.approveCompetitionRequest(requestId, true, responseComments);
      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'Approved', responseDate: new Date().toISOString(), responseComments }
          : req
      ));
      setShowDetails(false);
      setResponseComments('');
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await apiClient.approveCompetitionRequest(requestId, false, responseComments);
      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'Rejected', responseDate: new Date().toISOString(), responseComments }
          : req
      ));
      setShowDetails(false);
      setResponseComments('');
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger-100 text-danger-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
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
        <h2 className="text-xl font-semibold text-gray-900">Competition Requests</h2>
        <p className="text-gray-600">Review and manage competition participation requests from schools</p>
      </div>

      {/* Requests Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Institution
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Competition
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Principal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{request.institutionName}</div>
                      <div className="text-sm text-gray-500">{request.principalName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{request.competitionTitle}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{request.principalName}</div>
                    <div className="text-sm text-gray-500">{request.principalEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(request.requestDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(request.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDetails(true);
                        }}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {request.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowDetails(true);
                            }}
                            className="text-success-600 hover:text-success-900"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowDetails(true);
                            }}
                            className="text-danger-600 hover:text-danger-900"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Details Modal */}
      {showDetails && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Competition Request Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Institution</h4>
                  <p className="text-sm text-gray-900">{selectedRequest.institutionName}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700">Competition</h4>
                  <p className="text-sm text-gray-900">{selectedRequest.competitionTitle}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700">Principal</h4>
                  <p className="text-sm text-gray-900">{selectedRequest.principalName}</p>
                  <p className="text-sm text-gray-500">{selectedRequest.principalEmail}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700">Request Date</h4>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedRequest.requestDate).toLocaleString()}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700">Comments</h4>
                  <p className="text-sm text-gray-900">{selectedRequest.comments}</p>
                </div>

                {selectedRequest.status !== 'Pending' && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Response</h4>
                    <p className="text-sm text-gray-900">{selectedRequest.responseComments}</p>
                    <p className="text-sm text-gray-500">
                      {selectedRequest.responseDate && 
                        `Responded on: ${new Date(selectedRequest.responseDate).toLocaleString()}`
                      }
                    </p>
                  </div>
                )}

                {selectedRequest.status === 'Pending' && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Response Comments</h4>
                    <textarea
                      value={responseComments}
                      onChange={(e) => setResponseComments(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      rows={3}
                      placeholder="Add your response comments..."
                    />
                  </div>
                )}
              </div>

              {selectedRequest.status === 'Pending' && (
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => handleReject(selectedRequest.id)}
                    className="px-4 py-2 bg-danger-600 text-white rounded-md hover:bg-danger-700 focus:outline-none focus:ring-2 focus:ring-danger-500"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(selectedRequest.id)}
                    className="px-4 py-2 bg-success-600 text-white rounded-md hover:bg-success-700 focus:outline-none focus:ring-2 focus:ring-success-500"
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




