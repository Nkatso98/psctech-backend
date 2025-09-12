import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AuthLayout } from '@/components/layout/auth-layout';
import { InstitutionSettingsManager } from '@/components/principal/institution-settings-manager';

export default function InstitutionSettings() {
  return (
    <AuthLayout>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Institution Settings</h1>
            <p className="text-muted-foreground">
              Manage your school's information, logo, and PDF letterhead customization.
            </p>
          </div>

          <InstitutionSettingsManager />
        </div>
      </DashboardLayout>
    </AuthLayout>
  );
}




