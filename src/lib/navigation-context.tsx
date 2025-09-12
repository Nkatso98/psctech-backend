import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string;
}

interface NavigationContextType {
  currentPage: string;
  breadcrumbs: NavigationItem[];
  navigationHistory: string[];
  addToHistory: (path: string) => void;
  goBack: () => void;
  canGoBack: boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const location = useLocation();
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(location.pathname);

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = (path: string): NavigationItem[] => {
    const segments = path.split('/').filter(Boolean);
    const breadcrumbs: NavigationItem[] = [];
    
    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Convert segment to readable label
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      breadcrumbs.push({
        label,
        href: currentPath,
        icon: getIconForPath(currentPath)
      });
    });
    
    return breadcrumbs;
  };

  // Get appropriate icon for different paths
  const getIconForPath = (path: string): string => {
    const iconMap: Record<string, string> = {
      '/dashboard': 'Home',
      '/reports': 'FileText',
      '/classes': 'Users',
      '/staff': 'Users',
      '/announcements': 'AlertTriangle',
      '/settings': 'Settings',
      '/schedule': 'Calendar',
      '/attendance': 'CheckCircle',
      '/results': 'FileText',
      '/homework': 'FileText',
      '/performance': 'BarChart3',
      '/meetings': 'Calendar',
      '/documents': 'FileText',
      '/competitions': 'Trophy',
      '/ai-homework-generator': 'BookOpen',
      '/ai-test-generator': 'FileText',
      '/ai-study-zone': 'BookOpen',
      '/study-zone': 'BookOpen',
      '/timetable': 'Calendar',
      '/children': 'Users',
      '/messages': 'MessageSquare',
      '/calendar': 'Calendar'
    };
    
    return iconMap[path] || 'FileText';
  };

  // Add current path to history
  const addToHistory = (path: string) => {
    setNavigationHistory(prev => {
      const newHistory = [...prev];
      if (newHistory[newHistory.length - 1] !== path) {
        newHistory.push(path);
      }
      // Keep only last 10 items
      return newHistory.slice(-10);
    });
  };

  // Navigate back in history
  const goBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop(); // Remove current page
      const previousPage = newHistory[newHistory.length - 1];
      setNavigationHistory(newHistory);
      window.history.back();
    }
  };

  // Update current page and add to history when location changes
  useEffect(() => {
    setCurrentPage(location.pathname);
    addToHistory(location.pathname);
  }, [location.pathname]);

  const value: NavigationContextType = {
    currentPage,
    breadcrumbs: generateBreadcrumbs(location.pathname),
    navigationHistory,
    addToHistory,
    goBack,
    canGoBack: navigationHistory.length > 1
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}

