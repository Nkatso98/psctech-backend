import { ReactNode, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  BellIcon,
  UserIcon,
  ChevronDownIcon,
  MenuIcon,
  XIcon,
  LogOutIcon,
  HomeIcon,
  CalendarIcon,
  BookOpenIcon,
  UsersIcon,
  CheckCircleIcon,
  FileTextIcon,
  MessageSquareIcon,
  SettingsIcon,
  AlertTriangleIcon,
  BuildingIcon,
  GlobeIcon,
  GraduationCapIcon,
  BarChart3,
  Trophy,
  CreditCard
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth-context';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface SidebarLinkProps {
  to: string;
  icon: ReactNode;
  label: string;
  badge?: string;
}

function SidebarLink({ to, icon, label, badge }: SidebarLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-300',
        'hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 hover:shadow-md',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'relative overflow-hidden border border-transparent hover:border-blue-200',
        isActive 
          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-lg transform scale-105' 
          : 'text-gray-600 hover:text-blue-700'
      )}
    >
      <div className={cn(
        'flex items-center gap-3 w-full',
        isActive && 'transform translate-x-1'
      )}>
        <div className={cn(
          'transition-all duration-300 p-1 rounded-lg',
          isActive 
            ? 'text-white bg-white/20' 
            : 'text-gray-500 group-hover:text-blue-600 group-hover:bg-blue-100'
        )}>
          {icon}
        </div>
        <span className="flex-1 truncate font-medium">{label}</span>
        {badge && (
          <Badge variant="secondary" className={cn(
            "ml-auto text-xs font-semibold",
            isActive 
              ? "bg-white/20 text-white border-white/30" 
              : "bg-blue-100 text-blue-700 border-blue-200"
          )}>
            {badge}
          </Badge>
        )}
      </div>
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full shadow-lg" />
      )}
    </Link>
  );
}

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, institution, logout } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const navLinks = () => {
    const baseLinks = [
      { to: '/dashboard', icon: <HomeIcon className="h-4 w-4" />, label: 'Dashboard' },
    ];

    const roleSpecificLinks = {
      Principal: [
        { to: '/overall-academic-performance', icon: <BarChart3 className="h-4 w-4" />, label: 'Overall Academic Performance' },
        { to: '/add-student', icon: <UsersIcon className="h-4 w-4" />, label: 'Add Student' },
        { to: '/add-teacher', icon: <UsersIcon className="h-4 w-4" />, label: 'Add Teacher' },
        { to: '/reports', icon: <FileTextIcon className="h-4 w-4" />, label: 'Reports', badge: '12' },
        { to: '/classes', icon: <UsersIcon className="h-4 w-4" />, label: 'Classes', badge: '8' },
        { to: '/staff', icon: <UsersIcon className="h-4 w-4" />, label: 'Staff', badge: '24' },
        { to: '/announcements', icon: <AlertTriangleIcon className="h-4 w-4" />, label: 'Announcements', badge: '3' },
        { to: '/competitions', icon: <Trophy className="h-4 w-4" />, label: 'Competitions' },
        { to: '/vouchers', icon: <CreditCard className="h-4 w-4" />, label: 'Vouchers', badge: 'New' },
        { to: '/settings', icon: <SettingsIcon className="h-4 w-4" />, label: 'Settings' },
      ],
      Teacher: [
        { to: '/add-student', icon: <UsersIcon className="h-4 w-4" />, label: 'Add Student' },
        { to: '/schedule', icon: <CalendarIcon className="h-4 w-4" />, label: 'Schedule' },
        { to: '/attendance', icon: <CheckCircleIcon className="h-4 w-4" />, label: 'Attendance', badge: 'New' },
        { to: '/results', icon: <FileTextIcon className="h-4 w-4" />, label: 'Results' },
        { to: '/reports', icon: <FileTextIcon className="h-4 w-4" />, label: 'Reports' },
        { to: '/announcements', icon: <AlertTriangleIcon className="h-4 w-4" />, label: 'Announcements', badge: '5' },
        { to: '/ai-homework-generator', icon: <BookOpenIcon className="h-4 w-4" />, label: 'AI Homework Generator' },
        { to: '/ai-test-generator', icon: <FileTextIcon className="h-4 w-4" />, label: 'AI Test Generator' },
      ],
      Parent: [
        { to: '/children', icon: <UsersIcon className="h-4 w-4" />, label: 'Children' },
        { to: '/attendance', icon: <CheckCircleIcon className="h-4 w-4" />, label: 'Attendance' },
        { to: '/results', icon: <FileTextIcon className="h-4 w-4" />, label: 'Results', badge: 'Updated' },
        { to: '/calendar', icon: <CalendarIcon className="h-4 w-4" />, label: 'Calendar' },
        { to: '/messages', icon: <MessageSquareIcon className="h-4 w-4" />, label: 'Messages', badge: '2' },
        { to: '/announcements', icon: <AlertTriangleIcon className="h-4 w-4" />, label: 'Announcements' },
        { to: '/vouchers', icon: <CreditCard className="h-4 w-4" />, label: 'Redeem Voucher', badge: 'Access' },
      ],
      Learner: [
        { to: '/study-zone', icon: <BookOpenIcon className="h-4 w-4" />, label: 'Study Zone' },
        { to: '/homework', icon: <FileTextIcon className="h-4 w-4" />, label: 'Homework', badge: '3' },
        { to: '/timetables', icon: <CalendarIcon className="h-4 w-4" />, label: 'Timetable' },
        { to: '/performance', icon: <FileTextIcon className="h-4 w-4" />, label: 'Performance' },
        { to: '/messages', icon: <MessageSquareIcon className="h-4 w-4" />, label: 'Messages', badge: '1' },
        { to: '/announcements', icon: <AlertTriangleIcon className="h-4 w-4" />, label: 'Announcements' },
        { to: '/ai-study-zone', icon: <BookOpenIcon className="h-4 w-4" />, label: 'AI Study Zone' },
      ],
      SGB: [
        { to: '/meetings', icon: <CalendarIcon className="h-4 w-4" />, label: 'Meetings', badge: '2' },
        { to: '/documents', icon: <FileTextIcon className="h-4 w-4" />, label: 'Documents' },
        { to: '/announcements', icon: <AlertTriangleIcon className="h-4 w-4" />, label: 'Announcements' },
        { to: '/overall-academic-performance', icon: <BarChart3 className="h-4 w-4" />, label: 'Academic Performance' },
      ]
    };

    return [...baseLinks, ...(user?.role && roleSpecificLinks[user.role as keyof typeof roleSpecificLinks] || [])];
  };

  // Close mobile nav when route changes
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Enhanced Sidebar for desktop */}
      <aside className="hidden border-r bg-gradient-to-b from-background to-muted/20 lg:block w-72 shrink-0 shadow-lg">
        <div className="flex h-full max-h-screen flex-col gap-2">
          {/* Enhanced Header */}
          <div className="flex h-16 items-center border-b px-6 bg-gradient-to-r from-primary/5 to-primary/10">
            <Link to="/dashboard" className="flex items-center gap-3 font-semibold group">
              <div className="relative">
                <img 
                  src="/assets/images/psc-tech-logo.png" 
                  alt="PSC Tech Logo" 
                  className="h-10 w-10 transition-transform duration-200 group-hover:scale-110" 
                />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  PSC Tech
                </span>
                <span className="text-xs text-muted-foreground">Multi-Tenant Platform</span>
              </div>
            </Link>
          </div>
          
          {/* Institution Info */}
          {institution && (
            <div className="px-4 py-3">
              <div className="rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-4 border border-blue-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <BuildingIcon className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Current Institution</span>
                </div>
                <div className="text-sm font-semibold text-gray-800 truncate mb-1">
                  {institution.name}
                </div>
                <div className="text-xs text-gray-600 truncate mb-2">
                  {institution.district || 'District not set'}
                </div>
                <Badge variant="outline" className="text-xs bg-white/80 border-blue-300 text-blue-700">
                  <GlobeIcon className="h-3 w-3 mr-1" />
                  Multi-Tenant
                </Badge>
              </div>
            </div>
          )}
          
          {/* Navigation */}
          <div className="flex-1 overflow-auto py-4 px-4">
            <nav className="grid items-start gap-2">
              {navLinks().map((link, index) => (
                <SidebarLink key={index} to={link.to} icon={link.icon} label={link.label} />
              ))}
            </nav>
          </div>
          
          {/* Enhanced User Profile */}
          <div className="mt-auto border-t border-gray-200 p-4 bg-gradient-to-t from-gray-50 to-transparent">
            <div className="flex items-center gap-3 rounded-xl px-4 py-3 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm border border-gray-200">
              <Avatar className="h-10 w-10 ring-2 ring-blue-200">
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                  {user?.fullName ? getInitials(user.fullName) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col overflow-hidden min-w-0">
                <div className="text-sm font-semibold truncate text-gray-800">
                  {user?.fullName || 'User'}
                </div>
                <div className="text-xs text-gray-600 truncate">
                  {user?.role || 'Role'}
                </div>
                <div className="text-xs text-blue-600 font-medium">
                  {institution?.name ? 'Active' : 'No Institution'}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                className="h-8 w-8 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
              >
                <LogOutIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Main content */}
      <div className="flex flex-col min-h-screen flex-1 overflow-auto">
        {/* Enhanced Top navigation bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 px-4 lg:px-6 shadow-sm">
          <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden h-9 w-9 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                onClick={() => setIsMobileNavOpen(true)}
              >
                <MenuIcon className="h-5 w-5 text-gray-600" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="lg:hidden w-80 p-0">
              <div className="flex h-full flex-col">
                <div className="flex h-16 items-center border-b border-gray-200 px-6 bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex items-center gap-3 font-semibold">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <GraduationCapIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xl font-bold text-gray-800">PSC Tech</span>
                      <span className="text-xs text-gray-600">Multi-Tenant Platform</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto h-8 w-8 hover:bg-gray-100"
                    onClick={() => setIsMobileNavOpen(false)}
                  >
                    <XIcon className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="flex-1 overflow-auto">
                  <div className="p-4">
                    <div className="rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-4 border border-blue-200 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <BuildingIcon className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Current Institution</span>
                      </div>
                      <div className="text-sm font-semibold text-gray-800 truncate">
                        {institution?.name || 'No Institution'}
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        {institution?.district || 'District not set'}
                      </div>
                    </div>
                  </div>
                  
                  <nav className="grid items-start gap-1 p-6 overflow-auto">
                    {navLinks().map((link, index) => (
                      <SidebarLink key={index} to={link.to} icon={link.icon} label={link.label} />
                    ))}
                  </nav>
                  <div className="mt-auto border-t border-gray-200 p-4">
                    <div className="flex items-center gap-3 rounded-lg px-3 py-3 bg-gray-50">
                      <Avatar className="h-10 w-10 ring-2 ring-blue-200">
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                          {user?.fullName ? getInitials(user.fullName) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
                        <div className="text-sm font-semibold truncate text-gray-800">{user?.fullName || 'User'}</div>
                        <div className="text-xs text-gray-600 truncate">{user?.role || 'Role'}</div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleLogout}
                        className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                      >
                        <LogOutIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <div className="flex-1 flex items-center">
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold hidden sm:block truncate text-gray-800">
                {institution?.name || 'School Dashboard'}
              </h1>
              <p className="text-xs text-gray-600 hidden sm:block">
                Welcome back, <span className="font-medium text-blue-600">{user?.fullName?.split(' ')[0] || 'User'}</span>! 
                {institution && <span className="text-gray-500"> • {institution.name}</span>}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="relative h-9 w-9 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
            >
              <BellIcon className="h-5 w-5 text-gray-600" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-xs text-white flex items-center justify-center font-medium shadow-lg">
                  {notifications > 9 ? '9+' : notifications}
                </span>
              )}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 h-9 border-gray-300 hover:border-blue-400 hover:bg-blue-50">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                      {user?.fullName ? getInitials(user.fullName) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline-block truncate max-w-24 text-gray-700">
                    {user?.fullName ? user.fullName.split(' ')[0] : 'Account'}
                  </span>
                  <ChevronDownIcon className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border-2 border-gray-200 shadow-xl">
                <DropdownMenuLabel className="font-normal p-4">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-gray-800">{user?.fullName}</p>
                    <p className="text-xs leading-none text-gray-600">{user?.role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="hover:bg-blue-50 focus:bg-blue-50">
                  <UserIcon className="mr-2 h-4 w-4 text-blue-600" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-blue-50 focus:bg-blue-50">
                  <SettingsIcon className="mr-2 h-4 w-4 text-blue-600" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:bg-red-50 focus:bg-red-50">
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        {/* Enhanced Main content area */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 min-h-screen">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
        
        {/* Enhanced Footer */}
        <footer className="border-t py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-t from-muted/20 to-transparent">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img 
                src="/assets/images/psc-tech-logo.png" 
                alt="PSC Tech Logo" 
                className="h-6 w-6" 
              />
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} PSC Tech. All rights reserved.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Multi-Tenant Platform</span>
              <Separator orientation="vertical" className="h-4" />
              <span>Version 2.0.0</span>
              <Separator orientation="vertical" className="h-4" />
              <span>Powered by Nkanyezi Tech</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}