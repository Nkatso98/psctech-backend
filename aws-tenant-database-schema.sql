-- AWS Tenant Database Schema for PSCTECH
-- This schema is used for each institution (tenant) with complete data isolation
-- Run this on AWS RDS PostgreSQL for each tenant database

-- =====================================================
-- TENANT DATABASE SCHEMA
-- =====================================================

-- =====================================================
-- CORE INSTITUTION TABLES
-- =====================================================

-- Institutions (Main tenant table)
CREATE TABLE IF NOT EXISTS institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Primary School', 'Secondary School', 'Combined School', 'University', 'College', 'Technical Institute', 'Vocational School')),
    district VARCHAR(100),
    province VARCHAR(100),
    country VARCHAR(100) DEFAULT 'South Africa',
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    logo_url VARCHAR(500),
    subscription_plan VARCHAR(20) DEFAULT 'basic',
    subscription_status VARCHAR(20) DEFAULT 'active',
    subscription_expiry TIMESTAMP,
    max_users INTEGER DEFAULT 100,
    max_students INTEGER DEFAULT 500,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Institution Details (Extended information)
CREATE TABLE IF NOT EXISTS institution_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id),
    principal_name VARCHAR(255),
    principal_email VARCHAR(255),
    principal_phone VARCHAR(20),
    academic_year VARCHAR(9), -- e.g., "2024-2025"
    term_start_date DATE,
    term_end_date DATE,
    school_hours_start TIME DEFAULT '07:30',
    school_hours_end TIME DEFAULT '14:30',
    timezone VARCHAR(50) DEFAULT 'Africa/Johannesburg',
    language_of_instruction VARCHAR(50) DEFAULT 'English',
    additional_languages TEXT[], -- Array of additional languages
    facilities TEXT[], -- Array of available facilities
    policies JSONB, -- School policies and rules
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- USER MANAGEMENT TABLES
-- =====================================================

-- Users (Authentication and basic info)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('Principal', 'Teacher', 'Parent', 'Learner', 'SGB', 'Admin')),
    institution_id UUID NOT NULL REFERENCES institutions(id),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    password_reset_token VARCHAR(255),
    password_reset_token_expiry TIMESTAMP,
    last_login TIMESTAMP,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Profiles (Extended user information)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
    profile_picture VARCHAR(500),
    bio TEXT,
    preferences JSONB, -- User preferences and settings
    emergency_contact JSONB, -- Emergency contact information
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- STUDENT MANAGEMENT TABLES
-- =====================================================

-- Students
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
    grade VARCHAR(10) NOT NULL, -- e.g., "Grade 8", "Grade 9"
    class VARCHAR(20), -- e.g., "8A", "9B"
    institution_id UUID NOT NULL REFERENCES institutions(id),
    parent_id UUID REFERENCES users(id), -- Link to parent user
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated', 'transferred')),
    academic_year VARCHAR(9),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student Academic Records
CREATE TABLE IF NOT EXISTS student_academic_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    academic_year VARCHAR(9) NOT NULL,
    term VARCHAR(20) NOT NULL, -- e.g., "Term 1", "Term 2"
    grade VARCHAR(10) NOT NULL,
    class VARCHAR(20),
    total_subjects INTEGER DEFAULT 0,
    average_score DECIMAL(5,2),
    position_in_class INTEGER,
    total_students_in_class INTEGER,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, academic_year, term)
);

-- =====================================================
-- TEACHER MANAGEMENT TABLES
-- =====================================================

-- Teachers
CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
    qualification VARCHAR(255),
    specialization VARCHAR(255), -- Main subject area
    institution_id UUID NOT NULL REFERENCES institutions(id),
    user_id UUID REFERENCES users(id), -- Link to user account
    employment_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'resigned', 'retired')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teacher Subjects (Many-to-many relationship)
CREATE TABLE IF NOT EXISTS teacher_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    subject_name VARCHAR(100) NOT NULL,
    grade_level VARCHAR(10), -- e.g., "Grade 8-12"
    is_primary BOOLEAN DEFAULT false, -- Primary subject for this teacher
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(teacher_id, subject_name, grade_level)
);

-- =====================================================
-- SUBJECT AND CURRICULUM TABLES
-- =====================================================

-- Subjects
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    grade_level VARCHAR(10), -- e.g., "Grade 8-12"
    credits INTEGER DEFAULT 1,
    institution_id UUID NOT NULL REFERENCES institutions(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Classes
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL, -- e.g., "8A", "9B"
    grade VARCHAR(10) NOT NULL,
    academic_year VARCHAR(9) NOT NULL,
    institution_id UUID NOT NULL REFERENCES institutions(id),
    class_teacher_id UUID REFERENCES teachers(id),
    capacity INTEGER DEFAULT 40,
    current_enrollment INTEGER DEFAULT 0,
    room_number VARCHAR(20),
    schedule JSONB, -- Class schedule
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, grade, academic_year, institution_id)
);

-- Class Allocations (Students to Classes)
CREATE TABLE IF NOT EXISTS class_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    academic_year VARCHAR(9) NOT NULL,
    allocation_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, class_id, academic_year)
);

-- =====================================================
-- ATTENDANCE MANAGEMENT TABLES
-- =====================================================

-- Attendance Records
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id),
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused', 'sick')),
    time_in TIME,
    time_out TIME,
    reason TEXT, -- For absences or late arrivals
    recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, class_id, date)
);

-- Attendance Summary (Aggregated data for reporting)
CREATE TABLE IF NOT EXISTS attendance_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    academic_year VARCHAR(9) NOT NULL,
    term VARCHAR(20) NOT NULL,
    total_days INTEGER DEFAULT 0,
    days_present INTEGER DEFAULT 0,
    days_absent INTEGER DEFAULT 0,
    days_late INTEGER DEFAULT 0,
    attendance_percentage DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, academic_year, term)
);

-- =====================================================
-- ASSESSMENT AND PERFORMANCE TABLES
-- =====================================================

-- Assessments (Tests, Exams, Assignments)
CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject_id UUID NOT NULL REFERENCES subjects(id),
    class_id UUID NOT NULL REFERENCES classes(id),
    assessment_type VARCHAR(50) NOT NULL CHECK (assessment_type IN ('Test', 'Exam', 'Assignment', 'Project', 'Quiz', 'Homework')),
    total_marks INTEGER NOT NULL,
    weight_percentage DECIMAL(5,2) DEFAULT 100.00,
    due_date TIMESTAMP,
    duration_minutes INTEGER, -- For timed assessments
    instructions TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assessment Results
CREATE TABLE IF NOT EXISTS assessment_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    marks_obtained DECIMAL(5,2) NOT NULL,
    percentage DECIMAL(5,2),
    grade VARCHAR(5), -- e.g., "A", "B", "C"
    remarks TEXT,
    submitted_at TIMESTAMP,
    graded_by UUID REFERENCES users(id),
    graded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(assessment_id, student_id)
);

-- Performance Analytics
CREATE TABLE IF NOT EXISTS performance_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id),
    academic_year VARCHAR(9) NOT NULL,
    term VARCHAR(20) NOT NULL,
    total_assessments INTEGER DEFAULT 0,
    average_score DECIMAL(5,2),
    highest_score DECIMAL(5,2),
    lowest_score DECIMAL(5,2),
    improvement_rate DECIMAL(5,2), -- Percentage improvement from previous term
    rank_in_class INTEGER,
    total_students_in_class INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, subject_id, academic_year, term)
);

-- =====================================================
-- STUDY ZONE AND AI FEATURES TABLES
-- =====================================================

-- Study Sessions
CREATE TABLE IF NOT EXISTS study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    subject VARCHAR(100) NOT NULL,
    topic VARCHAR(255) NOT NULL,
    session_type VARCHAR(50) DEFAULT 'practice' CHECK (session_type IN ('practice', 'quiz', 'revision', 'ai_assisted')),
    duration_minutes INTEGER,
    questions_count INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    score DECIMAL(5,2),
    difficulty_level VARCHAR(20) DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    session_data JSONB, -- Detailed session information
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Study Results
CREATE TABLE IF NOT EXISTS study_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    session_id UUID NOT NULL REFERENCES study_sessions(id),
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    time_spent INTEGER, -- in seconds
    answers JSONB, -- Detailed answer data
    recommendations JSONB, -- AI-generated recommendations
    weak_areas JSONB, -- Identified weak areas
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Study Materials
CREATE TABLE IF NOT EXISTS ai_study_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject VARCHAR(100) NOT NULL,
    topic VARCHAR(255) NOT NULL,
    grade_level VARCHAR(10),
    material_type VARCHAR(50) CHECK (material_type IN ('question_bank', 'notes', 'practice_test', 'explanation')),
    content JSONB NOT NULL,
    difficulty_level VARCHAR(20) DEFAULT 'medium',
    tags TEXT[],
    usage_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    created_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- VOUCHER SYSTEM TABLES
-- =====================================================

-- Vouchers
CREATE TABLE IF NOT EXISTS vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voucher_code VARCHAR(19) UNIQUE NOT NULL, -- Format: XXXX-XXXX-XXXX-XXXX
    denomination DECIMAL(10,2) NOT NULL,
    parent_guardian_name VARCHAR(255) NOT NULL,
    learner_count INTEGER NOT NULL CHECK (learner_count BETWEEN 1 AND 10),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'expired', 'cancelled')),
    institution_id UUID NOT NULL REFERENCES institutions(id),
    issued_by_user_id UUID NOT NULL REFERENCES users(id),
    issued_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    redeemed_by_user_id UUID REFERENCES users(id),
    redeemed_date TIMESTAMP,
    expiry_date TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Voucher Redemptions
CREATE TABLE IF NOT EXISTS voucher_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voucher_id UUID NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    redemption_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    learner_count INTEGER NOT NULL,
    parent_guardian_name VARCHAR(255) NOT NULL,
    activation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Voucher Audit Trail
CREATE TABLE IF NOT EXISTS voucher_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voucher_id UUID NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- e.g., 'created', 'redeemed', 'expired', 'cancelled'
    user_id UUID REFERENCES users(id),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- COMMUNICATION AND NOTIFICATIONS TABLES
-- =====================================================

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    target_audience VARCHAR(50) CHECK (target_audience IN ('all', 'students', 'parents', 'teachers', 'staff')),
    institution_id UUID NOT NULL REFERENCES institutions(id),
    created_by UUID NOT NULL REFERENCES users(id),
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP,
    expiry_date TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id),
    recipient_id UUID NOT NULL REFERENCES users(id),
    subject VARCHAR(255),
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'internal' CHECK (message_type IN ('internal', 'email', 'sms')),
    priority VARCHAR(20) DEFAULT 'normal',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- e.g., 'assessment_due', 'attendance_alert', 'voucher_redeemed'
    reference_type VARCHAR(50), -- e.g., 'assessment', 'voucher', 'announcement'
    reference_id UUID,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    is_sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TIMETABLE AND SCHEDULING TABLES
-- =====================================================

-- Timetables
CREATE TABLE IF NOT EXISTS timetables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id),
    academic_year VARCHAR(9) NOT NULL,
    term VARCHAR(20) NOT NULL,
    schedule_data JSONB NOT NULL, -- Detailed timetable data
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_id, academic_year, term)
);

-- Events and Meetings
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('meeting', 'exam', 'holiday', 'sports', 'cultural', 'other')),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    location VARCHAR(255),
    institution_id UUID NOT NULL REFERENCES institutions(id),
    organizer_id UUID NOT NULL REFERENCES users(id),
    attendees JSONB, -- Array of user IDs or 'all'
    is_all_day BOOLEAN DEFAULT false,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern JSONB, -- For recurring events
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- DOCUMENTS AND FILES TABLES
-- =====================================================

-- Documents
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    mime_type VARCHAR(100),
    document_type VARCHAR(50) CHECK (document_type IN ('report', 'policy', 'form', 'syllabus', 'assignment', 'other')),
    institution_id UUID NOT NULL REFERENCES institutions(id),
    uploaded_by UUID NOT NULL REFERENCES users(id),
    is_public BOOLEAN DEFAULT false,
    access_level VARCHAR(20) DEFAULT 'restricted' CHECK (access_level IN ('public', 'restricted', 'private')),
    download_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Document Access Control
CREATE TABLE IF NOT EXISTS document_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id), -- NULL means role-based access
    role VARCHAR(20), -- NULL means user-specific access
    permission VARCHAR(20) NOT NULL CHECK (permission IN ('read', 'write', 'delete')),
    granted_by UUID NOT NULL REFERENCES users(id),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    UNIQUE(document_id, user_id, role)
);

-- =====================================================
-- COMPETITIONS AND ACTIVITIES TABLES
-- =====================================================

-- Competitions
CREATE TABLE IF NOT EXISTS competitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    competition_type VARCHAR(50) CHECK (competition_type IN ('academic', 'sports', 'cultural', 'art', 'science', 'other')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    registration_deadline DATE,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    prizes JSONB, -- Prize information
    rules TEXT,
    institution_id UUID NOT NULL REFERENCES institutions(id),
    organizer_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Competition Participants
CREATE TABLE IF NOT EXISTS competition_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'participated', 'won', 'disqualified')),
    score DECIMAL(5,2),
    rank INTEGER,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(competition_id, student_id)
);

-- =====================================================
-- HOMEWORK AND ASSIGNMENTS TABLES
-- =====================================================

-- Homework Assignments
CREATE TABLE IF NOT EXISTS homework_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject_id UUID NOT NULL REFERENCES subjects(id),
    class_id UUID NOT NULL REFERENCES classes(id),
    assigned_by UUID NOT NULL REFERENCES users(id),
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP NOT NULL,
    total_marks INTEGER,
    instructions TEXT,
    attachments JSONB, -- Array of document IDs
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Homework Submissions
CREATE TABLE IF NOT EXISTS homework_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES homework_assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    content TEXT,
    attachments JSONB, -- Array of document IDs
    marks_obtained DECIMAL(5,2),
    feedback TEXT,
    graded_by UUID REFERENCES users(id),
    graded_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'late', 'graded', 'returned')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(assignment_id, student_id)
);

-- =====================================================
-- REPORTS AND ANALYTICS TABLES
-- =====================================================

-- Report Templates
CREATE TABLE IF NOT EXISTS report_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_type VARCHAR(50) NOT NULL CHECK (template_type IN ('academic', 'attendance', 'behavior', 'financial', 'custom')),
    template_data JSONB NOT NULL, -- Report structure and formatting
    institution_id UUID NOT NULL REFERENCES institutions(id),
    created_by UUID NOT NULL REFERENCES users(id),
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Generated Reports
CREATE TABLE IF NOT EXISTS generated_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES report_templates(id),
    report_name VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    report_data JSONB NOT NULL, -- Actual report data
    file_path VARCHAR(500), -- Path to generated PDF/Excel file
    institution_id UUID NOT NULL REFERENCES institutions(id),
    generated_by UUID NOT NULL REFERENCES users(id),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    parameters JSONB, -- Parameters used to generate the report
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SETTINGS AND CONFIGURATION TABLES
-- =====================================================

-- Institution Settings
CREATE TABLE IF NOT EXISTS institution_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id),
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT NOT NULL,
    setting_type VARCHAR(50) DEFAULT 'string',
    description TEXT,
    is_encrypted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(institution_id, setting_key)
);

-- User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preference_key VARCHAR(100) NOT NULL,
    preference_value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, preference_key)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users Indexes
CREATE INDEX IF NOT EXISTS idx_users_institution ON users(institution_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Students Indexes
CREATE INDEX IF NOT EXISTS idx_students_institution ON students(institution_id);
CREATE INDEX IF NOT EXISTS idx_students_grade ON students(grade);
CREATE INDEX IF NOT EXISTS idx_students_parent ON students(parent_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);

-- Teachers Indexes
CREATE INDEX IF NOT EXISTS idx_teachers_institution ON teachers(institution_id);
CREATE INDEX IF NOT EXISTS idx_teachers_employee_number ON teachers(employee_number);

-- Attendance Indexes
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance_records(student_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_class_date ON attendance_records(class_id, date);

-- Assessment Indexes
CREATE INDEX IF NOT EXISTS idx_assessments_subject ON assessments(subject_id);
CREATE INDEX IF NOT EXISTS idx_assessments_class ON assessments(class_id);
CREATE INDEX IF NOT EXISTS idx_assessments_type ON assessments(assessment_type);

-- Voucher Indexes
CREATE INDEX IF NOT EXISTS idx_vouchers_code ON vouchers(voucher_code);
CREATE INDEX IF NOT EXISTS idx_vouchers_institution ON vouchers(institution_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_status ON vouchers(status);

-- Study Session Indexes
CREATE INDEX IF NOT EXISTS idx_study_sessions_user ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_subject ON study_sessions(subject);

-- Message Indexes
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(is_read);

-- Notification Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- Document Indexes
CREATE INDEX IF NOT EXISTS idx_documents_institution ON documents(institution_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);

-- =====================================================
-- TRIGGERS FOR AUTOMATION
-- =====================================================

-- Update updated_at timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON institutions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vouchers_updated_at BEFORE UPDATE ON vouchers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS FOR REPORTING
-- =====================================================

-- Student Performance Summary View
CREATE OR REPLACE VIEW student_performance_summary AS
SELECT 
    s.id as student_id,
    s.student_number,
    s.first_name,
    s.last_name,
    s.grade,
    s.class,
    i.name as institution_name,
    COUNT(ar.id) as total_assessments,
    AVG(ar.marks_obtained) as average_score,
    MAX(ar.marks_obtained) as highest_score,
    MIN(ar.marks_obtained) as lowest_score
FROM students s
JOIN institutions i ON s.institution_id = i.id
LEFT JOIN assessment_results ar ON s.id = ar.student_id
WHERE s.is_active = true
GROUP BY s.id, s.student_number, s.first_name, s.last_name, s.grade, s.class, i.name;

-- Attendance Summary View
CREATE OR REPLACE VIEW attendance_summary_view AS
SELECT 
    s.id as student_id,
    s.student_number,
    s.first_name,
    s.last_name,
    s.grade,
    s.class,
    COUNT(ar.id) as total_days,
    COUNT(CASE WHEN ar.status = 'present' THEN 1 END) as days_present,
    COUNT(CASE WHEN ar.status = 'absent' THEN 1 END) as days_absent,
    COUNT(CASE WHEN ar.status = 'late' THEN 1 END) as days_late,
    ROUND(
        (COUNT(CASE WHEN ar.status = 'present' THEN 1 END)::DECIMAL / COUNT(ar.id)::DECIMAL) * 100, 2
    ) as attendance_percentage
FROM students s
LEFT JOIN attendance_records ar ON s.id = ar.student_id
WHERE s.is_active = true
GROUP BY s.id, s.student_number, s.first_name, s.last_name, s.grade, s.class;

-- Voucher Analytics View
CREATE OR REPLACE VIEW voucher_analytics AS
SELECT 
    i.name as institution_name,
    COUNT(v.id) as total_vouchers,
    COUNT(CASE WHEN v.status = 'active' THEN 1 END) as active_vouchers,
    COUNT(CASE WHEN v.status = 'redeemed' THEN 1 END) as redeemed_vouchers,
    COUNT(CASE WHEN v.status = 'expired' THEN 1 END) as expired_vouchers,
    SUM(v.denomination) as total_value,
    AVG(v.denomination) as average_denomination,
    COUNT(DISTINCT v.issued_by_user_id) as unique_issuers
FROM vouchers v
JOIN institutions i ON v.institution_id = i.id
GROUP BY i.id, i.name;

-- =====================================================
-- INITIAL DATA FOR TESTING
-- =====================================================

-- Insert sample institution
INSERT INTO institutions (code, name, type, district, province, email, phone) VALUES
('DEMO001', 'Demo Primary School', 'Primary School', 'Demo District', 'Demo Province', 'info@demoschool.com', '+27123456789')
ON CONFLICT (code) DO NOTHING;

-- Insert sample users for testing
INSERT INTO users (username, email, password_hash, role, institution_id) VALUES
('principal', 'principal@demoschool.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', 'Principal', (SELECT id FROM institutions WHERE code = 'DEMO001')),
('teacher', 'teacher@demoschool.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', 'Teacher', (SELECT id FROM institutions WHERE code = 'DEMO001')),
('parent', 'parent@demoschool.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', 'Parent', (SELECT id FROM institutions WHERE code = 'DEMO001')),
('learner', 'learner@demoschool.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', 'Learner', (SELECT id FROM institutions WHERE code = 'DEMO001'))
ON CONFLICT (username) DO NOTHING;

-- Insert sample user profiles
INSERT INTO user_profiles (user_id, first_name, last_name, phone) VALUES
((SELECT id FROM users WHERE username = 'principal'), 'John', 'Principal', '+27123456789'),
((SELECT id FROM users WHERE username = 'teacher'), 'Jane', 'Teacher', '+27123456790'),
((SELECT id FROM users WHERE username = 'parent'), 'Bob', 'Parent', '+27123456791'),
((SELECT id FROM users WHERE username = 'learner'), 'Alice', 'Learner', '+27123456792')
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample subjects
INSERT INTO subjects (name, code, description, grade_level, institution_id) VALUES
('Mathematics', 'MATH', 'Core mathematics curriculum', 'Grade 8-12', (SELECT id FROM institutions WHERE code = 'DEMO001')),
('English', 'ENG', 'English language and literature', 'Grade 8-12', (SELECT id FROM institutions WHERE code = 'DEMO001')),
('Science', 'SCI', 'General science', 'Grade 8-12', (SELECT id FROM institutions WHERE code = 'DEMO001'))
ON CONFLICT (code, institution_id) DO NOTHING;

COMMIT;








