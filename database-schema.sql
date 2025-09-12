-- PSC Tech Database Schema v2.0.0
-- Comprehensive database design for School Management System

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Institutions (Multi-tenant support)
CREATE TABLE institutions (
    id UUID PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    type ENUM('primary', 'secondary', 'combined') NOT NULL,
    district VARCHAR(100),
    province VARCHAR(100),
    country VARCHAR(100) DEFAULT 'South Africa',
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    logo_url VARCHAR(500),
    subscription_plan ENUM('basic', 'premium', 'enterprise') DEFAULT 'basic',
    subscription_status ENUM('active', 'expired', 'suspended') DEFAULT 'active',
    subscription_expiry DATE,
    max_users INT DEFAULT 100,
    max_students INT DEFAULT 1000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Users (Unified user management)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT (UUID()),
    institution_id UUID NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('superadmin', 'principal', 'teacher', 'parent', 'learner', 'sgb') NOT NULL,
    phone VARCHAR(20),
    profile_picture_url VARCHAR(500),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other', 'prefer_not_to_say'),
    address TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE
);

-- Academic Years
CREATE TABLE academic_years (
    id UUID PRIMARY KEY DEFAULT (UUID()),
    institution_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    status ENUM('upcoming', 'active', 'completed', 'archived') DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_institution_year (institution_id, name)
);

-- Terms/Semesters
CREATE TABLE terms (
    id UUID PRIMARY KEY DEFAULT (UUID()),
    academic_year_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    order_number INT NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    status ENUM('upcoming', 'active', 'completed', 'archived') DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    UNIQUE KEY unique_year_term (academic_year_id, name)
);

-- Grades/Standards
CREATE TABLE grades (
    id UUID PRIMARY KEY DEFAULT (UUID()),
    institution_id UUID NOT NULL,
    name VARCHAR(50) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    order_number INT NOT NULL,
    min_age INT,
    max_age INT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_institution_grade (institution_id, name)
);

-- Subjects
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT (UUID()),
    institution_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT,
    category ENUM('core', 'elective', 'extracurricular') DEFAULT 'core',
    is_compulsory BOOLEAN DEFAULT FALSE,
    max_score DECIMAL(5,2) DEFAULT 100.00,
    pass_score DECIMAL(5,2) DEFAULT 50.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_institution_subject (institution_id, code)
);

-- Classes
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT (UUID()),
    institution_id UUID NOT NULL,
    academic_year_id UUID NOT NULL,
    grade_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    capacity INT DEFAULT 40,
    current_enrollment INT DEFAULT 0,
    class_teacher_id UUID,
    room_number VARCHAR(20),
    schedule_info TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    FOREIGN KEY (grade_id) REFERENCES grades(id) ON DELETE CASCADE,
    FOREIGN KEY (class_teacher_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_institution_class (institution_id, academic_year_id, code)
);

-- =====================================================
-- STUDENT MANAGEMENT
-- =====================================================

-- Students (Learners)
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT (UUID()),
    user_id UUID NOT NULL,
    institution_id UUID NOT NULL,
    student_number VARCHAR(50) UNIQUE NOT NULL,
    admission_date DATE NOT NULL,
    current_class_id UUID,
    grade_level_id UUID NOT NULL,
    enrollment_status ENUM('enrolled', 'transferred', 'graduated', 'withdrawn', 'suspended') DEFAULT 'enrolled',
    enrollment_date DATE NOT NULL,
    withdrawal_date DATE NULL,
    withdrawal_reason TEXT,
    previous_school VARCHAR(255),
    special_needs TEXT,
    medical_conditions TEXT,
    allergies TEXT,
    dietary_restrictions TEXT,
    parent_guardian_1_id UUID,
    parent_guardian_2_id UUID,
    emergency_contact_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE,
    FOREIGN KEY (current_class_id) REFERENCES classes(id) ON DELETE SET NULL,
    FOREIGN KEY (grade_level_id) REFERENCES grades(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_guardian_1_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_guardian_2_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (emergency_contact_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_student_number (student_number)
);

-- =====================================================
-- TEACHER MANAGEMENT
-- =====================================================

-- Teachers
CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT (UUID()),
    user_id UUID NOT NULL,
    institution_id UUID NOT NULL,
    employee_number VARCHAR(50) UNIQUE NOT NULL,
    hire_date DATE NOT NULL,
    employment_status ENUM('active', 'probation', 'suspended', 'terminated', 'resigned') DEFAULT 'active',
    employment_type ENUM('full-time', 'part-time', 'contract', 'substitute') DEFAULT 'full-time',
    qualification TEXT,
    specialization TEXT,
    years_of_experience INT,
    salary_grade VARCHAR(20),
    department VARCHAR(100),
    is_class_teacher BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_employee_number (employee_number)
);

-- Teacher Subject Assignments
CREATE TABLE teacher_subject_assignments (
    id UUID PRIMARY KEY DEFAULT (UUID()),
    teacher_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    class_id UUID NOT NULL,
    academic_year_id UUID NOT NULL,
    term_id UUID NOT NULL,
    is_primary_teacher BOOLEAN DEFAULT FALSE,
    assigned_date DATE NOT NULL,
    end_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    FOREIGN KEY (term_id) REFERENCES terms(id) ON DELETE CASCADE,
    UNIQUE KEY unique_teacher_subject_class (teacher_id, subject_id, class_id, academic_year_id, term_id)
);

-- =====================================================
-- ACADEMIC RECORDS
-- =====================================================

-- Attendance
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT (UUID()),
    student_id UUID NOT NULL,
    class_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    teacher_id UUID NOT NULL,
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'late', 'excused', 'suspended') NOT NULL,
    time_in TIME NULL,
    time_out TIME NULL,
    reason_for_absence TEXT,
    verified_by UUID NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_attendance_record (student_id, class_id, subject_id, date)
);

-- Assignments
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject_id UUID NOT NULL,
    class_id UUID NOT NULL,
    teacher_id UUID NOT NULL,
    academic_year_id UUID NOT NULL,
    term_id UUID NOT NULL,
    assignment_type ENUM('homework', 'classwork', 'project', 'test', 'quiz', 'exam') NOT NULL,
    due_date DATETIME NOT NULL,
    max_score DECIMAL(5,2) DEFAULT 100.00,
    weight_percentage DECIMAL(5,2) DEFAULT 10.00,
    instructions TEXT,
    attachment_urls JSON,
    is_published BOOLEAN DEFAULT FALSE,
    is_submitted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    FOREIGN KEY (term_id) REFERENCES terms(id) ON DELETE CASCADE
);

-- Assignment Submissions
CREATE TABLE assignment_submissions (
    id UUID PRIMARY KEY DEFAULT (UUID()),
    assignment_id UUID NOT NULL,
    student_id UUID NOT NULL,
    submitted_at DATETIME NOT NULL,
    submission_content TEXT,
    attachment_urls JSON,
    score DECIMAL(5,2) NULL,
    feedback TEXT,
    graded_by UUID NULL,
    graded_at TIMESTAMP NULL,
    is_late BOOLEAN DEFAULT FALSE,
    late_reason TEXT,
    status ENUM('submitted', 'graded', 'returned', 'resubmitted') DEFAULT 'submitted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (graded_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_student_assignment (student_id, assignment_id)
);

-- Grades/Results
CREATE TABLE grades (
    id UUID PRIMARY KEY DEFAULT (UUID()),
    student_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    class_id UUID NOT NULL,
    academic_year_id UUID NOT NULL,
    term_id UUID NOT NULL,
    assignment_id UUID NULL,
    grade_type ENUM('assignment', 'test', 'exam', 'term', 'final') NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    max_score DECIMAL(5,2) NOT NULL,
    percentage DECIMAL(5,2) GENERATED ALWAYS AS ((score / max_score) * 100) STORED,
    letter_grade VARCHAR(10),
    remarks TEXT,
    graded_by UUID NOT NULL,
    graded_at TIMESTAMP NOT NULL,
    is_final BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    FOREIGN KEY (term_id) REFERENCES terms(id) ON DELETE CASCADE,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE SET NULL,
    FOREIGN KEY (graded_by) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_grade_record (student_id, subject_id, class_id, academic_year_id, term_id, assignment_id)
);

-- =====================================================
-- COMMUNICATION & NOTIFICATIONS
-- =====================================================

-- Announcements
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT (UUID()),
    institution_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id UUID NOT NULL,
    target_audience ENUM('all', 'teachers', 'students', 'parents', 'staff', 'specific_class') DEFAULT 'all',
    target_class_id UUID NULL,
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    requires_acknowledgment BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (target_class_id) REFERENCES classes(id) ON DELETE SET NULL
);

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT (UUID()),
    sender_id UUID NOT NULL,
    recipient_id UUID NOT NULL,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    message_type ENUM('direct', 'group', 'system') DEFAULT 'direct',
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    is_deleted_by_sender BOOLEAN DEFAULT FALSE,
    is_deleted_by_recipient BOOLEAN DEFAULT FALSE,
    parent_message_id UUID NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_message_id) REFERENCES messages(id) ON DELETE SET NULL
);

-- =====================================================
-- AI FEATURES
-- =====================================================

-- AI Generated Content
CREATE TABLE ai_generated_content (
    id UUID PRIMARY KEY DEFAULT (UUID()),
    institution_id UUID NOT NULL,
    creator_id UUID NOT NULL,
    content_type ENUM('homework', 'test', 'study_material', 'lesson_plan', 'assessment') NOT NULL,
    subject_id UUID NULL,
    class_id UUID NULL,
    prompt TEXT NOT NULL,
    generated_content TEXT NOT NULL,
    metadata JSON,
    is_approved BOOLEAN DEFAULT FALSE,
    approved_by UUID NULL,
    approved_at TIMESTAMP NULL,
    usage_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- COMPETITIONS & EVENTS
-- =====================================================

-- Competitions
CREATE TABLE competitions (
    id UUID PRIMARY KEY DEFAULT (UUID()),
    institution_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category ENUM('academic', 'sports', 'arts', 'technology', 'debate', 'other') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    registration_deadline DATE NOT NULL,
    max_participants INT,
    current_participants INT DEFAULT 0,
    eligibility_criteria TEXT,
    prizes TEXT,
    rules TEXT,
    organizer_id UUID NOT NULL,
    status ENUM('upcoming', 'registration_open', 'in_progress', 'completed', 'cancelled') DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE,
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Core indexes
CREATE INDEX idx_user_institution ON users(institution_id);
CREATE INDEX idx_user_role ON users(role);
CREATE INDEX idx_user_email ON users(email);

-- Academic indexes
CREATE INDEX idx_class_institution ON classes(institution_id);
CREATE INDEX idx_class_academic_year ON classes(academic_year_id);
CREATE INDEX idx_student_class ON students(current_class_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_assignment_due_date ON assignments(due_date);

-- Communication indexes
CREATE INDEX idx_announcement_institution ON announcements(institution_id);
CREATE INDEX idx_message_sender ON messages(sender_id);
CREATE INDEX idx_message_recipient ON messages(recipient_id);

-- =====================================================
-- COMMENTS & DOCUMENTATION
-- =====================================================

/*
PSC Tech Database Schema v2.0.0
Last Updated: 2024

Key Features:
- Multi-tenant architecture with institution isolation
- Role-based access control (RBAC)
- Comprehensive academic management
- AI features integration
- Performance optimized with proper indexing

Design Principles:
1. Data Normalization: Proper 3NF design
2. Referential Integrity: Foreign key constraints
3. Performance: Strategic indexing
4. Security: User authentication tracking
5. Scalability: Multi-institution support
6. Flexibility: JSON fields for extensibility

Maintenance:
- Regular index optimization
- Performance monitoring
- Backup and recovery procedures
*/
