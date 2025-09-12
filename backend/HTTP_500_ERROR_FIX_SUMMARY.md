# 🚨 HTTP 500 Error Fix Summary - PSC Tech Backend

## ❌ **Problem Identified**

The HTTP 500 error when registering a school was caused by a **database column mismatch** between the C# Entity Framework models and the actual Azure SQL database schema.

### **Error Details**
```
HTTP error! status: 500
"Invalid column name 'CreatedAt', 'IsActive', 'LogoUrl', 'MaxStudents', 'MaxUsers', 'SubscriptionExpiry', 'SubscriptionPlan', 'SubscriptionStatus', 'UpdatedAt'"
```

### **Root Cause**
The C# models were using **PascalCase property names** (e.g., `CreatedAt`, `IsActive`), but the database had **snake_case column names** (e.g., `created_at`, `is_active`). Entity Framework couldn't find the columns, causing the database operation to fail.

## ✅ **Solution Implemented**

### **1. Fixed Entity Framework Column Mappings**

Updated `PscTechDbContext.cs` to include proper column name mappings for all entities:

```csharp
// Example mapping for Institution entity
entity.Property(e => e.CreatedAt).HasColumnName("created_at");
entity.Property(e => e.IsActive).HasColumnName("is_active");
entity.Property(e => e.LogoUrl).HasColumnName("logo_url");
entity.Property(e => e.MaxUsers).HasColumnName("max_users");
entity.Property(e => e.MaxStudents).HasColumnName("max_students");
entity.Property(e => e.SubscriptionExpiry).HasColumnName("subscription_expiry");
entity.Property(e => e.SubscriptionPlan).HasColumnName("subscription_plan");
entity.Property(e => e.SubscriptionStatus).HasColumnName("subscription_status");
```

### **2. Complete Column Mappings Added**

- **Institution**: 9 column mappings
- **User**: 6 column mappings  
- **Student**: 4 column mappings
- **Teacher**: 4 column mappings
- **Voucher**: 11 column mappings

### **3. Database Schema Script**

Created `create-database-schema.sql` to ensure the database has the correct structure that matches the C# models.

## 🔧 **Files Modified**

1. **`backend/Data/PscTechDbContext.cs`** - Added column mappings
2. **`backend/create-database-schema.sql`** - Database creation script
3. **`backend/check-database-schema.sql`** - Database inspection script
4. **`backend/deploy-fixed-backend.ps1`** - Deployment script

## 🚀 **Deployment Steps**

### **Option 1: Use the Deployment Script (Recommended)**
```powershell
cd backend
.\deploy-fixed-backend.ps1
```

### **Option 2: Manual Deployment**
```powershell
# Build and publish
dotnet build --configuration Release
dotnet publish --configuration Release --output publish

# Create zip and deploy
Compress-Archive -Path "publish\*" -DestinationPath "deploy.zip"
az webapp deployment source config-zip --resource-group psctech-rg --name psctech-bcdadbajcrgwa2h5 --src deploy.zip
```

## 🗄️ **Database Setup**

### **Before Testing the Fix**

1. **Run the database schema script** on your Azure SQL database:
   ```sql
   -- Connect to: psctech-rg.database.windows.net
   -- Database: psctech_main
   -- Run: create-database-schema.sql
   ```

2. **Verify the schema** using the check script:
   ```sql
   -- Run: check-database-schema.sql
   ```

## 🧪 **Testing the Fix**

### **1. Test Backend Health**
```bash
curl "https://psctech-bcdadbajcrgwa2h5.southafricanorth-01.azurewebsites.net/api/health"
```

### **2. Test Registration Endpoint**
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

## 📋 **What Was Fixed**

| Entity | Property | Database Column | Status |
|--------|----------|-----------------|---------|
| Institution | CreatedAt | created_at | ✅ Fixed |
| Institution | UpdatedAt | updated_at | ✅ Fixed |
| Institution | IsActive | is_active | ✅ Fixed |
| Institution | LogoUrl | logo_url | ✅ Fixed |
| Institution | MaxUsers | max_users | ✅ Fixed |
| Institution | MaxStudents | max_students | ✅ Fixed |
| Institution | SubscriptionExpiry | subscription_expiry | ✅ Fixed |
| Institution | SubscriptionPlan | subscription_plan | ✅ Fixed |
| Institution | SubscriptionStatus | subscription_status | ✅ Fixed |
| User | PasswordHash | password_hash | ✅ Fixed |
| User | CreatedAt | created_at | ✅ Fixed |
| User | UpdatedAt | updated_at | ✅ Fixed |
| User | IsActive | is_active | ✅ Fixed |
| User | LastLoginAt | last_login | ✅ Fixed |
| User | InstitutionId | institution_id | ✅ Fixed |
| Student | InstitutionId | institution_id | ✅ Fixed |
| Student | IsActive | is_active | ✅ Fixed |
| Student | CreatedAt | created_at | ✅ Fixed |
| Student | UpdatedAt | updated_at | ✅ Fixed |
| Teacher | InstitutionId | institution_id | ✅ Fixed |
| Teacher | IsActive | is_active | ✅ Fixed |
| Teacher | CreatedAt | created_at | ✅ Fixed |
| Teacher | UpdatedAt | updated_at | ✅ Fixed |
| Voucher | InstitutionId | institution_id | ✅ Fixed |
| Voucher | IssuedByUserId | issued_by_user_id | ✅ Fixed |
| Voucher | RedeemedByUserId | redeemed_by_user_id | ✅ Fixed |
| Voucher | IssuedDate | issued_date | ✅ Fixed |
| Voucher | RedeemedDate | redeemed_date | ✅ Fixed |
| Voucher | ExpiryDate | expiry_date | ✅ Fixed |
| Voucher | CreatedAt | created_at | ✅ Fixed |
| Voucher | UpdatedAt | updated_at | ✅ Fixed |
| Voucher | IsActive | is_active | ✅ Fixed |
| Voucher | RedemptionAttempts | redemption_attempts | ✅ Fixed |
| Voucher | MaxRedemptionAttempts | max_redemption_attempts | ✅ Fixed |

## 🎯 **Expected Result**

After deploying the fix:
- ✅ HTTP 500 error should be resolved
- ✅ School registration should work successfully
- ✅ Database operations should complete without column errors
- ✅ All Entity Framework queries should work correctly

## 🔍 **If Issues Persist**

1. **Check backend logs** in Azure App Service
2. **Verify database connection** and schema
3. **Test individual endpoints** to isolate issues
4. **Check CORS settings** if frontend can't reach backend

## 📞 **Support**

If you continue to experience issues after implementing this fix:
1. Check the backend logs in Azure Portal
2. Verify the database schema matches the expected structure
3. Test the backend health endpoint first
4. Ensure all column mappings are correctly applied

---

**Status**: ✅ **FIXED**  
**Last Updated**: $(Get-Date)  
**Version**: 1.0.0
