# JWT Token Frontend Integration Guide

## Overview
This guide explains how to use JWT tokens for authentication in your frontend application. The JWT tokens now contain **all user data** so you can access user information directly from the token without additional API calls.

## JWT Token Structure
The JWT token now contains all seller information in the payload:
```json
{
  "id": "seller-guid",
  "userType": "Seller",
  "storename": "My Store",
  "email": "seller@example.com",
  "phoneNumber": "9876543210",
  "address": "123 Main St",
  "gstNumber": "22AAAAA0000A1Z5",
  "pincode": "123456",
  "hnscode": "1234",
  "profilePicture": "https://example.com/profile.jpg",
  "status": "Approved",
  "createdAt": "2024-06-06T10:30:00Z",
  "iat": 1717666200,
  "exp": 1717669800,
  "iss": "EcoApp",
  "aud": "EcoAppUsers"
}
```

## API Endpoints

### 1. Seller Signup
```http
POST /api/seller/signup
Content-Type: application/json

{
  "storename": "My Store",
  "Email": "seller@example.com",
  "Password": "password123",
  "PhoneNumber": "9876543210",
  "Address": "123 Main St",
  "Gstnumber": "22AAAAA0000A1Z5",
  "pincode": "123456",
  "hnscode": "1234",
  "profile_picture": "https://example.com/profile.jpg"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "seller": {
    "id": "guid-here",
    "storename": "My Store",
    "email": "seller@example.com",
    "phoneNumber": "9876543210",
    "address": "123 Main St",
    "gstNumber": "22AAAAA0000A1Z5",
    "userType": "Vendor",
    "pincode": "123456",
    "hnscode": "1234",
    "profile_picture": "https://example.com/profile.jpg"
  }
}
```

### 2. Seller Login
```http
POST /api/seller/login
Content-Type: application/json

{
  "Email": "seller@example.com",
  "Password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "seller": {
    "id": "guid-here",
    "userType": "Vendor",
    "status": "Approved"
  }
}
```

### 3. Token Validation
```http
POST /api/seller/validate-token
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "isValid": true,
  "message": "Token is valid",
  "user": {
    "id": "guid-here",
    "userType": "Seller",
    "storename": "My Store",
    "email": "seller@example.com",
    "phoneNumber": "9876543210",
    "address": "123 Main St",
    "gstNumber": "22AAAAA0000A1Z5",
    "pincode": "123456",
    "hnscode": "1234",
    "profilePicture": "https://example.com/profile.jpg",
    "status": "Approved",
    "createdAt": "2024-06-06T10:30:00Z"
  }
}
```

## Frontend Implementation

### 1. JWT Token Decoding

#### Decode JWT Token Client-Side
```javascript
// Function to decode JWT token
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

// Usage
const token = localStorage.getItem('authToken');
const userData = decodeJWT(token);

console.log('User data from token:', userData);
// Output: { id: "...", userType: "Seller", storename: "My Store", ... }
```

#### Get User Data from Token
```javascript
// Get user data directly from stored token
const getUserDataFromToken = () => {
  const token = localStorage.getItem('authToken');
  if (!token) return null;
  
  const decoded = decodeJWT(token);
  if (!decoded) return null;
  
  // Check if token is expired
  const currentTime = Date.now() / 1000;
  if (decoded.exp < currentTime) {
    console.log('Token has expired');
    localStorage.removeItem('authToken');
    return null;
  }
  
  return {
    id: decoded.id,
    userType: decoded.userType,
    storename: decoded.storename,
    email: decoded.email,
    phoneNumber: decoded.phoneNumber,
    address: decoded.address,
    gstNumber: decoded.gstNumber,
    pincode: decoded.pincode,
    hnscode: decoded.hnscode,
    profilePicture: decoded.profilePicture,
    status: decoded.status,
    createdAt: decoded.createdAt
  };
};
```

### 2. Cookie-Based Storage

#### Set JWT in HTTP-Only Cookie (Recommended for Production)
```javascript
// Set token in cookie (backend should set this)
const setTokenCookie = (token, days = 1) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  
  document.cookie = `authToken=${token}; expires=${expires.toUTCString()}; path=/; secure; SameSite=strict`;
};

// Get token from cookie
const getTokenFromCookie = () => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; authToken=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

// Remove token cookie
const removeTokenCookie = () => {
  document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};
```

#### Get User Data from Cookie
```javascript
const getUserDataFromCookie = () => {
  const token = getTokenFromCookie();
  if (!token) return null;
  
  return getUserDataFromToken(token);
};
```

### 3. React Hook for JWT Authentication with User Data

```javascript
// useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// JWT decode function
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      initializeUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const initializeUser = () => {
    try {
      const decoded = decodeJWT(token);
      if (decoded) {
        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          logout();
          return;
        }
        
        // Set user data from token
        setUser({
          id: decoded.id,
          userType: decoded.userType,
          storename: decoded.storename,
          email: decoded.email,
          phoneNumber: decoded.phoneNumber,
          address: decoded.address,
          gstNumber: decoded.gstNumber,
          pincode: decoded.pincode,
          hnscode: decoded.hnscode,
          profilePicture: decoded.profilePicture,
          status: decoded.status,
          createdAt: decoded.createdAt
        });
      } else {
        logout();
      }
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (token, userInfo) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    setToken(token);
    
    // Decode user data from token
    const decoded = decodeJWT(token);
    if (decoded) {
      setUser({
        id: decoded.id,
        userType: decoded.userType,
        storename: decoded.storename,
        email: decoded.email,
        phoneNumber: decoded.phoneNumber,
        address: decoded.address,
        gstNumber: decoded.gstNumber,
        pincode: decoded.pincode,
        hnscode: decoded.hnscode,
        profilePicture: decoded.profilePicture,
        status: decoded.status,
        createdAt: decoded.createdAt
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    setToken(null);
    setUser(null);
  };

  const updateUserData = (newData) => {
    setUser(prev => ({ ...prev, ...newData }));
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      updateUserData,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 4. Using User Data in Components

```javascript
// UserProfile.jsx
import { useAuth } from './useAuth';

const UserProfile = () => {
  const { user } = useAuth();

  if (!user) return <div>Please login</div>;

  return (
    <div className="user-profile">
      <h2>Welcome, {user.storename}!</h2>
      <div className="profile-info">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Phone:</strong> {user.phoneNumber}</p>
        <p><strong>Address:</strong> {user.address}</p>
        <p><strong>GST Number:</strong> {user.gstNumber}</p>
        <p><strong>Status:</strong> {user.status}</p>
        {user.profilePicture && (
          <img src={user.profilePicture} alt="Profile" />
        )}
      </div>
    </div>
  );
};
```

### 5. Automatic User Data Access

```javascript
// No need for additional API calls!
const Dashboard = () => {
  const { user } = useAuth();
  
  // User data is immediately available from the token
  return (
    <div>
      <h1>Dashboard - {user?.storename}</h1>
      <p>Status: {user?.status}</p>
      <p>Account created: {new Date(user?.createdAt).toLocaleDateString()}</p>
    </div>
  );
};
```

## Phone Number Validation

### Frontend Validation
```javascript
// Phone number validation regex
const phoneRegex = /^[6-9]\d{9}$/;

const validatePhoneNumber = (phone) => {
  if (!phoneRegex.test(phone)) {
    return "Phone number must be exactly 10 digits and start with 6, 7, 8, or 9";
  }
  return null;
};

// React form validation
const [phoneError, setPhoneError] = useState('');

const handlePhoneChange = (e) => {
  const phone = e.target.value;
  const error = validatePhoneNumber(phone);
  setPhoneError(error);
};
```

### HTML Input with Pattern
```html
<input 
  type="tel" 
  pattern="[6-9][0-9]{9}" 
  placeholder="Enter 10-digit phone number"
  title="Phone number must be exactly 10 digits starting with 6, 7, 8, or 9"
  required 
/>
```

## Advantages of Storing User Data in JWT

### ✅ **Benefits:**
1. **No Additional API Calls**: User data is immediately available
2. **Offline Access**: Data available even without internet
3. **Reduced Server Load**: Less database queries
4. **Faster UI Rendering**: Instant access to user information
5. **Stateless Authentication**: Perfect for microservices

### ⚠️ **Considerations:**
1. **Token Size**: JWT will be larger (but still manageable)
2. **Sensitive Data**: Don't store passwords or highly sensitive data
3. **Data Freshness**: Token data might be outdated (valid for 1 hour)
4. **Update Mechanism**: Need to refresh token when user data changes

## Security Best Practices

1. **Never store passwords** in JWT
2. **Use HTTPS only** in production
3. **Set appropriate expiration times** (1 hour in this implementation)
4. **Validate tokens on sensitive operations**
5. **Clear tokens on logout**
6. **Use HTTP-only cookies** for enhanced security in production

## Testing the Implementation

### Test with Valid Phone Number
```bash
curl -X POST http://localhost:5000/api/seller/signup \
  -H "Content-Type: application/json" \
  -d '{
    "storename": "Test Store",
    "Email": "test@example.com",
    "Password": "password123",
    "PhoneNumber": "9876543210",
    "Address": "123 Test St",
    "Gstnumber": "22AAAAA0000A1Z5",
    "pincode": "123456",
    "hnscode": "1234"
  }'
```

The response will contain a JWT token with all user data embedded!

## JWT Payload Example
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userType": "Seller",
  "storename": "Test Store",
  "email": "test@example.com",
  "phoneNumber": "9876543210",
  "address": "123 Test St",
  "gstNumber": "22AAAAA0000A1Z5",
  "pincode": "123456",
  "hnscode": "1234",
  "profilePicture": "",
  "status": "InReview",
  "createdAt": "2024-06-06T10:30:00Z",
  "iat": 1717666200,
  "exp": 1717669800,
  "iss": "EcoApp",
  "aud": "EcoAppUsers"
}
``` 