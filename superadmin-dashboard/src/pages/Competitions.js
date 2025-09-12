"use strict";
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
exports.default = Competitions;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var api_client_1 = require("../lib/api-client");
var CompetitionRequestManager_1 = require("../components/CompetitionRequestManager");
function Competitions() {
    var _this = this;
    var _a = (0, react_1.useState)([]), competitions = _a[0], setCompetitions = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)('competitions'), activeTab = _c[0], setActiveTab = _c[1];
    (0, react_1.useEffect)(function () {
        loadCompetitions();
    }, []);
    var loadCompetitions = function () { return __awaiter(_this, void 0, void 0, function () {
        var data, error_1, mockCompetitions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    return [4 /*yield*/, api_client_1.apiClient.getCompetitions()];
                case 1:
                    data = _a.sent();
                    setCompetitions(data);
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error loading competitions:', error_1);
                    mockCompetitions = [
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
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var getStatusBadge = function (status) {
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
    var getCategoryBadge = function (category) {
        var colors = {
            'Academic': 'bg-blue-100 text-blue-800',
            'Sports': 'bg-green-100 text-green-800',
            'Arts': 'bg-purple-100 text-purple-800',
            'Technology': 'bg-orange-100 text-orange-800',
            'General': 'bg-gray-100 text-gray-800'
        };
        return <span className={"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ".concat(colors[category] || colors.General)}>
      {category}
    </span>;
    };
    if (loading) {
        return (<div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>);
    }
    return (<div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Competitions</h1>
          <p className="text-gray-600">Create and manage platform-wide competitions for schools</p>
        </div>
        <button className="btn-primary">
          <lucide_react_1.Plus className="w-4 h-4 mr-2"/>
          Create Competition
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button onClick={function () { return setActiveTab('competitions'); }} className={"py-2 px-1 border-b-2 font-medium text-sm ".concat(activeTab === 'competitions'
            ? 'border-primary-500 text-primary-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300')}>
            <div className="flex items-center space-x-2">
              <lucide_react_1.Trophy className="w-4 h-4"/>
              <span>Competitions</span>
            </div>
          </button>
          <button onClick={function () { return setActiveTab('requests'); }} className={"py-2 px-1 border-b-2 font-medium text-sm ".concat(activeTab === 'requests'
            ? 'border-primary-500 text-primary-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300')}>
            <div className="flex items-center space-x-2">
              <lucide_react_1.MessageSquare className="w-4 h-4"/>
              <span>Participation Requests</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'competitions' && (<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {competitions.map(function (competition) { return (<div key={competition.id} className="card">
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
                    <lucide_react_1.Target className="w-4 h-4 text-gray-400"/>
                    <span>{getCategoryBadge(competition.category)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <lucide_react_1.Users className="w-4 h-4 text-gray-400"/>
                    <span>{competition.currentParticipants}/{competition.maxParticipants} participants</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <lucide_react_1.Calendar className="w-4 h-4 text-gray-400"/>
                    <span>Start: {new Date(competition.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <lucide_react_1.Calendar className="w-4 h-4 text-gray-400"/>
                    <span>End: {new Date(competition.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Prizes */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Prizes</h4>
                <div className="space-y-1">
                  {competition.prizes.map(function (prize, index) { return (<div key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                      <lucide_react_1.Trophy className="w-4 h-4 text-yellow-500"/>
                      <span>{prize}</span>
                    </div>); })}
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
            </div>); })}
        </div>)}

      {activeTab === 'requests' && (<CompetitionRequestManager_1.CompetitionRequestManager />)}
    </div>);
}
