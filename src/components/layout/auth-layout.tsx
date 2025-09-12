import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';

interface AuthLayoutProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export function AuthLayout({ children, allowedRoles }: AuthLayoutProps) {
  const { user, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access if allowedRoles is provided
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}