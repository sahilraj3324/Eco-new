# Frontend Authentication Update Guide

## Overview
Updated the frontend authentication system to work with the new cookie-based JWT authentication from the backend.

## 🔄 **Key Changes Made**

### **1. VendorLogin.jsx**
#### **Changes:**
- ✅ Updated field names to match backend: `email` → `Email`, `password` → `Password`
- ✅ Added `withCredentials: true` to axios requests for cookie handling
- ✅ Removed `localStorage.setItem("token", ...)` (cookies are HTTP-only)
- ✅ Fixed API endpoint to `/api/seller/login` (lowercase)
- ✅ Added proper error handling

#### **Before:**
```javascript
const [information, setInformation] = useState({
  email: "",
  password: "",
});

// Stored token in localStorage
localStorage.setItem("token", response.data.token);
```

#### **After:**
```javascript
const [information, setInformation] = useState({
  Email: "",
  Password: "",
});

// Cookie is automatically set by server
// Only store non-sensitive data in localStorage
localStorage.setItem("Id", response.data.seller.id);
```

### **2. VendorSignUp.jsx**
#### **Changes:**
- ✅ Updated all field names to match backend expectations
- ✅ Changed `PhoneNumber` from `number` to `tel` input with proper validation pattern
- ✅ Changed `pincode` from `number` to `text` input with 6-digit validation
- ✅ Added proper form validation (required fields, minLength for password)
- ✅ Added `withCredentials: true` for cookie support
- ✅ Removed excessive localStorage storage (only keep essential data)
- ✅ Fixed API endpoint to `/api/seller/signup`

#### **Field Mapping Changes:**
| Old Field | New Field | Type Change |
|-----------|-----------|-------------|
| `email` | `Email` | - |
| `password` | `Password` | - |
| `phoneNumber` | `PhoneNumber` | `number` → `tel` |
| `address` | `Address` | - |
| `userType` | `UserType` | - |
| `gstnumber` | `Gstnumber` | - |
| `pincode` | `pincode` | `number` → `text` |

#### **Validation Added:**
- Phone: `pattern="[6-9][0-9]{9}"` (10 digits starting with 6-9)
- Pincode: `pattern="[0-9]{6}"` (exactly 6 digits)
- Password: `minLength="6"`
- Email: `required`

### **3. New Authentication Hook**
#### **Created: `useAuth.js`**
A comprehensive React hook for managing authentication:

```javascript
import { useAuth } from '../hooks/useAuth';

const { user, loading, isAuthenticated, login, logout, checkAuth } = useAuth();
```

#### **Features:**
- ✅ Automatic authentication checking on app load
- ✅ HTTP-only cookie management
- ✅ Global axios configuration with `withCredentials: true`
- ✅ Automatic localStorage cleanup on logout/auth failure
- ✅ User data refreshing from `/api/seller/me` endpoint

## 🚀 **New API Integration**

### **Available Endpoints:**
| Endpoint | Method | Purpose | Cookie |
|----------|--------|---------|--------|
| `/api/seller/signup` | POST | Register + Auto-login | ✅ Sets |
| `/api/seller/login` | POST | Login | ✅ Sets |
| `/api/seller/me` | GET | Get current user data | ✅ Reads |
| `/api/seller/logout` | POST | Logout | ✅ Clears |

## 📝 **How to Use**

### **1. Login Process:**
```javascript
// Login automatically sets HTTP-only cookie
const response = await axios.post('/api/seller/login', {
  Email: 'seller@example.com',
  Password: 'password123'
}, { withCredentials: true });

// Cookie is automatically included in subsequent requests
```

### **2. Get Current User:**
```javascript
// Gets user data from cookie automatically
const response = await axios.get('/api/seller/me', {
  withCredentials: true
});

console.log(response.data.seller); // Complete user data
```

### **3. Logout:**
```javascript
// Clears cookie automatically
await axios.post('/api/seller/logout', {}, {
  withCredentials: true
});
```

### **4. Using the Authentication Hook:**
```javascript
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const { user, loading, isAuthenticated, logout } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please login</div>;

  return (
    <div>
      <h1>Welcome, {user.storename}!</h1>
      <p>Status: {user.status}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

## 🔒 **Security Improvements**

### **✅ HTTP-Only Cookies**
- Cannot be accessed by JavaScript (XSS protection)
- Automatically sent with requests
- Secure against client-side attacks

### **✅ Field Validation**
- Phone number: 10 digits starting with 6-9 (Indian mobile format)
- Pincode: Exactly 6 digits
- Password: Minimum 6 characters
- Email: Proper email format validation

### **✅ Automatic Session Management**
- Cookies expire after 1 hour
- Automatic cleanup on authentication failure
- Proper error handling for expired sessions

## 🛠️ **Migration Steps for Existing Components**

### **1. Update Axios Requests:**
```javascript
// Add to all API calls
const response = await axios.post('/api/endpoint', data, {
  withCredentials: true
});
```

### **2. Remove Token Management:**
```javascript
// ❌ Remove these
localStorage.setItem("token", token);
localStorage.getItem("token");
localStorage.removeItem("token");

// ✅ Keep only essential user data
localStorage.setItem("Id", user.id);
localStorage.setItem("Status", user.status);
```

### **3. Use the Authentication Hook:**
```javascript
// Replace manual auth checking with useAuth hook
import { useAuth } from '../hooks/useAuth';

const { user, isAuthenticated, logout } = useAuth();
```

## 📱 **Component Updates**

### **Forms that need updating:**
1. **Login forms**: Change field names to `Email`, `Password`
2. **Signup forms**: Match all field names with backend models
3. **Profile forms**: Use proper validation patterns
4. **API calls**: Add `withCredentials: true`

### **Components that can use useAuth:**
1. **Dashboard**: Get user data automatically
2. **Profile**: Display and update user information
3. **Navigation**: Show/hide based on authentication status
4. **Protected Routes**: Check authentication without API calls

## 🎯 **Benefits**

### **For Developers:**
- ✅ Simpler authentication flow
- ✅ Automatic cookie management
- ✅ Better error handling
- ✅ Consistent field validation

### **For Users:**
- ✅ More secure authentication
- ✅ Better form validation feedback
- ✅ Automatic session management
- ✅ Improved user experience

## 🔧 **Testing**

### **Test Login:**
1. Enter valid credentials
2. Check browser cookies for `token`
3. Verify user data in localStorage
4. Test navigation based on status

### **Test Signup:**
1. Fill all required fields with proper formats
2. Check field validation (phone, pincode, email)
3. Verify automatic login after signup
4. Check cookie and localStorage data

### **Test Session Management:**
1. Login and close browser
2. Reopen and verify still logged in
3. Wait for cookie expiration (1 hour)
4. Verify automatic logout

The frontend is now fully updated to work with the cookie-based JWT authentication system! 🎉 