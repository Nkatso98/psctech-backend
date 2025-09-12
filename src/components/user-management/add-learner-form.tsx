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
  GraduationCapIcon,
  UsersIcon
} from 'lucide-react';
import { Learner, User, UserRole } from '@/lib/types';
import { learnerStore, userStore } from '@/lib/store';
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '@/components/ui/modern-card';

const addLearnerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  idNumber: z.string().min(13, 'ID number must be 13 digits').max(13, 'ID number must be 13 digits'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  grade: z.string().min(1, 'Grade is required'),
  class: z.string().min(1, 'Class is required'),
  // Parent details
  parentFirstName: z.string().min(1, 'Parent first name is required'),
  parentLastName: z.string().min(1, 'Parent last name is required'),
  parentIdNumber: z.string().min(13, 'Parent ID number must be 13 digits').max(13, 'Parent ID number must be 13 digits'),
  parentPhoneNumber: z.string().min(1, 'Parent phone number is required'),
  parentEmail: z.string().email('Valid parent email is required'),
  parentAddress: z.string().min(1, 'Parent address is required'),
});

type AddLearnerFormValues = z.infer<typeof addLearnerSchema>;

interface AddLearnerFormProps {
  institutionId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddLearnerForm({ institutionId, onSuccess, onCancel }: AddLearnerFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdAccounts, setCreatedAccounts] = useState<{
    learner: { username: string; password: string };
    parent: { username: string; password: string };
  } | null>(null);

  const form = useForm<AddLearnerFormValues>({
    resolver: zodResolver(addLearnerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      idNumber: '',
      dateOfBirth: '',
      grade: '',
      class: '',
      parentFirstName: '',
      parentLastName: '',
      parentIdNumber: '',
      parentPhoneNumber: '',
      parentEmail: '',
      parentAddress: '',
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

  async function onSubmit(data: AddLearnerFormValues) {
    setIsLoading(true);
    setError(null);
    
    try {
      // Generate usernames and passwords
      const learnerUsername = generateUsername(data.firstName, data.lastName);
      const parentUsername = generateUsername(data.parentFirstName, data.parentLastName);
      const learnerPassword = generatePassword(data.idNumber);
      const parentPassword = generatePassword(data.parentIdNumber);

      // Check if usernames already exist
      const existingLearner = userStore.getAll().find(user => user.username === learnerUsername);
      const existingParent = userStore.getAll().find(user => user.username === parentUsername);
      
      if (existingLearner) {
        setError('A learner with this name already exists. Please use a different name.');
        return;
      }
      
      if (existingParent) {
        setError('A parent with this name already exists. Please use a different name.');
        return;
      }

      // Create parent user first
      const parentUser: Omit<User, 'userId'> = {
        institutionId: institutionId,
        role: 'Parent',
        fullName: `${data.parentFirstName} ${data.parentLastName}`,
        username: parentUsername,
        passwordHash: parentPassword,
        linkedIdNumber: data.parentIdNumber,
        status: 'Active',
        email: data.parentEmail
      };

      const createdParent = userStore.create(parentUser);

      // Create learner user
      const learnerUser: Omit<User, 'userId'> = {
        institutionId: institutionId,
        role: 'Learner',
        fullName: `${data.firstName} ${data.lastName}`,
        username: learnerUsername,
        passwordHash: learnerPassword,
        linkedIdNumber: data.idNumber,
        status: 'Active'
      };

      const createdLearner = userStore.create(learnerUser);

      // Create learner record
      const learner: Omit<Learner, 'learnerId'> = {
        userId: createdLearner.userId,
        institutionId: institutionId,
        grade: parseInt(data.grade),
        class: data.class,
        parentUserId: createdParent.userId,
        dateOfBirth: data.dateOfBirth,
        subscriptionStatus: 'Active',
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      };

      learnerStore.create(learner);

      // Store created account details for display
      setCreatedAccounts({
        learner: { username: learnerUsername, password: learnerPassword },
        parent: { username: parentUsername, password: parentPassword }
      });

      setSuccess(true);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error creating learner:', err);
      setError('Failed to create learner. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  if (success && createdAccounts) {
    return (
      <ModernCard variant="elevated" className="w-full max-w-2xl">
        <div className="py-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="w-9 h-9 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Learner Added Successfully!</h2>
          <p className="text-gray-600 mb-6">
            The learner and parent accounts have been created automatically.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Learner Account Details */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center mb-3">
                <GraduationCapIcon className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-blue-900">Learner Account</h3>
              </div>
              <div className="text-left space-y-2">
                <div>
                  <span className="text-sm font-medium text-blue-700">Username:</span>
                  <p className="font-mono text-blue-900 bg-white px-2 py-1 rounded text-sm">{createdAccounts.learner.username}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-blue-700">Password:</span>
                  <p className="font-mono text-blue-900 bg-white px-2 py-1 rounded text-sm">{createdAccounts.learner.password}</p>
                </div>
              </div>
            </div>

            {/* Parent Account Details */}
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
              <div className="flex items-center mb-3">
                <UsersIcon className="w-5 h-5 text-emerald-600 mr-2" />
                <h3 className="font-semibold text-emerald-900">Parent Account</h3>
              </div>
              <div className="text-left space-y-2">
                <div>
                  <span className="text-sm font-medium text-emerald-700">Username:</span>
                  <p className="font-mono text-emerald-900 bg-white px-2 py-1 rounded text-sm">{createdAccounts.parent.username}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-emerald-700">Password:</span>
                  <p className="font-mono text-emerald-900 bg-white px-2 py-1 rounded text-sm">{createdAccounts.parent.password}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => {
                setSuccess(false);
                setCreatedAccounts(null);
                form.reset();
              }}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-xl"
            >
              Add Another Learner
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
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
            <UserPlusIcon className="w-9 h-9 text-white" />
          </div>
        </div>
        <ModernCardTitle>Add New Learner</ModernCardTitle>
        <ModernCardDescription>
          Add a new learner to the system. Parent account will be created automatically.
        </ModernCardDescription>
      </ModernCardHeader>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Learner Information */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
            <GraduationCapIcon className="w-5 h-5 mr-2" />
            Learner Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium text-blue-700">First Name</Label>
              <Input
                id="firstName"
                placeholder="Enter first name"
                {...form.register('firstName')}
                disabled={isLoading}
                className="h-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
              />
              {form.formState.errors.firstName && (
                <p className="text-sm text-red-600">{form.formState.errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium text-blue-700">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Enter last name"
                {...form.register('lastName')}
                disabled={isLoading}
                className="h-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
              />
              {form.formState.errors.lastName && (
                <p className="text-sm text-red-600">{form.formState.errors.lastName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="idNumber" className="text-sm font-medium text-blue-700">ID Number</Label>
              <Input
                id="idNumber"
                placeholder="Enter 13-digit ID number"
                {...form.register('idNumber')}
                disabled={isLoading}
                className="h-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
              />
              {form.formState.errors.idNumber && (
                <p className="text-sm text-red-600">{form.formState.errors.idNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-sm font-medium text-blue-700">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...form.register('dateOfBirth')}
                disabled={isLoading}
                className="h-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
              />
              {form.formState.errors.dateOfBirth && (
                <p className="text-sm text-red-600">{form.formState.errors.dateOfBirth.message}</p>
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

        {/* Parent Information */}
        <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
          <h3 className="text-lg font-semibold text-emerald-900 mb-4 flex items-center">
            <UsersIcon className="w-5 h-5 mr-2" />
            Parent Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="parentFirstName" className="text-sm font-medium text-emerald-700">Parent First Name</Label>
              <Input
                id="parentFirstName"
                placeholder="Enter parent first name"
                {...form.register('parentFirstName')}
                disabled={isLoading}
                className="h-10 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
              />
              {form.formState.errors.parentFirstName && (
                <p className="text-sm text-red-600">{form.formState.errors.parentFirstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentLastName" className="text-sm font-medium text-emerald-700">Parent Last Name</Label>
              <Input
                id="parentLastName"
                placeholder="Enter parent last name"
                {...form.register('parentLastName')}
                disabled={isLoading}
                className="h-10 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
              />
              {form.formState.errors.parentLastName && (
                <p className="text-sm text-red-600">{form.formState.errors.parentLastName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentIdNumber" className="text-sm font-medium text-emerald-700">Parent ID Number</Label>
              <Input
                id="parentIdNumber"
                placeholder="Enter 13-digit ID number"
                {...form.register('parentIdNumber')}
                disabled={isLoading}
                className="h-10 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
              />
              {form.formState.errors.parentIdNumber && (
                <p className="text-sm text-red-600">{form.formState.errors.parentIdNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentPhoneNumber" className="text-sm font-medium text-emerald-700">Phone Number</Label>
              <Input
                id="parentPhoneNumber"
                placeholder="Enter phone number"
                {...form.register('parentPhoneNumber')}
                disabled={isLoading}
                className="h-10 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
              />
              {form.formState.errors.parentPhoneNumber && (
                <p className="text-sm text-red-600">{form.formState.errors.parentPhoneNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentEmail" className="text-sm font-medium text-emerald-700">Email Address</Label>
              <Input
                id="parentEmail"
                type="email"
                placeholder="Enter email address"
                {...form.register('parentEmail')}
                disabled={isLoading}
                className="h-10 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
              />
              {form.formState.errors.parentEmail && (
                <p className="text-sm text-red-600">{form.formState.errors.parentEmail.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="parentAddress" className="text-sm font-medium text-emerald-700">Address</Label>
              <Input
                id="parentAddress"
                placeholder="Enter full address"
                {...form.register('parentAddress')}
                disabled={isLoading}
                className="h-10 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
              />
              {form.formState.errors.parentAddress && (
                <p className="text-sm text-red-600">{form.formState.errors.parentAddress.message}</p>
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
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isLoading ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Adding Learner...
              </>
            ) : (
              <>
                <UserPlusIcon className="mr-2 h-4 w-4" />
                Add Learner
              </>
            )}
          </Button>
        </div>
      </form>
    </ModernCard>
  );
}


