# 🚀 Azure Deployment Guide - PSC Tech Backend

This guide will walk you through deploying your PSC Tech Backend to Azure using Visual Studio.

## 📋 Prerequisites

- ✅ Visual Studio 2022 (Community/Professional/Enterprise)
- ✅ Azure subscription
- ✅ Azure App Service already created (`psctech-bcdadbajcrgwa2h5`)
- ✅ Azure SQL Database configured
- ✅ Node.js installed on your machine

## 🔧 Step-by-Step Deployment

### **Step 1: Open Project in Visual Studio**

1. **Open Visual Studio 2022**
2. **Open Project/Solution**
3. **Navigate to** `backend/psctech-backend.sln`
4. **Wait for project to load** and restore NuGet packages

### **Step 2: Configure Azure Connection**

1. **Right-click on project** in Solution Explorer
2. **Select "Publish"**
3. **Choose "Azure"** as target
4. **Select "Azure App Service"**
5. **Click "Select Existing"**
6. **Choose your App Service**: `psctech-bcdadbajcrgwa2h5`

### **Step 3: Configure Publish Profile**

1. **Set Configuration** to `Release`
2. **Set Target Framework** to `net8.0`
3. **Set Deployment Mode** to `Self-Contained`
4. **Set Target Runtime** to `win-x64`
5. **Enable "Remove additional files at destination"**
6. **Click "Save"**

### **Step 4: Build and Deploy**

1. **Click "Publish"** button
2. **Wait for build to complete**
3. **Monitor deployment progress**
4. **Wait for "Publish Succeeded" message**

## 🌐 Post-Deployment Verification

### **1. Check Azure App Service**

- **URL**: https://psctech-bcdadbajcrgwa2h5.southafricanorth-01.azurewebsites.net
- **Status**: Should show "🚀 PSC Tech Backend Starting..."

### **2. Test Health Endpoints**

```bash
# .NET Health Check
curl https://psctech-bcdadbajcrgwa2h5.southafricanorth-01.azurewebsites.net/health

# Node.js Health Check (after startup)
curl https://psctech-bcdadbajcrgwa2h5.southafricanorth-01.azurewebsites.net:3001/health
```

### **3. Test API Endpoints**

```bash
# Root endpoint
curl https://psctech-bcdadbajcrgwa2h5.southafricanorth-01.azurewebsites.net/

# Voucher API
curl https://psctech-bcdadbajcrgwa2h5.southafricanorth-01.azurewebsites.net:3001/api/vouchers

# User API
curl https://psctech-bcdadbajcrgwa2h5.southafricanorth-01.azurewebsites.net:3001/api/users
```

## ⚙️ Azure Configuration

### **App Service Settings**

1. **Go to Azure Portal**
2. **Navigate to your App Service**
3. **Go to Configuration → Application settings**
4. **Add these environment variables**:

```bash
WEBSITE_NODE_DEFAULT_VERSION=18.17.0
WEBSITE_RUN_FROM_PACKAGE=1
NODE_ENV=production
PORT=3001
```

### **CORS Configuration**

1. **In App Service Configuration**
2. **Add CORS allowed origins**:
   - `https://psctech-bcdadbajcrgwa2h5.southafricanorth-01.azurewebsites.net`
   - `https://your-frontend-domain.azurewebsites.net`

### **Connection String**

1. **In App Service Configuration**
2. **Add connection string**:
   - **Name**: `DefaultConnection`
   - **Value**: `Server=psctech-rg.database.windows.net;Database=psctech_main;User Id=psctechadmin;Password=Rluthando@12;TrustServerCertificate=false;Encrypt=true;`

## 🔍 Troubleshooting

### **Common Issues:**

1. **Build Errors**
   - Clean solution and rebuild
   - Restore NuGet packages
   - Check .NET SDK version (8.0)

2. **Deployment Failures**
   - Verify Azure credentials
   - Check App Service status
   - Ensure sufficient permissions

3. **Runtime Errors**
   - Check App Service logs
   - Verify environment variables
   - Check database connectivity

### **Logs and Monitoring:**

1. **App Service Logs**
   - Go to App Service → Monitoring → Log stream
   - Check for errors and warnings

2. **Application Insights** (Optional)
   - Enable Application Insights
   - Monitor performance and errors

## 📊 Performance Optimization

### **Azure App Service:**

1. **Scale Up**: Choose appropriate pricing tier
2. **Scale Out**: Enable multiple instances
3. **Auto-scaling**: Configure based on CPU/memory

### **Database Optimization:**

1. **Connection Pooling**: Configure in connection string
2. **Query Optimization**: Use indexes and stored procedures
3. **Monitoring**: Enable Query Performance Insights

## 🔒 Security Considerations

### **Production Security:**

1. **HTTPS Only**: Force HTTPS redirects
2. **Authentication**: Implement proper JWT authentication
3. **CORS**: Restrict to specific domains
4. **Secrets**: Use Azure Key Vault for sensitive data

### **Database Security:**

1. **Firewall Rules**: Restrict access to App Service IPs
2. **Encryption**: Ensure data encryption at rest
3. **Audit Logging**: Enable SQL Server audit

## 🎯 Next Steps

After successful deployment:

1. **Update Frontend**: Point to Azure backend URLs
2. **Test End-to-End**: Verify voucher system functionality
3. **Monitor Performance**: Set up alerts and monitoring
4. **Scale as Needed**: Adjust resources based on usage

## 📞 Support

If you encounter issues:

1. **Check Azure Status**: https://status.azure.com
2. **Review App Service Logs**: Real-time troubleshooting
3. **Azure Documentation**: https://docs.microsoft.com/azure/app-service

---

**🎉 Congratulations!** Your PSC Tech Backend is now running on Azure with a professional, scalable infrastructure!


