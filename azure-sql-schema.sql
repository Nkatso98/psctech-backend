-- PSC Tech Database Schema for Azure SQL Database
-- Optimized for Azure SQL with performance and scalability features
-- Version: 2.0.0 - Azure SQL Edition

-- =====================================================
-- DATABASE CREATION (Azure SQL)
-- =====================================================

-- Note: Database creation is done through Azure Portal or Azure CLI
-- This script assumes you're connected to an existing database

-- Set database compatibility level for Azure SQL
ALTER DATABASE CURRENT SET COMPATIBILITY_LEVEL = 160; -- SQL Server 2022

-- Enable Query Store for performance monitoring
ALTER DATABASE CURRENT SET QUERY_STORE = ON;
ALTER DATABASE CURRENT SET QUERY_STORE (OPERATION_MODE = READ_WRITE);

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Institutions (Multi-tenant support)
CREATE TABLE institutions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(255) NOT NULL,
    code NVARCHAR(50) NOT NULL,
    type NVARCHAR(20) NOT NULL CHECK (type IN ('primary', 'secondary', 'combined')),
    district NVARCHAR(100),
    province NVARCHAR(100),
    country NVARCHAR(100) DEFAULT 'South Africa',
    address NVARCHAR(MAX),
    phone NVARCHAR(20),
    email NVARCHAR(255),
    website NVARCHAR(255),
    logo_url NVARCHAR(500),
    subscription_plan NVARCHAR(20) DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'premium', 'enterprise')),
    subscription_status NVARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'expired', 'suspended')),
    subscription_expiry DATE,
    max_users INT DEFAULT 100,
    max_students INT DEFAULT 1000,
    created_at DATETIME2(7) DEFAULT GETUTCDATE(),
    updated_at DATETIME2(7) DEFAULT GETUTCDATE(),
    is_active BIT DEFAULT 1,
    
    CONSTRAINT UQ_institution_code UNIQUE (code)
);

-- Users (Unified user management)
CREATE TABLE users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    institution_id UNIQUEIDENTIFIER NOT NULL,
    username NVARCHAR(100) NOT NULL,
    email NVARCHAR(255) NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    full_name NVARCHAR(255) NOT NULL,
    first_name NVARCHAR(100) NOT NULL,
    last_name NVARCHAR(100) NOT NULL,
    role NVARCHAR(20) NOT NULL CHECK (role IN ('superadmin', 'principal', 'teacher', 'parent', 'learner', 'sgb')),
    phone NVARCHAR(20),
    profile_picture_url NVARCHAR(500),
    date_of_birth DATE,
    gender NVARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    address NVARCHAR(MAX),
    emergency_contact_name NVARCHAR(255),
    emergency_contact_phone NVARCHAR(20),
    emergency_contact_relationship NVARCHAR(100),
    is_active BIT DEFAULT 1,
    last_login DATETIME2(7),
    login_attempts INT DEFAULT 0,
    locked_until DATETIME2(7),
    created_at DATETIME2(7) DEFAULT GETUTCDATE(),
    updated_at DATETIME2(7) DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_users_institution FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE,
    CONSTRAINT UQ_users_username UNIQUE (username),
    CONSTRAINT UQ_users_email UNIQUE (email)
);

-- Academic Years
CREATE TABLE academic_years (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    institution_id UNIQUEIDENTIFIER NOT NULL,
    name NVARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BIT DEFAULT 0,
    status NVARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'archived')),
    created_at DATETIME2(7) DEFAULT GETUTCDATE(),
    updated_at DATETIME2(7) DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_academic_years_institution FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE,
    CONSTRAINT UQ_institution_year UNIQUE (institution_id, name),
    CONSTRAINT CHK_academic_year_dates CHECK (start_date <= end_date)
);

-- Terms/Semesters
CREATE TABLE terms (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    academic_year_id UNIQUEIDENTIFIER NOT NULL,
    name NVARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    order_number INT NOT NULL,
    is_current BIT DEFAULT 0,
    status NVARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'archived')),
    created_at DATETIME2(7) DEFAULT GETUTCDATE(),
    updated_at DATETIME2(7) DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_terms_academic_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    CONSTRAINT UQ_year_term UNIQUE (academic_year_id, name),
    CONSTRAINT CHK_term_dates CHECK (start_date <= end_date)
);

-- Grades/Standards
CREATE TABLE grades (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    institution_id UNIQUEIDENTIFIER NOT NULL,
    name NVARCHAR(50) NOT NULL,
    display_name NVARCHAR(100) NOT NULL,
    order_number INT NOT NULL,
    min_age INT,
    max_age INT,
    description NVARCHAR(MAX),
    is_active BIT DEFAULT 1,
    created_at DATETIME2(7) DEFAULT GETUTCDATE(),
    updated_at DATETIME2(7) DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_grades_institution FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE,
    CONSTRAINT UQ_institution_grade UNIQUE (institution_id, name)
);

-- Subjects
CREATE TABLE subjects (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    institution_id UNIQUEIDENTIFIER NOT NULL,
    name NVARCHAR(100) NOT NULL,
    code NVARCHAR(20) NOT NULL,
    description NVARCHAR(MAX),
    category NVARCHAR(20) DEFAULT 'core' CHECK (category IN ('core', 'elective', 'extracurricular')),
    is_compulsory BIT DEFAULT 0,
    max_score DECIMAL(5,2) DEFAULT 100.00,
    pass_score DECIMAL(5,2) DEFAULT 50.00,
    is_active BIT DEFAULT 1,
    created_at DATETIME2(7) DEFAULT GETUTCDATE(),
    updated_at DATETIME2(7) DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_subjects_institution FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE,
    CONSTRAINT UQ_institution_subject UNIQUE (institution_id, code)
);

-- Classes
CREATE TABLE classes (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    institution_id UNIQUEIDENTIFIER NOT NULL,
    academic_year_id UNIQUEIDENTIFIER NOT NULL,
    grade_id UNIQUEIDENTIFIER NOT NULL,
    name NVARCHAR(100) NOT NULL,
    code NVARCHAR(50) NOT NULL,
    capacity INT DEFAULT 40,
    current_enrollment INT DEFAULT 0,
    class_teacher_id UNIQUEIDENTIFIER,
    room_number NVARCHAR(20),
    schedule_info NVARCHAR(MAX),
    is_active BIT DEFAULT 1,
    created_at DATETIME2(7) DEFAULT GETUTCDATE(),
    updated_at DATETIME2(7) DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_classes_institution FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE,
    CONSTRAINT FK_classes_academic_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    CONSTRAINT FK_classes_grade FOREIGN KEY (grade_id) REFERENCES grades(id) ON DELETE CASCADE,
    CONSTRAINT FK_classes_teacher FOREIGN KEY (class_teacher_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT UQ_institution_class UNIQUE (institution_id, academic_year_id, code),
    CONSTRAINT CHK_class_capacity CHECK (current_enrollment <= capacity)
);

-- =====================================================
-- STUDENT MANAGEMENT
-- =====================================================

-- Students (Learners)
CREATE TABLE students (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    institution_id UNIQUEIDENTIFIER NOT NULL,
    student_number NVARCHAR(50) NOT NULL,
    admission_date DATE NOT NULL,
    current_class_id UNIQUEIDENTIFIER,
    grade_level_id UNIQUEIDENTIFIER NOT NULL,
    enrollment_status NVARCHAR(20) DEFAULT 'enrolled' CHECK (enrollment_status IN ('enrolled', 'transferred', 'graduated', 'withdrawn', 'suspended')),
    enrollment_date DATE NOT NULL,
    withdrawal_date DATE,
    withdrawal_reason NVARCHAR(MAX),
    previous_school NVARCHAR(255),
    special_needs NVARCHAR(MAX),
    medical_conditions NVARCHAR(MAX),
    allergies NVARCHAR(MAX),
    dietary_restrictions NVARCHAR(MAX),
    parent_guardian_1_id UNIQUEIDENTIFIER,
    parent_guardian_2_id UNIQUEIDENTIFIER,
    emergency_contact_id UNIQUEIDENTIFIER,
    created_at DATETIME2(7) DEFAULT GETUTCDATE(),
    updated_at DATETIME2(7) DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_students_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT FK_students_institution FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE,
    CONSTRAINT FK_students_class FOREIGN KEY (current_class_id) REFERENCES classes(id) ON DELETE SET NULL,
    CONSTRAINT FK_students_grade FOREIGN KEY (grade_level_id) REFERENCES grades(id) ON DELETE CASCADE,
    CONSTRAINT FK_students_parent1 FOREIGN KEY (parent_guardian_1_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT FK_students_parent2 FOREIGN KEY (parent_guardian_2_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT FK_students_emergency FOREIGN KEY (emergency_contact_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT UQ_student_number UNIQUE (student_number)
);

-- =====================================================
-- TEACHER MANAGEMENT
-- =====================================================

-- Teachers
CREATE TABLE teachers (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    institution_id UNIQUEIDENTIFIER NOT NULL,
    employee_number NVARCHAR(50) NOT NULL,
    hire_date DATE NOT NULL,
    employment_status NVARCHAR(20) DEFAULT 'active' CHECK (employment_status IN ('active', 'probation', 'suspended', 'terminated', 'resigned')),
    employment_type NVARCHAR(20) DEFAULT 'full-time' CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'substitute')),
    qualification NVARCHAR(MAX),
    specialization NVARCHAR(MAX),
    years_of_experience INT,
    salary_grade NVARCHAR(20),
    department NVARCHAR(100),
    is_class_teacher BIT DEFAULT 0,
    created_at DATETIME2(7) DEFAULT GETUTCDATE(),
    updated_at DATETIME2(7) DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_teachers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT FK_teachers_institution FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE,
    CONSTRAINT UQ_employee_number UNIQUE (employee_number)
);

-- Teacher Subject Assignments
CREATE TABLE teacher_subject_assignments (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    teacher_id UNIQUEIDENTIFIER NOT NULL,
    subject_id UNIQUEIDENTIFIER NOT NULL,
    class_id UNIQUEIDENTIFIER NOT NULL,
    academic_year_id UNIQUEIDENTIFIER NOT NULL,
    term_id UNIQUEIDENTIFIER NOT NULL,
    is_primary_teacher BIT DEFAULT 0,
    assigned_date DATE NOT NULL,
    end_date DATE,
    created_at DATETIME2(7) DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_teacher_subject_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    CONSTRAINT FK_teacher_subject_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    CONSTRAINT FK_teacher_subject_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    CONSTRAINT FK_teacher_subject_academic_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    CONSTRAINT FK_teacher_subject_term FOREIGN KEY (term_id) REFERENCES terms(id) ON DELETE CASCADE,
    CONSTRAINT UQ_teacher_subject_class UNIQUE (teacher_id, subject_id, class_id, academic_year_id, term_id)
);

-- =====================================================
-- ACADEMIC RECORDS
-- =====================================================

-- Attendance
CREATE TABLE attendance (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    student_id UNIQUEIDENTIFIER NOT NULL,
    class_id UNIQUEIDENTIFIER NOT NULL,
    subject_id UNIQUEIDENTIFIER NOT NULL,
    teacher_id UNIQUEIDENTIFIER NOT NULL,
    date DATE NOT NULL,
    status NVARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused', 'suspended')),
    time_in TIME,
    time_out TIME,
    reason_for_absence NVARCHAR(MAX),
    verified_by UNIQUEIDENTIFIER,
    notes NVARCHAR(MAX),
    created_at DATETIME2(7) DEFAULT GETUTCDATE(),
    updated_at DATETIME2(7) DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_attendance_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT FK_attendance_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    CONSTRAINT FK_attendance_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    CONSTRAINT FK_attendance_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    CONSTRAINT FK_attendance_verified_by FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT UQ_attendance_record UNIQUE (student_id, class_id, subject_id, date)
);

-- Assignments
CREATE TABLE assignments (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    subject_id UNIQUEIDENTIFIER NOT NULL,
    class_id UNIQUEIDENTIFIER NOT NULL,
    teacher_id UNIQUEIDENTIFIER NOT NULL,
    academic_year_id UNIQUEIDENTIFIER NOT NULL,
    term_id UNIQUEIDENTIFIER NOT NULL,
    assignment_type NVARCHAR(20) NOT NULL CHECK (assignment_type IN ('homework', 'classwork', 'project', 'test', 'quiz', 'exam')),
    due_date DATETIME2(7) NOT NULL,
    max_score DECIMAL(5,2) DEFAULT 100.00,
    weight_percentage DECIMAL(5,2) DEFAULT 10.00,
    instructions NVARCHAR(MAX),
    attachment_urls NVARCHAR(MAX), -- JSON stored as NVARCHAR(MAX) in Azure SQL
    is_published BIT DEFAULT 0,
    is_submitted BIT DEFAULT 0,
    created_at DATETIME2(7) DEFAULT GETUTCDATE(),
    updated_at DATETIME2(7) DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_assignments_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    CONSTRAINT FK_assignments_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    CONSTRAINT FK_assignments_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    CONSTRAINT FK_assignments_academic_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    CONSTRAINT FK_assignments_term FOREIGN KEY (term_id) REFERENCES terms(id) ON DELETE CASCADE
);

-- Assignment Submissions
CREATE TABLE assignment_submissions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    assignment_id UNIQUEIDENTIFIER NOT NULL,
    student_id UNIQUEIDENTIFIER NOT NULL,
    submitted_at DATETIME2(7) NOT NULL,
    submission_content NVARCHAR(MAX),
    attachment_urls NVARCHAR(MAX), -- JSON stored as NVARCHAR(MAX)
    score DECIMAL(5,2),
    feedback NVARCHAR(MAX),
    graded_by UNIQUEIDENTIFIER,
    graded_at DATETIME2(7),
    is_late BIT DEFAULT 0,
    late_reason NVARCHAR(MAX),
    status NVARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'returned', 'resubmitted')),
    created_at DATETIME2(7) DEFAULT GETUTCDATE(),
    updated_at DATETIME2(7) DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_submissions_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    CONSTRAINT FK_submissions_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT FK_submissions_graded_by FOREIGN KEY (graded_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT UQ_student_assignment UNIQUE (student_id, assignment_id)
);

-- Grades/Results
CREATE TABLE grades (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    student_id UNIQUEIDENTIFIER NOT NULL,
    subject_id UNIQUEIDENTIFIER NOT NULL,
    class_id UNIQUEIDENTIFIER NOT NULL,
    academic_year_id UNIQUEIDENTIFIER NOT NULL,
    term_id UNIQUEIDENTIFIER NOT NULL,
    assignment_id UNIQUEIDENTIFIER,
    grade_type NVARCHAR(20) NOT NULL CHECK (grade_type IN ('assignment', 'test', 'exam', 'term', 'final')),
    score DECIMAL(5,2) NOT NULL,
    max_score DECIMAL(5,2) NOT NULL,
    percentage AS (score / max_score * 100) PERSISTED,
    letter_grade NVARCHAR(10),
    remarks NVARCHAR(MAX),
    graded_by UNIQUEIDENTIFIER NOT NULL,
    graded_at DATETIME2(7) NOT NULL,
    is_final BIT DEFAULT 0,
    created_at DATETIME2(7) DEFAULT GETUTCDATE(),
    updated_at DATETIME2(7) DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_grades_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT FK_grades_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    CONSTRAINT FK_grades_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    CONSTRAINT FK_grades_academic_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    CONSTRAINT FK_grades_term FOREIGN KEY (term_id) REFERENCES terms(id) ON DELETE CASCADE,
    CONSTRAINT FK_grades_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE SET NULL,
    CONSTRAINT FK_grades_graded_by FOREIGN KEY (graded_by) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT UQ_grade_record UNIQUE (student_id, subject_id, class_id, academic_year_id, term_id, assignment_id),
    CONSTRAINT CHK_score_range CHECK (score >= 0 AND score <= max_score)
);

-- =====================================================
-- COMMUNICATION & NOTIFICATIONS
-- =====================================================

-- Announcements
CREATE TABLE announcements (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    institution_id UNIQUEIDENTIFIER NOT NULL,
    title NVARCHAR(255) NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    author_id UNIQUEIDENTIFIER NOT NULL,
    target_audience NVARCHAR(20) DEFAULT 'all' CHECK (target_audience IN ('all', 'teachers', 'students', 'parents', 'staff', 'specific_class')),
    target_class_id UNIQUEIDENTIFIER,
    priority NVARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_published BIT DEFAULT 0,
    published_at DATETIME2(7),
    expires_at DATETIME2(7),
    requires_acknowledgment BIT DEFAULT 0,
    created_at DATETIME2(7) DEFAULT GETUTCDATE(),
    updated_at DATETIME2(7) DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_announcements_institution FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE,
    CONSTRAINT FK_announcements_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT FK_announcements_target_class FOREIGN KEY (target_class_id) REFERENCES classes(id) ON DELETE SET NULL
);

-- Messages
CREATE TABLE messages (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    sender_id UNIQUEIDENTIFIER NOT NULL,
    recipient_id UNIQUEIDENTIFIER NOT NULL,
    subject NVARCHAR(255),
    content NVARCHAR(MAX) NOT NULL,
    message_type NVARCHAR(20) DEFAULT 'direct' CHECK (message_type IN ('direct', 'group', 'system')),
    priority NVARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_read BIT DEFAULT 0,
    read_at DATETIME2(7),
    is_deleted_by_sender BIT DEFAULT 0,
    is_deleted_by_recipient BIT DEFAULT 0,
    parent_message_id UNIQUEIDENTIFIER,
    created_at DATETIME2(7) DEFAULT GETUTCDATE(),
    updated_at DATETIME2(7) DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT FK_messages_recipient FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT FK_messages_parent FOREIGN KEY (parent_message_id) REFERENCES messages(id) ON DELETE SET NULL
);

-- =====================================================
-- AI FEATURES
-- =====================================================

-- AI Generated Content
CREATE TABLE ai_generated_content (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    institution_id UNIQUEIDENTIFIER NOT NULL,
    creator_id UNIQUEIDENTIFIER NOT NULL,
    content_type NVARCHAR(20) NOT NULL CHECK (content_type IN ('homework', 'test', 'study_material', 'lesson_plan', 'assessment')),
    subject_id UNIQUEIDENTIFIER,
    class_id UNIQUEIDENTIFIER,
    prompt NVARCHAR(MAX) NOT NULL,
    generated_content NVARCHAR(MAX) NOT NULL,
    metadata NVARCHAR(MAX), -- JSON stored as NVARCHAR(MAX)
    is_approved BIT DEFAULT 0,
    approved_by UNIQUEIDENTIFIER,
    approved_at DATETIME2(7),
    usage_count INT DEFAULT 0,
    created_at DATETIME2(7) DEFAULT GETUTCDATE(),
    updated_at DATETIME2(7) DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_ai_content_institution FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE,
    CONSTRAINT FK_ai_content_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT FK_ai_content_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
    CONSTRAINT FK_ai_content_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
    CONSTRAINT FK_ai_content_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- COMPETITIONS & EVENTS
-- =====================================================

-- Competitions
CREATE TABLE competitions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    institution_id UNIQUEIDENTIFIER NOT NULL,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    category NVARCHAR(20) NOT NULL CHECK (category IN ('academic', 'sports', 'arts', 'technology', 'debate', 'other')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    registration_deadline DATE NOT NULL,
    max_participants INT,
    current_participants INT DEFAULT 0,
    eligibility_criteria NVARCHAR(MAX),
    prizes NVARCHAR(MAX),
    rules NVARCHAR(MAX),
    organizer_id UNIQUEIDENTIFIER NOT NULL,
    status NVARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'registration_open', 'in_progress', 'completed', 'cancelled')),
    created_at DATETIME2(7) DEFAULT GETUTCDATE(),
    updated_at DATETIME2(7) DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_competitions_institution FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE,
    CONSTRAINT FK_competitions_organizer FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT CHK_competition_dates CHECK (start_date <= end_date)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE (Azure SQL Optimized)
-- =====================================================

-- Core performance indexes
CREATE NONCLUSTERED INDEX IX_users_institution ON users(institution_id) INCLUDE (username, email, role, is_active);
CREATE NONCLUSTERED INDEX IX_users_role ON users(role) INCLUDE (institution_id, username, is_active);
CREATE NONCLUSTERED INDEX IX_users_email ON users(email) INCLUDE (institution_id, username, is_active);

-- Academic performance indexes
CREATE NONCLUSTERED INDEX IX_classes_institution ON classes(institution_id) INCLUDE (academic_year_id, grade_id, is_active);
CREATE NONCLUSTERED INDEX IX_classes_academic_year ON classes(academic_year_id) INCLUDE (institution_id, grade_id, is_active);
CREATE NONCLUSTERED INDEX IX_students_class ON students(current_class_id) INCLUDE (institution_id, enrollment_status);
CREATE NONCLUSTERED INDEX IX_attendance_date ON attendance(date) INCLUDE (student_id, class_id, status);
CREATE NONCLUSTERED INDEX IX_assignments_due_date ON assignments(due_date) INCLUDE (class_id, is_published);

-- Communication indexes
CREATE NONCLUSTERED INDEX IX_announcements_institution ON announcements(institution_id) INCLUDE (is_published, target_audience, published_at);
CREATE NONCLUSTERED INDEX IX_messages_sender ON messages(sender_id) INCLUDE (recipient_id, is_read, created_at);
CREATE NONCLUSTERED INDEX IX_messages_recipient ON messages(recipient_id) INCLUDE (sender_id, is_read, created_at);

-- Composite indexes for common queries
CREATE NONCLUSTERED INDEX IX_student_academic_year ON students(institution_id, enrollment_status) INCLUDE (current_class_id, grade_level_id);
CREATE NONCLUSTERED INDEX IX_teacher_institution_status ON teachers(institution_id, employment_status) INCLUDE (employee_number, department);
CREATE NONCLUSTERED INDEX IX_attendance_date_class ON attendance(date, class_id) INCLUDE (student_id, status);
CREATE NONCLUSTERED INDEX IX_assignment_due_class ON assignments(due_date, class_id, is_published) INCLUDE (title, assignment_type);
CREATE NONCLUSTERED INDEX IX_grade_student_subject ON grades(student_id, subject_id, academic_year_id) INCLUDE (score, grade_type);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Student Academic Summary View
CREATE VIEW vw_student_academic_summary AS
SELECT 
    s.id as student_id,
    s.student_number,
    u.full_name,
    c.name as class_name,
    g.name as grade_name,
    i.name as institution_name,
    COUNT(DISTINCT a.id) as total_assignments,
    COUNT(DISTINCT CASE WHEN a.is_submitted = 1 THEN a.id END) as submitted_assignments,
    AVG(gr.score) as average_score,
    COUNT(DISTINCT CASE WHEN att.status = 'present' THEN att.id END) as present_days,
    COUNT(DISTINCT att.id) as total_days
FROM students s
JOIN users u ON s.user_id = u.id
JOIN classes c ON s.current_class_id = c.id
JOIN grades g ON s.grade_level_id = g.id
JOIN institutions i ON s.institution_id = i.id
LEFT JOIN assignments a ON c.id = a.class_id
LEFT JOIN assignment_submissions a_sub ON a.id = a_sub.assignment_id AND s.id = a_sub.student_id
LEFT JOIN grades gr ON s.id = gr.student_id
LEFT JOIN attendance att ON s.id = att.student_id
WHERE s.enrollment_status = 'enrolled'
GROUP BY s.id, s.student_number, u.full_name, c.name, g.name, i.name;

-- Teacher Workload View
CREATE VIEW vw_teacher_workload AS
SELECT 
    t.id as teacher_id,
    u.full_name,
    i.name as institution_name,
    COUNT(DISTINCT c.id) as total_classes,
    COUNT(DISTINCT s.id) as total_students,
    COUNT(DISTINCT a.id) as total_assignments,
    COUNT(DISTINCT tsa.subject_id) as subjects_taught
FROM teachers t
JOIN users u ON t.user_id = u.id
JOIN institutions i ON t.institution_id = i.id
LEFT JOIN classes c ON t.id = c.class_teacher_id
LEFT JOIN students s ON c.id = s.current_class_id
LEFT JOIN assignments a ON t.id = a.teacher_id
LEFT JOIN teacher_subject_assignments tsa ON t.id = tsa.teacher_id
WHERE t.employment_status = 'active'
GROUP BY t.id, u.full_name, i.name;

-- =====================================================
-- STORED PROCEDURES FOR COMMON OPERATIONS
-- =====================================================

-- Calculate Student GPA
CREATE PROCEDURE sp_CalculateStudentGPA
    @StudentID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @TotalPoints DECIMAL(10,2) = 0;
    DECLARE @TotalWeight DECIMAL(10,2) = 0;
    DECLARE @GPA DECIMAL(4,2);
    
    SELECT 
        @TotalPoints = SUM(score * weight_percentage / 100),
        @TotalWeight = SUM(weight_percentage)
    FROM grades g
    JOIN assignments a ON g.assignment_id = a.id
    WHERE g.student_id = @StudentID 
    AND g.is_final = 1;
    
    IF @TotalWeight > 0
        SET @GPA = @TotalPoints / @TotalWeight;
    ELSE
        SET @GPA = 0;
    
    SELECT @GPA as student_gpa;
END;

-- Generate Attendance Report
CREATE PROCEDURE sp_GenerateAttendanceReport
    @ClassID UNIQUEIDENTIFIER,
    @StartDate DATE,
    @EndDate DATE
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        u.full_name,
        s.student_number,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_days,
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_days,
        COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late_days,
        COUNT(CASE WHEN a.status = 'excused' THEN 1 END) as excused_days,
        ROUND(CAST(COUNT(CASE WHEN a.status = 'present' THEN 1 END) AS FLOAT) / CAST(COUNT(*) AS FLOAT) * 100, 2) as attendance_percentage
    FROM students s
    JOIN users u ON s.user_id = u.id
    JOIN attendance a ON s.id = a.student_id
    WHERE s.current_class_id = @ClassID
    AND a.date BETWEEN @StartDate AND @EndDate
    GROUP BY s.id, u.full_name, s.student_number
    ORDER BY attendance_percentage DESC;
END;

-- =====================================================
-- TRIGGERS FOR DATA INTEGRITY
-- =====================================================

-- Trigger to update class enrollment count
CREATE TRIGGER tr_UpdateClassEnrollment
ON students
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    IF UPDATE(current_class_id)
    BEGIN
        -- Decrease count in old class
        UPDATE classes 
        SET current_enrollment = current_enrollment - 1 
        FROM classes c
        INNER JOIN deleted d ON c.id = d.current_class_id
        WHERE d.current_class_id IS NOT NULL;
        
        -- Increase count in new class
        UPDATE classes 
        SET current_enrollment = current_enrollment + 1 
        FROM classes c
        INNER JOIN inserted i ON c.id = i.current_class_id
        WHERE i.current_class_id IS NOT NULL;
    END;
END;

-- Trigger to update updated_at timestamp
CREATE TRIGGER tr_UpdateTimestamp
ON users
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE users 
    SET updated_at = GETUTCDATE()
    FROM users u
    INNER JOIN inserted i ON u.id = i.id;
END;

-- =====================================================
-- INITIAL DATA INSERTS
-- =====================================================

-- Insert sample institution
INSERT INTO institutions (name, code, type, district, province, subscription_plan)
VALUES ('Sample School', 'SAMPLE001', 'primary', 'Sample District', 'Sample Province', 'premium');

-- Insert sample academic year
INSERT INTO academic_years (institution_id, name, start_date, end_date, is_current, status)
SELECT id, '2024-2025', '2024-01-15', '2024-12-15', 1, 'active'
FROM institutions WHERE code = 'SAMPLE001';

-- Insert sample terms
INSERT INTO terms (academic_year_id, name, start_date, end_date, order_number, is_current, status)
SELECT 
    ay.id,
    'Term 1',
    '2024-01-15',
    '2024-04-05',
    1,
    1,
    'active'
FROM academic_years ay
JOIN institutions i ON ay.institution_id = i.id
WHERE i.code = 'SAMPLE001' AND ay.name = '2024-2025';

-- =====================================================
-- AZURE SQL SPECIFIC OPTIMIZATIONS
-- =====================================================

-- Enable In-Memory OLTP for high-performance tables (if using Premium/Business Critical tier)
-- ALTER TABLE attendance ADD MEMORY_OPTIMIZED = ON;
-- ALTER TABLE grades ADD MEMORY_OPTIMIZED = ON;

-- Enable Columnstore for analytics queries (if using Standard tier or higher)
-- CREATE CLUSTERED COLUMNSTORE INDEX CCI_grades ON grades;
-- CREATE CLUSTERED COLUMNSTORE INDEX CCI_attendance ON attendance;

-- Enable Query Store for performance monitoring
ALTER DATABASE CURRENT SET QUERY_STORE = ON;
ALTER DATABASE CURRENT SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30));

-- =====================================================
-- COMMENTS & DOCUMENTATION
-- =====================================================

/*
PSC Tech Database Schema for Azure SQL Database
Version: 2.0.0 - Azure SQL Edition
Last Updated: 2024

Key Features:
- Multi-tenant architecture with institution isolation
- Role-based access control (RBAC)
- Comprehensive academic management
- AI features integration
- Azure SQL optimized performance
- Scalable design for cloud deployment

Azure SQL Optimizations:
- UNIQUEIDENTIFIER for UUID support
- DATETIME2(7) for high-precision timestamps
- NVARCHAR(MAX) for JSON storage
- Computed columns for derived values
- Non-clustered indexes with INCLUDE for covering queries
- Query Store for performance monitoring

Design Principles:
1. Data Normalization: Proper 3NF design
2. Referential Integrity: Foreign key constraints
3. Performance: Strategic indexing for Azure SQL
4. Security: Multi-tenant isolation
5. Scalability: Cloud-ready architecture
6. Flexibility: JSON metadata support

Maintenance:
- Regular index optimization
- Query Store analysis
- Performance monitoring
- Backup and recovery procedures
*/


