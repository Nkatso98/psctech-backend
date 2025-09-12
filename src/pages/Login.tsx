import { EnhancedLoginForm } from '@/components/auth/enhanced-login-form';
import { useAuth } from '@/lib/auth-context';
import { Navigate } from 'react-router-dom';

export default function LoginPage() {
  const { user } = useAuth();

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img 
              src="/images/psc%20tech.png" 
              alt="PSC Tech Logo" 
              className="h-10 w-10 object-contain"
            />
            <span className="text-xl font-bold text-gray-800">PSC Tech</span>
          </div>
          <div className="text-sm text-gray-600">
            <a href="/" className="hover:text-blue-600 transition-colors">← Back to Home</a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] p-4">
        <div className="w-full max-w-md">
          <EnhancedLoginForm />
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} PSC Tech. All rights reserved.</p>
      </footer>
    </div>
  );
}
