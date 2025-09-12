import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AuthLayout } from '@/components/layout/auth-layout';

export default function AIHomeworkGenerator() {
  return (
    <AuthLayout>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Homework Generator</h1>
            <p className="text-muted-foreground">
              Generate homework assignments using AI based on topics and requirements
            </p>
          </div>
          
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h2>
            <p className="text-gray-600">AI Homework Generator functionality will be implemented here.</p>
          </div>
        </div>
      </DashboardLayout>
    </AuthLayout>
  );
}
