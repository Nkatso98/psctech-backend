import React from 'react';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  BarChart3, 
  ZapIcon,
  Shield,
  Award,
  Clock,
  CheckCircle,
  Star,
  TrendingUp,
  Globe,
  Smartphone,
  Tablet,
  Monitor
} from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-16 sm:py-20 lg:py-28">
          {/* Hero Content */}
          <div className="text-center">
            {/* Logo and Title */}
            <div className="mb-8 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-2xl">
                <span className="text-3xl font-bold text-white">PSC</span>
              </div>
            </div>
            
            <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              <span className="block">Transform Your School</span>
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                with PSC Tech
              </span>
            </h1>
            
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 sm:text-xl">
              The complete school management system that empowers educators, engages parents, 
              and inspires learners with AI-powered insights and modern technology.
            </p>
            
            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
              <Button asChild
                size="lg" 
                className="w-full sm:w-auto px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link to="/register">Get Started Free</Link>
              </Button>
              <Button asChild
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto px-8 py-4 text-lg font-semibold border-2 hover:bg-gray-50 transition-all duration-300"
              >
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <GraduationCap className="h-8 w-8" />,
                title: "Student Management",
                description: "Comprehensive learner profiles, attendance tracking, and performance analytics."
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: "Parent Engagement",
                description: "Real-time communication, progress updates, and involvement tracking."
              },
              {
                icon: <BookOpen className="h-8 w-8" />,
                title: "AI-Powered Learning",
                description: "Intelligent question generation, automated marking, and personalized feedback."
              },
              {
                icon: <BarChart3 className="h-8 w-8" />,
                title: "Performance Analytics",
                description: "Data-driven insights for continuous improvement and success tracking."
              },
              {
                icon: <ZapIcon className="h-8 w-8" />,
                title: "Smart Automation",
                description: "Streamlined workflows, automated notifications, and efficient processes."
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Secure & Compliant",
                description: "Enterprise-grade security with data protection and privacy compliance."
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="group relative rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <div className="mt-20 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-12 text-white shadow-2xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { number: "500+", label: "Schools Trust Us" },
                { number: "50K+", label: "Students Engaged" },
                { number: "95%", label: "Satisfaction Rate" },
                { number: "24/7", label: "Support Available" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold sm:text-4xl lg:text-5xl">
                    {stat.number}
                  </div>
                  <div className="mt-2 text-sm text-blue-100 sm:text-base">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Responsive Design Showcase */}
          <div className="mt-20 text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Works Perfectly on Every Device
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              From mobile phones to desktop computers, PSC Tech adapts seamlessly
            </p>
            
            <div className="mt-12 flex justify-center items-center gap-8">
              <div className="flex flex-col items-center gap-2">
                <Smartphone className="h-12 w-12 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Mobile</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Tablet className="h-12 w-12 text-indigo-600" />
                <span className="text-sm font-medium text-gray-700">Tablet</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Monitor className="h-12 w-12 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Desktop</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


