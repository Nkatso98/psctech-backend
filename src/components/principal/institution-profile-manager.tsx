import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Building2Icon, 
  PaletteIcon, 
  UploadIcon, 
  EyeIcon,
  SaveIcon,
  EditIcon,
  GlobeIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function InstitutionProfileManager() {
  const { institution, updateInstitution } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: institution?.name || '',
    type: institution?.type || 'Secondary',
    district: institution?.district || '',
    address: institution?.address || '',
    phone: institution?.phone || '',
    email: institution?.email || '',
    website: institution?.website || '',
    motto: institution?.motto || '',
    primaryColor: institution?.primaryColor || '#3b82f6',
    secondaryColor: institution?.secondaryColor || '#1e40af',
    logo: institution?.logo || null,
    letterhead: institution?.letterhead || ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, logo: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      // In a real app, this would call an API to update the institution
      await updateInstitution?.(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update institution:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: institution?.name || '',
      type: institution?.type || 'Secondary',
      district: institution?.district || '',
      address: institution?.address || '',
      phone: institution?.phone || '',
      email: institution?.email || '',
      website: institution?.website || '',
      motto: institution?.motto || '',
      primaryColor: institution?.primaryColor || '#3b82f6',
      secondaryColor: institution?.secondaryColor || '#1e40af',
      logo: institution?.logo || null,
      letterhead: institution?.letterhead || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-200 dark:border-blue-800">
              <Building2Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-2xl text-blue-800 dark:text-blue-200">Institution Profile</CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                Manage your institution's branding, contact information, and visual identity
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2Icon className="h-5 w-5 text-blue-600" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Core institution details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Institution Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter institution name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Institution Type</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="Primary">Primary</option>
                  <option value="Secondary">Secondary</option>
                  <option value="Combined">Combined</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                value={formData.district}
                onChange={(e) => handleInputChange('district', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter district"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter full address"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter website URL"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="motto">Institution Motto</Label>
              <Input
                id="motto"
                value={formData.motto}
                onChange={(e) => handleInputChange('motto', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter institution motto"
              />
            </div>
          </CardContent>
        </Card>

        {/* Visual Identity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PaletteIcon className="h-5 w-5 text-purple-600" />
              Visual Identity
            </CardTitle>
            <CardDescription>
              Logo, colors, and branding elements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo">Institution Logo</Label>
              <div className="flex items-center gap-4">
                {formData.logo && (
                  <div className="w-20 h-20 border rounded-lg overflow-hidden">
                    <img 
                      src={formData.logo} 
                      alt="Institution Logo" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={!isEditing}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: 200x200px, PNG or JPG format
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    disabled={!isEditing}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={formData.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    disabled={!isEditing}
                    placeholder="#3b82f6"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    disabled={!isEditing}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={formData.secondaryColor}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    disabled={!isEditing}
                    placeholder="#1e40af"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="letterhead">Letterhead Template</Label>
              <Textarea
                id="letterhead"
                value={formData.letterhead}
                onChange={(e) => handleInputChange('letterhead', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter letterhead template (HTML supported)"
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                This will be used for all official documents and PDF exports
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Letterhead Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <EyeIcon className="h-5 w-5 text-green-600" />
            Letterhead Preview
          </CardTitle>
          <CardDescription>
            Preview how your institution branding will appear on documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className="border rounded-lg p-8 min-h-[200px]"
            style={{
              backgroundColor: 'white',
              color: formData.primaryColor
            }}
          >
            <div 
              className="text-center mb-6"
              style={{ borderBottom: `3px solid ${formData.primaryColor}` }}
            >
              {formData.logo && (
                <img 
                  src={formData.logo} 
                  alt="Logo" 
                  className="h-16 mx-auto mb-4"
                />
              )}
              <h1 
                className="text-3xl font-bold mb-2"
                style={{ color: formData.primaryColor }}
              >
                {formData.name || 'Institution Name'}
              </h1>
              {formData.motto && (
                <p className="text-lg italic" style={{ color: formData.secondaryColor }}>
                  "{formData.motto}"
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPinIcon className="h-4 w-4" />
                  <span className="font-medium">Address:</span>
                </div>
                <p className="ml-6">{formData.address || 'Address not set'}</p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <PhoneIcon className="h-4 w-4" />
                  <span className="font-medium">Phone:</span>
                </div>
                <p className="ml-6">{formData.phone || 'Phone not set'}</p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MailIcon className="h-4 w-4" />
                  <span className="font-medium">Email:</span>
                </div>
                <p className="ml-6">{formData.email || 'Email not set'}</p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <GlobeIcon className="h-4 w-4" />
                  <span className="font-medium">Website:</span>
                </div>
                <p className="ml-6">{formData.website || 'Website not set'}</p>
              </div>
            </div>
            
            <div className="mt-8 text-center text-xs text-gray-500">
              <p>This is a preview of how your institution branding will appear on all official documents</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-end gap-4">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <EditIcon className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <SaveIcon className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Building2Icon, 
  PaletteIcon, 
  UploadIcon, 
  EyeIcon,
  SaveIcon,
  EditIcon,
  GlobeIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function InstitutionProfileManager() {
  const { institution, updateInstitution } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: institution?.name || '',
    type: institution?.type || 'Secondary',
    district: institution?.district || '',
    address: institution?.address || '',
    phone: institution?.phone || '',
    email: institution?.email || '',
    website: institution?.website || '',
    motto: institution?.motto || '',
    primaryColor: institution?.primaryColor || '#3b82f6',
    secondaryColor: institution?.secondaryColor || '#1e40af',
    logo: institution?.logo || null,
    letterhead: institution?.letterhead || ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, logo: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      // In a real app, this would call an API to update the institution
      await updateInstitution?.(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update institution:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: institution?.name || '',
      type: institution?.type || 'Secondary',
      district: institution?.district || '',
      address: institution?.address || '',
      phone: institution?.phone || '',
      email: institution?.email || '',
      website: institution?.website || '',
      motto: institution?.motto || '',
      primaryColor: institution?.primaryColor || '#3b82f6',
      secondaryColor: institution?.secondaryColor || '#1e40af',
      logo: institution?.logo || null,
      letterhead: institution?.letterhead || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-200 dark:border-blue-800">
              <Building2Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-2xl text-blue-800 dark:text-blue-200">Institution Profile</CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                Manage your institution's branding, contact information, and visual identity
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2Icon className="h-5 w-5 text-blue-600" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Core institution details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Institution Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter institution name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Institution Type</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="Primary">Primary</option>
                  <option value="Secondary">Secondary</option>
                  <option value="Combined">Combined</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                value={formData.district}
                onChange={(e) => handleInputChange('district', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter district"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter full address"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter website URL"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="motto">Institution Motto</Label>
              <Input
                id="motto"
                value={formData.motto}
                onChange={(e) => handleInputChange('motto', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter institution motto"
              />
            </div>
          </CardContent>
        </Card>

        {/* Visual Identity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PaletteIcon className="h-5 w-5 text-purple-600" />
              Visual Identity
            </CardTitle>
            <CardDescription>
              Logo, colors, and branding elements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo">Institution Logo</Label>
              <div className="flex items-center gap-4">
                {formData.logo && (
                  <div className="w-20 h-20 border rounded-lg overflow-hidden">
                    <img 
                      src={formData.logo} 
                      alt="Institution Logo" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={!isEditing}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: 200x200px, PNG or JPG format
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    disabled={!isEditing}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={formData.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    disabled={!isEditing}
                    placeholder="#3b82f6"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    disabled={!isEditing}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={formData.secondaryColor}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    disabled={!isEditing}
                    placeholder="#1e40af"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="letterhead">Letterhead Template</Label>
              <Textarea
                id="letterhead"
                value={formData.letterhead}
                onChange={(e) => handleInputChange('letterhead', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter letterhead template (HTML supported)"
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                This will be used for all official documents and PDF exports
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Letterhead Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <EyeIcon className="h-5 w-5 text-green-600" />
            Letterhead Preview
          </CardTitle>
          <CardDescription>
            Preview how your institution branding will appear on documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className="border rounded-lg p-8 min-h-[200px]"
            style={{
              backgroundColor: 'white',
              color: formData.primaryColor
            }}
          >
            <div 
              className="text-center mb-6"
              style={{ borderBottom: `3px solid ${formData.primaryColor}` }}
            >
              {formData.logo && (
                <img 
                  src={formData.logo} 
                  alt="Logo" 
                  className="h-16 mx-auto mb-4"
                />
              )}
              <h1 
                className="text-3xl font-bold mb-2"
                style={{ color: formData.primaryColor }}
              >
                {formData.name || 'Institution Name'}
              </h1>
              {formData.motto && (
                <p className="text-lg italic" style={{ color: formData.secondaryColor }}>
                  "{formData.motto}"
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPinIcon className="h-4 w-4" />
                  <span className="font-medium">Address:</span>
                </div>
                <p className="ml-6">{formData.address || 'Address not set'}</p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <PhoneIcon className="h-4 w-4" />
                  <span className="font-medium">Phone:</span>
                </div>
                <p className="ml-6">{formData.phone || 'Phone not set'}</p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MailIcon className="h-4 w-4" />
                  <span className="font-medium">Email:</span>
                </div>
                <p className="ml-6">{formData.email || 'Email not set'}</p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <GlobeIcon className="h-4 w-4" />
                  <span className="font-medium">Website:</span>
                </div>
                <p className="ml-6">{formData.website || 'Website not set'}</p>
              </div>
            </div>
            
            <div className="mt-8 text-center text-xs text-gray-500">
              <p>This is a preview of how your institution branding will appear on all official documents</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-end gap-4">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <EditIcon className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <SaveIcon className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
