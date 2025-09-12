import { ReactNode } from 'react';
import { BuildingIcon, GraduationCapIcon } from 'lucide-react';

interface ModernHeaderProps {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  showLogo?: boolean;
}

export function ModernHeader({ 
  title = "PSC Tech", 
  subtitle = "School Management System",
  children,
  showLogo = true 
}: ModernHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-6">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            {showLogo && (
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <GraduationCapIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full border-2 border-white shadow-sm"></div>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    {title}
                  </h1>
                  <p className="text-sm text-blue-200 font-medium">
                    {subtitle}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right side content */}
          <div className="flex items-center space-x-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ModernPageHeader({ 
  title, 
  subtitle, 
  children 
}: { 
  title: string; 
  subtitle?: string; 
  children?: ReactNode; 
}) {
  return (
    <div className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
          {children && (
            <div className="mt-6">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


