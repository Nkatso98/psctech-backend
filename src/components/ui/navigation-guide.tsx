import { useState } from 'react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { 
  Navigation, 
  MousePointer, 
  ArrowRight, 
  Home, 
  Search,
  BookOpen,
  Users,
  FileText,
  Settings,
  X
} from 'lucide-react';

interface NavigationGuideProps {
  onClose?: () => void;
}

export function NavigationGuide({ onClose }: NavigationGuideProps) {
  const [currentTip, setCurrentTip] = useState(0);

  const navigationTips = [
    {
      title: "Quick Navigation",
      description: "Use the sidebar to quickly jump between different sections of the application.",
      icon: <Navigation className="h-5 w-5" />,
      tips: [
        "Click on any menu item to navigate instantly",
        "Use the search functionality to find specific features",
        "The active page is highlighted in the sidebar"
      ]
    },
    {
      title: "Breadcrumb Navigation",
      description: "Follow the breadcrumb trail to understand your current location and navigate back.",
      icon: <MousePointer className="h-5 w-5" />,
      tips: [
        "Click on any breadcrumb to go back to that section",
        "The current page is shown in bold",
        "Use the back button for quick navigation"
      ]
    },
    {
      title: "Role-Based Access",
      description: "Your navigation options change based on your role in the system.",
      icon: <Users className="h-5 w-5" />,
      tips: [
        "Principals see administrative functions",
        "Teachers access classroom management tools",
        "Parents view their children's information",
        "Learners access study materials and assignments"
      ]
    },
    {
      title: "Keyboard Shortcuts",
      description: "Use keyboard shortcuts for faster navigation.",
      icon: <BookOpen className="h-5 w-5" />,
      tips: [
        "Alt + H: Go to Dashboard",
        "Alt + S: Open Search",
        "Alt + M: Toggle Sidebar",
        "Escape: Close modals and dropdowns"
      ]
    }
  ];

  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % navigationTips.length);
  };

  const prevTip = () => {
    setCurrentTip((prev) => (prev - 1 + navigationTips.length) % navigationTips.length);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-2">
          <Navigation className="h-5 w-5 text-blue-600" />
          <CardTitle>Navigation Guide</CardTitle>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Tip */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
              {navigationTips[currentTip].icon}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {navigationTips[currentTip].title}
            </h3>
            <p className="text-gray-600 mt-1">
              {navigationTips[currentTip].description}
            </p>
          </div>
        </div>

        {/* Tips List */}
        <div className="space-y-3">
          {navigationTips[currentTip].tips.map((tip, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <Badge variant="secondary" className="mt-0.5">
                {index + 1}
              </Badge>
              <span className="text-sm text-gray-700">{tip}</span>
            </div>
          ))}
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={prevTip}
            disabled={currentTip === 0}
          >
            Previous
          </Button>
          
          <div className="flex space-x-1">
            {navigationTips.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTip(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentTip ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <Button onClick={nextTip}>
            Next
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t">
          <Button variant="outline" className="w-full">
            <Home className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Button>
          <Button variant="outline" className="w-full">
            <Search className="h-4 w-4 mr-2" />
            Search Features
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


