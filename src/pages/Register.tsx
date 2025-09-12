import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  SparklesIcon,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { apiService, API_CONFIG } from '@/lib/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    schoolName: '',
    principalName: '',
    email: '',
    phone: '',
    address: '',
    schoolType: 'Secondary School',
    username: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Call the backend API to register the institution
      const response = await apiService.post(API_CONFIG.ENDPOINTS.INSTITUTION_REGISTER, {
        schoolName: formData.schoolName,
        principalName: formData.principalName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        schoolType: formData.schoolType,
        username: formData.username,
        password: formData.password
      });

      if (response.success) {
        toast.success('School registered successfully! You can now log in.');
        // Redirect to login page
        navigate('/login');
      } else {
        toast.error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img 
              src="/images/psc%20tech.png" 
              alt="PSC Tech Logo" 
              className="h-10 w-10 object-contain"
            />
            <span className="text-xl font-bold text-gray-800">PSC Tech</span>
          </div>
          <div className="text-sm text-gray-600">
            <a href="/" className="hover:text-blue-600 transition-colors">← Back to Home</a>
          </div>
        </div>
      </nav>

      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] p-4">
        <div className="w-full max-w-2xl">
        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Register Your School
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 mt-2">
              Join PSC Tech and transform your school management experience
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* School Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  School Information
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="schoolName" className="text-sm font-semibold text-gray-700">
                      School Name
                    </Label>
                    <Input
                      id="schoolName"
                      placeholder="Enter your school name"
                      value={formData.schoolName}
                      onChange={(e) => handleInputChange('schoolName', e.target.value)}
                      className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-lg"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="principalName" className="text-sm font-semibold text-gray-700">
                      Principal's Full Name
                    </Label>
                    <Input
                      id="principalName"
                      placeholder="Enter principal's full name"
                      value={formData.principalName}
                      onChange={(e) => handleInputChange('principalName', e.target.value)}
                      className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-lg"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-green-600" />
                  Contact Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-lg"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-lg"
                      required
                    />
                  </div>
                </div>

                                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-semibold text-gray-700">
                      School Address
                    </Label>
                    <Input
                      id="address"
                      placeholder="Enter school address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-lg"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="schoolType" className="text-sm font-semibold text-gray-700">
                      School Type
                    </Label>
                    <select
                      id="schoolType"
                      value={formData.schoolType}
                      onChange={(e) => handleInputChange('schoolType', e.target.value)}
                      className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-lg px-3 bg-white"
                      required
                    >
                      <option value="Primary School">Primary School</option>
                      <option value="Secondary School">Secondary School</option>
                      <option value="Combined School">Combined School</option>
                    </select>
                  </div>
              </div>

              {/* Account Setup */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-green-600" />
                  Account Setup
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-semibold text-gray-700">
                      Username
                    </Label>
                    <Input
                      id="username"
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-lg"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Choose a password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-lg"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Features Preview */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <SparklesIcon className="h-5 w-5 text-blue-600" />
                  What You'll Get
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>AI-powered homework & test generation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Real-time attendance tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Comprehensive reporting & analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Multi-role access control</span>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 rounded-lg" 
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Registering...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <SparklesIcon className="h-5 w-5" />
                    Register School
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="text-center border-t pt-6">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                Sign in here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>

    {/* Footer */}
    <footer className="relative z-10 text-center py-6 text-sm text-gray-500">
      <p>&copy; {new Date().getFullYear()} PSC Tech. All rights reserved.</p>
    </footer>
  </div>
  );
}
