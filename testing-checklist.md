# 🧪 **Comprehensive Testing Checklist**

## 🎯 **After Running Database Fix Script**

### **Database Validation Tests**
- [ ] StudySessions table exists with correct StartTime column (NVARCHAR(10))
- [ ] Institutions table has proper CHECK constraints
- [ ] Vouchers table created successfully
- [ ] Users table created with proper role constraints
- [ ] All stored procedures created successfully
- [ ] All views created successfully
- [ ] All indexes created for performance

## 🔧 **Backend API Testing**

### **1. Study Sessions API**
```bash
# Test 1: Create Study Session
curl -X POST "https://psctech-bcdadbajcrgwa2h5.azurewebsites.net/api/Study/session" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "institutionId": "test-inst-456",
    "subject": "Mathematics",
    "topic": "Algebra",
    "dayOfWeek": 1,
    "startTime": "14:30",
    "durationMinutes": 60,
    "reminderMinutesBefore": 15
  }'

# Expected: 200 OK with session data
```

```bash
# Test 2: Get User Sessions
curl -X GET "https://psctech-bcdadbajcrgwa2h5.azurewebsites.net/api/Study/session/user/test-user-123"

# Expected: 200 OK with sessions list
```

```bash
# Test 3: Invalid Data (should fail)
curl -X POST "https://psctech-bcdadbajcrgwa2h5.azurewebsites.net/api/Study/session" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "",
    "subject": "",
    "dayOfWeek": 7,
    "startTime": "25:00",
    "durationMinutes": 0
  }'

# Expected: 400 Bad Request with validation errors
```

### **2. Voucher API**
```bash
# Test 1: Create Voucher
curl -X POST "https://psctech-bcdadbajcrgwa2h5.azurewebsites.net/api/Voucher/create" \
  -H "Content-Type: application/json" \
  -d '{
    "denomination": 1000.00,
    "parentGuardianName": "John Doe",
    "learnerCount": 2,
    "institutionId": "SCHOOL001",
    "issuedByUserId": "user-123"
  }'

# Expected: 200 OK with voucher data
```

```bash
# Test 2: Redeem Voucher
curl -X POST "https://psctech-bcdadbajcrgwa2h5.azurewebsites.net/api/Voucher/redeem" \
  -H "Content-Type: application/json" \
  -d '{
    "voucherCode": "VOUCHER-xxx-xxx",
    "userId": "user-456",
    "parentGuardianName": "Jane Smith",
    "learnerCount": 1
  }'

# Expected: 200 OK with redemption data
```

```bash
# Test 3: Get Institution Vouchers
curl -X GET "https://psctech-bcdadbajcrgwa2h5.azurewebsites.net/api/Voucher/institution/SCHOOL001"

# Expected: 200 OK with vouchers list
```

### **3. Institution API**
```bash
# Test 1: Register Institution
curl -X POST "https://psctech-bcdadbajcrgwa2h5.azurewebsites.net/api/Institution/register" \
  -H "Content-Type: application/json" \
  -d '{
    "schoolName": "Test Academy",
    "principalName": "Dr. Test Principal",
    "email": "test@academy.edu.ng",
    "phone": "+2348012345678",
    "address": "123 Test Street",
    "schoolType": "Secondary School",
    "username": "testprincipal",
    "password": "password123"
  }'

# Expected: 200 OK with institution data
```

```bash
# Test 2: Invalid School Type (should fail)
curl -X POST "https://psctech-bcdadbajcrgwa2h5.azurewebsites.net/api/Institution/register" \
  -H "Content-Type: application/json" \
  -d '{
    "schoolName": "Test Academy",
    "principalName": "Dr. Test Principal",
    "email": "test2@academy.edu.ng",
    "schoolType": "Invalid Type",
    "username": "testprincipal2",
    "password": "password123"
  }'

# Expected: 400 Bad Request with validation error
```

## 🎨 **Frontend Testing**

### **1. Study Session Form**
- [ ] Form loads without errors
- [ ] Required field validation works
- [ ] Time format validation works (HH:MM)
- [ ] Day of week dropdown works (0-6)
- [ ] Duration validation works (1-1440 minutes)
- [ ] Form submission works
- [ ] Success/error messages display correctly

### **2. Voucher Form**
- [ ] Form loads without errors
- [ ] Denomination validation works (> 0)
- [ ] Parent/Guardian name validation works
- [ ] Learner count validation works (1-100)
- [ ] Institution selection works
- [ ] Form submission works
- [ ] Success/error messages display correctly

### **3. Institution Registration Form**
- [ ] Form loads without errors
- [ ] School name validation works
- [ ] Email format validation works
- [ ] School type dropdown works
- [ ] Password validation works (min 8 chars)
- [ ] Form submission works
- [ ] Success/error messages display correctly

## 🔍 **Error Testing**

### **Test Invalid Scenarios**
- [ ] Empty required fields → Should show validation errors
- [ ] Invalid email format → Should show validation error
- [ ] Invalid time format → Should show validation error
- [ ] Invalid school type → Should show validation error
- [ ] Duplicate email → Should show "already exists" error
- [ ] Invalid voucher code → Should show "not found" error

### **Test Edge Cases**
- [ ] Very long text inputs → Should respect max length
- [ ] Negative numbers → Should show validation error
- [ ] Zero values where not allowed → Should show validation error
- [ ] Special characters in inputs → Should handle properly

## 📊 **Performance Testing**

### **Database Performance**
- [ ] Study session creation < 500ms
- [ ] Voucher creation < 500ms
- [ ] Institution registration < 1000ms
- [ ] Session retrieval < 200ms
- [ ] Voucher listing < 300ms

### **API Response Times**
- [ ] All endpoints respond < 2 seconds
- [ ] No timeout errors
- [ ] Consistent response times

## 🚨 **Monitoring Checklist**

### **Check for Remaining Errors**
- [ ] No 500 Internal Server Errors
- [ ] No 400 Bad Request errors (except intentional validation)
- [ ] No database connection errors
- [ ] No constraint violation errors
- [ ] No data truncation errors

### **Log Analysis**
- [ ] Check application logs for errors
- [ ] Check database logs for issues
- [ ] Monitor API response codes
- [ ] Check for any new error patterns

## 🎯 **Success Criteria**

### **All Tests Must Pass**
- [ ] ✅ Database schema validation successful
- [ ] ✅ All API endpoints return correct responses
- [ ] ✅ Frontend forms validate correctly
- [ ] ✅ No 500 or 400 errors in normal operation
- [ ] ✅ Performance meets requirements
- [ ] ✅ Error handling works correctly

## 🔧 **If Tests Fail**

### **Database Issues**
1. Check connection string
2. Verify firewall settings
3. Check database permissions
4. Review error logs

### **API Issues**
1. Check controller code
2. Verify DTO validation
3. Check stored procedure calls
4. Review exception handling

### **Frontend Issues**
1. Check Zod validation schemas
2. Verify form field names
3. Check API endpoint URLs
4. Review error handling

## 📝 **Test Results Log**

| Test Category | Status | Notes |
|---------------|--------|-------|
| Database Fix | ⏳ Pending | Run comprehensive fix script |
| Study API | ⏳ Pending | Update controller first |
| Voucher API | ⏳ Pending | Create controller first |
| Institution API | ⏳ Pending | Update controller first |
| Frontend Forms | ⏳ Pending | Install Zod and update forms |
| Error Handling | ⏳ Pending | Test after all updates |

**Run this checklist after each step to ensure everything works correctly!**









