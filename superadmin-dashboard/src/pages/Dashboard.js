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
exports.default = Dashboard;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var api_client_1 = require("../lib/api-client");
function Dashboard() {
    var _this = this;
    var _a = (0, react_1.useState)(null), stats = _a[0], setStats = _a[1];
    var _b = (0, react_1.useState)([]), recentActivities = _b[0], setRecentActivities = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    (0, react_1.useEffect)(function () {
        loadDashboardData();
    }, []);
    var loadDashboardData = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, platformStats, activities, error_1, mockStats, mockActivities;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    return [4 /*yield*/, Promise.all([
                            api_client_1.apiClient.getPlatformStats(),
                            api_client_1.apiClient.getRecentActivities()
                        ])];
                case 1:
                    _a = _b.sent(), platformStats = _a[0], activities = _a[1];
                    setStats(platformStats);
                    setRecentActivities(activities);
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _b.sent();
                    console.error('Error loading dashboard data:', error_1);
                    mockStats = {
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
                    mockActivities = [
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
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    if (loading) {
        return (<div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>);
    }
    var getSeverityIcon = function (severity) {
        switch (severity) {
            case 'Success':
                return <lucide_react_1.CheckCircle className="w-5 h-5 text-success-600"/>;
            case 'Warning':
                return <lucide_react_1.AlertCircle className="w-5 h-5 text-warning-600"/>;
            case 'Error':
                return <lucide_react_1.AlertCircle className="w-5 h-5 text-danger-600"/>;
            default:
                return <lucide_react_1.Clock className="w-5 h-5 text-gray-600"/>;
        }
    };
    var formatCurrency = function (amount) {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR'
        }).format(amount);
    };
    return (<div className="space-y-6">
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
                <lucide_react_1.Building2 className="w-5 h-5 text-primary-600"/>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Institutions</p>
              <p className="text-2xl font-semibold text-gray-900">{stats === null || stats === void 0 ? void 0 : stats.totalInstitutions}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                <lucide_react_1.Users className="w-5 h-5 text-success-600"/>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats === null || stats === void 0 ? void 0 : stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                <lucide_react_1.CreditCard className="w-5 h-5 text-warning-600"/>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Subscriptions</p>
              <p className="text-2xl font-semibold text-gray-900">{stats === null || stats === void 0 ? void 0 : stats.activeSubscriptions}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-info-100 rounded-lg flex items-center justify-center">
                <lucide_react_1.TrendingUp className="w-5 h-5 text-info-600"/>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency((stats === null || stats === void 0 ? void 0 : stats.totalRevenue) || 0)}</p>
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
              <span className="text-sm font-medium text-gray-900">{stats === null || stats === void 0 ? void 0 : stats.totalStudents}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Teachers</span>
              <span className="text-sm font-medium text-gray-900">{stats === null || stats === void 0 ? void 0 : stats.totalTeachers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Parents</span>
              <span className="text-sm font-medium text-gray-900">{stats === null || stats === void 0 ? void 0 : stats.totalParents}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Health</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">System Uptime</span>
              <span className="text-sm font-medium text-success-600">{stats === null || stats === void 0 ? void 0 : stats.systemUptime}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Average Rating</span>
              <span className="text-sm font-medium text-warning-600">{stats === null || stats === void 0 ? void 0 : stats.averageInstitutionRating}/5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Last Updated</span>
              <span className="text-sm font-medium text-gray-900">
                {(stats === null || stats === void 0 ? void 0 : stats.lastUpdated) ? new Date(stats.lastUpdated).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-3">
            {recentActivities.slice(0, 3).map(function (activity) { return (<div key={activity.id} className="flex items-start space-x-3">
                {getSeverityIcon(activity.severity)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.type}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>); })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-primary">
            <lucide_react_1.Building2 className="w-4 h-4 mr-2"/>
            Add New Institution
          </button>
          <button className="btn-secondary">
            <lucide_react_1.FileText className="w-4 h-4 mr-2"/>
            Generate Report
          </button>
          <button className="btn-secondary">
            <lucide_react_1.Trophy className="w-4 h-4 mr-2"/>
            Create Competition
          </button>
        </div>
      </div>
    </div>);
}
