# PSC Tech Backend - Voucher System

A professional Node.js backend for the PSC Tech multi-tenant voucher system, integrated with Azure SQL Database.

## 🚀 Quick Start

### Option 1: Automatic Startup (Recommended)
```bash
node start-backend.js
```

### Option 2: Manual Startup
```bash
# Install dependencies
npm install

# Start the server
npm start

# Or for development with auto-restart
npm run dev
```

## 📊 Backend Status

Once started, your backend will be available at:

- **Server URL**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **API Base**: http://localhost:3001/api
- **API Documentation**: http://localhost:3001/

## 🔗 Available API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Vouchers
- `GET /api/vouchers` - Get all vouchers (with filtering)
- `POST /api/vouchers` - Generate new voucher
- `GET /api/vouchers/:id` - Get voucher details
- `POST /api/vouchers/:id/redeem` - Redeem voucher
- `GET /api/vouchers/stats/overview` - Get voucher statistics

### Users
- `GET /api/users` - Get all users (with filtering)
- `GET /api/users/:id` - Get user details
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `GET /api/users/stats/overview` - Get user statistics

### Institutions
- `GET /api/institutions` - Get all institutions
- `GET /api/institutions/:id` - Get institution details
- `POST /api/institutions` - Create new institution
- `PUT /api/institutions/:id` - Update institution
- `GET /api/institutions/stats/overview` - Get institution statistics

## 🗄️ Database Integration

The backend is configured to connect to your Azure SQL Database:

- **Master Database**: `psctech_master` (Tenant Management)
- **Main Database**: `psctech_main` (Voucher System + Application Data)

## 🔧 Configuration

Environment variables are automatically configured in the startup script:

```bash
DB_SERVER=psctech-rg.database.windows.net
DB_NAME=psctech_main
DB_USER=psctechadmin
DB_PASSWORD=Rluthando@12
PORT=3001
```

## 🧪 Testing the Backend

### 1. Health Check
```bash
curl http://localhost:3001/health
```

### 2. API Status
```bash
curl http://localhost:3001/
```

### 3. Test Voucher Generation
```bash
curl -X POST http://localhost:3001/api/vouchers \
  -H "Content-Type: application/json" \
  -d '{
    "denomination": 25,
    "parent_guardian_name": "John Doe",
    "learner_count": 2,
    "institution_id": "MASTER001",
    "issued_by_user_id": "PRINCIPAL001"
  }'
```

## 🚨 Troubleshooting

### Common Issues:

1. **Port Already in Use**
   - Change the port in `.env` file or kill the process using port 3001

2. **Database Connection Failed**
   - Verify Azure SQL credentials
   - Check firewall settings
   - Ensure database exists and is accessible

3. **Dependencies Missing**
   - Run `npm install` manually

4. **Permission Denied**
   - Ensure you have write permissions in the backend directory

## 📋 System Requirements

- Node.js 16+ 
- npm 8+
- Access to Azure SQL Database
- Port 3001 available

## 🔒 Security Features

- **CORS Protection** - Configured for frontend integration
- **Rate Limiting** - 100 requests per 15 minutes per IP
- **Helmet Security** - HTTP security headers
- **Input Validation** - Request data validation
- **SQL Injection Protection** - Parameterized queries

## 🎯 Next Steps

1. **Start the backend** using the startup script
2. **Test the health endpoint** to verify it's running
3. **Test voucher generation** to verify database connectivity
4. **Integrate with frontend** by updating API base URLs

Your backend is now ready to provide a professional workflow for the voucher system! 🎉