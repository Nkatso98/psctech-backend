import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangleIcon, BellIcon, PlusIcon } from 'lucide-react';

export default function Notices() {
  return (
    <AuthLayout>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Class Notices</h1>
              <p className="text-muted-foreground">
                View and manage announcements for your classes.
              </p>
            </div>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              New Notice
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BellIcon className="h-5 w-5" />
                Recent Notices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangleIcon className="h-12 w-12 mx-auto mb-4" />
                <p>Notices system coming soon!</p>
                <p className="text-sm">This will include creating and managing class announcements.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthLayout>
  );
}


