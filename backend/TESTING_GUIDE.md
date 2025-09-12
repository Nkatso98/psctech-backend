# 🧪 PSC Tech Voucher System Testing Guide

## Overview
This guide covers the comprehensive testing of the voucher system integration, ensuring all components work seamlessly together.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ installed
- Azure SQL Database access
- Test database `psctech_test` created

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Run Tests
```bash
# Run all tests
npm test

# Run only voucher system tests
npm run test:voucher

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch
```

## 🗄️ Database Setup for Testing

### Create Test Database
1. Connect to Azure SQL: `psctech-rg.database.windows.net`
2. Create database: `psctech_test`
3. Run setup scripts:
   ```sql
   -- Run in order:
   azure-sql-deployment/01-create-master-database.sql
   azure-sql-deployment/02-create-institution-database.sql
   ```

### Test Database Configuration
- **Database**: `psctech_test`
- **Schema**: Auto-created by TypeORM
- **Data**: Cleaned between test runs
- **Connection**: Uses test credentials

## 🧪 Test Categories

### 1. Voucher Generation Flow
- ✅ Valid voucher creation
- ✅ Denomination validation (R5-R45)
- ✅ Learner count validation (1-10)
- ✅ Required field validation
- ✅ Security (code hashing, salt generation)

### 2. Voucher Redemption Flow
- ✅ Successful redemption
- ✅ 30-day expiry calculation
- ✅ Duplicate redemption prevention
- ✅ Expired voucher handling
- ✅ Multi-learner activation

### 3. Voucher Management Flow
- ✅ Listing with pagination
- ✅ Status filtering
- ✅ Search functionality
- ✅ Statistics calculation
- ✅ Bulk operations

### 4. Voucher Audit Flow
- ✅ Creation audit records
- ✅ Redemption audit records
- ✅ Status change tracking
- ✅ User action logging
- ✅ Metadata preservation

### 5. Voucher Export Flow
- ✅ CSV export functionality
- ✅ Data filtering
- ✅ Format validation
- ✅ Performance testing

### 6. Error Handling & Validation
- ✅ Invalid input handling
- ✅ Database error handling
- ✅ Business rule validation
- ✅ Graceful degradation

### 7. Performance & Scalability
- ✅ Bulk voucher generation
- ✅ Concurrent operations
- ✅ Database performance
- ✅ Memory usage optimization

## 🔧 Test Configuration

### Jest Configuration
```typescript
// test/jest.config.ts
{
  testTimeout: 30000,        // 30 seconds for DB operations
  maxWorkers: 1,             // Sequential execution
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  testEnvironment: 'node'
}
```

### Environment Variables
```bash
NODE_ENV=test
TEST_DATABASE=psctech_test
```

### Database Connection
```typescript
// test/setup.ts
export const createTestDatabase = () => ({
  type: 'mssql',
  host: 'psctech-rg.database.windows.net',
  database: 'psctech_test',
  synchronize: true,
  dropSchema: true, // Clean between runs
  logging: false
});
```

## 📊 Test Coverage

### Current Coverage Areas
- **Voucher Service**: 95%+
- **Voucher Controller**: 90%+
- **Voucher Entities**: 100%
- **Utility Services**: 85%+
- **Integration Flows**: 90%+

### Coverage Report
```bash
npm run test:cov
# Generates report in coverage/ directory
```

## 🚨 Common Test Issues

### 1. Database Connection
**Problem**: Connection timeout or authentication failure
**Solution**: 
- Verify Azure SQL credentials
- Check firewall rules
- Ensure test database exists

### 2. Test Data Cleanup
**Problem**: Tests interfering with each other
**Solution**:
- Use `beforeEach` cleanup
- Enable `dropSchema: true`
- Isolate test data

### 3. Async Operations
**Problem**: Tests completing before async operations
**Solution**:
- Use proper `async/await`
- Set appropriate timeouts
- Handle promises correctly

## 🔍 Debugging Tests

### Debug Mode
```bash
npm run test:debug
# Opens Node.js debugger
```

### Verbose Output
```bash
npm test -- --verbose
```

### Single Test File
```bash
npm test -- voucher-system.integration.test.ts
```

### Specific Test
```bash
npm test -- --testNamePattern="should generate a voucher"
```

## 📈 Performance Testing

### Load Testing
```typescript
// Test bulk operations
it('should handle 1000 vouchers efficiently', async () => {
  const startTime = Date.now();
  // Generate 1000 vouchers
  const duration = Date.now() - startTime;
  expect(duration).toBeLessThan(10000); // 10 seconds
});
```

### Memory Testing
```typescript
// Monitor memory usage
it('should not leak memory during bulk operations', async () => {
  const initialMemory = process.memoryUsage().heapUsed;
  // Perform operations
  const finalMemory = process.memoryUsage().heapUsed;
  const memoryIncrease = finalMemory - initialMemory;
  expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB
});
```

## 🧹 Test Data Management

### Test Data Creation
```typescript
beforeEach(async () => {
  // Create test vouchers
  testVouchers = await Promise.all([
    voucherService.generateVoucher(testData1),
    voucherService.generateVoucher(testData2)
  ]);
});
```

### Test Data Cleanup
```typescript
afterEach(async () => {
  // Clean up test data
  await voucherService.clearTestData();
});
```

### Isolated Test Data
```typescript
// Use unique identifiers
const testId = `test-${Date.now()}-${Math.random()}`;
```

## 🔐 Security Testing

### Input Validation
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ Input sanitization
- ✅ Business rule validation

### Authentication Testing
- ✅ JWT token validation
- ✅ Role-based access control
- ✅ Session management
- ✅ Permission checking

## 📱 API Testing

### Endpoint Testing
```typescript
// Test API endpoints
describe('Voucher API Endpoints', () => {
  it('POST /vouchers should create voucher', async () => {
    const response = await request(app.getHttpServer())
      .post('/vouchers')
      .send(voucherData)
      .expect(201);
    
    expect(response.body).toHaveProperty('id');
  });
});
```

### Response Validation
- ✅ Status codes
- ✅ Response format
- ✅ Data integrity
- ✅ Error messages

## 🚀 Continuous Integration

### GitHub Actions
```yaml
# .github/workflows/test.yml
- name: Run Tests
  run: |
    cd backend
    npm install
    npm run test:cov
```

### Pre-commit Hooks
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test"
    }
  }
}
```

## 📝 Test Documentation

### Test Naming Convention
```typescript
describe('Voucher Generation', () => {
  it('should create voucher with valid data', () => {});
  it('should reject invalid denominations', () => {});
  it('should handle edge cases', () => {});
});
```

### Test Structure
```typescript
describe('Feature Name', () => {
  let testData: TestType;
  
  beforeEach(() => {
    // Setup
  });
  
  afterEach(() => {
    // Cleanup
  });
  
  it('should perform expected behavior', async () => {
    // Arrange
    // Act
    // Assert
  });
});
```

## 🎯 Best Practices

### 1. Test Isolation
- Each test should be independent
- Clean up test data
- Use unique identifiers

### 2. Descriptive Names
- Test names should explain the scenario
- Use "should" format
- Include expected outcome

### 3. Arrange-Act-Assert
- Setup test data
- Execute test action
- Verify results

### 4. Error Testing
- Test both success and failure cases
- Verify error messages
- Test edge cases

### 5. Performance Awareness
- Monitor test execution time
- Test with realistic data volumes
- Identify bottlenecks

## 🔄 Running Tests in Different Environments

### Development
```bash
npm run test:watch
```

### CI/CD Pipeline
```bash
npm run test:cov
```

### Production Validation
```bash
NODE_ENV=production npm test
```

## 📊 Test Metrics

### Key Metrics to Track
- **Test Execution Time**: < 30 seconds total
- **Coverage Percentage**: > 90%
- **Test Reliability**: > 99% pass rate
- **Performance**: < 5 seconds for bulk operations

### Monitoring
```bash
# Performance metrics
npm run test -- --verbose

# Coverage report
npm run test:cov

# Test results summary
npm test -- --silent
```

## 🆘 Getting Help

### Common Resources
- Jest Documentation: https://jestjs.io/
- NestJS Testing: https://docs.nestjs.com/fundamentals/testing
- TypeORM Testing: https://typeorm.io/testing

### Troubleshooting
1. Check database connectivity
2. Verify test environment setup
3. Review test data isolation
4. Check async operation handling

---

**Happy Testing! 🎉**

The voucher system is designed to be robust, secure, and performant. These tests ensure all components work together seamlessly in your Azure SQL environment.


