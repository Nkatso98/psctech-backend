import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AuthLayout } from '@/components/layout/auth-layout';

export default function AIStudyZone() {
  return (
    <AuthLayout>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Study Zone</h1>
            <p className="text-muted-foreground">
              Personalized AI-powered study recommendations and learning paths
            </p>
          </div>
          
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h2>
            <p className="text-gray-600">AI Study Zone functionality will be implemented here.</p>
          </div>
        </div>
      </DashboardLayout>
    </AuthLayout>
  );
}
