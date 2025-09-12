import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AuthLayout } from '@/components/layout/auth-layout';
import { PageHeader } from '@/components/ui/page-header';
import { PageTransition } from '@/components/ui/page-transition';
import { TeacherReportsManager } from '@/components/principal/teacher-reports-manager';

export default function Reports() {
  return (
    <AuthLayout>
      <DashboardLayout>
        <PageTransition>
          <PageHeader
            title="Teacher Reports"
            description="View and export comprehensive reports from teachers about learners and classes."
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Reports', href: '/reports' }
            ]}
            actions={
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Export All
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Generate Report
                </button>
              </div>
            }
          />
          
          <TeacherReportsManager />
        </PageTransition>
      </DashboardLayout>
    </AuthLayout>
  );
}




