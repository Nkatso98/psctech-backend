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
exports.default = Layout;
var react_router_dom_1 = require("react-router-dom");
var AuthContext_1 = require("../contexts/AuthContext");
var lucide_react_1 = require("lucide-react");
function Layout() {
    var _this = this;
    var _a = (0, AuthContext_1.useAuth)(), logout = _a.logout, superadminUser = _a.superadminUser;
    var navigate = (0, react_router_dom_1.useNavigate)();
    var location = (0, react_router_dom_1.useLocation)();
    var navigation = [
        { name: 'Dashboard', href: '/', icon: lucide_react_1.BarChart3 },
        { name: 'Institutions', href: '/institutions', icon: lucide_react_1.Building2 },
        { name: 'Subscriptions', href: '/subscriptions', icon: lucide_react_1.CreditCard },
        { name: 'Performance', href: '/performance', icon: lucide_react_1.TrendingUp },
        { name: 'Competitions', href: '/competitions', icon: lucide_react_1.Trophy },
        { name: 'Reports', href: '/reports', icon: lucide_react_1.FileText },
        { name: 'Settings', href: '/settings', icon: lucide_react_1.Settings },
    ];
    var handleLogout = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, logout()];
                case 1:
                    _a.sent();
                    navigate('/login');
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Logout failed:', error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold text-gray-900">PSC Tech</span>
            </div>
          </div>

          {/* User Info */}
          <div className="px-4 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <lucide_react_1.Users className="w-5 h-5 text-primary-600"/>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {(superadminUser === null || superadminUser === void 0 ? void 0 : superadminUser.fullName) || 'Superadmin'}
                </p>
                <p className="text-xs text-gray-500">
                  {(superadminUser === null || superadminUser === void 0 ? void 0 : superadminUser.role) || 'Platform Manager'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map(function (item) {
            var isActive = location.pathname === item.href;
            return (<button key={item.name} onClick={function () { return navigate(item.href); }} className={"w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ".concat(isActive
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100')}>
                  <item.icon className="w-5 h-5"/>
                  <span>{item.name}</span>
                </button>);
        })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200">
              <lucide_react_1.LogOut className="w-5 h-5"/>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        <main className="p-6">
          <react_router_dom_1.Outlet />
        </main>
      </div>
    </div>);
}
