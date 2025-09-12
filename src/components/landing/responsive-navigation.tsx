import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Menu, X, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { 
    label: 'Features', 
    href: '#features',
    children: [
      { label: 'Student Management', href: '#student-management' },
      { label: 'Parent Portal', href: '#parent-portal' },
      { label: 'AI Learning', href: '#ai-learning' },
      { label: 'Analytics', href: '#analytics' }
    ]
  },
  { 
    label: 'Solutions', 
    href: '#solutions',
    children: [
      { label: 'Primary Schools', href: '#primary' },
      { label: 'High Schools', href: '#high-school' },
      { label: 'Special Education', href: '#special-ed' }
    ]
  },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' }
];

export const ResponsiveNavigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleDropdownToggle = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  return (
    <nav className={cn(
      "relative z-50 transition-all duration-300 bg-white shadow-sm border-b border-gray-200",
      isScrolled && "shadow-lg"
    )}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/assets/images/psc-tech-logo.png" 
              alt="PSC Tech Logo" 
              className="h-10 w-10 object-contain"
              onError={(e) => {
                // Fallback to text if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <span className="text-xl font-bold text-gray-900">PSC Tech</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            {navigationItems.map((item) => (
              <div key={item.label} className="relative group">
                {item.children ? (
                  <button
                    onClick={() => handleDropdownToggle(item.label)}
                    className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <span>{item.label}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                ) : (
                  <Link
                    to={item.href}
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    {item.label}
                  </Link>
                )}

                {/* Desktop Dropdown */}
                {item.children && (
                  <div className="absolute left-0 top-full mt-2 w-48 rounded-md bg-white shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-200">
                    <div className="py-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          to={child.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/register">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200 shadow-lg">
            {navigationItems.map((item) => (
              <div key={item.label}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() => handleDropdownToggle(item.label)}
                      className="flex w-full items-center justify-between px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <span>{item.label}</span>
                      <ChevronDown 
                        className={cn(
                          "h-4 w-4 transition-transform",
                          activeDropdown === item.label && "rotate-180"
                        )} 
                      />
                    </button>
                    
                    {activeDropdown === item.label && (
                      <div className="pl-4 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            to={child.href}
                            onClick={closeMenu}
                            className="block px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.href}
                    onClick={closeMenu}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
            
            {/* Mobile CTA Buttons */}
            <div className="pt-4 pb-2 space-y-2">
              <Button asChild variant="ghost" className="w-full justify-center">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild className="w-full justify-center">
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};


