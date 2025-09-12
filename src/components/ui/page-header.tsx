import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ 
  title, 
  description, 
  breadcrumbs = [], 
  actions,
  className 
}: PageHeaderProps) {
  const location = useLocation();
  
  // Generate breadcrumbs based on current location if not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (breadcrumbs.length > 0) return breadcrumbs;
    
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const generatedBreadcrumbs: BreadcrumbItem[] = [];
    
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Convert segment to readable label
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      if (index === pathSegments.length - 1) {
        // Last item (current page)
        generatedBreadcrumbs.push({ label, href: currentPath });
      } else {
        // Navigation items
        generatedBreadcrumbs.push({ label, href: currentPath });
      }
    });
    
    return generatedBreadcrumbs;
  };
  
  const finalBreadcrumbs = generateBreadcrumbs();

  return (
    <div className={cn("mb-8", className)}>
      {/* Breadcrumbs */}
      {finalBreadcrumbs.length > 0 && (
        <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
          <Link 
            to="/dashboard" 
            className="flex items-center hover:text-foreground transition-colors duration-200"
          >
            <Home className="h-4 w-4 mr-1" />
            Dashboard
          </Link>
          
          {finalBreadcrumbs.map((item, index) => (
            <div key={index} className="flex items-center space-x-1">
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
              {index === finalBreadcrumbs.length - 1 ? (
                <span className="text-foreground font-medium">{item.label}</span>
              ) : (
                <Link 
                  to={item.href || '#'} 
                  className="hover:text-foreground transition-colors duration-200"
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
      )}
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-lg text-muted-foreground max-w-3xl">
              {description}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex flex-shrink-0 items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

