import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, CalendarDaysIcon, ClockIcon } from 'lucide-react';

export default function Calendar() {
  return (
    <AuthLayout>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">School Calendar</h1>
            <p className="text-muted-foreground">
              View school events, holidays, and important dates.
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <CalendarDaysIcon className="h-12 w-12 mx-auto mb-4" />
                <p>Calendar system coming soon!</p>
                <p className="text-sm">This will display school events, holidays, and important dates.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthLayout>
  );
}


