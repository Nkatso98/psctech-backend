import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  BookOpen, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Settings, 
  BarChart3, 
  Trophy,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  School,
  GraduationCap,
  UserCheck,
  ClipboardList,
  Clock,
  Award,
  Megaphone,
  FolderOpen,
  CalendarDays,
  MessageCircle,
  FileSpreadsheet,
  Cog,
  TrendingUp,
  Target,
  Users2,
  BookMarked,
  CheckCircle,
  AlertCircle,
  Clock3,
  Star,
  TrendingDown,
  Activity,
  PieChart,
  BarChart,
  LineChart,
  TargetIcon,
  TrophyIcon,
  MedalIcon,
  CrownIcon,
  ZapIcon,
  LightbulbIcon,
  RocketIcon,
  ShieldIcon,
  HeartIcon,
  SparklesIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  userRole?: string;
}

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
  badge?: string;
  children?: NavigationItem[];
}

const getNavigationItems = (role: string): NavigationItem[] => {
  const baseItems: NavigationItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
    { href: '/messages', label: 'Messages', icon: <MessageSquare className="h-5 w-5" /> },
    { href: '/calendar', label: 'Calendar', icon: <Calendar className="h-5 w-5" /> },
    { href: '/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
  ];

  const roleSpecificItems: NavigationItem[] = [];

  switch (role) {
    case 'Principal':
      roleSpecificItems.push(
        { href: '/reports', label: 'Reports', icon: <FileText className="h-5 w-5" /> },
        { href: '/timetables', label: 'Timetables', icon: <Calendar className="h-5 w-5" /> },
        { href: '/class-allocation', label: 'Class Allocation', icon: <Users className="h-5 w-5" /> },
        { href: '/staff', label: 'Staff Management', icon: <UserCheck className="h-5 w-5" /> },
        { href: '/performance', label: 'Performance', icon: <TrendingUp className="h-5 w-5" /> },
        { href: '/announcements', label: 'Announcements', icon: <Megaphone className="h-5 w-5" /> },
        { href: '/institution-settings', label: 'Institution Settings', icon: <School className="h-5 w-5" /> },
        { href: '/competitions', label: 'Competitions', icon: <Trophy className="h-5 w-5" /> }
      );
      break;
    case 'Teacher':
      roleSpecificItems.push(
        { href: '/schedule', label: 'Schedule', icon: <Clock className="h-5 w-5" /> },
        { href: '/attendance', label: 'Attendance', icon: <CheckCircle className="h-5 w-5" /> },
        { href: '/assignments', label: 'Assignments', icon: <ClipboardList className="h-5 w-5" /> },
        { href: '/ai-testing', label: 'AI Testing', icon: <Target className="h-5 w-5" /> },
        { href: '/results', label: 'Results', icon: <BarChart3 className="h-5 w-5" /> },
        { href: '/notices', label: 'Notices', icon: <AlertCircle className="h-5 w-5" /> }
      );
      break;
    case 'Parent':
      roleSpecificItems.push(
        { href: '/homework', label: 'Homework', icon: <BookOpen className="h-5 w-5" /> },
        { href: '/calendar', label: 'Calendar', icon: <CalendarDays className="h-5 w-5" /> }
      );
      break;
    case 'Learner':
      roleSpecificItems.push(
        { href: '/study-zone', label: 'Study Zone', icon: <BookOpen className="h-5 w-5" /> },
        { href: '/timetable', label: 'Timetable', icon: <Clock className="h-5 w-5" /> },
        { href: '/ai-tests', label: 'AI Tests', icon: <Target className="h-5 w-5" /> }
      );
      break;
    case 'SGB':
      roleSpecificItems.push(
        { href: '/meetings', label: 'Meetings', icon: <Users2 className="h-5 w-5" /> },
        { href: '/documents', label: 'Documents', icon: <FolderOpen className="h-5 w-5" /> }
      );
      break;
  }

  return [...baseItems, ...roleSpecificItems];
};

export function ResponsiveLayout({ children, userRole = 'User' }: ResponsiveLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigationItems = getNavigationItems(userRole);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden bg-card border-b border-border p-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-bold">PSC Tech</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="sidebar-overlay open lg:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={cn(
        "sidebar-mobile lg:hidden",
        isMobileMenuOpen && "open"
      )}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Menu</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    location.pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-border mt-auto">
          <Button variant="outline" className="w-full" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className={cn(
          "bg-card border-r border-border transition-all duration-300",
          isSidebarCollapsed ? "w-16" : "w-64"
        )}>
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              {!isSidebarCollapsed && (
                <h2 className="text-lg font-semibold">PSC Tech</h2>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="ml-auto"
              >
                {isSidebarCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <nav className="p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      location.pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                    title={isSidebarCollapsed ? item.label : undefined}
                  >
                    {item.icon}
                    {!isSidebarCollapsed && (
                      <>
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          
          {!isSidebarCollapsed && (
            <div className="p-4 border-t border-border mt-auto">
              <Button variant="outline" className="w-full" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}
        </aside>

        {/* Desktop Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Main Content */}
      <main className="lg:hidden">
        <div className="p-4">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="nav-mobile lg:hidden">
        {navigationItems.slice(0, 4).map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center space-y-1 p-2 rounded-lg text-xs font-medium transition-colors",
              location.pathname === item.href
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
