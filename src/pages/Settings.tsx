import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  SettingsIcon, 
  UserIcon,
  BellIcon,
  ShieldIcon,
  PaletteIcon,
  GlobeIcon,
  DownloadIcon,
  UploadIcon,
  SaveIcon,
  EyeIcon,
  EyeOffIcon,
  KeyIcon,
  MailIcon,
  SmartphoneIcon
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function Settings() {
  const { user, institution } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: '',
    bio: '',
    timezone: 'UTC',
    language: 'English'
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    homeworkReminders: true,
    attendanceAlerts: true,
    performanceUpdates: true,
    eventReminders: true,
    weeklyReports: false
  });
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'Public',
    contactInfoVisibility: 'Teachers Only',
    performanceVisibility: 'Private',
    allowMessages: true,
    showOnlineStatus: true,
    dataSharing: false
  });
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'system',
    fontSize: 'medium',
    colorScheme: 'default',
    compactMode: false,
    showAnimations: true
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    // Simulate API call - replace with actual API
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const saveProfile = async () => {
    setLoading(true);
    // Simulate API call - replace with actual API
    setTimeout(() => {
      console.log('Profile saved:', profileData);
      setLoading(false);
    }, 1000);
  };

  const saveNotificationSettings = async () => {
    setLoading(true);
    // Simulate API call - replace with actual API
    setTimeout(() => {
      console.log('Notification settings saved:', notificationSettings);
      setLoading(false);
    }, 1000);
  };

  const savePrivacySettings = async () => {
    setLoading(true);
    // Simulate API call - replace with actual API
    setTimeout(() => {
      console.log('Privacy settings saved:', privacySettings);
      setLoading(false);
    }, 1000);
  };

  const saveAppearanceSettings = async () => {
    setLoading(true);
    // Simulate API call - replace with actual API
    setTimeout(() => {
      console.log('Appearance settings saved:', appearanceSettings);
      setLoading(false);
    }, 1000);
  };

  const exportData = () => {
    const data = {
      profile: profileData,
      notifications: notificationSettings,
      privacy: privacySettings,
      appearance: appearanceSettings
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'user_settings.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.profile) setProfileData(data.profile);
          if (data.notifications) setNotificationSettings(data.notifications);
          if (data.privacy) setPrivacySettings(data.privacy);
          if (data.appearance) setAppearanceSettings(data.appearance);
        } catch (error) {
          console.error('Error importing settings:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <AuthLayout>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground">
                Manage your account preferences and system configuration
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={exportData}>
                <DownloadIcon className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Label htmlFor="import-settings" className="cursor-pointer">
                <Button variant="outline" asChild>
                  <span>
                    <UploadIcon className="h-4 w-4 mr-2" />
                    Import
                  </span>
                </Button>
              </Label>
              <input
                id="import-settings"
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </div>
          </div>

          {/* Settings Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
            </TabsList>

            {/* Profile Settings */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select value={profileData.timezone} onValueChange={(value) => setProfileData({...profileData, timezone: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="EST">Eastern Time</SelectItem>
                          <SelectItem value="PST">Pacific Time</SelectItem>
                          <SelectItem value="GMT">GMT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="language">Language</Label>
                      <Select value={profileData.language} onValueChange={(value) => setProfileData({...profileData, language: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Spanish">Spanish</SelectItem>
                          <SelectItem value="French">French</SelectItem>
                          <SelectItem value="German">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell us about yourself..."
                        value={profileData.bio}
                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <Button onClick={saveProfile} disabled={loading}>
                      <SaveIcon className="h-4 w-4 mr-2" />
                      Save Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BellIcon className="h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Notification Channels</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label htmlFor="email-notifications">Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                          </div>
                          <Switch
                            id="email-notifications"
                            checked={notificationSettings.emailNotifications}
                            onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label htmlFor="push-notifications">Push Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive push notifications in the app</p>
                          </div>
                          <Switch
                            id="push-notifications"
                            checked={notificationSettings.pushNotifications}
                            onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, pushNotifications: checked})}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label htmlFor="sms-notifications">SMS Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                          </div>
                          <Switch
                            id="sms-notifications"
                            checked={notificationSettings.smsNotifications}
                            onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, smsNotifications: checked})}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Notification Types</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label htmlFor="homework-reminders">Homework Reminders</Label>
                          </div>
                          <Switch
                            id="homework-reminders"
                            checked={notificationSettings.homeworkReminders}
                            onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, homeworkReminders: checked})}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label htmlFor="attendance-alerts">Attendance Alerts</Label>
                          </div>
                          <Switch
                            id="attendance-alerts"
                            checked={notificationSettings.attendanceAlerts}
                            onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, attendanceAlerts: checked})}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label htmlFor="performance-updates">Performance Updates</Label>
                          </div>
                          <Switch
                            id="performance-updates"
                            checked={notificationSettings.performanceUpdates}
                            onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, performanceUpdates: checked})}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label htmlFor="event-reminders">Event Reminders</Label>
                          </div>
                          <Switch
                            id="event-reminders"
                            checked={notificationSettings.eventReminders}
                            onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, eventReminders: checked})}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={saveNotificationSettings} disabled={loading}>
                        <SaveIcon className="h-4 w-4 mr-2" />
                        Save Notifications
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Settings */}
            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldIcon className="h-5 w-5" />
                    Privacy & Security
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Profile Visibility</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="profile-visibility">Profile Visibility</Label>
                          <Select value={privacySettings.profileVisibility} onValueChange={(value) => setPrivacySettings({...privacySettings, profileVisibility: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Public">Public - Everyone can see</SelectItem>
                              <SelectItem value="Teachers Only">Teachers Only</SelectItem>
                              <SelectItem value="Private">Private - Only you</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="contact-visibility">Contact Information</Label>
                          <Select value={privacySettings.contactInfoVisibility} onValueChange={(value) => setPrivacySettings({...privacySettings, contactInfoVisibility: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Public">Public - Everyone can see</SelectItem>
                              <SelectItem value="Teachers Only">Teachers Only</SelectItem>
                              <SelectItem value="Private">Private - Only you</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Communication</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label htmlFor="allow-messages">Allow Messages</Label>
                            <p className="text-sm text-muted-foreground">Allow other users to send you messages</p>
                          </div>
                          <Switch
                            id="allow-messages"
                            checked={privacySettings.allowMessages}
                            onCheckedChange={(checked) => setPrivacySettings({...privacySettings, allowMessages: checked})}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label htmlFor="show-online">Show Online Status</Label>
                            <p className="text-sm text-muted-foreground">Show when you're online</p>
                          </div>
                          <Switch
                            id="show-online"
                            checked={privacySettings.showOnlineStatus}
                            onCheckedChange={(checked) => setPrivacySettings({...privacySettings, showOnlineStatus: checked})}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={savePrivacySettings} disabled={loading}>
                        <SaveIcon className="h-4 w-4 mr-2" />
                        Save Privacy Settings
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance Settings */}
            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PaletteIcon className="h-5 w-5" />
                    Appearance & Display
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Theme & Colors</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label htmlFor="theme">Theme</Label>
                          <Select value={appearanceSettings.theme} onValueChange={(value) => setAppearanceSettings({...appearanceSettings, theme: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="dark">Dark</SelectItem>
                              <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="font-size">Font Size</Label>
                          <Select value={appearanceSettings.fontSize} onValueChange={(value) => setAppearanceSettings({...appearanceSettings, fontSize: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">Small</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="large">Large</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Display Options</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label htmlFor="compact-mode">Compact Mode</Label>
                            <p className="text-sm text-muted-foreground">Use compact spacing for interface elements</p>
                          </div>
                          <Switch
                            id="compact-mode"
                            checked={appearanceSettings.compactMode}
                            onCheckedChange={(checked) => setAppearanceSettings({...appearanceSettings, compactMode: checked})}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label htmlFor="show-animations">Show Animations</Label>
                            <p className="text-sm text-muted-foreground">Enable smooth animations and transitions</p>
                          </div>
                          <Switch
                            id="show-animations"
                            checked={appearanceSettings.showAnimations}
                            onCheckedChange={(checked) => setAppearanceSettings({...appearanceSettings, showAnimations: checked})}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={saveAppearanceSettings} disabled={loading}>
                        <SaveIcon className="h-4 w-4 mr-2" />
                        Save Appearance
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </AuthLayout>
  );
}











