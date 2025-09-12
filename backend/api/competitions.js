const express = require('express');
const router = express.Router();

// Mock database for competitions
let competitions = [
  {
    id: 'comp001',
    title: 'Academic Excellence Challenge 2024',
    description: 'A comprehensive academic competition covering Mathematics, Science, and Languages',
    category: 'Academic',
    startDate: '2024-09-15',
    endDate: '2024-10-15',
    maxParticipants: 50,
    currentParticipants: 32,
    status: 'Upcoming',
    prizes: ['1st Place: R50,000', '2nd Place: R30,000', '3rd Place: R20,000'],
    rules: ['Open to all registered schools', 'Maximum 5 students per school', 'Online and offline components'],
    participants: [],
    createdAt: '2024-08-20T10:00:00Z',
    createdBy: 'superadmin001',
    isActive: true
  },
  {
    id: 'comp002',
    title: 'Innovation in Education Awards',
    description: 'Recognizing schools that implement innovative teaching methods and technologies',
    category: 'Technology',
    startDate: '2024-08-01',
    endDate: '2024-11-30',
    maxParticipants: 30,
    currentParticipants: 28,
    status: 'Active',
    prizes: ['Innovation Grant: R100,000', 'Technology Package', 'Recognition Certificate'],
    rules: ['Submit project proposal', 'Implementation timeline', 'Impact assessment'],
    participants: [],
    createdAt: '2024-07-15T10:00:00Z',
    createdBy: 'superadmin001',
    isActive: true
  }
];

// Mock database for competition requests
let competitionRequests = [
  {
    id: 'req001',
    competitionId: 'comp001',
    competitionTitle: 'Academic Excellence Challenge 2024',
    institutionId: 'inst001',
    institutionName: 'St. Mary\'s Academy',
    principalId: 'principal001',
    principalName: 'Dr. Sarah Johnson',
    principalEmail: 'principal@stmarys.edu.za',
    requestDate: '2024-08-25T10:30:00Z',
    status: 'Pending',
    comments: 'Our school would like to participate in this competition. We have 5 students who are very interested in the academic challenge.',
    responseDate: null,
    responseComments: null,
    isActive: true
  },
  {
    id: 'req002',
    competitionId: 'comp002',
    competitionTitle: 'Innovation in Education Awards',
    institutionId: 'inst002',
    institutionName: 'City High School',
    principalId: 'principal002',
    principalName: 'Mr. David Wilson',
    principalEmail: 'principal@cityhigh.edu.za',
    requestDate: '2024-08-24T14:15:00Z',
    status: 'Approved',
    comments: 'We have an innovative project on sustainable energy that we believe would be perfect for this competition.',
    responseDate: '2024-08-26T09:00:00Z',
    responseComments: 'Approved! Your project sounds very interesting. Looking forward to seeing your submission.',
    isActive: true
  }
];

// Mock database for institutions
let institutions = [
  {
    id: 'inst001',
    name: 'St. Mary\'s Academy',
    type: 'Secondary',
    district: 'Johannesburg Central',
    address: '123 Main Street, Johannesburg',
    registeredOn: '2024-01-15',
    status: 'Active',
    subscriptionPlan: 'Premium',
    subscriptionStatus: 'Active',
    subscriptionEndDate: '2025-01-15',
    totalStudents: 450,
    totalTeachers: 35,
    totalParents: 420,
    performance: {
      averageScore: 78.5,
      attendanceRate: 94.2,
      completionRate: 89.1
    },
    lastActivity: '2024-08-27T10:30:00Z'
  },
  {
    id: 'inst002',
    name: 'City High School',
    type: 'Secondary',
    district: 'Cape Town Central',
    address: '456 Oak Avenue, Cape Town',
    registeredOn: '2024-02-20',
    status: 'Active',
    subscriptionPlan: 'Enterprise',
    subscriptionStatus: 'Active',
    subscriptionEndDate: '2025-02-20',
    totalStudents: 320,
    totalTeachers: 28,
    totalParents: 300,
    performance: {
      averageScore: 82.1,
      attendanceRate: 96.8,
      completionRate: 92.3
    },
    lastActivity: '2024-08-27T09:15:00Z'
  }
];

// Get all competitions
router.get('/', async (req, res) => {
  try {
    const activeCompetitions = competitions.filter(comp => comp.isActive);
    res.json(activeCompetitions);
  } catch (error) {
    console.error('Error fetching competitions:', error);
    res.status(500).json({ error: 'Failed to fetch competitions' });
  }
});

// Get competition by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const competition = competitions.find(comp => comp.id === id && comp.isActive);
    
    if (!competition) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    res.json(competition);
  } catch (error) {
    console.error('Error fetching competition:', error);
    res.status(500).json({ error: 'Failed to fetch competition' });
  }
});

// Create new competition (Superadmin only)
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      startDate,
      endDate,
      maxParticipants,
      prizes,
      rules
    } = req.body;

    const newCompetition = {
      id: `comp${Date.now()}`,
      title,
      description,
      category,
      startDate,
      endDate,
      maxParticipants: parseInt(maxParticipants),
      currentParticipants: 0,
      status: 'Upcoming',
      prizes: Array.isArray(prizes) ? prizes : [prizes],
      rules: Array.isArray(rules) ? rules : [rules],
      participants: [],
      createdAt: new Date().toISOString(),
      createdBy: req.user?.id || 'superadmin001',
      isActive: true
    };

    competitions.push(newCompetition);
    res.status(201).json(newCompetition);
  } catch (error) {
    console.error('Error creating competition:', error);
    res.status(500).json({ error: 'Failed to create competition' });
  }
});

// Update competition (Superadmin only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const competitionIndex = competitions.findIndex(comp => comp.id === id);
    if (competitionIndex === -1) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    competitions[competitionIndex] = {
      ...competitions[competitionIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    res.json(competitions[competitionIndex]);
  } catch (error) {
    console.error('Error updating competition:', error);
    res.status(500).json({ error: 'Failed to update competition' });
  }
});

// Delete competition (Superadmin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const competitionIndex = competitions.findIndex(comp => comp.id === id);
    
    if (competitionIndex === -1) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    competitions[competitionIndex].isActive = false;
    res.json({ message: 'Competition deleted successfully' });
  } catch (error) {
    console.error('Error deleting competition:', error);
    res.status(500).json({ error: 'Failed to delete competition' });
  }
});

// Get competition requests
router.get('/requests/all', async (req, res) => {
  try {
    const activeRequests = competitionRequests.filter(req => req.isActive);
    res.json(activeRequests);
  } catch (error) {
    console.error('Error fetching competition requests:', error);
    res.status(500).json({ error: 'Failed to fetch competition requests' });
  }
});

// Get competition requests by institution
router.get('/requests/institution/:institutionId', async (req, res) => {
  try {
    const { institutionId } = req.params;
    const institutionRequests = competitionRequests.filter(
      req => req.institutionId === institutionId && req.isActive
    );
    res.json(institutionRequests);
  } catch (error) {
    console.error('Error fetching institution competition requests:', error);
    res.status(500).json({ error: 'Failed to fetch institution competition requests' });
  }
});

// Create competition request (Principal)
router.post('/requests', async (req, res) => {
  try {
    const {
      competitionId,
      institutionId,
      principalId,
      comments
    } = req.body;

    // Find competition details
    const competition = competitions.find(comp => comp.id === competitionId);
    if (!competition) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    // Find institution details
    const institution = institutions.find(inst => inst.id === institutionId);
    if (!institution) {
      return res.status(404).json({ error: 'Institution not found' });
    }

    const newRequest = {
      id: `req${Date.now()}`,
      competitionId,
      competitionTitle: competition.title,
      institutionId,
      institutionName: institution.name,
      principalId,
      principalName: req.user?.fullName || 'Principal',
      principalEmail: req.user?.email || 'principal@school.edu.za',
      requestDate: new Date().toISOString(),
      status: 'Pending',
      comments,
      responseDate: null,
      responseComments: null,
      isActive: true
    };

    competitionRequests.push(newRequest);
    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error creating competition request:', error);
    res.status(500).json({ error: 'Failed to create competition request' });
  }
});

// Approve/Reject competition request (Superadmin)
router.patch('/requests/:requestId/approve', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { approved, comments } = req.body;

    const requestIndex = competitionRequests.findIndex(req => req.id === requestId);
    if (requestIndex === -1) {
      return res.status(404).json({ error: 'Competition request not found' });
    }

    const request = competitionRequests[requestIndex];
    request.status = approved ? 'Approved' : 'Rejected';
    request.responseDate = new Date().toISOString();
    request.responseComments = comments;

    // If approved, add institution to competition participants
    if (approved) {
      const competition = competitions.find(comp => comp.id === request.competitionId);
      if (competition) {
        competition.participants.push({
          institutionId: request.institutionId,
          institutionName: request.institutionName,
          joinedDate: new Date().toISOString()
        });
        competition.currentParticipants = competition.participants.length;
      }
    }

    res.json(request);
  } catch (error) {
    console.error('Error updating competition request:', error);
    res.status(500).json({ error: 'Failed to update competition request' });
  }
});

// Get platform statistics
router.get('/stats/platform', async (req, res) => {
  try {
    const stats = {
      totalCompetitions: competitions.filter(comp => comp.isActive).length,
      activeCompetitions: competitions.filter(comp => comp.status === 'Active' && comp.isActive).length,
      totalRequests: competitionRequests.filter(req => req.isActive).length,
      pendingRequests: competitionRequests.filter(req => req.status === 'Pending' && req.isActive).length,
      approvedRequests: competitionRequests.filter(req => req.status === 'Approved' && req.isActive).length,
      totalParticipants: competitions.reduce((sum, comp) => sum + comp.currentParticipants, 0)
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    res.status(500).json({ error: 'Failed to fetch platform stats' });
  }
});

module.exports = router;














