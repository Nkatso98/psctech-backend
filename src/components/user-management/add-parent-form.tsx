import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertCircleIcon, 
  Loader2Icon, 
  CheckCircleIcon,
  UserPlusIcon,
  UsersIcon
} from 'lucide-react';
import { User, UserRole } from '@/lib/types';
import { userStore } from '@/lib/store';
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '@/components/ui/modern-card';

const addParentSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  idNumber: z.string().min(13, 'ID number must be 13 digits').max(13, 'ID number must be 13 digits'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Valid email is required'),
  address: z.string().min(1, 'Address is required'),
});

type AddParentFormValues = z.infer<typeof addParentSchema>;

interface AddParentFormProps {
  institutionId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddParentForm({ institutionId, onSuccess, onCancel }: AddParentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdAccount, setCreatedAccount] = useState<{
    username: string;
    password: string;
  } | null>(null);

  const form = useForm<AddParentFormValues>({
    resolver: zodResolver(addParentSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      idNumber: '',
      phoneNumber: '',
      email: '',
      address: '',
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

  async function onSubmit(data: AddParentFormValues) {
    setIsLoading(true);
    setError(null);
    
    try {
      // Generate username and password
      const username = generateUsername(data.firstName, data.lastName);
      const password = generatePassword(data.idNumber);

      // Check if username already exists
      const existingUser = userStore.getAll().find(user => user.username === username);
      
      if (existingUser) {
        setError('A parent with this name already exists. Please use a different name.');
        return;
      }

      // Create parent user
      const parentUser: Omit<User, 'userId'> = {
        institutionId: institutionId,
        role: 'Parent',
        fullName: `${data.firstName} ${data.lastName}`,
        username: username,
        passwordHash: password,
        linkedIdNumber: data.idNumber,
        status: 'Active',
        email: data.email
      };

      userStore.create(parentUser);

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
      console.error('Error creating parent:', err);
      setError('Failed to create parent. Please try again.');
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Parent Added Successfully!</h2>
          <p className="text-gray-600 mb-6">
            The parent account has been created automatically.
          </p>

          {/* Parent Account Details */}
          <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200 mb-6">
            <div className="flex items-center mb-3">
              <UsersIcon className="w-5 h-5 text-emerald-600 mr-2" />
              <h3 className="font-semibold text-emerald-900">Parent Account</h3>
            </div>
            <div className="text-left space-y-3">
              <div>
                <span className="text-sm font-medium text-emerald-700">Username:</span>
                <p className="font-mono text-emerald-900 bg-white px-3 py-2 rounded text-sm">{createdAccount.username}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-emerald-700">Password:</span>
                <p className="font-mono text-emerald-900 bg-white px-3 py-2 rounded text-sm">{createdAccount.password}</p>
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
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-2 rounded-xl"
            >
              Add Another Parent
            </Button>
            {onCancel && (
              <Button
                onClick={onCancel}
                variant="outline"
                className="border-2 border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 px-6 py-2 rounded-xl"
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
    <ModernCard variant="elevated" className="w-full max-w-3xl">
      <ModernCardHeader>
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg">
            <UserPlusIcon className="w-9 h-9 text-white" />
          </div>
        </div>
        <ModernCardTitle>Add New Parent</ModernCardTitle>
        <ModernCardDescription>
          Add a new parent to the system. Account will be created automatically.
        </ModernCardDescription>
      </ModernCardHeader>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Parent Information */}
        <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
          <h3 className="text-lg font-semibold text-emerald-900 mb-4 flex items-center">
            <UsersIcon className="w-5 h-5 mr-2" />
            Parent Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium text-emerald-700">First Name</Label>
              <Input
                id="firstName"
                placeholder="Enter first name"
                {...form.register('firstName')}
                disabled={isLoading}
                className="h-10 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
              />
              {form.formState.errors.firstName && (
                <p className="text-sm text-red-600">{form.formState.errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium text-emerald-700">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Enter last name"
                {...form.register('lastName')}
                disabled={isLoading}
                className="h-10 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
              />
              {form.formState.errors.lastName && (
                <p className="text-sm text-red-600">{form.formState.errors.lastName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="idNumber" className="text-sm font-medium text-emerald-700">ID Number</Label>
              <Input
                id="idNumber"
                placeholder="Enter 13-digit ID number"
                {...form.register('idNumber')}
                disabled={isLoading}
                className="h-10 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
              />
              {form.formState.errors.idNumber && (
                <p className="text-sm text-red-600">{form.formState.errors.idNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-sm font-medium text-emerald-700">Phone Number</Label>
              <Input
                id="phoneNumber"
                placeholder="Enter phone number"
                {...form.register('phoneNumber')}
                disabled={isLoading}
                className="h-10 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
              />
              {form.formState.errors.phoneNumber && (
                <p className="text-sm text-red-600">{form.formState.errors.phoneNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-emerald-700">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                {...form.register('email')}
                disabled={isLoading}
                className="h-10 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address" className="text-sm font-medium text-emerald-700">Address</Label>
              <Input
                id="address"
                placeholder="Enter full address"
                {...form.register('address')}
                disabled={isLoading}
                className="h-10 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
              />
              {form.formState.errors.address && (
                <p className="text-sm text-red-600">{form.formState.errors.address.message}</p>
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
              className="border-2 border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 px-6 py-2 rounded-xl"
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isLoading ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Adding Parent...
              </>
            ) : (
              <>
                <UserPlusIcon className="mr-2 h-4 w-4" />
                Add Parent
              </>
            )}
          </Button>
        </div>
      </form>
    </ModernCard>
  );
}


