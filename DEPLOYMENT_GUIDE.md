# PSC Tech Deployment Guide

## 🚀 Complete Deployment Process

This guide will help you deploy both the backend (Azure) and frontend (Firebase) with the enhanced authentication system.

## 📋 Prerequisites

### Backend Prerequisites
- Azure CLI installed and logged in
- .NET 8.0 SDK
- Access to Azure subscription

### Frontend Prerequisites
- Node.js (v18 or higher)
- pnpm package manager
- Firebase CLI
- Firebase project access

## 🔧 Step 1: Fix Database Schema

The 500 error is caused by missing password fields in the User table. Run this SQL script on your Azure SQL Database:

```sql
-- Run this on Azure SQL Database: psctech_main
USE [psctech_main];

-- Add PasswordHash column if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'PasswordHash')
BEGIN
    ALTER TABLE [dbo].[Users] ADD [PasswordHash] NVARCHAR(255) NOT NULL DEFAULT ''
    PRINT 'Added PasswordHash column to Users table'
END

-- Add PasswordResetToken column if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'PasswordResetToken')
BEGIN
    ALTER TABLE [dbo].[Users] ADD [PasswordResetToken] NVARCHAR(255) NULL
    PRINT 'Added PasswordResetToken column to Users table'
END

-- Add PasswordResetTokenExpiry column if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'PasswordResetTokenExpiry')
BEGIN
    ALTER TABLE [dbo].[Users] ADD [PasswordResetTokenExpiry] DATETIME2 NULL
    PRINT 'Added PasswordResetTokenExpiry column to Users table'
END

-- Update existing users with a default password hash
UPDATE [dbo].[Users] 
SET [PasswordHash] = 'default_hash_for_existing_users'
WHERE [PasswordHash] = '' OR [PasswordHash] IS NULL

PRINT 'Database schema fix completed successfully!'
```

## 🎯 Step 2: Deploy Backend to Azure

### Option A: Using PowerShell Script (Recommended)

1. **Navigate to backend directory:**
   ```powershell
   cd backend
   ```

2. **Run the deployment script:**
   ```powershell
   .\deploy-to-azure-fixed.ps1
   ```

### Option B: Manual Deployment

1. **Build the project:**
   ```bash
   dotnet restore
   dotnet build --configuration Release
   dotnet publish --configuration Release --output publish-fixed-auth
   ```

2. **Deploy to Azure:**
   ```bash
   az webapp deployment source config-zip --resource-group psctech --name psctech-bcdadbajcrgwa2h5 --src deploy-fixed-auth.zip
   ```

### Backend URLs After Deployment
- **API Base URL:** `https://psctech-bcdadbajcrgwa2h5.azurewebsites.net`
- **Swagger Documentation:** `https://psctech-bcdadbajcrgwa2h5.azurewebsites.net/swagger`
- **Health Check:** `https://psctech-bcdadbajcrgwa2h5.azurewebsites.net/api/health`

## 🌐 Step 3: Deploy Frontend to Firebase

### Option A: Using PowerShell Script (Recommended)

1. **Navigate to root directory:**
   ```powershell
   cd ..
   ```

2. **Run the deployment script:**
   ```powershell
   .\deploy-frontend-to-firebase.ps1
   ```

### Option B: Manual Deployment

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Build the project:**
   ```bash
   pnpm run build
   ```

3. **Deploy to Firebase:**
   ```bash
   firebase login
   firebase use psctech-2f998
   firebase deploy --only hosting
   ```

### Frontend URLs After Deployment
- **Production URL:** `https://psctech-2f998.web.app`
- **Alternative URL:** `https://psctech-2f998.firebaseapp.com`

## 🧪 Step 4: Test the Deployment

### Test Backend Authentication

1. **Test Registration:**
   ```bash
   curl -X POST "https://psctech-bcdadbajcrgwa2h5.azurewebsites.net/api/auth/register" \
   -H "Content-Type: application/json" \
   -d '{
     "username": "testuser",
     "password": "TestPassword123!",
     "email": "test@example.com",
     "firstName": "Test",
     "lastName": "User",
     "role": "teacher",
     "institutionId": "12345678-1234-1234-1234-123456789012"
   }'
   ```

2. **Test Login:**
   ```bash
   curl -X POST "https://psctech-bcdadbajcrgwa2h5.azurewebsites.net/api/auth/login" \
   -H "Content-Type: application/json" \
   -d '{
     "username": "test@example.com",
     "password": "TestPassword123!"
   }'
   ```

3. **Test Protected Endpoint:**
   ```bash
   curl -X GET "https://psctech-bcdadbajcrgwa2h5.azurewebsites.net/api/auth/profile" \
   -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

### Test Frontend

1. **Open the deployed frontend URL**
2. **Test the authentication flow**
3. **Verify API integration**

## 🔐 Authentication System Features

### Available Endpoints

#### Public Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset with token

#### Protected Endpoints
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout

#### Role-Based Endpoints
- `GET /api/auth/test-admin` - Admin access test (principal, teacher)
- `GET /api/auth/test-teacher` - Teacher access test (teacher only)

### User Roles
- **principal**: School principal with full access
- **teacher**: Teacher with limited administrative access
- **parent**: Parent with student-related access
- **learner**: Student with basic access
- **sgb**: School Governing Body member

## 🛠️ Troubleshooting

### Common Issues

#### 1. Database Connection Issues
- Verify connection string in `appsettings.json`
- Check Azure SQL Database firewall rules
- Ensure database exists and is accessible

#### 2. Authentication Errors
- Verify JWT configuration in `appsettings.json`
- Check if password fields were added to User table
- Ensure proper CORS configuration

#### 3. Build Errors
- Clear `node_modules` and reinstall dependencies
- Update to latest Node.js version
- Check for TypeScript compilation errors

#### 4. Deployment Failures
- Verify Azure CLI login status
- Check Firebase project permissions
- Ensure all required tools are installed

### Debug Commands

#### Backend Debug
```bash
# Check backend health
curl https://psctech-bcdadbajcrgwa2h5.azurewebsites.net/api/health

# Check database connection
curl https://psctech-bcdadbajcrgwa2h5.azurewebsites.net/api/db-test
```

#### Frontend Debug
```bash
# Check build output
ls -la dist/

# Test local build
pnpm run preview
```

## 📞 Support

If you encounter any issues during deployment:

1. **Check the logs** in Azure App Service or Firebase Console
2. **Verify configuration** files are correct
3. **Test endpoints** using Swagger UI
4. **Review error messages** for specific issues

## 🎉 Success Indicators

### Backend Success
- ✅ Health check returns `{"status": "ok"}`
- ✅ Swagger UI loads without errors
- ✅ Authentication endpoints respond correctly
- ✅ Database connection test passes

### Frontend Success
- ✅ Site loads without errors
- ✅ Authentication flow works
- ✅ API calls to backend succeed
- ✅ No console errors in browser

### Integration Success
- ✅ Frontend can authenticate with backend
- ✅ JWT tokens are generated and validated
- ✅ Protected endpoints work with authentication
- ✅ Role-based access control functions correctly









