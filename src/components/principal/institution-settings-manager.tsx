import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BuildingIcon, 
  UploadIcon, 
  SaveIcon, 
  EyeIcon,
  DownloadIcon,
  FileTextIcon,
  ImageIcon,
  SettingsIcon,
  PaletteIcon
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface InstitutionSettings {
  id: string;
  name: string;
  shortName: string;
  motto: string;
  description: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  established: string;
  principal: string;
  logo: string;
  letterheadColor: string;
  letterheadTextColor: string;
  footerText: string;
}

export function InstitutionSettingsManager() {
  const { user, institution } = useAuth();
  const [settings, setSettings] = useState<InstitutionSettings>({
    id: '',
    name: '',
    shortName: '',
    motto: '',
    description: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    established: '',
    principal: '',
    logo: '',
    letterheadColor: '#1f2937',
    letterheadTextColor: '#ffffff',
    footerText: 'Powered by Nkanyezi Tech Solutions'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (institution) {
      loadInstitutionSettings();
    }
  }, [institution]);

  const loadInstitutionSettings = () => {
    if (institution) {
      setSettings({
        id: institution.id || '',
        name: institution.name || '',
        shortName: institution.shortName || '',
        motto: institution.motto || 'Excellence in Education',
        description: institution.description || '',
        address: institution.address || '',
        city: institution.city || '',
        province: institution.province || '',
        postalCode: institution.postalCode || '',
        country: institution.country || 'South Africa',
        phone: institution.phone || '',
        email: institution.email || '',
        website: institution.website || '',
        established: institution.established || '',
        principal: institution.principal || '',
        logo: institution.logo || '/assets/images/psc-tech-logo.png',
        letterheadColor: institution.letterheadColor || '#1f2937',
        letterheadTextColor: institution.letterheadTextColor || '#ffffff',
        footerText: institution.footerText || 'Powered by Nkanyezi Tech Solutions'
      });
      setLogoPreview(institution.logo || '/assets/images/psc-tech-logo.png');
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // In a real app, you would upload the logo to a server and get the URL
      // For now, we'll use the preview URL
      const updatedSettings = {
        ...settings,
        logo: logoPreview
      };

      // Update the institution in the store
      // This would typically be an API call
      console.log('Saving institution settings:', updatedSettings);
      
      setIsEditing(false);
      setLogoFile(null);
    } catch (error) {
      console.error('Error saving institution settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setLogoFile(null);
    setLogoPreview(settings.logo);
    loadInstitutionSettings();
  };

  if (!user || user.role !== 'principal') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BuildingIcon className="h-4 w-4 mr-2" />
            Access Restricted
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Only principals can access institution settings.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Institution Configuration</h2>
          <p className="text-muted-foreground">
            Customize your school's information and PDF letterhead
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              <SettingsIcon className="h-4 w-4 mr-2" />
              Edit Settings
            </Button>
          )}
          {isEditing && (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                <SaveIcon className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">
            <BuildingIcon className="h-4 w-4 mr-2" />
            General Info
          </TabsTrigger>
          <TabsTrigger value="letterhead">
            <FileTextIcon className="h-4 w-4 mr-2" />
            Letterhead
          </TabsTrigger>
          <TabsTrigger value="preview">
            <EyeIcon className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Institution Name *</Label>
                  <Input
                    id="name"
                    value={settings.name}
                    onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter full institution name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortName">Short Name</Label>
                  <Input
                    id="shortName"
                    value={settings.shortName}
                    onChange={(e) => setSettings(prev => ({ ...prev, shortName: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="e.g., PSC"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motto">Motto</Label>
                  <Input
                    id="motto"
                    value={settings.motto}
                    onChange={(e) => setSettings(prev => ({ ...prev, motto: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="e.g., Excellence in Education"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="established">Established</Label>
                  <Input
                    id="established"
                    value={settings.established}
                    onChange={(e) => setSettings(prev => ({ ...prev, established: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="e.g., 1995"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="principal">Principal</Label>
                  <Input
                    id="principal"
                    value={settings.principal}
                    onChange={(e) => setSettings(prev => ({ ...prev, principal: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Principal's name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="info@school.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={settings.description}
                  onChange={(e) => setSettings(prev => ({ ...prev, description: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Brief description of your institution"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={settings.phone}
                    onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="+27 11 123 4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={settings.website}
                    onChange={(e) => setSettings(prev => ({ ...prev, website: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="https://school.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={settings.address}
                  onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Street address"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={settings.city}
                    onChange={(e) => setSettings(prev => ({ ...prev, city: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">Province</Label>
                  <Input
                    id="province"
                    value={settings.province}
                    onChange={(e) => setSettings(prev => ({ ...prev, province: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Province"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={settings.postalCode}
                    onChange={(e) => setSettings(prev => ({ ...prev, postalCode: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Postal code"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={settings.country}
                  onChange={(e) => setSettings(prev => ({ ...prev, country: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Country"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="letterhead" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logo & Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Institution Logo</Label>
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                    {logoPreview ? (
                      <img 
                        src={logoPreview} 
                        alt="Institution Logo" 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      disabled={!isEditing}
                    >
                      <UploadIcon className="h-4 w-4 mr-2" />
                      Upload Logo
                    </Button>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      disabled={!isEditing}
                    />
                    <p className="text-xs text-muted-foreground">
                      Recommended: 200x200px, PNG or JPG format
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Letterhead Customization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="letterheadColor">Header Background Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="letterheadColor"
                      type="color"
                      value={settings.letterheadColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, letterheadColor: e.target.value }))}
                      disabled={!isEditing}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={settings.letterheadColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, letterheadColor: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="#1f2937"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="letterheadTextColor">Header Text Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="letterheadTextColor"
                      type="color"
                      value={settings.letterheadTextColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, letterheadTextColor: e.target.value }))}
                      disabled={!isEditing}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={settings.letterheadTextColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, letterheadTextColor: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="footerText">Footer Text</Label>
                <Input
                  id="footerText"
                  value={settings.footerText}
                  onChange={(e) => setSettings(prev => ({ ...prev, footerText: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Powered by Nkanyezi Tech Solutions"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Letterhead Preview</span>
                <Button onClick={() => console.log('Generate test PDF')} variant="outline">
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Download Test PDF
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                  <div 
                    className="text-white p-6 rounded-lg mb-4"
                    style={{ backgroundColor: settings.letterheadColor }}
                  >
                    <div className="flex items-center justify-center space-x-4 mb-4">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                        {logoPreview ? (
                          <img 
                            src={logoPreview} 
                            alt="Logo" 
                            className="w-12 h-12 object-contain"
                          />
                        ) : (
                          <span className="text-2xl font-bold text-gray-600">
                            {settings.shortName || 'PSC'}
                          </span>
                        )}
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold">{settings.name || 'Institution Name'}</h1>
                        <p className="text-lg opacity-90">{settings.motto || 'Motto'}</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <h2 className="text-xl font-semibold">DOCUMENT TITLE</h2>
                      <p className="text-sm opacity-75">Letterhead Preview</p>
                    </div>
                  </div>
                  
                  <div className="text-left space-y-2 text-sm text-gray-600">
                    <p><strong>Institution:</strong> {settings.name || 'Not set'}</p>
                    <p><strong>Address:</strong> {settings.address || 'Not set'}, {settings.city || 'Not set'}</p>
                    <p><strong>Contact:</strong> {settings.phone || 'Not set'} | {settings.email || 'Not set'}</p>
                    <p><strong>Website:</strong> {settings.website || 'Not set'}</p>
                  </div>
                  
                  <div className="mt-4 p-4 bg-gray-100 rounded">
                    <p className="text-xs text-gray-500 text-center">
                      {settings.footerText || 'Footer text not set'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Current Settings</Label>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center space-x-2">
                        <span>Header Color:</span>
                        <div 
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: settings.letterheadColor }}
                        />
                        <span>{settings.letterheadColor}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>Text Color:</span>
                        <div 
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: settings.letterheadTextColor }}
                        />
                        <span>{settings.letterheadTextColor}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Quick Actions</Label>
                    <div className="space-y-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setActiveTab('letterhead')}
                        className="w-full"
                      >
                        <PaletteIcon className="h-4 w-4 mr-2" />
                        Customize Colors
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setActiveTab('general')}
                        className="w-full"
                      >
                        <BuildingIcon className="h-4 w-4 mr-2" />
                        Edit Information
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


