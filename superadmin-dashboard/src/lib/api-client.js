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
exports.apiClient = void 0;
// Base URL for the main school management project
var BASE_URL = 'http://localhost:3000'; // Adjust this to match your main project's API endpoint
// Generic API client
var ApiClient = /** @class */ (function () {
    function ApiClient() {
    }
    ApiClient.prototype.request = function (endpoint_1) {
        return __awaiter(this, arguments, void 0, function (endpoint, options) {
            var url, response, error_1;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = "".concat(BASE_URL).concat(endpoint);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetch(url, __assign({ headers: __assign({ 'Content-Type': 'application/json' }, options.headers) }, options))];
                    case 2:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("API request failed: ".concat(response.status, " ").concat(response.statusText));
                        }
                        return [4 /*yield*/, response.json()];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        error_1 = _a.sent();
                        console.error('API request error:', error_1);
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Institution Management
    ApiClient.prototype.getInstitutions = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request('/api/institutions')];
            });
        });
    };
    ApiClient.prototype.getInstitutionById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request("/api/institutions/".concat(id))];
            });
        });
    };
    ApiClient.prototype.updateInstitutionStatus = function (id, status) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request("/api/institutions/".concat(id, "/status"), {
                        method: 'PATCH',
                        body: JSON.stringify({ status: status }),
                    })];
            });
        });
    };
    // Subscription Management
    ApiClient.prototype.getSubscriptions = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request('/api/institutions/subscriptions/all')];
            });
        });
    };
    ApiClient.prototype.getSubscriptionsByInstitution = function (institutionId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request("/api/institutions/".concat(institutionId, "/subscriptions"))];
            });
        });
    };
    ApiClient.prototype.updateSubscription = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request("/api/institutions/subscriptions/".concat(id), {
                        method: 'PATCH',
                        body: JSON.stringify(updates),
                    })];
            });
        });
    };
    // Performance Reports
    ApiClient.prototype.getPerformanceReports = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request('/api/performance-reports')];
            });
        });
    };
    ApiClient.prototype.generatePerformanceReport = function (institutionId, period) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request('/api/performance-reports/generate', {
                        method: 'POST',
                        body: JSON.stringify({ institutionId: institutionId, period: period }),
                    })];
            });
        });
    };
    // Competition Management
    ApiClient.prototype.getCompetitions = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request('/api/competitions')];
            });
        });
    };
    ApiClient.prototype.createCompetition = function (competition) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request('/api/competitions', {
                        method: 'POST',
                        body: JSON.stringify(competition),
                    })];
            });
        });
    };
    ApiClient.prototype.updateCompetition = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request("/api/competitions/".concat(id), {
                        method: 'PATCH',
                        body: JSON.stringify(updates),
                    })];
            });
        });
    };
    ApiClient.prototype.deleteCompetition = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request("/api/competitions/".concat(id), {
                        method: 'DELETE',
                    })];
            });
        });
    };
    // Competition Requests
    ApiClient.prototype.getCompetitionRequests = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request('/api/competitions/requests/all')];
            });
        });
    };
    ApiClient.prototype.approveCompetitionRequest = function (requestId, approved, comments) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request("/api/competitions/requests/".concat(requestId, "/approve"), {
                        method: 'PATCH',
                        body: JSON.stringify({ approved: approved, comments: comments }),
                    })];
            });
        });
    };
    // Platform Statistics
    ApiClient.prototype.getPlatformStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request('/api/platform-stats')];
            });
        });
    };
    ApiClient.prototype.getRecentActivities = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request('/api/recent-activities')];
            });
        });
    };
    // User Management
    ApiClient.prototype.getUsersByInstitution = function (institutionId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request("/api/institutions/".concat(institutionId, "/users"))];
            });
        });
    };
    ApiClient.prototype.getUserStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request('/api/institutions/stats/users')];
            });
        });
    };
    return ApiClient;
}());
exports.apiClient = new ApiClient();
exports.default = exports.apiClient;
