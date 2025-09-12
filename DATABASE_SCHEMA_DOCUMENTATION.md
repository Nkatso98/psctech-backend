# PSC Tech Database Schema Documentation

## Overview

This document provides a comprehensive guide to the PSC Tech database schema, designed to support a multi-tenant school management system with role-based access control, comprehensive academic management, and AI features integration.

## 🏗️ Database Architecture

### Design Principles

1. **Multi-Tenant Architecture**: Each institution's data is completely isolated
2. **Normalized Design**: 3NF normalization to eliminate data redundancy
3. **Referential Integrity**: Foreign key constraints ensure data consistency
4. **Performance Optimized**: Strategic indexing for common query patterns
5. **Scalable**: Support for multiple institutions and large datasets
6. **Flexible**: JSON fields for extensible data structures

### Technology Stack

- **Database**: MySQL 8.0+ / PostgreSQL 13+ / SQL Server 2019+
- **Primary Keys**: UUID for global uniqueness
- **Timestamps**: Automatic creation and update tracking
- **JSON Support**: For flexible metadata storage

## 📊 Core Tables Structure

### 1. Institutions Table
**Purpose**: Multi-tenant isolation and institution management

```sql
CREATE TABLE institutions (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    type ENUM('primary', 'secondary', 'combined'),
    district VARCHAR(100),
    province VARCHAR(100),
    country VARCHAR(100) DEFAULT 'South Africa',
    subscription_plan ENUM('basic', 'premium', 'enterprise'),
    -- ... additional fields
);
```

**Key Features**:
- Unique institution codes for identification
- Subscription management for different plans
- Geographic location tracking
- Multi-language support preparation

### 2. Users Table
**Purpose**: Unified user management across all roles

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    institution_id UUID NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role ENUM('superadmin', 'principal', 'teacher', 'parent', 'learner', 'sgb'),
    -- ... additional fields
);
```

**Key Features**:
- Role-based access control (RBAC)
- Institution isolation
- Comprehensive user profiles
- Security features (login attempts, account locking)

### 3. Academic Structure Tables

#### Academic Years
```sql
CREATE TABLE academic_years (
    id UUID PRIMARY KEY,
    institution_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE
);
```

#### Terms/Semesters
```sql
CREATE TABLE terms (
    id UUID PRIMARY KEY,
    academic_year_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    order_number INT NOT NULL
);
```

#### Grades/Standards
```sql
CREATE TABLE grades (
    id UUID PRIMARY KEY,
    institution_id UUID NOT NULL,
    name VARCHAR(50) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    order_number INT NOT NULL
);
```

#### Subjects
```sql
CREATE TABLE subjects (
    id UUID PRIMARY KEY,
    institution_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    category ENUM('core', 'elective', 'extracurricular'),
    is_compulsory BOOLEAN DEFAULT FALSE
);
```

#### Classes
```sql
CREATE TABLE classes (
    id UUID PRIMARY KEY,
    institution_id UUID NOT NULL,
    academic_year_id UUID NOT NULL,
    grade_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    capacity INT DEFAULT 40,
    current_enrollment INT DEFAULT 0,
    class_teacher_id UUID
);
```

## 👥 User Management Tables

### 4. Students Table
**Purpose**: Comprehensive student information and academic tracking

```sql
CREATE TABLE students (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    institution_id UUID NOT NULL,
    student_number VARCHAR(50) UNIQUE NOT NULL,
    current_class_id UUID,
    grade_level_id UUID NOT NULL,
    enrollment_status ENUM('enrolled', 'transferred', 'graduated', 'withdrawn'),
    -- ... additional fields
);
```

**Key Features**:
- Student number uniqueness per institution
- Class and grade level tracking
- Enrollment status management
- Medical and special needs information
- Parent/guardian relationships

### 5. Teachers Table
**Purpose**: Teacher employment and qualification management

```sql
CREATE TABLE teachers (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    institution_id UUID NOT NULL,
    employee_number VARCHAR(50) UNIQUE NOT NULL,
    employment_status ENUM('active', 'probation', 'suspended', 'terminated'),
    employment_type ENUM('full-time', 'part-time', 'contract', 'substitute'),
    -- ... additional fields
);
```

**Key Features**:
- Employee number uniqueness
- Employment status tracking
- Qualification and specialization
- Department assignment

### 6. Teacher Subject Assignments
**Purpose**: Track which teachers teach which subjects in which classes

```sql
CREATE TABLE teacher_subject_assignments (
    id UUID PRIMARY KEY,
    teacher_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    class_id UUID NOT NULL,
    academic_year_id UUID NOT NULL,
    term_id UUID NOT NULL,
    is_primary_teacher BOOLEAN DEFAULT FALSE
);
```

## 📚 Academic Management Tables

### 7. Attendance Table
**Purpose**: Comprehensive student attendance tracking

```sql
CREATE TABLE attendance (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL,
    class_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    teacher_id UUID NOT NULL,
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'late', 'excused', 'suspended'),
    time_in TIME NULL,
    time_out TIME NULL,
    reason_for_absence TEXT
);
```

**Key Features**:
- Daily attendance tracking
- Multiple status types
- Time tracking for late students
- Absence reason documentation
- Teacher verification

### 8. Assignments Table
**Purpose**: Manage all types of academic assignments

```sql
CREATE TABLE assignments (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subject_id UUID NOT NULL,
    class_id UUID NOT NULL,
    teacher_id UUID NOT NULL,
    assignment_type ENUM('homework', 'classwork', 'project', 'test', 'quiz', 'exam'),
    due_date DATETIME NOT NULL,
    max_score DECIMAL(5,2) DEFAULT 100.00,
    weight_percentage DECIMAL(5,2) DEFAULT 10.00
);
```

**Key Features**:
- Multiple assignment types
- Due date management
- Scoring and weighting
- File attachment support (JSON)
- Publication status

### 9. Assignment Submissions Table
**Purpose**: Track student submissions and grading

```sql
CREATE TABLE assignment_submissions (
    id UUID PRIMARY KEY,
    assignment_id UUID NOT NULL,
    student_id UUID NOT NULL,
    submitted_at DATETIME NOT NULL,
    score DECIMAL(5,2) NULL,
    feedback TEXT,
    status ENUM('submitted', 'graded', 'returned', 'resubmitted')
);
```

**Key Features**:
- Submission timestamp tracking
- Late submission detection
- Grading workflow
- Feedback management
- Resubmission support

### 10. Grades Table
**Purpose**: Comprehensive grade management and calculation

```sql
CREATE TABLE grades (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    class_id UUID NOT NULL,
    academic_year_id UUID NOT NULL,
    term_id UUID NOT NULL,
    assignment_id UUID NULL,
    grade_type ENUM('assignment', 'test', 'exam', 'term', 'final'),
    score DECIMAL(5,2) NOT NULL,
    max_score DECIMAL(5,2) NOT NULL,
    percentage DECIMAL(5,2) GENERATED ALWAYS AS ((score / max_score) * 100) STORED
);
```

**Key Features**:
- Multiple grade types
- Automatic percentage calculation
- Comprehensive grade tracking
- Final grade management
- Historical grade preservation

## 💬 Communication Tables

### 11. Announcements Table
**Purpose**: Institution-wide and targeted communications

```sql
CREATE TABLE announcements (
    id UUID PRIMARY KEY,
    institution_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    target_audience ENUM('all', 'teachers', 'students', 'parents', 'staff', 'specific_class'),
    priority ENUM('low', 'normal', 'high', 'urgent'),
    is_published BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NULL
);
```

**Key Features**:
- Audience targeting
- Priority levels
- Publication control
- Expiration management
- Acknowledgment tracking

### 12. Messages Table
**Purpose**: Direct messaging between users

```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY,
    sender_id UUID NOT NULL,
    recipient_id UUID NOT NULL,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    message_type ENUM('direct', 'group', 'system'),
    priority ENUM('low', 'normal', 'high', 'urgent'),
    is_read BOOLEAN DEFAULT FALSE
);
```

**Key Features**:
- Direct messaging
- Group messaging support
- System notifications
- Read status tracking
- Threaded conversations

## 🤖 AI Features Tables

### 13. AI Generated Content Table
**Purpose**: Track and manage AI-generated educational content

```sql
CREATE TABLE ai_generated_content (
    id UUID PRIMARY KEY,
    institution_id UUID NOT NULL,
    creator_id UUID NOT NULL,
    content_type ENUM('homework', 'test', 'study_material', 'lesson_plan', 'assessment'),
    prompt TEXT NOT NULL,
    generated_content TEXT NOT NULL,
    metadata JSON,
    is_approved BOOLEAN DEFAULT FALSE,
    usage_count INT DEFAULT 0
);
```

**Key Features**:
- Content type categorization
- Prompt storage for reproducibility
- Approval workflow
- Usage tracking
- Metadata flexibility

## 🏆 Competitions & Events Tables

### 14. Competitions Table
**Purpose**: Manage school competitions and events

```sql
CREATE TABLE competitions (
    id UUID PRIMARY KEY,
    institution_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    category ENUM('academic', 'sports', 'arts', 'technology', 'debate', 'other'),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    max_participants INT,
    current_participants INT DEFAULT 0
);
```

**Key Features**:
- Multiple competition categories
- Date range management
- Participant limits
- Registration tracking
- Status management

## 🔍 Performance Optimization

### Strategic Indexing

```sql
-- Core performance indexes
CREATE INDEX idx_user_institution ON users(institution_id);
CREATE INDEX idx_user_role ON users(role);
CREATE INDEX idx_user_email ON users(email);

-- Academic performance indexes
CREATE INDEX idx_class_institution ON classes(institution_id);
CREATE INDEX idx_class_academic_year ON classes(academic_year_id);
CREATE INDEX idx_student_class ON students(current_class_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_assignment_due_date ON assignments(due_date);

-- Communication indexes
CREATE INDEX idx_announcement_institution ON announcements(institution_id);
CREATE INDEX idx_message_sender ON messages(sender_id);
CREATE INDEX idx_message_recipient ON messages(recipient_id);
```

### Query Optimization Tips

1. **Always filter by institution_id first** for multi-tenant queries
2. **Use composite indexes** for frequently combined filters
3. **Leverage JSON indexes** for metadata searches
4. **Implement pagination** for large result sets
5. **Use views** for complex, frequently-used queries

## 🔐 Security & Data Integrity

### Multi-Tenant Security

- **Institution Isolation**: All queries must include institution_id filter
- **Role-Based Access**: User permissions based on role and institution
- **Data Encryption**: Sensitive data encryption at rest and in transit
- **Audit Logging**: Complete tracking of data modifications

### Data Validation

```sql
-- Example constraints
CONSTRAINT chk_score_range CHECK (score >= 0 AND score <= max_score)
CONSTRAINT chk_dates CHECK (start_date <= end_date)
CONSTRAINT chk_capacity CHECK (current_enrollment <= capacity)
```

## 📈 Scalability Considerations

### Horizontal Scaling

1. **Database Sharding**: By institution for very large deployments
2. **Read Replicas**: For reporting and analytics queries
3. **Connection Pooling**: Efficient database connection management
4. **Caching Strategy**: Redis/Memcached for frequently accessed data

### Performance Monitoring

- **Query Performance**: Monitor slow queries and optimize
- **Index Usage**: Track index effectiveness
- **Connection Metrics**: Monitor connection pool utilization
- **Storage Growth**: Track table sizes and growth rates

## 🚀 Implementation Guidelines

### 1. Database Setup

```sql
-- Create database
CREATE DATABASE psc_tech_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Set timezone
SET time_zone = '+02:00'; -- South Africa timezone

-- Create user with appropriate permissions
CREATE USER 'psc_tech_user'@'%' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON psc_tech_db.* TO 'psc_tech_user'@'%';
```

### 2. Migration Strategy

1. **Phase 1**: Core tables (institutions, users, academic structure)
2. **Phase 2**: Student and teacher management
3. **Phase 3**: Academic records and communication
4. **Phase 4**: AI features and advanced analytics
5. **Phase 5**: Performance optimization and monitoring

### 3. Backup Strategy

- **Full Backups**: Daily automated backups
- **Incremental Backups**: Every 4 hours during business hours
- **Point-in-Time Recovery**: Binary log archiving
- **Cross-Region Replication**: Disaster recovery preparation

## 🔧 Maintenance Procedures

### Regular Maintenance Tasks

1. **Index Optimization**: Weekly index usage analysis
2. **Statistics Updates**: Daily table statistics refresh
3. **Log Rotation**: Weekly log file management
4. **Performance Tuning**: Monthly query performance review
5. **Capacity Planning**: Quarterly storage and performance assessment

### Monitoring Queries

```sql
-- Check table sizes
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'psc_tech_db'
ORDER BY (data_length + index_length) DESC;

-- Check slow queries
SELECT * FROM mysql.slow_log 
WHERE start_time > DATE_SUB(NOW(), INTERVAL 1 DAY)
ORDER BY query_time DESC LIMIT 10;
```

## 📚 Best Practices

### 1. Data Modeling

- **Normalize First**: Start with 3NF, denormalize only when necessary
- **Consistent Naming**: Use clear, descriptive table and column names
- **Documentation**: Maintain up-to-date schema documentation
- **Version Control**: Track schema changes in version control

### 2. Query Optimization

- **Use Prepared Statements**: Prevent SQL injection and improve performance
- **Limit Result Sets**: Always use LIMIT for large queries
- **Avoid SELECT ***: Specify only needed columns
- **Use Appropriate Indexes**: Create indexes based on query patterns

### 3. Security

- **Principle of Least Privilege**: Grant minimum necessary permissions
- **Input Validation**: Validate all user inputs
- **SQL Injection Prevention**: Use parameterized queries
- **Regular Security Audits**: Periodic security reviews

## 🔮 Future Enhancements

### Planned Features

1. **Advanced Analytics**: Machine learning for student performance prediction
2. **Real-time Notifications**: WebSocket support for instant updates
3. **Mobile Optimization**: Mobile-specific data structures
4. **Integration APIs**: Third-party system integrations
5. **Advanced Reporting**: Custom report builder with drag-and-drop interface

### Scalability Improvements

1. **Microservices Architecture**: Break down into smaller, focused services
2. **Event Sourcing**: Implement event-driven architecture for audit trails
3. **GraphQL API**: Flexible data querying for frontend applications
4. **Multi-Database Support**: Support for different database engines

---

This database schema provides a solid foundation for PSC Tech, ensuring data consistency, performance, and scalability while maintaining the flexibility needed for future enhancements.


