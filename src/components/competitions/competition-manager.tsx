import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrophyIcon, 
  UsersIcon, 
  CalendarIcon, 
  TargetIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  AwardIcon,
  ClockIcon,
  MapPinIcon,
  BookOpenIcon,
  StarIcon,
  TrendingUpIcon,
  CheckCircleIcon,
  AlertCircleIcon
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface Competition {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  currentParticipants: number;
  status: 'upcoming' | 'active' | 'completed';
  prizes: string[];
  rules: string[];
  participants: any[];
  results?: any[];
}

export function CompetitionManager() {
  const { user } = useAuth();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState<Competition | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    startDate: '',
    endDate: '',
    maxParticipants: 100,
    prizes: [''],
    rules: ['']
  });

  // Mock data for competitions
  useEffect(() => {
    const mockCompetitions: Competition[] = [
      {
        id: '1',
        title: 'Mathematics Olympiad',
        description: 'Annual mathematics competition for high school students',
        category: 'Academic',
        startDate: '2025-09-01',
        endDate: '2025-09-30',
        maxParticipants: 200,
        currentParticipants: 156,
        status: 'upcoming',
        prizes: ['1st Place: R5000', '2nd Place: R3000', '3rd Place: R1500'],
        rules: ['Open to Grade 10-12 students', 'Individual participation only', 'No calculators allowed'],
        participants: []
      },
      {
        id: '2',
        title: 'Science Fair',
        description: 'Innovation and research project showcase',
        category: 'Science',
        startDate: '2025-08-15',
        endDate: '2025-08-20',
        maxParticipants: 50,
        currentParticipants: 42,
        status: 'active',
        prizes: ['Best Innovation: R3000', 'Most Creative: R2000', 'Best Research: R1500'],
        rules: ['Group projects allowed (max 3 students)', 'Projects must be original work', 'Presentation required'],
        participants: []
      },
      {
        id: '3',
        title: 'Debate Championship',
        description: 'Inter-school debate competition',
        category: 'Public Speaking',
        startDate: '2025-07-01',
        endDate: '2025-07-15',
        maxParticipants: 100,
        currentParticipants: 100,
        status: 'completed',
        prizes: ['Champion Team: R4000', 'Runner-up: R2500', 'Best Speaker: R1000'],
        rules: ['Teams of 4 students', 'Topics announced 1 week before', 'Judged by external panel'],
        participants: [],
        results: [
          { team: 'Team Alpha', position: 1, score: 95 },
          { team: 'Team Beta', position: 2, score: 88 },
          { team: 'Team Gamma', position: 3, score: 82 }
        ]
      }
    ];
    setCompetitions(mockCompetitions);
  }, []);

  const handleCreateCompetition = () => {
    const newCompetition: Competition = {
      id: Date.now().toString(),
      ...formData,
      currentParticipants: 0,
      status: 'upcoming',
      participants: []
    };
    setCompetitions([...competitions, newCompetition]);
    setFormData({
      title: '',
      description: '',
      category: '',
      startDate: '',
      endDate: '',
      maxParticipants: 100,
      prizes: [''],
      rules: ['']
    });
    setShowCreateForm(false);
  };

  const handleEditCompetition = (competition: Competition) => {
    setEditingCompetition(competition);
    setFormData({
      title: competition.title,
      description: competition.description,
      category: competition.category,
      startDate: competition.startDate,
      endDate: competition.endDate,
      maxParticipants: competition.maxParticipants,
      prizes: competition.prizes,
      rules: competition.rules
    });
    setShowCreateForm(true);
  };

  const handleUpdateCompetition = () => {
    if (!editingCompetition) return;
    
    const updatedCompetitions = competitions.map(comp => 
      comp.id === editingCompetition.id 
        ? { ...comp, ...formData }
        : comp
    );
    setCompetitions(updatedCompetitions);
    setEditingCompetition(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      startDate: '',
      endDate: '',
      maxParticipants: 100,
      prizes: [''],
      rules: ['']
    });
    setShowCreateForm(false);
  };

  const handleDeleteCompetition = (id: string) => {
    setCompetitions(competitions.filter(comp => comp.id !== id));
  };

  const addPrize = () => {
    setFormData({ ...formData, prizes: [...formData.prizes, ''] });
  };

  const removePrize = (index: number) => {
    const newPrizes = formData.prizes.filter((_, i) => i !== index);
    setFormData({ ...formData, prizes: newPrizes });
  };

  const updatePrize = (index: number, value: string) => {
    const newPrizes = [...formData.prizes];
    newPrizes[index] = value;
    setFormData({ ...formData, prizes: newPrizes });
  };

  const addRule = () => {
    setFormData({ ...formData, rules: [...formData.rules, ''] });
  };

  const removeRule = (index: number) => {
    const newRules = formData.rules.filter((_, i) => i !== index);
    setFormData({ ...formData, rules: newRules });
  };

  const updateRule = (index: number, value: string) => {
    const newRules = [...formData.rules];
    newRules[index] = value;
    setFormData({ ...formData, rules: newRules });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const canManageCompetitions = user?.role === 'admin' || user?.role === 'moderator';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Competition Management</h2>
          <p className="text-muted-foreground">
            {canManageCompetitions 
              ? 'Create and manage school competitions'
              : 'View available competitions and participate'
            }
          </p>
        </div>
        {canManageCompetitions && (
          <Button onClick={() => setShowCreateForm(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Competition
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Competitions</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {competitions.map((competition) => (
              <Card key={competition.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <TrophyIcon className="h-5 w-5 text-yellow-600" />
                        {competition.title}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {competition.description}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(competition.status)}>
                      {competition.status.charAt(0).toUpperCase() + competition.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpenIcon className="h-4 w-4" />
                      <span>{competition.category}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{new Date(competition.startDate).toLocaleDateString()} - {new Date(competition.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <UsersIcon className="h-4 w-4" />
                      <span>{competition.currentParticipants}/{competition.maxParticipants} participants</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AwardIcon className="h-4 w-4" />
                      <span>{competition.prizes.length} prizes</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <EyeIcon className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                    {canManageCompetitions && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditCompetition(competition)}
                        >
                          <EditIcon className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteCompetition(competition.id)}
                        >
                          <TrashIcon className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {competitions.filter(c => c.status === 'upcoming').map((competition) => (
              <Card key={competition.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrophyIcon className="h-5 w-5 text-yellow-600" />
                    {competition.title}
                  </CardTitle>
                  <CardDescription>{competition.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Starts: {new Date(competition.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <UsersIcon className="h-4 w-4" />
                      <span>{competition.currentParticipants}/{competition.maxParticipants} participants</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Join Competition
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {competitions.filter(c => c.status === 'active').map((competition) => (
              <Card key={competition.id} className="hover:shadow-lg transition-shadow border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrophyIcon className="h-5 w-5 text-green-600" />
                    {competition.title}
                  </CardTitle>
                  <CardDescription>{competition.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <ClockIcon className="h-4 w-4" />
                      <span>Ends: {new Date(competition.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <UsersIcon className="h-4 w-4" />
                      <span>{competition.currentParticipants}/{competition.maxParticipants} participants</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    <EyeIcon className="mr-2 h-4 w-4" />
                    View Progress
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {competitions.filter(c => c.status === 'completed').map((competition) => (
              <Card key={competition.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrophyIcon className="h-5 w-5 text-gray-600" />
                    {competition.title}
                  </CardTitle>
                  <CardDescription>{competition.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                      <span>Completed: {new Date(competition.endDate).toLocaleDateString()}</span>
                    </div>
                    {competition.results && competition.results.length > 0 && (
                      <div className="mt-3">
                        <h4 className="font-medium mb-2">Top Results:</h4>
                        <div className="space-y-1">
                          {competition.results.slice(0, 3).map((result, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{result.team}</span>
                              <span className="font-medium">{result.position === 1 ? '🥇' : result.position === 2 ? '🥈' : '🥉'} {result.score}pts</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    <EyeIcon className="mr-2 h-4 w-4" />
                    View Results
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Competition Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingCompetition ? 'Edit Competition' : 'Create New Competition'}
              </h3>
              <Button variant="outline" size="sm" onClick={() => setShowCreateForm(false)}>
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="title">Competition Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter competition title"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Academic">Academic</SelectItem>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="Arts">Arts</SelectItem>
                      <SelectItem value="Sports">Sports</SelectItem>
                      <SelectItem value="Public Speaking">Public Speaking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter competition description"
                  rows={3}
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="maxParticipants">Maximum Participants</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({...formData, maxParticipants: parseInt(e.target.value)})}
                  min="1"
                />
              </div>
              
              <div>
                <Label>Prizes</Label>
                <div className="space-y-2">
                  {formData.prizes.map((prize, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={prize}
                        onChange={(e) => updatePrize(index, e.target.value)}
                        placeholder={`Prize ${index + 1}`}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removePrize(index)}
                        disabled={formData.prizes.length === 1}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addPrize}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add Prize
                  </Button>
                </div>
              </div>
              
              <div>
                <Label>Rules</Label>
                <div className="space-y-2">
                  {formData.rules.map((rule, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={rule}
                        onChange={(e) => updateRule(index, e.target.value)}
                        placeholder={`Rule ${index + 1}`}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeRule(index)}
                        disabled={formData.rules.length === 1}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addRule}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add Rule
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={editingCompetition ? handleUpdateCompetition : handleCreateCompetition}
                  disabled={!formData.title || !formData.description || !formData.category}
                >
                  {editingCompetition ? 'Update Competition' : 'Create Competition'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}











