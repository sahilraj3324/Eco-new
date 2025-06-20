# Environment Variables Setup Guide

## Overview

This guide explains how to properly configure environment variables for your Ecocys application, including both backend (.NET) and frontend (React) applications for local development and production deployment.

## 🔑 Why Environment Variables?

Environment variables help you:
- **Security**: Keep sensitive data (API keys, database credentials) out of source code
- **Flexibility**: Use different configurations for development, staging, and production
- **Team Collaboration**: Each developer can have their own local settings
- **CI/CD**: Easily deploy to different environments without code changes

## 📁 File Structure

```
Eco-new/
├── Services/
│   ├── Backend/Backend/
│   │   ├── .env                    # Backend development
│   │   ├── .env.production        # Backend production
│   │   └── appsettings.json       # Now using env vars
│   └── Frontend/
│       ├── Retailer2/
│       │   ├── .env               # Frontend development
│       │   └── .env.production    # Frontend production
│       ├── adminpanel/
│       │   ├── .env
│       │   └── .env.production
│       └── Vendor/
│           ├── .env
│           └── .env.production
└── .gitignore                     # Excludes .env files
```

## 🎯 Understanding "api.ecocys.com"

The line **"Add api.ecocys.com as API base url in production env file"** means:

- **Local Development**: Your API runs on `http://localhost:5261`
- **Production**: Your API will be hosted at `https://api.ecocys.com`
- **The frontend needs different URLs** for different environments

## 🔧 Backend (.NET) Configuration

### 1. Environment Files

**`.env` (Development)**
```bash
# Database Configuration
CONNECTION_STRING_DEFAULT=Server=VANQUISHER\SQLEXPRESS;Database=ECOSYS;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True;

# Twilio Configuration
TWILIO_ACCOUNT_SID=AC3caf576e3d8efc569d3cfb74c3998100
TWILIO_AUTH_TOKEN=d91afbfcfd498a2d26cc141efb0c0154
TWILIO_VERIFY_SID=VA6ffbae7125a8823c4ceda8203032b724

# JWT Configuration
JWT_KEY=super_secret_key_123_make_this_at_least_32_characters_long!
JWT_ISSUER=EcosysApp
JWT_AUDIENCE=EcosysUsers
JWT_EXPIRE_MINUTES=60

# Cashfree Configuration
CASHFREE_CLIENT_ID=TEST10116618581fbe98c868149d61df81661101
CASHFREE_CLIENT_SECRET=cfsk_ma_test_37d9e4f9a41b5ad9042f46a9307dfee1_acb75781
CASHFREE_BASE_URL=https://sandbox.cashfree.com
CASHFREE_VERSION=2023-08-01

# Environment
ASPNETCORE_ENVIRONMENT=Development
```

**`.env.production` (Production)**
```bash
# Production Database Configuration
CONNECTION_STRING_DEFAULT=Server=YOUR_PRODUCTION_SERVER;Database=ECOSYS;User ID=your_user;Password=your_password;Integrated Security=false;MultipleActiveResultSets=true;TrustServerCertificate=True;

# Twilio Configuration (Production)
TWILIO_ACCOUNT_SID=YOUR_PRODUCTION_TWILIO_SID
TWILIO_AUTH_TOKEN=YOUR_PRODUCTION_TWILIO_TOKEN
TWILIO_VERIFY_SID=YOUR_PRODUCTION_VERIFY_SID

# JWT Configuration (Production)
JWT_KEY=YOUR_SUPER_SECURE_PRODUCTION_JWT_KEY_AT_LEAST_32_CHARACTERS_LONG!
JWT_ISSUER=EcosysApp
JWT_AUDIENCE=EcosysUsers
JWT_EXPIRE_MINUTES=60

# Cashfree Configuration (Production)
CASHFREE_CLIENT_ID=YOUR_PRODUCTION_CASHFREE_CLIENT_ID
CASHFREE_CLIENT_SECRET=YOUR_PRODUCTION_CASHFREE_CLIENT_SECRET
CASHFREE_BASE_URL=https://api.cashfree.com
CASHFREE_VERSION=2023-08-01

# Environment
ASPNETCORE_ENVIRONMENT=Production
```

### 2. How It Works

The backend now automatically:
1. Detects if it's running in Development or Production
2. Loads the appropriate `.env` file
3. Overrides `appsettings.json` values with environment variables
4. Falls back to configuration values if environment variables aren't set

## 🎨 Frontend (React) Configuration

### 1. Environment Files

**`.env` (Development)**
```bash
# Development Environment Variables
VITE_API_BASE_URL=http://localhost:5261
VITE_API_BASE_URL_HTTPS=https://localhost:7209

# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyAy0Yj6yW8cCsXEAcYafUrTn8Bmh-4llLs
VITE_FIREBASE_AUTH_DOMAIN=senior-5c96a.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://senior-5c96a-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=senior-5c96a
VITE_FIREBASE_STORAGE_BUCKET=senior-5c96a.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=652023010346
VITE_FIREBASE_APP_ID=1:652023010346:web:fe74365dc105558c155f53
VITE_FIREBASE_MEASUREMENT_ID=G-K75ZVNQTQ6

# Environment
NODE_ENV=development
```

**`.env.production` (Production)**
```bash
# Production Environment Variables
VITE_API_BASE_URL=https://api.ecocys.com
VITE_API_BASE_URL_HTTPS=https://api.ecocys.com

# Firebase Configuration (Production)
VITE_FIREBASE_API_KEY=YOUR_PRODUCTION_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=your-production-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-production-project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-production-project
VITE_FIREBASE_STORAGE_BUCKET=your-production-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_PRODUCTION_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_PRODUCTION_APP_ID
VITE_FIREBASE_MEASUREMENT_ID=YOUR_PRODUCTION_MEASUREMENT_ID

# Environment
NODE_ENV=production
```

### 2. Important Notes for React/Vite

- **All frontend environment variables MUST start with `VITE_`**
- Vite only exposes variables that start with `VITE_` to the browser
- These values are **publicly visible** in the built JavaScript
- Never put secret keys in frontend environment variables

## 🚀 SmarterASP.NET Deployment Guide

### 1. Backend Deployment

Since you're using **SmarterASP.NET Shared/VPS hosting**, here's how to set up environment variables:

#### Option A: Use Web.config transforms
```xml
<!-- Web.Release.config -->
<configuration>
  <connectionStrings>
    <add name="DefaultConnection" 
         connectionString="YOUR_PRODUCTION_CONNECTION_STRING" 
         xdt:Transform="SetAttributes" xdt:Locator="Match(name)"/>
  </connectionStrings>
  
  <appSettings>
    <add key="TwilioAccountSid" value="YOUR_PRODUCTION_TWILIO_SID" 
         xdt:Transform="SetAttributes" xdt:Locator="Match(key)"/>
    <!-- Add other production settings -->
  </appSettings>
</configuration>
```

#### Option B: Use Application Settings in hosting panel
1. Log into your SmarterASP.NET control panel
2. Go to **Configuration** → **Application Settings**
3. Add each environment variable:
   - `CONNECTION_STRING_DEFAULT` = `Your production connection string`
   - `TWILIO_ACCOUNT_SID` = `Your production Twilio SID`
   - `JWT_KEY` = `Your production JWT key`
   - etc.

#### Option C: Upload .env.production file
1. Upload your `.env.production` file to the server
2. Ensure it's not in the `wwwroot` folder (security)
3. The application will automatically load it

### 2. Frontend Deployment

#### Build with Production Environment
```bash
# For each frontend app
cd Services/Frontend/Retailer2
npm run build -- --mode production

cd ../adminpanel  
npm run build -- --mode production

cd ../Vendor
npm run build -- --mode production
```

#### Upload to Hosting
1. Upload the `dist` folder contents to your web directory
2. Ensure your hosting supports SPA routing (if using React Router)

## 🔒 Security Best Practices

### 1. Never Commit Sensitive Data
- ✅ `.env` files are in `.gitignore`
- ✅ `appsettings.json` has empty values
- ❌ Never commit real API keys, passwords, or connection strings

### 2. Use Different Keys for Different Environments
- **Development**: Use test/sandbox API keys
- **Production**: Use live API keys
- **Firebase**: Consider separate projects for dev/prod

### 3. Secure Production Deployment
- Use strong, unique passwords
- Enable HTTPS only
- Restrict database access by IP if possible
- Regularly rotate API keys

## 🛠️ Development Workflow

### 1. Setting Up a New Developer
```bash
# 1. Clone the repository
git clone <your-repo>
cd Eco-new

# 2. Copy and customize environment files
cp Services/Backend/Backend/.env.example Services/Backend/Backend/.env
cp Services/Frontend/Retailer2/.env.example Services/Frontend/Retailer2/.env

# 3. Update .env files with your local settings
# Edit database connection strings, API keys, etc.

# 4. Run the applications
cd Services/Backend/Backend
dotnet run

cd ../../Frontend/Retailer2
npm install
npm run dev
```

### 2. Adding New Environment Variables

#### Backend
1. Add to `.env` and `.env.production` files
2. Add to `OverrideConfigurationWithEnvironmentVariables()` method in `Program.cs`
3. Use in your code: `builder.Configuration["Your:Setting"]`

#### Frontend
1. Add to `.env` and `.env.production` files (with `VITE_` prefix)
2. Use in your code: `import.meta.env.VITE_YOUR_SETTING`

## 🧪 Testing Environment Configuration

### Backend Testing
```bash
cd Services/Backend/Backend
dotnet run
# Check console output for loaded environment variables
```

### Frontend Testing
```bash
cd Services/Frontend/Retailer2
npm run dev
# Check browser console for API base URL and Firebase config
```

## 🚨 Troubleshooting

### Common Issues

1. **Environment variables not loading**
   - Check file names exactly: `.env` not `env` or `.env.txt`
   - Ensure files are in the correct directories
   - Check for syntax errors (no spaces around `=`)

2. **Frontend can't reach API**
   - Verify `VITE_API_BASE_URL` is correct
   - Check CORS configuration in backend
   - Ensure API is running on expected port

3. **Firebase not working**
   - Verify all Firebase environment variables are set
   - Check Firebase project configuration
   - Ensure Firebase rules allow your operations

4. **Database connection fails**
   - Check connection string format
   - Verify database server is running
   - Ensure network connectivity

### Debug Commands
```bash
# Check environment variables (backend)
echo $CONNECTION_STRING_DEFAULT

# Check loaded variables (frontend)
console.log(import.meta.env)

# Test API connectivity
curl http://localhost:5261/api/test
```

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Verify environment files are correctly formatted
3. Test with minimal configuration
4. Check application logs for specific error messages

Remember: **Never share your production `.env` files or commit them to version control!** 