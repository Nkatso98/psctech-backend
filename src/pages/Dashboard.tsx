import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AuthLayout } from '@/components/layout/auth-layout';
import PrincipalDashboard from '@/components/dashboard/principal-dashboard';
import { TeacherDashboard } from '@/components/dashboard/teacher-dashboard';
import { ParentDashboard } from '@/components/dashboard/parent-dashboard';
import { LearnerDashboard } from '@/components/dashboard/learner-dashboard';
import { SGBDashboard } from '@/components/dashboard/sgb-dashboard';
import { initializeDemoData } from '@/lib/store';

export default function Dashboard() {
  const { user } = useAuth();

  // Initialize demo data if needed
  useEffect(() => {
    initializeDemoData();
  }, []);

  // Render dashboard based on user role
  const renderDashboardContent = () => {
    switch (user?.role) {
      case 'Principal':
        return <PrincipalDashboard />;
      case 'Teacher':
        return <TeacherDashboard />;
      case 'Parent':
        return <ParentDashboard />;
      case 'Learner':
        return <LearnerDashboard />;
      case 'SGB':
        return <SGBDashboard />;
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h2 className="text-2xl font-semibold mb-2">Welcome to PSC Tech</h2>
            <p className="text-muted-foreground mb-4">Please log in to access your dashboard</p>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Demo credentials:</p>
              <div className="text-xs text-gray-400 space-y-1">
                <p><strong>Principal:</strong> username: principal, password: password123</p>
                <p><strong>Teacher:</strong> username: teacher, password: password123</p>
                <p><strong>Parent:</strong> username: parent, password: password123</p>
                <p><strong>Learner:</strong> username: learner, password: password123</p>
              </div>
              <Link to="/login" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Go to Login
              </Link>
            </div>
          </div>
        );
    }
  };

  return (
    <AuthLayout>
      <DashboardLayout>
        {renderDashboardContent()}
      </DashboardLayout>
    </AuthLayout>
  );
}
