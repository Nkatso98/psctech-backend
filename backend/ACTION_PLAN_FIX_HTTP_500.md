# 🚨 ACTION PLAN: Fix HTTP 500 Error - PSC Tech Backend

## 📋 **Current Situation**
- ❌ **HTTP 500 error** when registering schools
- ❌ **Database schema mismatch** between C# backend and Azure SQL
- ❌ **Missing tables and columns** that the backend expects

## 🎯 **Root Cause**
Your database has:
- `institution_details` table (backend expects `institutions`)
- `users` table missing columns like `password_hash`, `created_at`, etc.
- Missing `students` and `teachers` tables
- `vouchers` table with different structure

## ✅ **Solution: 3-Step Fix**

### **STEP 1: Fix Database Schema** 🔧
**File to run**: `backend/fix-database-schema.sql`

**What it does**:
- Creates missing `institutions` table
- Creates missing `students` and `teachers` tables  
- Adds missing columns to `users` table
- Fixes `vouchers` table structure
- Adds proper foreign keys and indexes

**How to run**:
1. **Fix firewall first** (if you haven't already):
   - Click "Allowlist IP 41.121.61.174 on server psctech-rg" in Azure portal
   - Wait 5 minutes for it to take effect

2. **Run the schema fix script**:
   - Connect to your `psctech_main` database
   - Run: `backend/fix-database-schema.sql`
   - Verify all tables and columns are created

### **STEP 2: Deploy Fixed Backend** 🚀
**File to run**: `backend/deploy-fixed-backend.ps1`

**What it does**:
- Rebuilds backend with proper column mappings
- Deploys to Azure App Service
- Tests backend health

**How to run**:
```powershell
cd backend
.\deploy-fixed-backend.ps1
```

### **STEP 3: Test the Fix** 🧪
**Test the registration endpoint**:
```bash
curl -X POST "https://psctech-bcdadbajcrgwa2h5.southafricanorth-01.azurewebsites.net/api/institution/register" \
  -H "Content-Type: application/json" \
  -d '{
    "SchoolName": "Test School",
    "PrincipalName": "Test Principal", 
    "Email": "test@test.com",
    "Phone": "123456789",
    "Address": "Test Address",
    "SchoolType": "secondary",
    "Username": "test@test.com",
    "Password": "testpass123"
  }'
```

## 📁 **Files You Need**

1. **`backend/fix-database-schema.sql`** - Fixes database structure
2. **`backend/deploy-fixed-backend.ps1`** - Deploys fixed backend
3. **`backend/Data/PscTechDbContext.cs`** - Already updated with column mappings

## ⚠️ **Important Notes**

- **Run schema fix FIRST** before deploying backend
- **Wait 5 minutes** after firewall changes
- **Test backend health** before testing registration
- **Backup your database** before running schema changes

## 🔍 **Verification Steps**

After each step, verify:

**Step 1 (Database)**:
- ✅ `institutions` table exists with all columns
- ✅ `users` table has `password_hash`, `created_at`, etc.
- ✅ `students` and `teachers` tables exist
- ✅ All foreign keys are properly set

**Step 2 (Backend)**:
- ✅ Backend deploys successfully
- ✅ Health endpoint returns 200 OK
- ✅ No build errors

**Step 3 (Testing)**:
- ✅ Registration endpoint returns success
- ✅ No more HTTP 500 errors
- ✅ School registration works

## 🚨 **If Something Goes Wrong**

1. **Check Azure App Service logs** for backend errors
2. **Verify database connection** and firewall rules
3. **Check table structure** matches expected schema
4. **Rollback database changes** if needed

## 📞 **Expected Timeline**

- **Step 1**: 10-15 minutes (database schema fix)
- **Step 2**: 5-10 minutes (backend deployment)
- **Step 3**: 2-3 minutes (testing)
- **Total**: ~20-30 minutes

## 🎉 **Success Indicators**

You'll know it's fixed when:
- ✅ No more HTTP 500 errors
- ✅ School registration completes successfully
- ✅ Backend logs show successful database operations
- ✅ All Entity Framework queries work without column errors

---

**Ready to fix this? Start with Step 1!** 🚀
