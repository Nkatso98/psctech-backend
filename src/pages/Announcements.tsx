import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Megaphone, 
  Clock, 
  Users, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AuthLayout } from '@/components/layout/auth-layout';
import { PageHeader } from '@/components/ui/page-header';
import { PageTransition } from '@/components/ui/page-transition';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  targetRoles: string[]; // Multiple roles can be targeted
  createdAt: string;
  expiresAt?: string;
  createdBy: string;
  isActive: boolean;
}

export default function Announcements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedRole, setSelectedRole] = useState('All');

  // State for create/edit announcement form
  const [createForm, setCreateForm] = useState({
    title: '',
    content: '',
    priority: 'Medium' as const,
    targetRoles: [] as string[],
    expiresAt: ''
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockAnnouncements: Announcement[] = [
      {
        id: '1',
        title: 'Parent-Teacher Meeting Schedule',
        content: 'Important reminder about upcoming parent-teacher meetings. All parents are encouraged to attend.',
        priority: 'High',
        targetRoles: ['Parent', 'Teacher'],
        createdAt: '2024-01-15T10:00:00Z',
        expiresAt: '2024-01-30T23:59:59Z',
        createdBy: 'Principal',
        isActive: true
      },
      {
        id: '2',
        title: 'Sports Day Registration',
        content: 'Registration for annual sports day is now open. Students can register for multiple events.',
        priority: 'Medium',
        targetRoles: ['Learner', 'Parent'],
        createdAt: '2024-01-14T14:30:00Z',
        expiresAt: '2024-01-25T23:59:59Z',
        createdBy: 'Sports Coordinator',
        isActive: true
      },
      {
        id: '3',
        title: 'Library Week Celebration',
        content: 'Join us for a week of reading activities, book fairs, and literary events.',
        priority: 'Low',
        targetRoles: ['All'],
        createdAt: '2024-01-13T09:00:00Z',
        expiresAt: '2024-01-20T23:59:59Z',
        createdBy: 'Librarian',
        isActive: true
      }
    ];
    setAnnouncements(mockAnnouncements);
  }, []);

  const canCreateAnnouncements = user?.role === 'Principal' || user?.role === 'Teacher';
  const canEditAnnouncements = user?.role === 'Principal' || user?.role === 'Teacher';

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'Critical': return <AlertTriangle className="h-3 w-3" />;
      case 'High': return <AlertTriangle className="h-3 w-3" />;
      case 'Medium': return <Info className="h-3 w-3" />;
      case 'Low': return <CheckCircle className="h-3 w-3" />;
      default: return <Info className="h-3 w-3" />;
    }
  };

  const getTargetRoleColor = (role: string) => {
    switch (role) {
      case 'All': return 'bg-purple-100 text-purple-800';
      case 'Principal': return 'bg-blue-100 text-blue-800';
      case 'Teacher': return 'bg-green-100 text-green-800';
      case 'Parent': return 'bg-yellow-100 text-yellow-800';
      case 'Learner': return 'bg-indigo-100 text-indigo-800';
      case 'SGB': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateAnnouncement = () => {
    if (!createForm.title || !createForm.content || createForm.targetRoles.length === 0) {
      alert('Please fill in all required fields and select at least one target role.');
      return;
    }

    const newAnnouncement: Announcement = {
      id: Date.now().toString(),
      title: createForm.title,
      content: createForm.content,
      priority: createForm.priority,
      targetRoles: createForm.targetRoles,
      createdAt: new Date().toISOString(),
      expiresAt: createForm.expiresAt || undefined,
      createdBy: user?.fullName || 'Unknown',
      isActive: true
    };
    
    setAnnouncements([newAnnouncement, ...announcements]);
    setShowCreateDialog(false);
    
    // Reset form
    setCreateForm({
      title: '',
      content: '',
      priority: 'Medium',
      targetRoles: [],
      expiresAt: ''
    });
  };

  const handleRoleToggle = (role: string) => {
    setCreateForm(prev => ({
      ...prev,
      targetRoles: prev.targetRoles.includes(role)
        ? prev.targetRoles.filter(r => r !== role)
        : [...prev.targetRoles, role]
    }));
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
  };

  const handleUpdateAnnouncement = (updatedData: Partial<Announcement>) => {
    if (editingAnnouncement) {
      setAnnouncements(announcements.map(ann => 
        ann.id === editingAnnouncement.id 
          ? { ...ann, ...updatedData }
          : ann
      ));
      setEditingAnnouncement(null);
    }
  };

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements(announcements.filter(ann => ann.id !== id));
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = selectedPriority === 'All' || announcement.priority === selectedPriority;
    const matchesRole = selectedRole === 'All' || announcement.targetRoles.includes(selectedRole);
    return matchesSearch && matchesPriority && matchesRole;
  });

  return (
    <AuthLayout>
      <DashboardLayout>
        <PageTransition>
          <PageHeader
            title="School Announcements"
            description="Stay updated with important school news, events, and announcements"
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Announcements', href: '/announcements' }
            ]}
            actions={
              canCreateAnnouncements ? (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Announcement
                </Button>
              ) : undefined
            }
          />

          <div className="space-y-6">
            {/* Filters */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Input
                  placeholder="Search announcements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Megaphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Priority</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Roles</SelectItem>
                  <SelectItem value="Principal">Principal</SelectItem>
                  <SelectItem value="Teacher">Teacher</SelectItem>
                  <SelectItem value="Parent">Parent</SelectItem>
                  <SelectItem value="Learner">Learner</SelectItem>
                  <SelectItem value="SGB">SGB</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Announcements List */}
            <div className="space-y-4">
              {filteredAnnouncements.map((announcement) => (
                <Card key={announcement.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{announcement.title}</CardTitle>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className={getPriorityColor(announcement.priority)}>
                            {getPriorityIcon(announcement.priority)}
                            <span className="ml-1">{announcement.priority}</span>
                          </Badge>
                          <div className="flex flex-wrap gap-1">
                            {announcement.targetRoles.map((role, index) => (
                              <Badge key={index} className={getTargetRoleColor(role)}>
                                <Users className="h-3 w-3 mr-1" />
                                {role}
                              </Badge>
                            ))}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(announcement.createdAt).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                      {canEditAnnouncements && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAnnouncement(announcement)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAnnouncement(announcement.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed mb-4">{announcement.content}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Created by: {announcement.createdBy}</span>
                      {announcement.expiresAt && (
                        <span>Expires: {new Date(announcement.expiresAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredAnnouncements.length === 0 && (
                <Card className="text-center py-12">
                  <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Announcements</h3>
                  <p className="text-gray-500 mb-4">
                    There are no announcements to display at the moment.
                  </p>
                  {canCreateAnnouncements && (
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Announcement
                    </Button>
                  )}
                </Card>
              )}
            </div>
          </div>

          {/* Create Announcement Dialog */}
          {canCreateAnnouncements && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Announcement</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={createForm.title}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter announcement title"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="content">Content *</Label>
                    <Textarea
                      id="content"
                      value={createForm.content}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Enter announcement content"
                      rows={4}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={createForm.priority} onValueChange={(value: any) => setCreateForm(prev => ({ ...prev, priority: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="expiresAt">Expiry Date (Optional)</Label>
                      <Input
                        id="expiresAt"
                        type="date"
                        value={createForm.expiresAt}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Target Roles *</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Select which user roles should see this announcement
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {['All', 'Principal', 'Teacher', 'Parent', 'Learner', 'SGB'].map((role) => (
                        <div key={role} className="flex items-center space-x-2">
                          <Checkbox
                            id={`role-${role}`}
                            checked={createForm.targetRoles.includes(role)}
                            onCheckedChange={() => handleRoleToggle(role)}
                          />
                          <Label htmlFor={`role-${role}`} className="text-sm font-normal">
                            {role}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateAnnouncement}>
                      Create Announcement
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </PageTransition>
      </DashboardLayout>
    </AuthLayout>
  );
}






