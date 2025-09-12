import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  AlertCircleIcon, 
  Loader2Icon, 
  CheckCircleIcon,
  UserPlusIcon,
  BookOpenIcon,
  GraduationCapIcon
} from 'lucide-react';
import { Teacher, User, UserRole } from '@/lib/types';
import { teacherStore, userStore } from '@/lib/store';
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '@/components/ui/modern-card';

const addTeacherSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  idNumber: z.string().min(13, 'ID number must be 13 digits').max(13, 'ID number must be 13 digits'),
  email: z.string().email('Valid email is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
  subject: z.string().min(1, 'Subject is required'),
  grade: z.string().min(1, 'Grade is required'),
  class: z.string().min(1, 'Class is required'),
  companyNumber: z.string().min(1, 'Company number is required'),
});

type AddTeacherFormValues = z.infer<typeof addTeacherSchema>;

interface AddTeacherFormProps {
  institutionId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddTeacherForm({ institutionId, onSuccess, onCancel }: AddTeacherFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdAccount, setCreatedAccount] = useState<{
    username: string;
    password: string;
  } | null>(null);

  const form = useForm<AddTeacherFormValues>({
    resolver: zodResolver(addTeacherSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      idNumber: '',
      email: '',
      phoneNumber: '',
      address: '',
      subject: '',
      grade: '',
      class: '',
      companyNumber: '',
    },
  });

  // Generate username from first and last name
  const generateUsername = (firstName: string, lastName: string): string => {
    return `${firstName.toLowerCase()}${lastName.toLowerCase()}`.replace(/\s+/g, '');
  };

  // Generate password from ID number
  const generatePassword = (idNumber: string): string => {
    return idNumber;
  };

  async function onSubmit(data: AddTeacherFormValues) {
    setIsLoading(true);
    setError(null);
    
    try {
      // Generate username and password
      const username = generateUsername(data.firstName, data.lastName);
      const password = generatePassword(data.idNumber);

      // Check if username already exists
      const existingUser = userStore.getAll().find(user => user.username === username);
      
      if (existingUser) {
        setError('A teacher with this name already exists. Please use a different name.');
        return;
      }

      // Create teacher user
      const teacherUser: Omit<User, 'userId'> = {
        institutionId: institutionId,
        role: 'Teacher',
        fullName: `${data.firstName} ${data.lastName}`,
        username: username,
        passwordHash: password,
        linkedIdNumber: data.idNumber,
        status: 'Active',
        email: data.email
      };

      const createdTeacher = userStore.create(teacherUser);

      // Create teacher record
      const teacher: Omit<Teacher, 'teacherId'> = {
        userId: createdTeacher.userId,
        institutionId: institutionId,
        subject: data.subject,
        grade: parseInt(data.grade),
        class: data.class,
        companyNumber: data.companyNumber
      };

      teacherStore.create(teacher);

      // Store created account details for display
      setCreatedAccount({
        username: username,
        password: password
      });

      setSuccess(true);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error creating teacher:', err);
      setError('Failed to create teacher. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  if (success && createdAccount) {
    return (
      <ModernCard variant="elevated" className="w-full max-w-2xl">
        <div className="py-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="w-9 h-9 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Teacher Added Successfully!</h2>
          <p className="text-gray-600 mb-6">
            The teacher account has been created automatically.
          </p>

          {/* Teacher Account Details */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 mb-6">
            <div className="flex items-center mb-3">
              <BookOpenIcon className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="font-semibold text-blue-900">Teacher Account</h3>
            </div>
            <div className="text-left space-y-3">
              <div>
                <span className="text-sm font-medium text-blue-700">Username:</span>
                <p className="font-mono text-blue-900 bg-white px-3 py-2 rounded text-sm">{createdAccount.username}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-700">Password:</span>
                <p className="font-mono text-blue-900 bg-white px-3 py-2 rounded text-sm">{createdAccount.password}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => {
                setSuccess(false);
                setCreatedAccount(null);
                form.reset();
              }}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-xl"
            >
              Add Another Teacher
            </Button>
            {onCancel && (
              <Button
                onClick={onCancel}
                variant="outline"
                className="border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 px-6 py-2 rounded-xl"
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </ModernCard>
    );
  }

  return (
    <ModernCard variant="elevated" className="w-full max-w-4xl">
      <ModernCardHeader>
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg">
            <UserPlusIcon className="w-9 h-9 text-white" />
          </div>
        </div>
        <ModernCardTitle>Add New Teacher</ModernCardTitle>
        <ModernCardDescription>
          Add a new teacher to the system. Account will be created automatically.
        </ModernCardDescription>
      </ModernCardHeader>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Personal Information */}
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
            <UserPlusIcon className="w-5 h-5 mr-2" />
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium text-purple-700">First Name</Label>
              <Input
                id="firstName"
                placeholder="Enter first name"
                {...form.register('firstName')}
                disabled={isLoading}
                className="h-10 border-purple-200 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
              />
              {form.formState.errors.firstName && (
                <p className="text-sm text-red-600">{form.formState.errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium text-purple-700">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Enter last name"
                {...form.register('lastName')}
                disabled={isLoading}
                className="h-10 border-purple-200 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
              />
              {form.formState.errors.lastName && (
                <p className="text-sm text-red-600">{form.formState.errors.lastName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="idNumber" className="text-sm font-medium text-purple-700">ID Number</Label>
              <Input
                id="idNumber"
                placeholder="Enter 13-digit ID number"
                {...form.register('idNumber')}
                disabled={isLoading}
                className="h-10 border-purple-200 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
              />
              {form.formState.errors.idNumber && (
                <p className="text-sm text-red-600">{form.formState.errors.idNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-purple-700">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                {...form.register('email')}
                disabled={isLoading}
                className="h-10 border-purple-200 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-sm font-medium text-purple-700">Phone Number</Label>
              <Input
                id="phoneNumber"
                placeholder="Enter phone number"
                {...form.register('phoneNumber')}
                disabled={isLoading}
                className="h-10 border-purple-200 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
              />
              {form.formState.errors.phoneNumber && (
                <p className="text-sm text-red-600">{form.formState.errors.phoneNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyNumber" className="text-sm font-medium text-purple-700">Company Number</Label>
              <Input
                id="companyNumber"
                placeholder="Enter company number"
                {...form.register('companyNumber')}
                disabled={isLoading}
                className="h-10 border-purple-200 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
              />
              {form.formState.errors.companyNumber && (
                <p className="text-sm text-red-600">{form.formState.errors.companyNumber.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address" className="text-sm font-medium text-purple-700">Address</Label>
              <Input
                id="address"
                placeholder="Enter full address"
                {...form.register('address')}
                disabled={isLoading}
                className="h-10 border-purple-200 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
              />
              {form.formState.errors.address && (
                <p className="text-sm text-red-600">{form.formState.errors.address.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Teaching Information */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
            <BookOpenIcon className="w-5 h-5 mr-2" />
            Teaching Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-sm font-medium text-blue-700">Subject</Label>
              <Select
                onValueChange={(value) => form.setValue('subject', value)}
                defaultValue={form.getValues('subject')}
                disabled={isLoading}
              >
                <SelectTrigger className="h-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    'Mathematics', 'English', 'Afrikaans', 'Zulu', 'Xhosa', 'Sesotho',
                    'Physical Sciences', 'Life Sciences', 'Geography', 'History',
                    'Economics', 'Business Studies', 'Accounting', 'Computer Applications Technology',
                    'Life Orientation', 'Consumer Studies', 'Tourism', 'Hospitality Studies'
                  ].map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.subject && (
                <p className="text-sm text-red-600">{form.formState.errors.subject.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade" className="text-sm font-medium text-blue-700">Grade</Label>
              <Select
                onValueChange={(value) => form.setValue('grade', value)}
                defaultValue={form.getValues('grade')}
                disabled={isLoading}
              >
                <SelectTrigger className="h-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(grade => (
                    <SelectItem key={grade} value={grade.toString()}>
                      Grade {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.grade && (
                <p className="text-sm text-red-600">{form.formState.errors.grade.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="class" className="text-sm font-medium text-blue-700">Class</Label>
              <Select
                onValueChange={(value) => form.setValue('class', value)}
                defaultValue={form.getValues('class')}
                disabled={isLoading}
              >
                <SelectTrigger className="h-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {['A', 'B', 'C', 'D', 'E', 'F'].map(className => (
                    <SelectItem key={className} value={className}>
                      Class {className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.class && (
                <p className="text-sm text-red-600">{form.formState.errors.class.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          {onCancel && (
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              disabled={isLoading}
              className="border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 px-6 py-2 rounded-xl"
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isLoading ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Adding Teacher...
              </>
            ) : (
              <>
                <UserPlusIcon className="mr-2 h-4 w-4" />
                Add Teacher
              </>
            )}
          </Button>
        </div>
      </form>
    </ModernCard>
  );
}


