# Backend Voucher System Documentation

## Overview

The Backend Voucher System is a comprehensive, enterprise-grade implementation built with NestJS and TypeORM that provides a secure, scalable, and maintainable foundation for the PSC Tech voucher management system. It follows professional workflow patterns and ensures data integrity, security, and auditability.

## Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Voucher Module                          │
├─────────────────────────────────────────────────────────────┤
│  Controllers  │  Services  │  Entities  │  Utilities     │
├─────────────────────────────────────────────────────────────┤
│ VoucherCtrl   │ VoucherSvc │ Voucher    │ CodeGenerator  │
│               │            │ Redemption │ ExpirySvc      │
│               │            │ Audit      │ ValidationSvc  │
│               │            │            │ ExportSvc      │
│               │            │            │ NotificationSvc│
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Framework**: NestJS (Node.js)
- **ORM**: TypeORM with SQL Server/Azure SQL
- **Validation**: class-validator & class-transformer
- **Documentation**: Swagger/OpenAPI
- **Scheduling**: @nestjs/schedule (cron jobs)
- **Security**: JWT authentication, role-based access control
- **Logging**: Built-in NestJS logger with structured logging

## Core Entities

### 1. Voucher Entity

The main voucher entity that represents a voucher in the system.

**Key Features:**
- Secure code storage with SHA-256 hashing and salt
- 30-day expiry logic after redemption
- Multi-learner support (1-10 learners)
- Parent/guardian tracking
- Comprehensive status management
- Audit trail integration

**Database Fields:**
```typescript
@PrimaryGeneratedColumn('uuid') id: string;
@Column({ type: 'varchar', length: 19, unique: true }) code: string;
@Column({ type: 'binary', length: 32 }) codeHash: Buffer;
@Column({ type: 'binary', length: 16 }) codeSalt: Buffer;
@Column({ type: 'int' }) valueCents: number;
@Column({ type: 'int' }) learnerCount: number;
@Column({ type: 'varchar', length: 100 }) parentName: string;
@Column({ type: 'enum', enum: VoucherStatus }) status: VoucherStatus;
@Column({ type: 'datetime', nullable: true }) expiryDate: Date | null;
```

### 2. VoucherRedemption Entity

Tracks the redemption process and attempts for each voucher.

**Key Features:**
- Multiple redemption methods (online, mobile app, admin panel, API)
- Attempt tracking and rate limiting
- Device and location information
- Validation error tracking
- Retry mechanism

**Database Fields:**
```typescript
@PrimaryGeneratedColumn('uuid') id: string;
@Column({ type: 'uuid' }) voucherId: string;
@Column({ type: 'uuid' }) userId: string;
@Column({ type: 'enum', enum: RedemptionStatus }) status: RedemptionStatus;
@Column({ type: 'enum', enum: RedemptionMethod }) method: RedemptionMethod;
@Column({ type: 'datetime' }) redemptionDate: Date;
@Column({ type: 'int', default: 0 }) attemptCount: number;
```

### 3. VoucherAudit Entity

Comprehensive audit trail for all voucher-related activities.

**Key Features:**
- Detailed action tracking (created, updated, redeemed, expired, cancelled)
- Severity levels (info, warning, error, critical)
- Source identification (user, system, API, scheduled, admin)
- Metadata storage for context
- Review workflow for high-severity events

**Database Fields:**
```typescript
@PrimaryGeneratedColumn('uuid') id: string;
@Column({ type: 'uuid' }) voucherId: string;
@Column({ type: 'enum', enum: AuditAction }) action: AuditAction;
@Column({ type: 'enum', enum: AuditSeverity }) severity: AuditSeverity;
@Column({ type: 'enum', enum: AuditSource }) source: AuditSource;
@Column({ type: 'json', nullable: true }) metadata: any;
@Column({ type: 'boolean', default: false }) requiresReview: boolean;
```

## Services Architecture

### 1. VoucherService (Main Service)

**Responsibilities:**
- Orchestrates all voucher operations
- Manages business logic and workflows
- Coordinates between utility services
- Handles database transactions
- Ensures data consistency

**Key Methods:**
```typescript
async createVoucher(createVoucherDto: CreateVoucherDto, user: User): Promise<Voucher>
async redeemVoucher(voucherCode: string, user: User): Promise<Voucher>
async getVouchers(filters: any): Promise<{ vouchers: Voucher[]; total: number; page: number; totalPages: number }>
async getVoucherStats(): Promise<any>
async updateVoucher(id: string, updateVoucherDto: UpdateVoucherDto): Promise<Voucher>
async cancelVoucher(id: string): Promise<void>
async exportVouchers(filters: any): Promise<{ csvData: string; filename: string }>
```

### 2. Utility Services

#### VoucherCodeGenerator
- Generates unique, secure voucher codes
- Implements SHA-256 hashing with salt
- Validates code format and strength
- Supports batch code generation
- Code complexity analysis

#### VoucherExpiryService
- Manages 30-day expiry logic
- Scheduled expiry checks (hourly)
- Expiry notifications (daily)
- Expiry statistics and reporting
- Manual expiry extensions

#### VoucherValidationService
- Comprehensive validation rules
- Rate limiting (5 attempts per hour)
- Monthly voucher limits per parent
- User permission validation
- Business rule enforcement

#### VoucherExportService
- CSV export functionality
- Advanced filtering and search
- Export statistics and breakdowns
- Filename generation with filters
- Data sanitization and escaping

#### VoucherNotificationService
- Email and SMS templates
- Redemption confirmations
- Expiry warnings (7, 3, 1 days)
- Cancellation notifications
- Bulk notification processing

## API Endpoints

### RESTful API Design

**Base Path**: `/api/vouchers`

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/` | Create voucher | Principal, Admin |
| POST | `/redeem` | Redeem voucher | Parent, Learner |
| GET | `/` | Get vouchers (with filters) | Principal, Admin |
| GET | `/stats` | Get voucher statistics | Principal, Admin |
| GET | `/export` | Export vouchers to CSV | Principal, Admin |
| GET | `/recent-redemptions` | Get recent redemptions | Principal, Admin |
| GET | `/validate/:code` | Validate voucher code | Any authenticated |
| GET | `/:id` | Get voucher by ID | Principal, Admin |
| PUT | `/:id` | Update voucher | Principal, Admin |
| DELETE | `/:id` | Cancel voucher | Principal, Admin |

### Request/Response Examples

#### Create Voucher
```typescript
// Request
POST /api/vouchers
{
  "value": 25,
  "learnerCount": 2,
  "parentName": "John Johnson",
  "notes": "Parent payment for January - 2 children"
}

// Response
{
  "id": "uuid",
  "code": "ABCD-EFGH-JKLM-NPQR",
  "value": 25,
  "learnerCount": 2,
  "parentName": "John Johnson",
  "status": "active",
  "issuedDate": "2024-01-15T10:00:00Z",
  "expiryDate": null
}
```

#### Redeem Voucher
```typescript
// Request
POST /api/vouchers/redeem
{
  "code": "ABCD-EFGH-JKLM-NPQR"
}

// Response
{
  "id": "uuid",
  "code": "ABCD-EFGH-JKLM-NPQR",
  "status": "redeemed",
  "redeemedDate": "2024-01-15T14:30:00Z",
  "expiryDate": "2024-02-14T14:30:00Z",
  "message": "Voucher redeemed successfully! Access activated for 2 learner(s)."
}
```

## Security Features

### 1. Authentication & Authorization
- JWT-based authentication
- Role-based access control (Principal, Teacher, Parent, Learner, SGB)
- Institution-level isolation
- Session management

### 2. Data Security
- Voucher codes hashed with SHA-256 + salt
- No plain-text code storage
- Input validation and sanitization
- SQL injection prevention via TypeORM

### 3. Rate Limiting
- Maximum 5 redemption attempts per hour per user
- Maximum 10 vouchers per parent per month
- Configurable limits and thresholds

### 4. Audit Trail
- Complete audit log of all actions
- User action tracking
- System action logging
- Review workflow for critical events

## Business Logic

### 1. Voucher Lifecycle

```
[Generated] → [Active] → [Redeemed] → [Expired/Cancelled]
     ↓           ↓          ↓              ↓
  Principal   Available   Parent      System/Admin
  Creates     for Use     Redeems     Manages
```

### 2. Expiry Logic
- **30-day expiry**: Starts from redemption date, not generation date
- **Automatic expiry**: System marks vouchers as expired
- **Manual extension**: Admins can extend expiry dates
- **Warning notifications**: Sent at 7, 3, and 1 days before expiry

### 3. Multi-Learner Support
- **Learner count**: 1-10 learners per voucher
- **Access activation**: All learners get dashboard access
- **Parent relationship**: Tracks parent/guardian name
- **Institution isolation**: Each institution manages its own vouchers

### 4. Validation Rules
- **Code format**: XXXX-XXXX-XXXX-XXXX (excluding I, O, 1, 0)
- **Value denominations**: R5, R10, R15, R20, R25, R30, R35, R40, R45
- **User permissions**: Only parents/learners can redeem
- **Institution boundaries**: Users can only redeem institution vouchers

## Performance & Scalability

### 1. Database Optimization
- **Indexes**: Strategic indexing on frequently queried fields
- **Query optimization**: Efficient TypeORM query builders
- **Connection pooling**: Database connection management
- **Caching**: Redis integration ready

### 2. Scheduled Jobs
- **Expiry checks**: Hourly automated expiry processing
- **Notifications**: Daily expiry warning distribution
- **Cleanup**: Automated cleanup of expired records
- **Statistics**: Periodic aggregation of voucher data

### 3. Export & Reporting
- **CSV generation**: Efficient data export with filters
- **Batch processing**: Large dataset handling
- **Memory management**: Streaming for large exports
- **Async processing**: Non-blocking export operations

## Error Handling & Logging

### 1. Structured Logging
```typescript
this.logger.log(`Voucher ${voucherId} redeemed successfully by user ${userId}`);
this.logger.warn(`Rate limit exceeded for user ${userId}`);
this.logger.error(`Database connection failed: ${error.message}`, error.stack);
```

### 2. Error Categories
- **Validation errors**: User input validation failures
- **Business rule violations**: Policy enforcement failures
- **System errors**: Technical infrastructure issues
- **Security violations**: Authentication/authorization failures

### 3. Error Responses
```typescript
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    "Learner count must be between 1 and 10",
    "Invalid voucher code format"
  ]
}
```

## Testing Strategy

### 1. Unit Tests
- Service method testing
- Entity validation testing
- Utility function testing
- Mock repository testing

### 2. Integration Tests
- API endpoint testing
- Database integration testing
- Service interaction testing
- Authentication flow testing

### 3. E2E Tests
- Complete voucher lifecycle testing
- User workflow testing
- Error scenario testing
- Performance testing

## Deployment & Configuration

### 1. Environment Variables
```bash
# Database
DATABASE_HOST=localhost
DATABASE_PORT=1433
DATABASE_NAME=psc_tech
DATABASE_USERNAME=sa
DATABASE_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# Voucher Settings
VOUCHER_MAX_ATTEMPTS_PER_HOUR=5
VOUCHER_MAX_PER_PARENT_PER_MONTH=10
VOUCHER_EXPIRY_DAYS=30
```

### 2. Database Migration
```bash
# Generate migration
npm run typeorm:generate-migration -- -n CreateVoucherTables

# Run migration
npm run typeorm:run-migration
```

### 3. Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

## Monitoring & Observability

### 1. Health Checks
- Database connectivity
- Service availability
- Scheduled job status
- Memory and CPU usage

### 2. Metrics
- Voucher creation rate
- Redemption success rate
- Expiry processing time
- API response times

### 3. Alerts
- High error rates
- Database connection failures
- Scheduled job failures
- Performance degradation

## Future Enhancements

### 1. Advanced Features
- **QR Code generation**: For voucher codes
- **Bulk operations**: Mass voucher generation/management
- **Advanced analytics**: Business intelligence reporting
- **Mobile app integration**: Native mobile support

### 2. Integration Points
- **Payment gateways**: Stripe, PayPal integration
- **SMS services**: Twilio, AWS SNS integration
- **Email services**: SendGrid, AWS SES integration
- **Push notifications**: Firebase, OneSignal integration

### 3. Scalability Improvements
- **Microservices**: Break into smaller, focused services
- **Event-driven architecture**: Kafka, RabbitMQ integration
- **Caching layer**: Redis, Memcached integration
- **Load balancing**: Horizontal scaling support

## Troubleshooting

### 1. Common Issues

#### Voucher Code Generation Fails
```bash
# Check database connectivity
npm run typeorm:query "SELECT 1"

# Verify code generator service
npm run test voucher-code-generator
```

#### Expiry Notifications Not Sending
```bash
# Check scheduled job status
npm run typeorm:query "SELECT * FROM voucher_audits WHERE action = 'system_expiry'"

# Verify notification service
npm run test voucher-notification
```

#### Export Performance Issues
```bash
# Check database indexes
npm run typeorm:query "EXEC sp_helpindex 'vouchers'"

# Monitor query performance
npm run typeorm:query "SET STATISTICS IO ON"
```

### 2. Debug Mode
```typescript
// Enable debug logging
const app = await NestFactory.create(AppModule, {
  logger: ['debug', 'log', 'warn', 'error']
});
```

### 3. Performance Profiling
```typescript
// Add performance monitoring
import { PerformanceInterceptor } from './interceptors/performance.interceptor';
app.useGlobalInterceptors(new PerformanceInterceptor());
```

## Conclusion

The Backend Voucher System provides a robust, secure, and scalable foundation for voucher management in the PSC Tech platform. It follows enterprise-grade patterns and ensures professional workflow implementation while maintaining high performance and reliability.

The system is designed to handle the complex business requirements of multi-tenant voucher management, including secure code generation, comprehensive validation, automated expiry management, and detailed audit trails. It provides a solid foundation for future enhancements and integrations.


