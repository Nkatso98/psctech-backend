import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useAuth } from '@/lib/auth-context';
import {
  AlertCircleIcon,
  Loader2Icon,
  BuildingIcon,
  UserIcon,
  ChevronDownIcon,
  ShieldIcon,
  SparklesIcon,
  GraduationCapIcon
} from 'lucide-react';
import { Institution, UserRole, User } from '@/lib/types';
import { institutionStore, userStore } from '@/lib/store';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function EnhancedLoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Parent');
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Load institutions on component mount
  useEffect(() => {
    const allInstitutions = institutionStore.getAll();
    setInstitutions(allInstitutions);

    // If there's only one institution, auto-select it
    if (allInstitutions.length === 1) {
      setSelectedInstitutionId(allInstitutions[0].institutionId);
    }
  }, []);

  // Filter available users based on selected institution and role
  useEffect(() => {
    if (selectedInstitutionId && selectedRole) {
      const allUsers = userStore.getAll();
      const filteredUsers = allUsers.filter(user =>
        user.institutionId === selectedInstitutionId && user.role === selectedRole
      );
      setAvailableUsers(filteredUsers);
    } else {
      setAvailableUsers([]);
    }
  }, [selectedInstitutionId, selectedRole]);

  const roles: UserRole[] = ['Principal', 'Teacher', 'Parent', 'Learner', 'SGB'];

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    setError(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      // Call the backend API to authenticate
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: data.username,
          password: data.password
        })
      });

      const result = await response.json();

      if (result.success) {
        // Login successful - use the local login function to set user state
        const success = await login(data.username, data.password);
        if (success) {
          navigate('/dashboard');
        } else {
          setError('Login failed. Please check your credentials.');
        }
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full">
      <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-6 pt-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 shadow-lg">
            <GraduationCapIcon className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-600 text-base">
            Sign in to access your school management system
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-8 pb-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* School Selection */}
            <div className="space-y-2">
              <Label htmlFor="school" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <BuildingIcon className="h-4 w-4 text-blue-600" />
                School
              </Label>
              <Select value={selectedInstitutionId} onValueChange={setSelectedInstitutionId}>
                <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors duration-200 bg-white rounded-lg shadow-sm">
                  <SelectValue placeholder="Select a school" />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-gray-200 shadow-xl">
                  {institutions.map((institution) => (
                    <SelectItem key={institution.institutionId} value={institution.institutionId}>
                      <div className="flex items-center gap-2">
                        <BuildingIcon className="h-4 w-4 text-blue-600" />
                        {institution.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <ShieldIcon className="h-4 w-4 text-purple-600" />
                Role
              </Label>
              <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
                <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-purple-300 focus:border-purple-500 transition-colors duration-200 bg-white rounded-lg shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-gray-200 shadow-xl">
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      <div className="flex items-center gap-2">
                        <ShieldIcon className="h-4 w-4 text-purple-600" />
                        {role}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-green-600" />
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                className="h-12 border-2 border-gray-200 hover:border-green-300 focus:border-green-500 transition-colors duration-200 bg-white rounded-lg shadow-sm"
                {...form.register('username')}
              />
              {form.formState.errors.username && (
                <p className="text-sm text-red-600">{form.formState.errors.username.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <ShieldIcon className="h-4 w-4 text-red-600" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="h-12 border-2 border-gray-200 hover:border-red-300 focus:border-red-500 transition-colors duration-200 bg-white rounded-lg shadow-sm"
                {...form.register('password')}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
              )}
            </div>

            {/* Error Alert */}
            {error && (
              <Alert className="border-red-200 bg-red-50 text-red-700">
                <AlertCircleIcon className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              {isLoading ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <SparklesIcon className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="px-8 pb-8">
          <div className="w-full text-center space-y-3">
            <p className="text-sm text-gray-500">
              Contact your school administrator if you need access
            </p>
            <div className="border-t pt-3">
              <p className="text-sm text-gray-600 mb-2">
                Don't have an account?
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.href = '/register'}
                className="w-full border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
              >
                Create New Account
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}