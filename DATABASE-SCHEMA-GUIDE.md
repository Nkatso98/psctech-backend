# PSCTECH Multi-Tenant Database Schema Guide

## Overview

This guide explains the SQL Server-compatible database schemas for the PSCTECH multi-tenant educational platform. The system uses a **master-tenant architecture** where:

- **Master Database** (`psctech_master`): Manages tenant registration, subscriptions, and system-wide configurations
- **Tenant Databases**: Individual databases for each institution with complete data isolation

## Database Architecture

### 1. Master Database (`aws-master-database-schema.sql`)

**Purpose**: Central management of all tenants and system-wide operations

**Key Tables**:
- `tenant_registry`: Main tenant information and database connections
- `tenant_connections`: Connection strings and server endpoints
- `subscription_plans`: Available subscription tiers
- `tenant_subscriptions`: Active subscriptions for each tenant
- `system_audit_log`: System-wide audit trail
- `api_usage_log`: API usage tracking

**Usage**: Run this schema first to set up the master database that will manage all tenant databases.

### 2. Tenant Database Core (`aws-tenant-database-core.sql`)

**Purpose**: Essential tables for basic institution functionality

**Key Tables**:
- `institutions`: Institution details
- `users`: User authentication and roles
- `user_profiles`: Extended user information
- `students`: Student records
- `teachers`: Teacher records
- `study_results`: Study session results
- `vouchers`: Voucher system
- `voucher_redemptions`: Voucher redemption tracking
- `voucher_audits`: Voucher audit trail

**Usage**: Run this for each new institution to create their isolated database.

### 3. Tenant Database Extended (`aws-tenant-database-extended.sql`)

**Purpose**: Additional functionality for comprehensive school management

**Key Tables**:
- `classes`: Class management
- `attendance_records`: Student attendance tracking
- `subjects`: Subject management
- `assessments`: Test and assignment management
- `assessment_results`: Student performance tracking
- `study_sessions`: Detailed study session tracking
- `ai_study_materials`: AI-generated study content
- `announcements`: School announcements
- `messages`: Internal messaging system

**Usage**: Run this after the core schema to add advanced features.

## Installation Instructions

### Step 1: Set Up Master Database

```sql
-- Connect to your SQL Server instance
-- Create the master database
USE master;
GO

-- Run the master database schema
-- Execute: aws-master-database-schema.sql
```

### Step 2: Create Tenant Database

```sql
-- For each new institution, create a new database
CREATE DATABASE psctech_tenant_[INSTITUTION_CODE];
GO

USE psctech_tenant_[INSTITUTION_CODE];
GO

-- Run the core tenant schema
-- Execute: aws-tenant-database-core.sql

-- Run the extended tenant schema (optional)
-- Execute: aws-tenant-database-extended.sql
```

### Step 3: Register Tenant in Master Database

```sql
-- Connect back to master database
USE psctech_master;
GO

-- Register the new tenant
INSERT INTO tenant_registry (
    tenant_code,
    tenant_name,
    database_name,
    server_endpoint,
    connection_string,
    subscription_plan,
    max_users,
    max_students
) VALUES (
    'INSTITUTION_CODE',
    'Institution Name',
    'psctech_tenant_INSTITUTION_CODE',
    'your-server-endpoint',
    'your-connection-string',
    'basic',
    100,
    500
);
```

## Multi-Tenant Data Isolation

### Complete Isolation Strategy

Each institution has its own database with:
- **Separate schema**: All tables prefixed with `[dbo].`
- **Independent data**: No shared data between institutions
- **Isolated users**: Users can only access their institution's data
- **Separate configurations**: Each institution can have different settings

### Security Features

- **Row-level security**: All queries filter by `institution_id`
- **User isolation**: Users can only access their assigned institution
- **Audit trails**: Complete tracking of all data changes
- **Voucher system**: Secure voucher generation and redemption

## Key Features Supported

### 1. User Management
- **Roles**: Principal, Teacher, Parent, Learner, SGB, Admin
- **Authentication**: JWT-based with password hashing
- **Profiles**: Extended user information
- **Multi-role support**: Users can have multiple roles

### 2. Student Management
- **Student records**: Complete student information
- **Grade tracking**: Academic year and grade management
- **Parent linking**: Connect students to parent accounts
- **Enrollment tracking**: Student status and enrollment dates

### 3. Teacher Management
- **Teacher profiles**: Complete teacher information
- **Subject assignments**: Link teachers to subjects
- **Class assignments**: Assign teachers to classes
- **Employment tracking**: Employment status and dates

### 4. Study Zone & AI Features
- **Study sessions**: Track learning sessions
- **Performance analytics**: Score tracking and analysis
- **AI materials**: AI-generated study content
- **Recommendations**: Personalized learning recommendations

### 5. Voucher System
- **Voucher generation**: Create vouchers for parents
- **Redemption tracking**: Monitor voucher usage
- **Audit trail**: Complete voucher history
- **Multi-learner support**: Vouchers for multiple learners

### 6. Assessment & Performance
- **Assessment creation**: Tests, exams, assignments
- **Result tracking**: Student performance data
- **Grade calculation**: Automatic grade computation
- **Performance analytics**: Trend analysis

### 7. Attendance Management
- **Daily attendance**: Track student attendance
- **Status tracking**: Present, absent, late, excused
- **Reporting**: Attendance summaries and reports
- **Class management**: Organize students into classes

### 8. Communication
- **Announcements**: School-wide announcements
- **Messaging**: Internal messaging system
- **Targeted communication**: Role-based messaging
- **Priority levels**: Urgent, high, normal, low

## Testing with Sample Data

Both schemas include sample data for testing:

### Demo Institution
- **Code**: `DEMO001`
- **Name**: Demo School
- **Type**: Primary School

### Demo Users
- **Principal**: `principal@demoschool.com` / `password123`
- **Teacher**: `teacher@demoschool.com` / `password123`
- **Parent**: `parent@demoschool.com` / `password123`
- **Learner**: `learner@demoschool.com` / `password123`

### Sample Data Includes
- Institution setup
- User accounts with profiles
- Sample subjects (Mathematics, English)
- Sample class (8A)
- Welcome announcement
- Basic voucher structure

## Database Maintenance

### Regular Tasks
1. **Backup**: Daily backups of all tenant databases
2. **Index maintenance**: Regular index rebuilding
3. **Statistics updates**: Keep query statistics current
4. **Audit log cleanup**: Archive old audit records

### Performance Optimization
- **Indexes**: Strategic indexes on frequently queried columns
- **Partitioning**: Consider partitioning large tables by date
- **Compression**: Enable data compression for large tables
- **Query optimization**: Monitor and optimize slow queries

## Migration from Existing System

### Data Migration Steps
1. **Export existing data**: Extract data from current system
2. **Transform data**: Convert to new schema format
3. **Import data**: Load into new tenant databases
4. **Verify integrity**: Check data consistency
5. **Update connections**: Point application to new databases

### Schema Updates
- **Version control**: Track schema changes
- **Migration scripts**: Create scripts for schema updates
- **Rollback plans**: Prepare rollback procedures
- **Testing**: Test all changes in staging environment

## Troubleshooting

### Common Issues
1. **Connection errors**: Check connection strings in master database
2. **Permission errors**: Verify user permissions on tenant databases
3. **Data isolation issues**: Ensure proper `institution_id` filtering
4. **Performance issues**: Check indexes and query optimization

### Support
- **Documentation**: Refer to this guide and AWS migration guide
- **Logs**: Check application and database logs
- **Monitoring**: Use database monitoring tools
- **Backup**: Always have recent backups before making changes

## Next Steps

1. **Deploy schemas**: Run the SQL scripts on your SQL Server instance
2. **Configure application**: Update connection strings in your .NET backend
3. **Test functionality**: Verify all features work with new schemas
4. **Migrate data**: Transfer existing data to new structure
5. **Go live**: Deploy to production environment

For AWS migration details, refer to the `AWS-MIGRATION-GUIDE.md` file.








