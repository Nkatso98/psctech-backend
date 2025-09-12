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
exports.default = Register;
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var AuthContext_1 = require("../contexts/AuthContext");
var lucide_react_1 = require("lucide-react");
function Register() {
    var _this = this;
    var _a = (0, react_1.useState)({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        organization: '',
        phone: ''
    }), formData = _a[0], setFormData = _a[1];
    var _b = (0, react_1.useState)(false), showPassword = _b[0], setShowPassword = _b[1];
    var _c = (0, react_1.useState)(false), showConfirmPassword = _c[0], setShowConfirmPassword = _c[1];
    var _d = (0, react_1.useState)(false), loading = _d[0], setLoading = _d[1];
    var _e = (0, react_1.useState)(''), error = _e[0], setError = _e[1];
    var register = (0, AuthContext_1.useAuth)().register;
    var navigate = (0, react_router_dom_1.useNavigate)();
    var handleChange = function (e) {
        var _a;
        setFormData(__assign(__assign({}, formData), (_a = {}, _a[e.target.name] = e.target.value, _a)));
    };
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setLoading(true);
                    setError('');
                    // Validation
                    if (formData.password !== formData.confirmPassword) {
                        setError('Passwords do not match');
                        setLoading(false);
                        return [2 /*return*/];
                    }
                    if (formData.password.length < 6) {
                        setError('Password must be at least 6 characters long');
                        setLoading(false);
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, register(formData.email, formData.password, {
                            fullName: formData.fullName,
                            organization: formData.organization,
                            phone: formData.phone
                        })];
                case 2:
                    _a.sent();
                    navigate('/');
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    setError(error_1.message || 'Failed to register');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <lucide_react_1.UserPlus className="h-8 w-8 text-primary-600"/>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create Superadmin Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign up to access the platform management dashboard
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>)}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input id="fullName" name="fullName" type="text" autoComplete="name" required value={formData.fullName} onChange={handleChange} className="mt-1 input-field" placeholder="Enter your full name"/>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input id="email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} className="mt-1 input-field" placeholder="Enter your email"/>
            </div>

            <div>
              <label htmlFor="organization" className="block text-sm font-medium text-gray-700">
                Organization
              </label>
              <input id="organization" name="organization" type="text" autoComplete="organization" required value={formData.organization} onChange={handleChange} className="mt-1 input-field" placeholder="Enter your organization"/>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input id="phone" name="phone" type="tel" autoComplete="tel" value={formData.phone} onChange={handleChange} className="mt-1 input-field" placeholder="Enter your phone number"/>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={formData.password} onChange={handleChange} className="input-field pr-10" placeholder="Enter your password"/>
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={function () { return setShowPassword(!showPassword); }}>
                  {showPassword ? (<lucide_react_1.EyeOff className="h-5 w-5 text-gray-400"/>) : (<lucide_react_1.Eye className="h-5 w-5 text-gray-400"/>)}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" required value={formData.confirmPassword} onChange={handleChange} className="input-field pr-10" placeholder="Confirm your password"/>
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={function () { return setShowConfirmPassword(!showConfirmPassword); }}>
                  {showConfirmPassword ? (<lucide_react_1.EyeOff className="h-5 w-5 text-gray-400"/>) : (<lucide_react_1.Eye className="h-5 w-5 text-gray-400"/>)}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button type="button" onClick={function () { return navigate('/login'); }} className="font-medium text-primary-600 hover:text-primary-500">
                Sign in here
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>);
}
