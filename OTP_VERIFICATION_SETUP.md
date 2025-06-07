# OTP Verification System for Mess Owner Registration

This implementation adds a comprehensive OTP (One-Time Password) verification system to limit and verify people when they register as mess owners on your platform.

## Overview

The OTP verification system works in three steps:

1. **Email Verification**: User enters their email address
2. **OTP Verification**: User receives a 6-digit code via email and enters it
3. **Account Creation**: User completes registration with personal details

## Files Created/Modified

### New Files:

- `src/lib/otpStore.ts` - OTP storage utility
- `src/lib/emailService.ts` - Email service with templates
- `src/app/api/auth/otp/send/route.ts` - API to send OTP
- `src/app/api/auth/otp/verify/route.ts` - API to verify OTP

### Modified Files:

- `src/app/api/auth/signup/mess-owner/route.ts` - Now requires OTP verification
- `src/app/signup/mess-owner/page.tsx` - Multi-step signup with OTP

## Features

✅ **Email Verification**: Prevents fake email addresses  
✅ **6-Digit OTP**: Secure and user-friendly verification codes  
✅ **10-minute Expiry**: OTPs expire automatically for security  
✅ **Rate Limiting**: Built-in timer prevents OTP spam  
✅ **Beautiful Email Templates**: Professional HTML emails  
✅ **Development Mode**: Shows OTP in console for testing  
✅ **Multi-step UI**: Clean, progressive signup flow  
✅ **Resend Functionality**: Users can request new OTP  
✅ **Input Validation**: Comprehensive validation at all steps

## How It Works

### 1. Email Verification Step

```typescript
// User enters email, system checks if it's already registered
POST /api/auth/otp/send
{
  "email": "owner@example.com",
  "purpose": "mess-owner-signup"
}
```

### 2. OTP Generation & Sending

- 6-digit random OTP generated
- Stored in memory with 10-minute expiry
- Beautiful HTML email sent with verification code
- In development: OTP also returned in API response

### 3. OTP Verification

```typescript
// User enters OTP for verification
POST /api/auth/otp/verify
{
  "email": "owner@example.com",
  "otp": "123456",
  "purpose": "mess-owner-signup"
}
```

### 4. Account Creation

```typescript
// Only after OTP verification, account can be created
POST /api/auth/signup/mess-owner
{
  "name": "John Doe",
  "email": "owner@example.com",
  "password": "password123",
  "otp": "123456"  // Re-verified during signup
}
```

## Security Features

- **Email Uniqueness**: Prevents duplicate registrations
- **OTP Expiry**: 10-minute window for verification
- **Purpose Validation**: OTP tied to specific use case
- **Memory Cleanup**: Expired OTPs automatically removed
- **Re-verification**: OTP checked again during account creation
- **Rate Limiting**: Timer prevents rapid OTP requests

## Email Service Integration

The system uses a modular email service that can be easily extended:

### Current (Development)

- Mock email service logs to console
- Returns OTP in API response for testing

### Production Ready

Uncomment and configure one of these providers in `src/lib/emailService.ts`:

#### SendGrid Setup

```typescript
// Install: npm install @sendgrid/mail
// Environment variables:
SENDGRID_API_KEY=your_sendgrid_key
FROM_EMAIL=noreply@yourdomain.com
EMAIL_PROVIDER=sendgrid
```

#### AWS SES Setup

```typescript
// Install: npm install aws-sdk
// Environment variables:
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
FROM_EMAIL=noreply@yourdomain.com
EMAIL_PROVIDER=ses
```

## UI/UX Features

### Progress Indicator

Shows current step with icons:

- 📧 Email Verification
- 🛡️ OTP Verification
- ✅ Account Creation

### Smart Navigation

- Back buttons for step navigation
- Error handling with clear messages
- Success feedback at each step

### Timer Display

- Countdown for OTP resend eligibility
- Visual feedback for remaining time

## Testing

### Development Mode

1. Start your development server
2. Go to `/signup/mess-owner`
3. Enter any valid email format
4. Check console for OTP (also shown in success message)
5. Enter the OTP to proceed

### Production Testing

1. Configure your email provider
2. Test with real email addresses
3. Verify emails are delivered properly
4. Test error scenarios (expired OTP, wrong OTP, etc.)

## Customization

### OTP Length

Change in `src/lib/otpStore.ts`:

```typescript
export function generateOTP(): string {
  // Current: 6-digit (100000-999999)
  return Math.floor(100000 + Math.random() * 900000).toString();

  // For 4-digit:
  // return Math.floor(1000 + Math.random() * 9000).toString();
}
```

### OTP Expiry Time

Change in `src/app/api/auth/otp/send/route.ts`:

```typescript
const expiresAt = Date.now() + 10 * 60 * 1000; // Current: 10 minutes
// For 5 minutes: Date.now() + 5 * 60 * 1000
```

### Email Templates

Modify templates in `src/lib/emailService.ts` to match your branding.

## Production Considerations

### Storage

Current implementation uses in-memory storage. For production:

- Use Redis for distributed systems
- Use database with TTL for persistence
- Consider rate limiting per IP/email

### Email Delivery

- Configure SPF/DKIM records for your domain
- Monitor email delivery rates
- Implement email bounce handling
- Add unsubscribe links for compliance

### Security Enhancements

- Add IP-based rate limiting
- Implement CAPTCHA for suspicious activity
- Log authentication attempts
- Monitor for abuse patterns

## Error Scenarios Handled

- ❌ Invalid email format
- ❌ Email already registered
- ❌ OTP not found/expired
- ❌ Wrong OTP entered
- ❌ Missing required fields
- ❌ Email sending failures
- ❌ Network/server errors

## Benefits

1. **Prevents Fake Registrations**: Only verified emails can create accounts
2. **Reduces Spam**: Email verification acts as a natural filter
3. **Improves Trust**: Shows platform takes security seriously
4. **Better Data Quality**: Ensures contact information is valid
5. **Fraud Prevention**: Makes it harder to create multiple fake accounts

This OTP verification system provides a robust, user-friendly way to verify mess owners during registration while maintaining security and preventing abuse.
