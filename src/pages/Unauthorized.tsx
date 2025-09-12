import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ShieldAlertIcon } from 'lucide-react';

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-md">
        <ShieldAlertIcon className="h-16 w-16 text-destructive mx-auto" />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this page. If you believe this is an error, please contact your administrator.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
          <Button variant="outline" onClick={() => navigate('/login')}>
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
