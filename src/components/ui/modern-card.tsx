import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ModernCardProps {
  children: ReactNode;
  className?: string;
  header?: ReactNode;
  footer?: ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
}

export function ModernCard({ 
  children, 
  className, 
  header, 
  footer, 
  variant = 'default' 
}: ModernCardProps) {
  const baseClasses = "bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden";
  
  const variantClasses = {
    default: "shadow-sm border-gray-100",
    elevated: "shadow-xl border-gray-200",
    outlined: "shadow-none border-gray-200"
  };

  return (
    <div className={cn(baseClasses, variantClasses[variant], className)}>
      {header && (
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          {header}
        </div>
      )}
      
      <div className="px-6 py-6">
        {children}
      </div>
      
      {footer && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          {footer}
        </div>
      )}
    </div>
  );
}

export function ModernCardHeader({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn("text-center mb-6", className)}>
      {children}
    </div>
  );
}

export function ModernCardTitle({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <h2 className={cn("text-2xl font-bold text-gray-900 mb-2", className)}>
      {children}
    </h2>
  );
}

export function ModernCardDescription({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <p className={cn("text-gray-600 text-sm leading-relaxed", className)}>
      {children}
    </p>
  );
}


