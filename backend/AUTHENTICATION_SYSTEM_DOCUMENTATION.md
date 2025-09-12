# PSC Tech Backend Authentication System Documentation

## Overview

The PSC Tech Backend now includes a comprehensive JWT-based authentication system with password hashing, role-based authorization, and secure token management.

## Features

### 🔐 Core Authentication Features
- **JWT Token Authentication**: Secure token-based authentication
- **Password Hashing**: SHA256 password hashing for security
- **Role-Based Authorization**: Support for multiple user roles (principal, teacher, parent, learner, sgb)
- **Password Reset**: Secure password reset functionality with tokens
- **Profile Management**: User profile retrieval and updates
- **Token Validation**: Automatic token validation middleware

### 🛡️ Security Features
- **Password Verification**: Secure password comparison
- **Token Expiration**: Configurable token expiration (24 hours default)
- **Reset Token Expiry**: Password reset tokens expire after 24 hours
- **Role-Based Access Control**: Endpoint protection based on user roles
- **Secure Headers**: JWT tokens transmitted via Authorization header

## API Endpoints

### Public Endpoints (No Authentication Required)

#### 1. User Registration
```
POST /api/auth/register
```
**Request Body:**
```json
{
  "username": "john.doe",
  "password": "securePassword123",
  "email": "john.doe@school.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "teacher",
  "institutionId": "12345678-1234-1234-1234-123456789012"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "87654321-4321-4321-4321-210987654321",
    "username": "john.doe@school.com",
    "message": "User registered successfully"
  },
  "message": "User registered successfully"
}
```

#### 2. User Login
```
POST /api/auth/login
```
**Request Body:**
```json
{
  "username": "john.doe@school.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "87654321-4321-4321-4321-210987654321",
    "username": "john.doe@school.com",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@school.com",
    "role": "teacher",
    "institutionId": "12345678-1234-1234-1234-123456789012",
    "institutionName": "Sample School",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "message": "Login successful"
  },
  "message": "Login successful"
}
```

#### 3. Forgot Password
```
POST /api/auth/forgot-password
```
**Request Body:**
```json
{
  "email": "john.doe@school.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "If the email exists, a reset link has been sent"
  },
  "message": "If the email exists, a reset link has been sent"
}
```

#### 4. Reset Password
```
POST /api/auth/reset-password
```
**Request Body:**
```json
{
  "token": "reset_token_here",
  "newPassword": "newSecurePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Password reset successfully"
  },
  "message": "Password reset successfully"
}
```

### Protected Endpoints (Authentication Required)

#### 1. Get User Profile
```
GET /api/auth/profile
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "87654321-4321-4321-4321-210987654321",
    "username": "john.doe",
    "email": "john.doe@school.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "teacher",
    "institutionId": "12345678-1234-1234-1234-123456789012",
    "institutionName": "Sample School",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "message": "Profile retrieved successfully"
}
```

#### 2. Update User Profile
```
PUT /api/auth/profile
Authorization: Bearer <jwt_token>
```
**Request Body:**
```json
{
  "firstName": "Johnny",
  "lastName": "Smith"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "87654321-4321-4321-4321-210987654321",
    "firstName": "Johnny",
    "lastName": "Smith",
    "message": "Profile updated successfully"
  },
  "message": "Profile updated successfully"
}
```

#### 3. Change Password
```
POST /api/auth/change-password
Authorization: Bearer <jwt_token>
```
**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Password changed successfully"
  },
  "message": "Password changed successfully"
}
```

#### 4. Logout
```
POST /api/auth/logout
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  },
  "message": "Logged out successfully"
}
```

### Role-Based Protected Endpoints

#### 1. Admin Access Test (Principal or Teacher)
```
GET /api/auth/test-admin
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Admin access granted",
    "userId": "87654321-4321-4321-4321-210987654321",
    "userRole": "teacher",
    "userEmail": "john.doe@school.com"
  },
  "message": "Admin access granted"
}
```

#### 2. Teacher Access Test (Teacher Only)
```
GET /api/auth/test-teacher
Authorization: Bearer <jwt_token>
```

## Configuration

### JWT Settings (appsettings.json)
```json
{
  "Jwt": {
    "Key": "psctech-jwt-secret-key-2024-azure-production",
    "Issuer": "PscTechBackend",
    "Audience": "PscTechFrontend",
    "ExpiresIn": "24h"
  }
}
```

### User Roles
- **principal**: School principal with full access
- **teacher**: Teacher with limited administrative access
- **parent**: Parent with student-related access
- **learner**: Student with basic access
- **sgb**: School Governing Body member

## Implementation Details

### Password Hashing
- Uses SHA256 hashing algorithm
- Passwords are hashed before storage
- Secure comparison during login

### JWT Token Structure
```json
{
  "sub": "user_id",
  "email": "user@email.com",
  "role": "teacher",
  "institutionId": "institution_guid",
  "iss": "PscTechBackend",
  "aud": "PscTechFrontend",
  "exp": 1642248000,
  "iat": 1642161600
}
```

### Middleware
- **JwtMiddleware**: Automatically validates JWT tokens and attaches user info to request context
- **JwtAuthorizeAttribute**: Custom authorization attribute for role-based access control

### Database Schema Updates
The User model has been enhanced with:
- `PasswordHash`: SHA256 hashed password
- `PasswordResetToken`: Token for password reset
- `PasswordResetTokenExpiry`: Expiration time for reset token

## Security Best Practices

1. **Token Storage**: Store JWT tokens securely on the client side
2. **Token Transmission**: Always use HTTPS for token transmission
3. **Token Expiration**: Tokens expire after 24 hours for security
4. **Password Requirements**: Implement strong password policies
5. **Rate Limiting**: Consider implementing rate limiting for login attempts
6. **Audit Logging**: Log authentication events for security monitoring

## Error Handling

### Common Error Responses

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

#### 403 Forbidden (Insufficient Role)
```json
{
  "success": false,
  "message": "Forbidden: Insufficient permissions"
}
```

#### 400 Bad Request
```json
{
  "success": false,
  "message": "Username and password are required"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "An error occurred during login",
  "error": "Detailed error message"
}
```

## Testing

### Test Endpoints
- `/api/auth/test-admin`: Test admin access (principal, teacher roles)
- `/api/auth/test-teacher`: Test teacher access (teacher role only)

### Testing Workflow
1. Register a new user
2. Login to get JWT token
3. Use token in Authorization header for protected endpoints
4. Test role-based access control

## Deployment Notes

1. **Environment Variables**: Ensure JWT secret is properly configured
2. **Database Migration**: Run migrations to update User table schema
3. **HTTPS**: Always use HTTPS in production
4. **CORS**: Configure CORS settings for frontend domains
5. **Monitoring**: Monitor authentication logs for security events

## Future Enhancements

1. **Refresh Tokens**: Implement refresh token mechanism
2. **Multi-Factor Authentication**: Add MFA support
3. **Session Management**: Implement session tracking
4. **Token Blacklisting**: Add token revocation capability
5. **Audit Trail**: Comprehensive authentication audit logging









