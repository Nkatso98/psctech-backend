import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">404</h1>
          <h2 className="text-2xl font-semibold">Page not found</h2>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button onClick={() => navigate(-1)}>Go Back</Button>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
