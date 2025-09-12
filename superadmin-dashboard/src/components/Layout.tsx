import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Building2, 
  CreditCard, 
  TrendingUp, 
  Trophy, 
  FileText, 
  Settings, 
  LogOut,
  BarChart3,
  Users
} from 'lucide-react';

export default function Layout() {
  const { logout, superadminUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: BarChart3 },
    { name: 'Institutions', href: '/institutions', icon: Building2 },
    { name: 'Subscriptions', href: '/subscriptions', icon: CreditCard },
    { name: 'Performance', href: '/performance', icon: TrendingUp },
    { name: 'Competitions', href: '/competitions', icon: Trophy },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
                <Users className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {superadminUser?.fullName || 'Superadmin'}
                </p>
                <p className="text-xs text-gray-500">
                  {superadminUser?.role || 'Platform Manager'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}




