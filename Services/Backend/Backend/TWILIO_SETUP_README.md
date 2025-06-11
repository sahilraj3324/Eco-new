# Twilio SMS Verification Setup Guide

This guide explains how to set up and use the Twilio SMS verification system for password reset functionality in your ASP.NET Core application.

## Prerequisites

1. **.NET 8.0+** installed
2. **Twilio Account** with Verify Service configured
3. **SQL Server** instance running
4. **ASP.NET Core Identity** configured

## Twilio Setup

### 1. Create a Twilio Account
1. Go to [Twilio Console](https://console.twilio.com/)
2. Sign up or log in to your account
3. Navigate to the Dashboard to get your Account SID and Auth Token

### 2. Create a Verify Service
1. In Twilio Console, go to **Verify** > **Services**
2. Click **Create new Service**
3. Give your service a name (e.g., "Password Reset Service")
4. Copy the **Service SID** (starts with VA...)

### 3. Configure Application Settings

Update your `appsettings.Development.json` with your Twilio credentials:

```json
{
  "Twilio": {
    "AccountSid": "ACxxxxxxxxxxxxxxxxxxx",
    "AuthToken": "your_actual_auth_token_here",
    "VerifySid": "VAXXXXXXXXXXXXXXXXX"
  }
}
```

**Important**: Never commit real credentials to version control. Use environment variables or Azure Key Vault in production.

## API Endpoints

The system provides three endpoints for password reset:

### 1. Request OTP (`POST /api/auth/forgot`)

Sends an OTP to the user's phone number.

**Request Body:**
```json
{
  "phone": "+1234567890",
  "portal": "Retailer"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully to your phone number."
}
```

### 2. Verify OTP (`POST /api/auth/verify`)

Verifies the OTP and returns a reset token.

**Request Body:**
```json
{
  "phone": "+1234567890",
  "code": "123456",
  "portal": "Retailer"
}
```

**Response:**
```json
{
  "token": "550e8400-e29b-41d4-a716-446655440000",
  "message": "OTP verified successfully. Use the token to reset your password."
}
```

### 3. Reset Password (`POST /api/auth/reset`)

Resets the password using the token from step 2.

**Request Body:**
```json
{
  "token": "550e8400-e29b-41d4-a716-446655440000",
  "newPassword": "NewSecurePassword123!"
}
```

**Response:**
```json
{
  "message": "Password reset successfully."
}
```

## Frontend Implementation

### React Component
A complete React component is provided at:
```
Services/Frontend/Retailer2/src/Pages/PasswordReset/ForgotPassword.jsx
```

### Key Features:
- Multi-step form (Phone → OTP → New Password)
- Portal selection (Admin/Vendor/Retailer)
- Proper error handling
- Loading states
- Responsive design with Tailwind CSS

### Usage in React Router:
```jsx
import ForgotPassword from './Pages/PasswordReset/ForgotPassword';

// Add to your routes
<Route path="/forgot-password" element={<ForgotPassword />} />
```

## User Flow

1. **User enters phone number** and selects portal type
2. **System sends OTP** via Twilio SMS
3. **User enters OTP** received on their phone
4. **System verifies OTP** and generates a reset token (valid for 15 minutes)
5. **User enters new password** 
6. **System resets password** and user can login with new credentials

## Database Schema

### AppUser Table (Identity)
- Extends ASP.NET Core Identity User
- Includes `Portal` field for multi-tenant support

### PasswordResetToken Table
- `Id` (Guid) - Primary key
- `UserId` (Guid) - Foreign key to AppUser
- `Portal` (string) - Portal type for validation
- `ExpiresAt` (DateTime) - Token expiration (15 minutes)
- `Used` (bool) - Prevents token reuse

## Security Features

1. **Token Expiration**: Reset tokens expire after 15 minutes
2. **Single Use**: Tokens can only be used once
3. **Portal Validation**: Users can only reset passwords for their registered portal
4. **Phone Verification**: Twilio ensures SMS is sent to the correct number
5. **Password Requirements**: Enforced by Identity configuration

## Testing

### Test Endpoints with Curl

1. **Send OTP:**
```bash
curl -X POST http://localhost:5000/api/auth/forgot \
  -H "Content-Type: application/json" \
  -d '{"phone":"+1234567890","portal":"Retailer"}'
```

2. **Verify OTP:**
```bash
curl -X POST http://localhost:5000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"phone":"+1234567890","code":"123456","portal":"Retailer"}'
```

3. **Reset Password:**
```bash
curl -X POST http://localhost:5000/api/auth/reset \
  -H "Content-Type: application/json" \
  -d '{"token":"your-token-here","newPassword":"NewPassword123!"}'
```

### Development Testing

For development, you can use Twilio's test credentials:
- Account SID: `ACtest...`
- Auth Token: `test_token`
- Test phone numbers that don't send real SMS

## Error Handling

Common error responses:

- **404**: User not found with provided phone/portal
- **400**: Invalid OTP code
- **400**: Token expired or already used
- **400**: Validation errors (weak password, etc.)
- **500**: Server errors (Twilio API issues, database problems)

## Production Considerations

1. **Environment Variables**: Use environment variables for sensitive configuration
2. **Rate Limiting**: Implement rate limiting to prevent abuse
3. **Logging**: Add comprehensive logging for debugging
4. **Monitoring**: Monitor Twilio usage and costs
5. **Phone Number Validation**: Add phone number format validation
6. **HTTPS**: Ensure all endpoints use HTTPS in production

## Troubleshooting

### Common Issues:

1. **"Twilio credentials not configured"**
   - Check appsettings.json has correct Twilio section
   - Verify Account SID, Auth Token, and Verify SID are correct

2. **"User not found"**
   - Ensure user exists in database with matching phone and portal
   - Check phone number format consistency

3. **"Invalid OTP"**
   - Verify code is entered correctly
   - Check if code has expired (Twilio codes expire after 10 minutes by default)

4. **"Token expired"**
   - Reset tokens expire after 15 minutes
   - User needs to restart the process

## Cost Optimization

- Twilio Verify charges per verification attempt
- Consider implementing cooldown periods between requests
- Use test credentials during development
- Monitor usage in Twilio Console

## Next Steps

1. Add rate limiting middleware
2. Implement user notification preferences
3. Add support for email verification as alternative
4. Add audit logging for security compliance
5. Consider adding CAPTCHA for additional security 