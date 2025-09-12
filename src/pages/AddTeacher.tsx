import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AuthLayout } from '@/components/layout/auth-layout';
import { AddTeacherForm } from '@/components/user-management/add-teacher-form';
import { useAuth } from '@/lib/auth-context';

export default function AddTeacher() {
  const { user, institution } = useAuth();

  if (!institution) {
    return (
      <AuthLayout>
        <DashboardLayout>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Institution Selected</h2>
            <p className="text-gray-600">Please select an institution to add teachers.</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Add New Teacher</h1>
            <p className="text-muted-foreground">
              Register a new teacher account in the system
            </p>
          </div>

          <AddTeacherForm 
            institutionId={institution.institutionId}
            onSuccess={() => {
              // Could redirect to teachers list or show success message
              console.log('Teacher added successfully');
            }}
          />
        </div>
      </DashboardLayout>
    </AuthLayout>
  );
}
