const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// Mock database for teachers
let teachers = [
  {
    id: 't001',
    employeeId: 'EMP001',
    fullName: 'Mrs. Sarah Johnson',
    email: 'sarah.johnson@psctech.edu',
    phone: '+27 82 123 4567',
    subjects: ['Mathematics', 'Advanced Mathematics'],
    classes: ['8A', '9B', '10A', '11A'],
    status: 'active',
    hireDate: '2024-01-15',
    qualifications: 'MSc Mathematics, BEd',
    createdAt: '2024-01-15T08:00:00Z'
  }
];

// Mock database for teacher accounts
let teacherAccounts = [
  {
    id: 'ta001',
    teacherId: 't001',
    username: 'sarah.johnson',
    passwordHash: '$2a$10$hashedpasswordhere', // This would be properly hashed
    email: 'sarah.johnson@psctech.edu',
    lastLogin: '2025-08-26T10:00:00Z',
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z'
  }
];

// Mock database for class allocations
let classAllocations = [
  {
    id: 'ca001',
    teacherId: 't001',
    class: '10A',
    subject: 'Mathematics',
    period: '10:30',
    day: 'Monday',
    room: 'Room 201',
    academicYear: '2025',
    term: 'Term 3'
  }
];

// Mock database for attendance records
let attendanceRecords = [
  {
    id: 'ar001',
    classId: 'ca001',
    date: '2025-08-26',
    period: '10:30',
    subject: 'Mathematics',
    teacherId: 't001',
    class: '10A',
    students: [
      {
        studentId: 's001',
        name: 'Alice Johnson',
        status: 'present',
        participation: 'excellent',
        notes: 'Active participation in algebra discussion'
      },
      {
        studentId: 's002',
        name: 'Michael Chen',
        status: 'present',
        participation: 'good',
        notes: 'Good understanding of equations'
      },
      {
        studentId: 's003',
        name: 'Emily Davis',
        status: 'absent',
        participation: 'none',
        notes: 'No reason provided'
      }
    ],
    createdAt: '2025-08-26T10:30:00Z',
    updatedAt: '2025-08-26T10:30:00Z'
  }
];

// GET all teachers
router.get('/', (req, res) => {
  try {
    const teachersWithDetails = teachers.map(teacher => {
      const account = teacherAccounts.find(ta => ta.teacherId === teacher.id);
      return {
        ...teacher,
        hasAccount: !!account,
        lastLogin: account?.lastLogin || null
      };
    });
    
    res.json({
      success: true,
      data: teachersWithDetails,
      message: 'Teachers retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving teachers',
      error: error.message
    });
  }
});

// GET teacher by ID
router.get('/:id', (req, res) => {
  try {
    const teacher = teachers.find(t => t.id === req.params.id);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    const account = teacherAccounts.find(ta => ta.teacherId === teacher.id);
    const allocations = classAllocations.filter(ca => ca.teacherId === teacher.id);
    
    res.json({
      success: true,
      data: {
        ...teacher,
        account: account ? {
          username: account.username,
          email: account.email,
          lastLogin: account.lastLogin,
          isActive: account.isActive
        } : null,
        classAllocations: allocations
      },
      message: 'Teacher retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving teacher',
      error: error.message
    });
  }
});

// POST create new teacher
router.post('/', async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      subjects,
      classes,
      qualifications,
      hireDate
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !subjects || !classes) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: fullName, email, subjects, classes'
      });
    }

    // Check if email already exists
    const existingTeacher = teachers.find(t => t.email === email);
    if (existingTeacher) {
      return res.status(400).json({
        success: false,
        message: 'Teacher with this email already exists'
      });
    }

    // Create new teacher
    const newTeacher = {
      id: `t${Date.now()}`,
      employeeId: `EMP${String(teachers.length + 1).padStart(3, '0')}`,
      fullName,
      email,
      phone: phone || '',
      subjects: Array.isArray(subjects) ? subjects : [subjects],
      classes: Array.isArray(classes) ? classes : [classes],
      status: 'active',
      hireDate: hireDate || new Date().toISOString().split('T')[0],
      qualifications: qualifications || '',
      createdAt: new Date().toISOString()
    };

    // Create teacher account automatically
    const username = email.split('@')[0];
    const defaultPassword = 'Welcome2025!'; // This would be configurable
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const newAccount = {
      id: `ta${Date.now()}`,
      teacherId: newTeacher.id,
      username,
      passwordHash,
      email: newTeacher.email,
      lastLogin: null,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    // Add to databases
    teachers.push(newTeacher);
    teacherAccounts.push(newAccount);

    // Create class allocations for the teacher
    const newAllocations = [];
    for (const className of newTeacher.classes) {
      for (const subject of newTeacher.subjects) {
        newAllocations.push({
          id: `ca${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          teacherId: newTeacher.id,
          class: className,
          subject: subject,
          period: 'TBD',
          day: 'TBD',
          room: 'TBD',
          academicYear: '2025',
          term: 'Term 3'
        });
      }
    }
    classAllocations.push(...newAllocations);

    res.status(201).json({
      success: true,
      data: {
        teacher: newTeacher,
        account: {
          username: newAccount.username,
          password: defaultPassword,
          email: newAccount.email
        },
        classAllocations: newAllocations
      },
      message: 'Teacher created successfully with automatic account and class allocations'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating teacher',
      error: error.message
    });
  }
});

// PUT update teacher
router.put('/:id', async (req, res) => {
  try {
    const teacherIndex = teachers.findIndex(t => t.id === req.params.id);
    if (teacherIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    const updatedTeacher = {
      ...teachers[teacherIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    teachers[teacherIndex] = updatedTeacher;

    res.json({
      success: true,
      data: updatedTeacher,
      message: 'Teacher updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating teacher',
      error: error.message
    });
  }
});

// DELETE teacher
router.delete('/:id', (req, res) => {
  try {
    const teacherIndex = teachers.findIndex(t => t.id === req.params.id);
    if (teacherIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Remove teacher and related data
    teachers.splice(teacherIndex, 1);
    teacherAccounts = teacherAccounts.filter(ta => ta.teacherId !== req.params.id);
    classAllocations = classAllocations.filter(ca => ca.teacherId !== req.params.id);

    res.json({
      success: true,
      message: 'Teacher deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting teacher',
      error: error.message
    });
  }
});

// GET teacher's class allocations
router.get('/:id/allocations', (req, res) => {
  try {
    const allocations = classAllocations.filter(ca => ca.teacherId === req.params.id);
    
    res.json({
      success: true,
      data: allocations,
      message: 'Class allocations retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving class allocations',
      error: error.message
    });
  }
});

// PUT update class allocation
router.put('/:id/allocations/:allocationId', (req, res) => {
  try {
    const allocationIndex = classAllocations.findIndex(ca => 
      ca.id === req.params.allocationId && ca.teacherId === req.params.id
    );
    
    if (allocationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Class allocation not found'
      });
    }

    const updatedAllocation = {
      ...classAllocations[allocationIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    classAllocations[allocationIndex] = updatedAllocation;

    res.json({
      success: true,
      data: updatedAllocation,
      message: 'Class allocation updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating class allocation',
      error: error.message
    });
  }
});

module.exports = router;


