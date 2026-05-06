# 🚀 Firebase Cloud Functions Deployment Guide

## Overview

The `functions/` directory contains Cloud Functions that handle:

- ✅ OTP sending & verification (Firebase Phone Auth)
- ✅ reCAPTCHA verification
- ✅ User creation & profile setup
- ✅ Rate limiting
- ✅ OTP expiration cleanup

## Prerequisites

1. **Firebase CLI installed**

   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase project created** at https://console.firebase.google.com

3. **Blaze plan enabled** (Functions requires pay-as-you-go)
   - Free tier doesn't support Cloud Functions
   - Enable billing at https://console.firebase.google.com/billing

## Setup Steps

### Step 1: Initialize Firebase in functions folder

```bash
cd functions
npm install
npm run build
```

### Step 2: Configure Environment Variables

1. Create `.env.local` from `.env.example`:

   ```bash
   cp .env.example .env.local
   ```

2. Get reCAPTCHA Secret Key:
   - Go to https://www.google.com/recaptcha/admin
   - Create new site (choose reCAPTCHA v3)
   - Copy SECRET KEY to `.env.local`

3. (Optional) Configure Twilio for SMS:
   - Sign up at https://www.twilio.com
   - Copy Account SID & Auth Token to `.env.local`

### Step 3: Deploy Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:sendOTP

# Deploy with environment variables
firebase functions:config:set recaptcha.secret_key="your_key_here"
```

### Step 4: Get Function URLs

After deployment, you'll see URLs like:

```
✔  functions[sendOTP]: https://us-central1-yourproject.cloudfunctions.net/sendOTP
✔  functions[verifyOTP]: https://us-central1-yourproject.cloudfunctions.net/verifyOTP
```

### Step 5: Update App Configuration

Update `.env.local` in app root:

```env
EXPO_PUBLIC_BACKEND_URL=https://us-central1-yourproject.cloudfunctions.net
EXPO_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

## Local Testing

### Test locally with emulator:

```bash
cd functions
npm run serve
```

This starts the Firebase emulator on `http://localhost:5001`

### Test OTP function:

```bash
curl -X POST http://localhost:5001/yourproject/us-central1/sendOTP \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+919876543210",
    "recaptchaToken": "test_token"
  }'
```

## API Endpoints

### 1. Send OTP

**POST** `/sendOTP`

```json
{
  "phoneNumber": "+919876543210",
  "recaptchaToken": "recaptcha_token_from_client"
}
```

**Response:**

```json
{
  "success": true,
  "message": "OTP sent to +919876543210",
  "otp": "123456" // Only in development
}
```

### 2. Verify OTP

**POST** `/verifyOTP`

```json
{
  "phoneNumber": "+919876543210",
  "otp": "123456",
  "userData": {
    "name": "John Doe",
    "shopName": "ABC Kirana Store"
  }
}
```

**Response:**

```json
{
  "success": true,
  "customToken": "firebase_custom_token",
  "user": {
    "uid": "user_id",
    "phoneNumber": "+919876543210",
    "displayName": "John Doe"
  }
}
```

### 3. Resend OTP

**POST** `/resendOTP`

```json
{
  "phoneNumber": "+919876543210",
  "recaptchaToken": "recaptcha_token_from_client"
}
```

## Environment Variables

| Variable               | Description                   | Required |
| ---------------------- | ----------------------------- | -------- |
| `RECAPTCHA_SECRET_KEY` | Google reCAPTCHA v3 secret    | ✅ Yes   |
| `TWILIO_ACCOUNT_SID`   | Twilio account ID             | ❌ No    |
| `TWILIO_AUTH_TOKEN`    | Twilio auth token             | ❌ No    |
| `TWILIO_PHONE_NUMBER`  | Twilio phone number           | ❌ No    |
| `ENVIRONMENT`          | 'development' or 'production' | ❌ No    |

## Firestore Collections Created

### `_otp_temp`

Temporary OTP storage (auto-deleted after 5 minutes)

```
{
  phoneNumber: "+919876543210",
  otp: "123456",
  expiresAt: 1234567890,
  attempts: 0,
  createdAt: 1234567890
}
```

### `_metadata`

Rate limiting information

```
{
  "otp_limit:+919876543210": {
    count: 3,
    timestamp: 1234567890
  }
}
```

### `users`

User profiles created automatically on first login

```
{
  uid: "user_123",
  phoneNumber: "+919876543210",
  name: "John Doe",
  shopName: "My Store",
  role: "admin",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### `shops`

Shop information created on first user signup

```
{
  ownerPhone: "+919876543210",
  name: "My Store",
  ownerName: "John Doe",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Security Rules

These functions are protected by:

- ✅ reCAPTCHA v3 verification
- ✅ Rate limiting (5 OTP requests/hour per phone)
- ✅ OTP expiration (5 minutes)
- ✅ Attempt limiting (5 failed attempts)
- ✅ CORS enabled for mobile apps
- ✅ Phone number validation

## Troubleshooting

### "Missing RECAPTCHA_SECRET_KEY"

- Get key from Google reCAPTCHA dashboard
- Set via `firebase functions:config:set`
- Or create `.env.local` file

### "Blaze plan required"

- Cloud Functions need pay-as-you-go
- Enable billing in Firebase Console
- Functions are still mostly free (free tier first 2M calls)

### "OTP not being sent"

- Check Firestore has write permissions
- Verify Twilio config (if using SMS)
- Check Cloud Functions logs: `firebase functions:log`

### "CORS errors"

- CORS is enabled in code
- Check function is deployed
- Verify backend URL in `.env.local`

## Monitoring

### View logs:

```bash
firebase functions:log
```

### Monitor in Firebase Console:

- https://console.firebase.google.com/functions

### Check function performance:

- Invocation count
- Execution time
- Error rate
- Memory usage

## Next Steps

1. ✅ Deploy functions: `firebase deploy --only functions`
2. ✅ Get function URL
3. ✅ Update app `.env.local`
4. ✅ Test OTP flow in app
5. ✅ Monitor in Firebase Console

## Advanced: Twilio SMS Integration

To send actual SMS instead of just logging:

```typescript
async function sendOTPViaTwilio(phoneNumber: string, otp: string) {
  const client = twilio(CONFIG.TWILIO_ACCOUNT_SID, CONFIG.TWILIO_AUTH_TOKEN);

  await client.messages.create({
    body: `Your Khata OTP is: ${otp}. Valid for 5 minutes.`,
    from: CONFIG.TWILIO_PHONE_NUMBER,
    to: phoneNumber,
  });
}
```

## Costs

**Firebase Functions Pricing:**

- First 2M invocations/month: FREE
- After that: $0.40 per million invocations
- Typical app with 100k users: ~$0.02-0.05/month

**Firestore Pricing:**

- Included in existing plan
- OTP temporary collection auto-deletes

**Total Cost:** Minimal to free for small-medium apps

---

**Questions?** See [FIREBASE_SETUP.md](../FIREBASE_SETUP.md) for more Firebase help.
