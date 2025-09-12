"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompetitionRequestManager = CompetitionRequestManager;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var api_client_1 = require("../lib/api-client");
function CompetitionRequestManager() {
    var _this = this;
    var _a = (0, react_1.useState)([]), requests = _a[0], setRequests = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(null), selectedRequest = _c[0], setSelectedRequest = _c[1];
    var _d = (0, react_1.useState)(false), showDetails = _d[0], setShowDetails = _d[1];
    var _e = (0, react_1.useState)(''), responseComments = _e[0], setResponseComments = _e[1];
    (0, react_1.useEffect)(function () {
        loadCompetitionRequests();
    }, []);
    var loadCompetitionRequests = function () { return __awaiter(_this, void 0, void 0, function () {
        var mockRequests;
        return __generator(this, function (_a) {
            try {
                setLoading(true);
                mockRequests = [
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
            }
            catch (error) {
                console.error('Error loading competition requests:', error);
            }
            finally {
                setLoading(false);
            }
            return [2 /*return*/];
        });
    }); };
    var handleApprove = function (requestId) { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, api_client_1.apiClient.approveCompetitionRequest(requestId, true, responseComments)];
                case 1:
                    _a.sent();
                    // Update local state
                    setRequests(function (prev) { return prev.map(function (req) {
                        return req.id === requestId
                            ? __assign(__assign({}, req), { status: 'Approved', responseDate: new Date().toISOString(), responseComments: responseComments }) : req;
                    }); });
                    setShowDetails(false);
                    setResponseComments('');
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error approving request:', error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleReject = function (requestId) { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, api_client_1.apiClient.approveCompetitionRequest(requestId, false, responseComments)];
                case 1:
                    _a.sent();
                    // Update local state
                    setRequests(function (prev) { return prev.map(function (req) {
                        return req.id === requestId
                            ? __assign(__assign({}, req), { status: 'Rejected', responseDate: new Date().toISOString(), responseComments: responseComments }) : req;
                    }); });
                    setShowDetails(false);
                    setResponseComments('');
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error rejecting request:', error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var getStatusBadge = function (status) {
        switch (status) {
            case 'Approved':
                return (<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
            <lucide_react_1.CheckCircle className="w-3 h-3 mr-1"/>
            Approved
          </span>);
            case 'Rejected':
                return (<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger-100 text-danger-800">
            <lucide_react_1.XCircle className="w-3 h-3 mr-1"/>
            Rejected
          </span>);
            default:
                return (<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
            <lucide_react_1.Clock className="w-3 h-3 mr-1"/>
            Pending
          </span>);
        }
    };
    if (loading) {
        return (<div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>);
    }
    return (<div className="space-y-6">
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
              {requests.map(function (request) { return (<tr key={request.id} className="hover:bg-gray-50">
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
                      <button onClick={function () {
                setSelectedRequest(request);
                setShowDetails(true);
            }} className="text-primary-600 hover:text-primary-900">
                        <lucide_react_1.Eye className="w-4 h-4"/>
                      </button>
                      {request.status === 'Pending' && (<>
                          <button onClick={function () {
                    setSelectedRequest(request);
                    setShowDetails(true);
                }} className="text-success-600 hover:text-success-900">
                            <lucide_react_1.CheckCircle className="w-4 h-4"/>
                          </button>
                          <button onClick={function () {
                    setSelectedRequest(request);
                    setShowDetails(true);
                }} className="text-danger-600 hover:text-danger-900">
                            <lucide_react_1.XCircle className="w-4 h-4"/>
                          </button>
                        </>)}
                    </div>
                  </td>
                </tr>); })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Details Modal */}
      {showDetails && selectedRequest && (<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Competition Request Details</h3>
                <button onClick={function () { return setShowDetails(false); }} className="text-gray-400 hover:text-gray-600">
                  <lucide_react_1.XCircle className="w-6 h-6"/>
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

                {selectedRequest.status !== 'Pending' && (<div>
                    <h4 className="text-sm font-medium text-gray-700">Response</h4>
                    <p className="text-sm text-gray-900">{selectedRequest.responseComments}</p>
                    <p className="text-sm text-gray-500">
                      {selectedRequest.responseDate &&
                    "Responded on: ".concat(new Date(selectedRequest.responseDate).toLocaleString())}
                    </p>
                  </div>)}

                {selectedRequest.status === 'Pending' && (<div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Response Comments</h4>
                    <textarea value={responseComments} onChange={function (e) { return setResponseComments(e.target.value); }} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" rows={3} placeholder="Add your response comments..."/>
                  </div>)}
              </div>

              {selectedRequest.status === 'Pending' && (<div className="flex justify-end space-x-3 mt-6">
                  <button onClick={function () { return handleReject(selectedRequest.id); }} className="px-4 py-2 bg-danger-600 text-white rounded-md hover:bg-danger-700 focus:outline-none focus:ring-2 focus:ring-danger-500">
                    Reject
                  </button>
                  <button onClick={function () { return handleApprove(selectedRequest.id); }} className="px-4 py-2 bg-success-600 text-white rounded-md hover:bg-success-700 focus:outline-none focus:ring-2 focus:ring-success-500">
                    Approve
                  </button>
                </div>)}
            </div>
          </div>
        </div>)}
    </div>);
}
