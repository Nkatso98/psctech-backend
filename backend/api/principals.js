const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

// Mock database for teachers (institution-specific)
let teachers = [
  {
    id: 't001',
    institutionId: 'inst001',
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
    passwordHash: '$2a$10$hashedpasswordhere',
    email: 'sarah.johnson@psctech.edu',
    lastLogin: '2025-08-26T10:00:00Z',
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z'
  }
];

// Mock database for students/learners
let students = [
  {
    id: 's001',
    institutionId: 'inst001',
    name: 'Alice Johnson',
    surname: 'Johnson',
    fullName: 'Alice Johnson',
    studentId: 'STU001',
    idNumber: '2006123456789',
    class: '10A',
    grade: '10',
    subjects: ['Mathematics', 'English', 'Science', 'History'],
    status: 'active',
    enrollmentDate: '2024-01-15',
    parentContact: '+27 82 123 4567',
    parentEmail: 'parent@email.com',
    createdAt: '2024-01-15T08:00:00Z'
  },
  {
    id: 's002',
    institutionId: 'inst001',
    name: 'Michael Chen',
    surname: 'Chen',
    fullName: 'Michael Chen',
    studentId: 'STU002',
    idNumber: '2006123456790',
    class: '10A',
    grade: '10',
    subjects: ['Mathematics', 'English', 'Science', 'History'],
    status: 'active',
    enrollmentDate: '2024-01-15',
    parentContact: '+27 82 123 4568',
    parentEmail: 'parent2@email.com',
    createdAt: '2024-01-15T08:00:00Z'
  },
  {
    id: 's003',
    institutionId: 'inst001',
    name: 'Emily Davis',
    surname: 'Davis',
    fullName: 'Emily Davis',
    studentId: 'STU003',
    idNumber: '2006123456791',
    class: '10A',
    grade: '10',
    subjects: ['Mathematics', 'English', 'Science', 'History'],
    status: 'active',
    enrollmentDate: '2024-01-15',
    parentContact: '+27 82 123 4569',
    parentEmail: 'parent3@email.com',
    createdAt: '2024-01-15T08:00:00Z'
  }
];

// Mock database for learner accounts
let learnerAccounts = [
  {
    id: 'la001',
    studentId: 's001',
    username: 'alice.johnson',
    passwordHash: '$2a$10$hashedpasswordhere',
    email: 'alice.johnson@psctech.edu',
    lastLogin: '2025-08-26T10:00:00Z',
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z'
  }
];

// Mock database for homework assignments
let homeworkAssignments = [
  {
    id: 'hw001',
    institutionId: 'inst001',
    teacherId: 't001',
    class: '10A',
    subject: 'Mathematics',
    title: 'Algebra Fundamentals',
    description: 'Complete exercises 1-20 on quadratic equations',
    dueDate: '2025-09-02',
    grade: '10',
    curriculum: 'CAPS',
    attachments: ['worksheet.pdf', 'examples.pdf'],
    status: 'active',
    createdAt: '2025-08-26T10:00:00Z'
  }
];

// Mock database for AI-generated tests
let aiTests = [
  {
    id: 'test001',
    institutionId: 'inst001',
    class: '10A',
    subject: 'Mathematics',
    grade: '10',
    curriculum: 'CAPS',
    title: 'Algebra Test - Term 3',
    questions: [
      {
        id: 'q1',
        question: 'Solve for x: 2x² + 5x - 3 = 0',
        type: 'multiple_choice',
        options: ['x = 1/2 or x = -3', 'x = -1/2 or x = 3', 'x = 1 or x = -3/2', 'x = -1 or x = 3/2'],
        correctAnswer: 'x = 1/2 or x = -3',
        explanation: 'Using the quadratic formula: x = (-5 ± √(25 + 24)) / 4 = (-5 ± 7) / 4'
      }
    ],
    memorandum: [
      {
        questionId: 'q1',
        solution: '2x² + 5x - 3 = 0\nUsing quadratic formula: x = (-b ± √(b² - 4ac)) / 2a\nx = (-5 ± √(25 + 24)) / 4\nx = (-5 ± 7) / 4\nx = 1/2 or x = -3',
        marks: 5
      }
    ],
    totalMarks: 50,
    duration: 60,
    difficulty: 'medium',
    createdAt: '2025-08-26T10:00:00Z'
  }
];

// Mock database for class allocations
let classAllocations = [
  {
    id: 'ca001',
    institutionId: 'inst001',
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
    institutionId: 'inst001',
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

// Mock database for parent/guardian accounts
let parentAccounts = [
  {
    id: 'p001',
    institutionId: 'inst001',
    name: 'John',
    surname: 'Johnson',
    fullName: 'John Johnson',
    idNumber: '1975123456789',
    phone: '+27 82 123 4567',
    email: 'john.johnson@email.com',
    username: 'john.johnson',
    passwordHash: '$2a$10$hashedpasswordhere',
    subscriptionStatus: 'active',
    subscriptionExpiry: '2025-09-26T00:00:00Z',
    children: ['s001'], // Array of child student IDs
    voucherCode: 'VOUCHER001',
    monthlyFee: 5.00,
    lastLogin: '2025-08-26T10:00:00Z',
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z'
  }
];

// Mock database for vouchers
let vouchers = [
  {
    id: 'v001',
    code: 'VOUCHER001',
    institutionId: 'inst001',
    parentId: 'p001',
    amount: 5.00,
    status: 'used',
    usedAt: '2024-01-15T08:00:00Z',
    expiresAt: '2025-12-31T23:59:59Z',
    createdAt: '2024-01-15T08:00:00Z'
  }
];

// Mock database for school announcements
let schoolAnnouncements = [
  {
    id: 'ann001',
    institutionId: 'inst001',
    title: 'Parent-Teacher Meeting',
    content: 'Annual parent-teacher meeting scheduled for next Friday',
    priority: 'high',
    targetAudience: 'all', // all, parents, teachers, students
    createdAt: '2025-08-26T10:00:00Z',
    expiresAt: '2025-09-30T23:59:59Z'
  }
];

// Mock database for parent-teacher communications
let parentTeacherMessages = [
  {
    id: 'msg001',
    institutionId: 'inst001',
    parentId: 'p001',
    teacherId: 't001',
    studentId: 's001',
    subject: 'Mathematics Progress',
    message: 'How is my child performing in Mathematics?',
    sender: 'parent',
    status: 'unread',
    createdAt: '2025-08-26T10:00:00Z'
  }
];

// GET all teachers for the institution
router.get('/teachers', (req, res) => {
  try {
    const institutionId = req.headers['x-institution-id'] || 'inst001'; // In real app, get from auth token
    
    const teachersWithDetails = teachers
      .filter(teacher => teacher.institutionId === institutionId)
      .map(teacher => {
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

// POST create new teacher (principal adds teacher)
router.post('/teachers', async (req, res) => {
  try {
    const institutionId = req.headers['x-institution-id'] || 'inst001';
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
      institutionId,
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
          institutionId,
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

// GET all students/learners for the institution
router.get('/students', (req, res) => {
  try {
    const institutionId = req.headers['x-institution-id'] || 'inst001';
    
    const studentsWithDetails = students
      .filter(student => student.institutionId === institutionId)
      .map(student => {
        const account = learnerAccounts.find(la => la.studentId === student.id);
        return {
          ...student,
          hasAccount: !!account,
          lastLogin: account?.lastLogin || null
        };
      });
    
    res.json({
      success: true,
      data: studentsWithDetails,
      message: 'Students retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving students',
      error: error.message
    });
  }
});

// POST create new student (principal adds student)
router.post('/students', async (req, res) => {
  try {
    const institutionId = req.headers['x-institution-id'] || 'inst001';
    const {
      name,
      surname,
      idNumber,
      class: className,
      grade,
      subjects,
      parentContact,
      parentEmail
    } = req.body;

    // Validate required fields
    if (!name || !surname || !idNumber || !className || !grade) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, surname, idNumber, class, grade'
      });
    }

    // Check if ID number already exists
    const existingStudent = students.find(s => s.idNumber === idNumber);
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student with this ID number already exists'
      });
    }

    // Create new student
    const newStudent = {
      id: `s${Date.now()}`,
      institutionId,
      name,
      surname,
      fullName: `${name} ${surname}`,
      studentId: `STU${String(students.length + 1).padStart(3, '0')}`,
      idNumber,
      class: className,
      grade,
      subjects: subjects || ['Mathematics', 'English', 'Science', 'History'],
      status: 'active',
      enrollmentDate: new Date().toISOString().split('T')[0],
      parentContact: parentContact || '',
      parentEmail: parentEmail || '',
      createdAt: new Date().toISOString()
    };

    // Create learner account automatically
    const username = `${name.toLowerCase()}.${surname.toLowerCase()}`;
    const password = idNumber; // Use ID number as password
    const passwordHash = await bcrypt.hash(password, 10);

    const newAccount = {
      id: `la${Date.now()}`,
      studentId: newStudent.id,
      username,
      passwordHash,
      email: `${username}@psctech.edu`,
      lastLogin: null,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    // Add to databases
    students.push(newStudent);
    learnerAccounts.push(newAccount);

    res.status(201).json({
      success: true,
      data: {
        student: newStudent,
        account: {
          username: newAccount.username,
          password: password,
          email: newAccount.email
        }
      },
      message: 'Student created successfully with automatic account. Username: name.surname, Password: ID number'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating student',
      error: error.message
    });
  }
});

// GET homework assignments for a class
router.get('/homework/:class', (req, res) => {
  try {
    const institutionId = req.headers['x-institution-id'] || 'inst001';
    const { class: className } = req.params;
    
    const classHomework = homeworkAssignments.filter(hw => 
      hw.institutionId === institutionId && hw.class === className
    );
    
    res.json({
      success: true,
      data: classHomework,
      message: 'Homework assignments retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving homework assignments',
      error: error.message
    });
  }
});

// POST create new homework assignment
router.post('/homework', async (req, res) => {
  try {
    const institutionId = req.headers['x-institution-id'] || 'inst001';
    const {
      teacherId,
      class: className,
      subject,
      title,
      description,
      dueDate,
      grade,
      curriculum,
      attachments
    } = req.body;

    // Validate required fields
    if (!teacherId || !className || !subject || !title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Create new homework assignment
    const newHomework = {
      id: `hw${Date.now()}`,
      institutionId,
      teacherId,
      class: className,
      subject,
      title,
      description,
      dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 7 days
      grade: grade || '10',
      curriculum: curriculum || 'CAPS',
      attachments: attachments || [],
      status: 'active',
      createdAt: new Date().toISOString()
    };

    homeworkAssignments.push(newHomework);

    res.status(201).json({
      success: true,
      data: newHomework,
      message: 'Homework assignment created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating homework assignment',
      error: error.message
    });
  }
});

// GET AI-generated tests for a class/subject
router.get('/ai-tests/:class/:subject', (req, res) => {
  try {
    const institutionId = req.headers['x-institution-id'] || 'inst001';
    const { class: className, subject } = req.params;
    
    const classTests = aiTests.filter(test => 
      test.institutionId === institutionId && 
      test.class === className && 
      test.subject === subject
    );
    
    res.json({
      success: true,
      data: classTests,
      message: 'AI tests retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving AI tests',
      error: error.message
    });
  }
});

// POST generate new AI test
router.post('/ai-tests/generate', async (req, res) => {
  try {
    const institutionId = req.headers['x-institution-id'] || 'inst001';
    const {
      class: className,
      subject,
      grade,
      curriculum,
      title,
      questionCount,
      difficulty
    } = req.body;

    // Validate required fields
    if (!className || !subject || !grade || !curriculum) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Generate AI test based on curriculum standards
    const curriculumStandards = {
      'CAPS': {
        'Mathematics': {
          '10': ['Algebra', 'Geometry', 'Trigonometry', 'Statistics'],
          '11': ['Functions', 'Calculus', 'Probability', 'Analytical Geometry'],
          '12': ['Advanced Calculus', 'Linear Algebra', 'Complex Numbers', 'Differential Equations']
        },
        'English': {
          '10': ['Literature Analysis', 'Essay Writing', 'Grammar', 'Comprehension'],
          '11': ['Advanced Writing', 'Poetry Analysis', 'Drama', 'Novel Study'],
          '12': ['Critical Analysis', 'Research Skills', 'Creative Writing', 'Exam Preparation']
        }
      },
      'Cambridge': {
        'Mathematics': {
          '10': ['Pure Mathematics', 'Mechanics', 'Statistics'],
          '11': ['Further Pure Mathematics', 'Further Mechanics', 'Further Statistics'],
          '12': ['Advanced Mathematics', 'Mathematical Modelling', 'Decision Mathematics']
        }
      },
      'IB': {
        'Mathematics': {
          '10': ['Number and Algebra', 'Functions', 'Geometry and Trigonometry'],
          '11': ['Statistics and Probability', 'Calculus', 'Mathematical Modelling'],
          '12': ['Advanced Topics', 'Internal Assessment', 'Theory of Knowledge']
        }
      }
    };

    // Generate sample questions based on curriculum
    const topics = curriculumStandards[curriculum]?.[subject]?.[grade] || ['General Topics'];
    const questions = [];
    const memorandum = [];

    for (let i = 1; i <= (questionCount || 10); i++) {
      const topic = topics[Math.floor(Math.random() * topics.length)];
      const question = {
        id: `q${i}`,
        question: `Sample ${topic} question ${i} for Grade ${grade} ${subject}`,
        type: 'multiple_choice',
        options: [
          `Option A for question ${i}`,
          `Option B for question ${i}`,
          `Option C for question ${i}`,
          `Option D for question ${i}`
        ],
        correctAnswer: `Option A for question ${i}`,
        explanation: `Explanation for question ${i} covering ${topic} concepts`
      };
      
      questions.push(question);
      
      memorandum.push({
        questionId: question.id,
        solution: `Detailed solution for question ${i}`,
        marks: 5
      });
    }

    // Create new AI test
    const newTest = {
      id: `test${Date.now()}`,
      institutionId,
      class: className,
      subject,
      grade,
      curriculum,
      title: title || `${subject} Test - ${curriculum} Grade ${grade}`,
      questions,
      memorandum,
      totalMarks: questions.length * 5,
      duration: questions.length * 6, // 6 minutes per question
      difficulty: difficulty || 'medium',
      createdAt: new Date().toISOString()
    };

    aiTests.push(newTest);

    res.status(201).json({
      success: true,
      data: newTest,
      message: 'AI test generated successfully based on curriculum standards'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating AI test',
      error: error.message
    });
  }
});

// GET real-time attendance data
router.get('/attendance', (req, res) => {
  try {
    const institutionId = req.headers['x-institution-id'] || 'inst001';
    const { date, class: className, subject } = req.query;

    let filteredAttendance = attendanceRecords.filter(record => 
      record.institutionId === institutionId
    );

    if (date) {
      filteredAttendance = filteredAttendance.filter(record => record.date === date);
    }
    if (className) {
      filteredAttendance = filteredAttendance.filter(record => record.class === className);
    }
    if (subject) {
      filteredAttendance = filteredAttendance.filter(record => record.subject === subject);
    }

    // Group by class and subject for better organization
    const groupedAttendance = filteredAttendance.reduce((acc, record) => {
      const key = `${record.class}-${record.subject}-${record.period}`;
      if (!acc[key]) {
        acc[key] = {
          class: record.class,
          subject: record.subject,
          period: record.period,
          date: record.date,
          teacher: teachers.find(t => t.id === record.teacherId)?.fullName || 'Unknown',
          totalStudents: record.students.length,
          present: record.students.filter(s => s.status === 'present').length,
          absent: record.students.filter(s => s.status === 'absent').length,
          late: record.students.filter(s => s.status === 'late').length,
          students: record.students
        };
      }
      return acc;
    }, {});

    res.json({
      success: true,
      data: Object.values(groupedAttendance),
      message: 'Attendance data retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving attendance data',
      error: error.message
    });
  }
});

// GET specific class attendance (e.g., Grade 10A Mathematics at 10:30)
router.get('/attendance/:class/:subject/:period', (req, res) => {
  try {
    const institutionId = req.headers['x-institution-id'] || 'inst001';
    const { class: className, subject, period } = req.params;
    const { date } = req.query;

    const targetDate = date || new Date().toISOString().split('T')[0];

    const attendanceRecord = attendanceRecords.find(record => 
      record.institutionId === institutionId &&
      record.class === className &&
      record.subject === subject &&
      record.period === period &&
      record.date === targetDate
    );

    if (!attendanceRecord) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found for this class, subject, and period'
      });
    }

    // Organize students by status
    const presentStudents = attendanceRecord.students.filter(s => s.status === 'present');
    const absentStudents = attendanceRecord.students.filter(s => s.status === 'absent');
    const lateStudents = attendanceRecord.students.filter(s => s.status === 'late');

    const response = {
      class: className,
      subject,
      period,
      date: targetDate,
      teacher: teachers.find(t => t.id === attendanceRecord.teacherId)?.fullName || 'Unknown',
      summary: {
        total: attendanceRecord.students.length,
        present: presentStudents.length,
        absent: absentStudents.length,
        late: lateStudents.length
      },
      students: {
        present: presentStudents,
        absent: absentStudents,
        late: lateStudents
      },
      lastUpdated: attendanceRecord.updatedAt
    };

    res.json({
      success: true,
      data: response,
      message: `Attendance for ${className} ${subject} at ${period} retrieved successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving attendance record',
      error: error.message
    });
  }
});

// GET class allocations
router.get('/class-allocations', (req, res) => {
  try {
    const institutionId = req.headers['x-institution-id'] || 'inst001';
    
    const allocations = classAllocations
      .filter(allocation => allocation.institutionId === institutionId)
      .map(allocation => ({
        ...allocation,
        teacher: teachers.find(t => t.id === allocation.teacherId)?.fullName || 'Unknown'
      }));

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

// PUT update class allocation (principal can modify schedules)
router.put('/class-allocations/:id', (req, res) => {
  try {
    const institutionId = req.headers['x-institution-id'] || 'inst001';
    const allocationIndex = classAllocations.findIndex(ca => 
      ca.id === req.params.id && ca.institutionId === institutionId
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
