import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AuthLayout } from '@/components/layout/auth-layout';
import { AddLearnerForm } from '@/components/user-management/add-learner-form';
import { useAuth } from '@/lib/auth-context';

export default function AddStudent() {
  const { user, institution } = useAuth();

  if (!institution) {
    return (
      <AuthLayout>
        <DashboardLayout>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Institution Selected</h2>
            <p className="text-gray-600">Please select an institution to add students.</p>
          </div>
        </DashboardLayout>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New Student</h1>
            <p className="text-muted-foreground">
              Register a new student and their parent account in the system
            </p>
          </div>

          <AddLearnerForm 
            institutionId={institution.institutionId}
            onSuccess={() => {
              // Could redirect to students list or show success message
              console.log('Student added successfully');
            }}
          />
        </div>
      </DashboardLayout>
    </AuthLayout>
  );
}
