import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { institutionStore, generateCredentials, userStore } from '@/lib/store';
import { SchoolType } from '@/lib/types';
import { AlertCircleIcon, Loader2Icon, CheckCircle2Icon } from 'lucide-react';

const registerSchema = z.object({
  schoolName: z.string().min(1, 'School name is required'),
  schoolType: z.enum(['Primary', 'Secondary', 'Combined'], {
    required_error: 'Please select a school type',
  }),
  district: z.string().min(1, 'District is required'),
  address: z.string().min(1, 'Address is required'),
  principalName: z.string().min(1, 'Principal name is required'),
  principalId: z.string().min(1, 'ID number is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null);
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      schoolName: '',
      schoolType: 'Combined' as SchoolType,
      district: '',
      address: '',
      principalName: '',
      principalId: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Generate verification code
  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Handle verification code sending
  const sendVerificationCode = () => {
    const code = generateVerificationCode();
    setVerificationCode(code);
    setVerificationSent(true);
    // In a real application, we would send this code via email
    // Here we're just displaying it on the screen for testing
  };

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);
    setError(null);

    try {
      // Create the institution
      const newInstitution = institutionStore.create({
        name: data.schoolName,
        type: data.schoolType as SchoolType,
        district: data.district,
        address: data.address,
        registeredOn: new Date().toISOString(),
      });

      // Use custom password instead of generated one
      const principalCredentials = {
        username: data.principalName.toLowerCase().replace(/\s+/g, '') + '@psctech.edu',
        password: data.password,
      };

      // Create principal user with custom password
      userStore.create({
        institutionId: newInstitution.institutionId,
        role: 'Principal',
        fullName: data.principalName,
        username: principalCredentials.username,
        passwordHash: data.password, // In production, this should be properly hashed
        linkedIdNumber: data.principalId,
        status: 'Active',
        email: data.email,
      });

      // Generate a verification code (in production this would be sent via email)
      sendVerificationCode();
      
      setCredentials(principalCredentials);
    } catch (err) {
      setError('An error occurred during registration. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <div className="flex items-center mb-2">
          <div className="bg-primary rounded-lg w-8 h-8 flex items-center justify-center text-white text-sm font-bold mr-2">P</div>
          <CardTitle className="text-2xl">School Registration</CardTitle>
        </div>
        <CardDescription>
          Register your school to the PSC Tech platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        {credentials ? (
          <div className="space-y-6">
            <Alert className="bg-green-50 border-green-200">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-green-800">Registration Successful!</h3>
                  <p className="text-green-700 mt-1">
                    Your school has been successfully registered on PSC Tech.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-md border border-green-100">
                  <h4 className="font-medium text-sm">Principal Login Credentials</h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Username:</span>
                      <span className="text-sm font-mono bg-green-50 px-2 py-1 rounded">{credentials.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Password:</span>
                      <span className="text-sm font-mono bg-green-50 px-2 py-1 rounded">{'*'.repeat(8)}</span>
                    </div>
                  </div>
                </div>
                {verificationCode && (
                  <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mt-4">
                    <div className="flex items-start">
                      <CheckCircle2Icon className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-800">Verification Code</h4>
                        <p className="text-blue-700 text-sm mt-1">
                          A verification code has been sent to your email. In a real application, this would be sent via email.
                        </p>
                        <div className="mt-3 p-2 bg-white rounded border border-blue-200">
                          <span className="font-mono text-lg font-bold tracking-wide text-blue-800">{verificationCode}</span>
                        </div>
                        <p className="text-xs text-blue-600 mt-2">
                          Note: This is just for testing purposes. In production, codes would only be sent via email.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Alert>
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setCredentials(null);
                  setVerificationCode(null);
                  setVerificationSent(false);
                }}
              >
                Register Another School
              </Button>
              <Button onClick={() => navigate('/login')}>
                Go to Login
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircleIcon className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* School Information */}
            <div className="space-y-4">
              <h3 className="font-medium">School Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">School Name</Label>
                  <Input
                    id="schoolName"
                    placeholder="Enter school name"
                    {...form.register('schoolName')}
                    disabled={isLoading}
                  />
                  {form.formState.errors.schoolName && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.schoolName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schoolType">School Type</Label>
                  <Select
                    onValueChange={(value) => form.setValue('schoolType', value as SchoolType)}
                    defaultValue={form.getValues('schoolType')}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="schoolType">
                      <SelectValue placeholder="Select school type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Primary">Primary School (Grade R-7)</SelectItem>
                      <SelectItem value="Secondary">Secondary School (Grade 8-12)</SelectItem>
                      <SelectItem value="Combined">Combined School (Grade R-12)</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.schoolType && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.schoolType.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    placeholder="Enter district"
                    {...form.register('district')}
                    disabled={isLoading}
                  />
                  {form.formState.errors.district && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.district.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="Enter school address"
                    {...form.register('address')}
                    disabled={isLoading}
                  />
                  {form.formState.errors.address && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.address.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Principal Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Principal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="principalName">Principal Full Name</Label>
                  <Input
                    id="principalName"
                    placeholder="Enter principal's full name"
                    {...form.register('principalName')}
                    disabled={isLoading}
                  />
                  {form.formState.errors.principalName && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.principalName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="principalId">ID Number</Label>
                  <Input
                    id="principalId"
                    placeholder="Enter principal's ID number"
                    {...form.register('principalId')}
                    disabled={isLoading}
                  />
                  {form.formState.errors.principalId && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.principalId.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    {...form.register('email')}
                    disabled={isLoading}
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Password Section */}
              <h3 className="font-medium pt-2">Account Security</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Create Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    {...form.register('password')}
                    disabled={isLoading}
                  />
                  {form.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    {...form.register('confirmPassword')}
                    disabled={isLoading}
                  />
                  {form.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Registering...' : 'Register School'}
            </Button>
          </form>
        )}
      </CardContent>
      {!credentials && (
        <CardFooter className="flex justify-center border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Already registered?{' '}
            <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/login')}>
              Sign in
            </Button>
          </p>
        </CardFooter>
      )}
    </Card>
  );
}