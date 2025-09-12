# 🚀 Deployment Troubleshooting Guide - PSC Tech Backend

This guide addresses the deployment issues you're experiencing and provides multiple solutions.

## ❌ **Current Issues & Solutions**

### **Issue 1: SSL Certificate Validation Failed**
- **Error**: `Could not verify the server's certificate`
- **Solution**: ✅ **FIXED** - Updated publish profile with SSL trust settings

### **Issue 2: Authentication Failed (401 Unauthorized)**
- **Error**: `Could not authorize. Make sure you are using the correct user name and password`
- **Solution**: ✅ **FIXED** - Removed hardcoded credentials from publish profile

## 🔧 **Solution 1: Visual Studio Deployment (Recommended)**

### **Step 1: Get Azure Deployment Credentials**
1. **Go to Azure Portal**: https://portal.azure.com
2. **Navigate to your App Service**: `psctech-bcdadbajcrgwa2h5`
3. **Go to "Deployment Center"** → "Deployment credentials"
4. **Note down**:
   - **Username**: Usually your Azure username or a deployment username
   - **Password**: The deployment password

### **Step 2: Update Visual Studio Credentials**
1. **Right-click project** → "Publish"
2. **Click "Edit"** on your Azure publish profile
3. **Enter the credentials** from Step 1
4. **Save and try publishing again**

### **Step 3: If Still Failing**
1. **Delete the publish profile** and create a new one
2. **Right-click project** → "Publish" → "New Profile"
3. **Choose "Azure"** → "Azure App Service"
4. **Select existing** App Service: `psctech-bcdadbajcrgwa2h5`
5. **Enter credentials** when prompted

## 🚀 **Solution 2: Azure CLI Deployment (Most Reliable)**

This method bypasses all Visual Studio authentication issues and is more reliable.

### **Prerequisites:**
1. **Install Azure CLI**: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
2. **Login to Azure**: `az login`

### **Deployment Steps:**

#### **Option A: PowerShell Script**
```powershell
# Navigate to backend folder
cd backend

# Run the deployment script
.\deploy-azure-cli.ps1
```

#### **Option B: Batch File**
```cmd
# Navigate to backend folder
cd backend

# Run the deployment script
deploy-azure-cli.bat
```

#### **Option C: Manual Commands**
```bash
# Build and publish
dotnet build --configuration Release
dotnet publish --configuration Release --output bin/Release/net8.0/publish

# Create zip file
powershell -Command "Compress-Archive -Path 'bin/Release/net8.0/publish/*' -DestinationPath 'bin/Release/net8.0/publish.zip' -Force"

# Deploy to Azure
az webapp deployment source config-zip --resource-group psctech-rg --name psctech-bcdadbajcrgwa2h5 --src "bin/Release/net8.0/publish.zip"
```

## 🔐 **Authentication Troubleshooting**

### **Common Causes:**
1. **Wrong deployment credentials**
2. **App Service not properly configured**
3. **Subscription permissions**
4. **Resource group access**

### **Verification Steps:**
1. **Check App Service Status**:
   ```bash
   az webapp show --resource-group psctech-rg --name psctech-bcdadbajcrgwa2h5
   ```

2. **Verify Resource Group Access**:
   ```bash
   az group show --name psctech-rg
   ```

3. **Check Current Azure Account**:
   ```bash
   az account show
   ```

## 📋 **Complete Deployment Checklist**

### **Before Deployment:**
- [ ] Azure CLI installed and logged in
- [ ] App Service is running and accessible
- [ ] Resource group permissions verified
- [ ] Project builds successfully locally

### **During Deployment:**
- [ ] Use Azure CLI method (most reliable)
- [ ] Monitor deployment progress
- [ ] Check for any error messages

### **After Deployment:**
- [ ] Test the deployed application
- [ ] Verify health endpoints
- [ ] Check application logs

## 🆘 **If All Else Fails**

### **Alternative Deployment Methods:**

1. **Azure DevOps Pipeline**
2. **GitHub Actions**
3. **Manual FTP Upload**
4. **Azure Container Registry**

### **Contact Support:**
- **Azure Status**: https://status.azure.com
- **Azure Documentation**: https://docs.microsoft.com/azure/app-service
- **Stack Overflow**: Tag with `azure-app-service` and `deployment`

## 🎯 **Recommended Next Steps**

1. **Try Azure CLI deployment first** (most reliable)
2. **If that fails, troubleshoot Azure permissions**
3. **Use Visual Studio as backup** after fixing credentials
4. **Test thoroughly** after successful deployment

---

**💡 Pro Tip**: Azure CLI deployment is almost always more reliable than Visual Studio deployment for Azure App Service. It handles authentication automatically and has better error reporting.

**🚀 Ready to deploy?** Start with the Azure CLI method for the best chance of success!


