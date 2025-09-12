"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Subscriptions;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
function Subscriptions() {
    var _a = (0, react_1.useState)([]), subscriptions = _a[0], setSubscriptions = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(''), searchTerm = _c[0], setSearchTerm = _c[1];
    var _d = (0, react_1.useState)('all'), statusFilter = _d[0], setStatusFilter = _d[1];
    var _e = (0, react_1.useState)('all'), planFilter = _e[0], setPlanFilter = _e[1];
    (0, react_1.useEffect)(function () {
        // Mock data - replace with actual Firebase calls
        var mockSubscriptions = [
            {
                id: '1',
                institutionId: '1',
                institutionName: 'St. Mary\'s Academy',
                plan: 'Premium',
                status: 'Active',
                startDate: '2024-01-15',
                endDate: '2025-01-15',
                amount: 2500,
                currency: 'ZAR',
                billingCycle: 'Yearly',
                autoRenew: true
            },
            {
                id: '2',
                institutionId: '2',
                institutionName: 'City High School',
                plan: 'Enterprise',
                status: 'Active',
                startDate: '2024-02-20',
                endDate: '2025-02-20',
                amount: 5000,
                currency: 'ZAR',
                billingCycle: 'Yearly',
                autoRenew: true
            },
            {
                id: '3',
                institutionId: '3',
                institutionName: 'Sunrise Primary School',
                plan: 'Basic',
                status: 'Trial',
                startDate: '2024-03-10',
                endDate: '2024-09-10',
                amount: 0,
                currency: 'ZAR',
                billingCycle: 'Monthly',
                autoRenew: false
            }
        ];
        setSubscriptions(mockSubscriptions);
        setLoading(false);
    }, []);
    var filteredSubscriptions = subscriptions.filter(function (subscription) {
        var matchesSearch = subscription.institutionName.toLowerCase().includes(searchTerm.toLowerCase());
        var matchesStatus = statusFilter === 'all' || subscription.status === statusFilter;
        var matchesPlan = planFilter === 'all' || subscription.plan === planFilter;
        return matchesSearch && matchesStatus && matchesPlan;
    });
    var getStatusBadge = function (status) {
        switch (status) {
            case 'Active':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
          <lucide_react_1.CheckCircle className="w-3 h-3 mr-1"/>
          Active
        </span>;
            case 'Expired':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger-100 text-danger-800">
          <lucide_react_1.AlertTriangle className="w-3 h-3 mr-1"/>
          Expired
        </span>;
            case 'Trial':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
          <lucide_react_1.Clock className="w-3 h-3 mr-1"/>
          Trial
        </span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {status}
        </span>;
        }
    };
    var getPlanBadge = function (plan) {
        switch (plan) {
            case 'Basic':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Basic
        </span>;
            case 'Premium':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Premium
        </span>;
            case 'Enterprise':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          Enterprise
        </span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {plan}
        </span>;
        }
    };
    var formatCurrency = function (amount, currency) {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: currency
        }).format(amount);
    };
    var calculateDaysRemaining = function (endDate) {
        var end = new Date(endDate);
        var now = new Date();
        var diffTime = end.getTime() - now.getTime();
        var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };
    if (loading) {
        return (<div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>);
    }
    return (<div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
          <p className="text-gray-600">Monitor and manage institution subscriptions</p>
        </div>
        <button className="btn-primary">
          <lucide_react_1.CreditCard className="w-4 h-4 mr-2"/>
          Add Subscription
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                <lucide_react_1.CheckCircle className="w-5 h-5 text-success-600"/>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Subscriptions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {subscriptions.filter(function (s) { return s.status === 'Active'; }).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                <lucide_react_1.Clock className="w-5 h-5 text-warning-600"/>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Trial Subscriptions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {subscriptions.filter(function (s) { return s.status === 'Trial'; }).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-danger-100 rounded-lg flex items-center justify-center">
                <lucide_react_1.AlertTriangle className="w-5 h-5 text-danger-600"/>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Expired Subscriptions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {subscriptions.filter(function (s) { return s.status === 'Expired'; }).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <lucide_react_1.DollarSign className="w-5 h-5 text-primary-600"/>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(subscriptions
            .filter(function (s) { return s.status === 'Active'; })
            .reduce(function (sum, s) { return sum + (s.billingCycle === 'Monthly' ? s.amount : s.amount / 12); }, 0), 'ZAR')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"/>
              <input type="text" placeholder="Search institutions..." value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }} className="input-field pl-10"/>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select value={statusFilter} onChange={function (e) { return setStatusFilter(e.target.value); }} className="input-field">
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
              <option value="Trial">Trial</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Plan</label>
            <select value={planFilter} onChange={function (e) { return setPlanFilter(e.target.value); }} className="input-field">
              <option value="all">All Plans</option>
              <option value="Basic">Basic</option>
              <option value="Premium">Premium</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Institution
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Billing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Auto Renew
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubscriptions.map(function (subscription) {
            var daysRemaining = calculateDaysRemaining(subscription.endDate);
            return (<tr key={subscription.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {subscription.institutionName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPlanBadge(subscription.plan)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(subscription.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(subscription.amount, subscription.currency)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {subscription.billingCycle}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>Start: {new Date(subscription.startDate).toLocaleDateString()}</div>
                        <div>End: {new Date(subscription.endDate).toLocaleDateString()}</div>
                        {daysRemaining > 0 && (<div className="text-xs text-gray-500">
                            {daysRemaining} days remaining
                          </div>)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ".concat(subscription.autoRenew
                    ? 'bg-success-100 text-success-800'
                    : 'bg-gray-100 text-gray-800')}>
                        {subscription.autoRenew ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-primary-600 hover:text-primary-900">
                          Edit
                        </button>
                        <button className="text-warning-600 hover:text-warning-900">
                          Renew
                        </button>
                        <button className="text-danger-600 hover:text-danger-900">
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>);
        })}
            </tbody>
          </table>
        </div>
      </div>
    </div>);
}
