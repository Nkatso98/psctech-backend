import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { Navigate } from 'react-router-dom';
import { 
  Building2, 
  GraduationCap, 
  Users, 
  BookOpen, 
  BarChart3, 
  MessageSquare, 
  Shield, 
  Zap,
  ArrowRight,
  CheckCircle,
  Star,
  Globe,
  Smartphone,
  Monitor,
  Info,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Heart,
  Award,
  Target,
  Lightbulb
} from 'lucide-react';

export default function IndexPage() {
  const { user, isLoading } = useAuth();

  // Only redirect if user is definitely logged in and not loading
  if (!isLoading && user && user.id) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img 
              src="/assets/images/psc-tech-logo.png" 
              alt="PSC Tech Logo" 
              className="h-10 w-10"
            />
            <span className="text-xl font-bold text-gray-800">PSC Tech</span>
          </div>
          <div className="hidden md:flex space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
          <div className="md:hidden">
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Logo and Title */}
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <img 
                    src="/assets/images/psc-tech-logo.png" 
                    alt="PSC Tech Logo" 
                    className="h-32 w-32 drop-shadow-2xl animate-in zoom-in duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
                  PSC Tech
                </h1>
                <h2 className="text-2xl md:text-4xl font-semibold text-gray-800">
                  School Management System
                </h2>
                <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  The all-in-one platform for primary and secondary schools to manage students, teachers, and administrative tasks with ease.
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-in fade-in delay-500 duration-1000">
              <Button asChild size="lg" className="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <Link to="/login" className="flex items-center space-x-2">
                  <span>Login to Dashboard</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="px-8 py-4 text-lg border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 transform hover:-translate-y-1">
                <Link to="/register">Register Your School</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-in fade-in delay-700 duration-1000">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Powerful Features for Every Role
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover how PSC Tech transforms school management with AI-powered tools and comprehensive solutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in delay-1000 duration-1000">
            {/* Principals */}
            <div className="group bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
              <div className="text-center space-y-4">
                <div className="inline-flex p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">For Principals</h3>
                <p className="text-gray-600 leading-relaxed">
                  Manage your entire institution with comprehensive admin tools, AI-powered analytics, and strategic decision-making support.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Institution Management</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>AI Analytics & Reports</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Strategic Planning</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Teachers */}
            <div className="group bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
              <div className="text-center space-y-4">
                <div className="inline-flex p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">For Teachers</h3>
                <p className="text-gray-600 leading-relaxed">
                  Track attendance, manage grades, communicate with parents, and leverage AI tools for homework and test generation.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>AI Homework Generator</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Smart Attendance</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Parent Communication</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Parents & Learners */}
            <div className="group bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
              <div className="text-center space-y-4">
                <div className="inline-flex p-4 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">For Parents & Learners</h3>
                <p className="text-gray-600 leading-relaxed">
                  Stay updated with academic progress, participate in AI-powered tests, and access personalized study recommendations.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Real-time Progress</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>AI Study Zone</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Interactive Tests</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Benefits Section */}
      <div className="relative z-10 px-6 py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Why Choose PSC Tech?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built with modern technology and designed for educational excellence
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center space-y-3">
              <div className="inline-flex p-3 bg-blue-100 rounded-full">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800">AI-Powered</h3>
              <p className="text-sm text-gray-600">Intelligent automation and insights</p>
            </div>
            <div className="text-center space-y-3">
              <div className="inline-flex p-3 bg-purple-100 rounded-full">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Secure</h3>
              <p className="text-sm text-gray-600">Enterprise-grade security</p>
            </div>
            <div className="text-center space-y-3">
              <div className="inline-flex p-3 bg-green-100 rounded-full">
                <Globe className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Cloud-Based</h3>
              <p className="text-sm text-gray-600">Access anywhere, anytime</p>
            </div>
            <div className="text-center space-y-3">
              <div className="inline-flex p-3 bg-orange-100 rounded-full">
                <Smartphone className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Mobile Ready</h3>
              <p className="text-sm text-gray-600">Optimized for all devices</p>
            </div>
          </div>
        </div>
      </div>

      {/* About Us Section */}
      <div className="relative z-10 px-6 py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex p-4 bg-blue-100 rounded-full mb-6">
              <Info className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              About PSC Tech
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Empowering South African schools through innovative technology solutions
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-800">
                  Company
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  <strong>PSC Tech</strong> (a product of Nkanyezi Tech Solutions, Reg: 2025/606307/07) is a South African EdTech platform built for Primary, Secondary, and Combined Schools. We provide secure, cloud-based school management software that connects principals, teachers, parents, learners, and school governing bodies in one powerful system.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Our mission is simple: <strong>empower schools through technology</strong> — making administration easier, improving communication, and ensuring every learner has access to quality education, even in communities where banking and digital resources are limited.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  What We Solve
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  At PSC Tech, we believe education is the foundation of growth. Many schools still rely on outdated manual systems that make it difficult to manage attendance, fees, reporting, and communication.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-600">All-in-one platform for school administration</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-600">Voucher-based payments (R5–R45) for cash accessibility</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-600">Multi-role dashboards for all stakeholders</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-600">Automated reports & analytics for data-driven decisions</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Our Impact
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  By bridging the gap between technology and accessibility, PSC Tech ensures that every learner, parent, and educator is connected. We're committed to making quality education management accessible to all South African schools.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-100">
                <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Award className="h-6 w-6 text-blue-600" />
                  Why Choose PSC Tech?
                </h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h5 className="font-semibold text-gray-800">South African Made</h5>
                      <p className="text-sm text-gray-600">Built specifically for South African schools and communities</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h5 className="font-semibold text-gray-800">Financial Inclusion</h5>
                      <p className="text-sm text-gray-600">Voucher system works with cash payments, no banking required</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h5 className="font-semibold text-gray-800">Community Focused</h5>
                      <p className="text-sm text-gray-600">Designed for schools in all communities, including rural areas</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h5 className="font-semibold text-gray-800">Future Ready</h5>
                      <p className="text-sm text-gray-600">AI-powered tools and modern technology stack</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-6 rounded-2xl">
                <h4 className="text-xl font-bold mb-3">Ready to Get Started?</h4>
                <p className="text-blue-100 mb-4">
                  Join the digital transformation of education in South Africa
                </p>
                <Button asChild className="w-full bg-white text-blue-600 hover:bg-gray-100">
                  <Link to="/register">Register Your School</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Us Section */}
      <div className="relative z-10 px-6 py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex p-4 bg-green-100 rounded-full mb-6">
              <Phone className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Contact Us
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We'd love to hear from you! Get in touch with our team for support, partnerships, or any questions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Company Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Building2 className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Company</h4>
                      <p className="text-gray-600">Nkanyezi Tech Solutions (Pty) Ltd</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Award className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Registration</h4>
                      <p className="text-gray-600">2025/606307/07</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <MapPin className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Address</h4>
                      <p className="text-gray-600">5627 EXT 5, Madikwe Street, Boitekong, Rustenburg, 0308</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Phone className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Phone</h4>
                      <p className="text-gray-600">+27 (635943899)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Mail className="h-6 w-6 text-purple-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Email</h4>
                      <p className="text-gray-600">info@psctech.co.za</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Globe className="h-6 w-6 text-indigo-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Website</h4>
                      <p className="text-gray-600">www.psctech.co.za</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Get in Touch</h3>
                <p className="text-gray-600 mb-6">
                  Whether you have questions about our platform, need technical support, or want to explore partnership opportunities, we're here to help.
                </p>
                <div className="space-y-4">
                  <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                    <a href="mailto:info@psctech.co.za">
                      <Mail className="h-4 w-4 mr-2" />
                      Send us an Email
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <a href="tel:+27635943899">
                      <Phone className="h-4 w-4 mr-2" />
                      Call Us Now
                    </a>
                  </Button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-600 to-blue-600 text-white p-6 rounded-2xl">
                <h4 className="text-xl font-bold mb-3">Need Immediate Support?</h4>
                <p className="text-green-100 mb-4">
                  Our support team is available to help you get started with PSC Tech
                </p>
                <Button asChild className="w-full bg-white text-green-600 hover:bg-gray-100">
                  <Link to="/login">Access Support Portal</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Careers Section */}
      <div className="relative z-10 px-6 py-20 bg-gradient-to-br from-purple-50 to-pink-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex p-4 bg-purple-100 rounded-full mb-6">
              <Briefcase className="h-8 w-8 text-purple-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Careers at PSC Tech
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're building the future of school management technology in South Africa, and we're always on the lookout for passionate, driven individuals to join us.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 text-center">
              <div className="inline-flex p-3 bg-blue-100 rounded-full mb-4">
                <Monitor className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Software Development</h3>
              <p className="text-sm text-gray-600">C#, .NET, React, Flutter</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 text-center">
              <div className="inline-flex p-3 bg-green-100 rounded-full mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Sales & Partnerships</h3>
              <p className="text-sm text-gray-600">Business development & growth</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 text-center">
              <div className="inline-flex p-3 bg-purple-100 rounded-full mb-4">
                <Heart className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Customer Success</h3>
              <p className="text-sm text-gray-600">Support & implementation</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 text-center">
              <div className="inline-flex p-3 bg-orange-100 rounded-full mb-4">
                <Lightbulb className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Marketing & Comms</h3>
              <p className="text-sm text-gray-600">Brand & communication</p>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-100 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Join Our Mission</h3>
              <p className="text-gray-600 mb-6">
                Help us transform education in South Africa through innovative technology. We're looking for individuals who are passionate about making a difference in education.
              </p>
              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <a href="mailto:careers@psctech.co.za">
                  <Mail className="h-4 w-4 mr-2" />
                  Apply Now
                </a>
              </Button>
              <p className="text-sm text-gray-500 mt-4">
                Send your CV and a short motivation to <strong>careers@psctech.co.za</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Ready to Transform Your School?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of schools already using PSC Tech to streamline their operations
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link to="/register">Start Free Trial</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-8 py-4 text-lg border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50">
              <Link to="/login">Login Now</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-white/80 backdrop-blur-sm border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <img 
                  src="/assets/images/psc-tech-logo.png" 
                  alt="PSC Tech Logo" 
                  className="h-8 w-8"
                />
                <span className="text-lg font-bold text-gray-800">PSC Tech</span>
              </div>
              <p className="text-sm text-gray-600">
                Empowering South African schools with modern technology for better education management.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>Nkanyezi Tech Solutions (Pty) Ltd</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span>Reg: 2025/606307/07</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Product</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>School Management</div>
                <div>AI Tools</div>
                <div>Voucher System</div>
                <div>Multi-role Dashboards</div>
                <div>Reports & Analytics</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Company</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>About Us</div>
                <div>Contact</div>
                <div>Careers</div>
                <div>Partnerships</div>
                <div>News & Updates</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Contact & Support</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>+27 (635943899)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>info@psctech.co.za</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Rustenburg, SA</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>www.psctech.co.za</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800">Our Mission</h4>
                <p className="text-sm text-gray-600">
                  To empower schools through technology — making administration easier, improving communication, and ensuring every learner has access to quality education.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800">Target Schools</h4>
                <p className="text-sm text-gray-600">
                  Primary, Secondary, and Combined Schools across South Africa, with special focus on communities where banking and digital resources are limited.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-gray-200">
              <div className="flex flex-col md:flex-row items-center gap-4 mb-4 md:mb-0">
                <p className="text-sm text-gray-600">
                  &copy; {new Date().getFullYear()} PSC Tech. All rights reserved.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>•</span>
                  <span>Made in South Africa</span>
                  <span>•</span>
                  <span>For South African Schools</span>
                </div>
              </div>
              <div className="flex space-x-6">
                <span className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer">Privacy Policy</span>
                <span className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer">Terms of Service</span>
                <span className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer">Support</span>
                <span className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer">Careers</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
