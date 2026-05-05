# Khata App - Firebase Setup Guide

## 📋 Prerequisites

Before you start, make sure you have:

- Firebase account (create at https://console.firebase.google.com)
- Expo CLI installed
- Node.js and npm installed

## 🔧 Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a new project"
3. Enter project name: "Khata-App"
4. Accept terms and create project
5. Wait for project to be created

## 📝 Step 2: Register App

1. In Firebase Console, click the web icon (</> button)
2. Register app with nickname: "Khata Web"
3. Copy the Firebase config credentials
4. Click "Continue to console"

## 🔑 Step 3: Environment Variables

Create a `.env.local` file in your project root:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## 🔐 Step 4: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get Started"
3. Enable **Phone** sign-in method
4. Configure reCAPTCHA settings
5. Save

**Note:** For Expo, phone authentication requires backend implementation. See `services/auth.ts` for mock implementation.

## 💾 Step 5: Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Start in **Production mode**
4. Choose location (closest to your users)
5. Click "Create"

## 📋 Step 6: Configure Security Rules

In Firestore, go to **Rules** tab and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin(shopId) {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.shopId == shopId;
    }

    function isStaff(shopId) {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.shopId == shopId;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated() && (resource.data.shopId == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.shopId || request.auth.uid == userId);
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && request.auth.uid == userId;
      allow delete: if isAdmin(resource.data.shopId);
    }

    // Shops collection
    match /shops/{shopId} {
      allow read: if isAuthenticated() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.shopId == shopId;
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && isAdmin(shopId);
      allow delete: if isAuthenticated() && isAdmin(shopId);
    }

    // Customers collection
    match /customers/{customerId} {
      allow read: if isAuthenticated() && isStaff(resource.data.shopId);
      allow create: if isAuthenticated() && isStaff(request.resource.data.shopId);
      allow update: if isAuthenticated() && (isAdmin(resource.data.shopId) || isStaff(resource.data.shopId));
      allow delete: if isAuthenticated() && isAdmin(resource.data.shopId);
    }

    // Transactions collection
    match /transactions/{transactionId} {
      allow read: if isAuthenticated() && isStaff(resource.data.shopId);
      allow create: if isAuthenticated() && isStaff(request.resource.data.shopId);
      allow update: if isAuthenticated() && isAdmin(resource.data.shopId);
      allow delete: if isAuthenticated() && isAdmin(resource.data.shopId);
    }
  }
}
```

## 🗄️ Step 7: Create Firestore Indexes

Go to **Firestore** → **Indexes** and create:

1. **Collection: transactions**
   - Fields: `shopId` (Ascending), `createdAt` (Descending)
2. **Collection: customers**
   - Fields: `shopId` (Ascending), `status` (Ascending)

3. **Collection: transactions**
   - Fields: `customerId` (Ascending), `createdAt` (Descending)

## 📦 Step 8: Set Up Backend (Optional)

For production phone authentication, set up Cloud Functions:

```bash
firebase init functions
```

See `config/firebaseRules.ts` for more details.

## 🚀 Step 9: Run App

```bash
# Install dependencies
npm install

# Start Expo
npm start

# Choose platform
# Press 'i' for iOS simulator
# Press 'a' for Android emulator
# Scan QR code for device
```

## 🧪 Step 10: Test with Sample Data

The app uses mock authentication by default. To test:

1. Open login screen
2. Enter any 10-digit phone number
3. Enter OTP: 123456
4. Fill shop and name details
5. Click "Verify & Continue"

## ⚠️ Important Notes

### Authentication

- Current implementation uses mock authentication
- For production, implement Firebase Phone Auth with reCAPTCHA
- Requires backend verification service

### Data Structure

**Users Collection:**

```json
{
  "id": "user_123",
  "phone": "9876543210",
  "name": "John Doe",
  "role": "admin",
  "shopId": "shop_123",
  "createdAt": "2024-01-01",
  "updatedAt": "2024-01-01"
}
```

**Shops Collection:**

```json
{
  "id": "shop_123",
  "name": "ABC Kirana Store",
  "ownerPhone": "9876543210",
  "createdAt": "2024-01-01",
  "updatedAt": "2024-01-01"
}
```

**Customers Collection:**

```json
{
  "id": "customer_123",
  "shopId": "shop_123",
  "name": "Ramesh Kumar",
  "phone": "9999999999",
  "address": "123 Main St",
  "email": "ramesh@email.com",
  "balance": 5000,
  "lastTransactionDate": "2024-01-15",
  "status": "active",
  "createdAt": "2024-01-01",
  "updatedAt": "2024-01-15"
}
```

**Transactions Collection:**

```json
{
  "id": "txn_123",
  "customerId": "customer_123",
  "shopId": "shop_123",
  "type": "credit",
  "amount": 1500,
  "note": "Purchased rice and dal",
  "createdAt": "2024-01-15",
  "updatedAt": "2024-01-15"
}
```

## 🔍 Firestore Optimization

### Indexing

- Create composite indexes for frequently filtered queries
- Use single-field indexes for sorting

### Pagination

- Implement cursor-based pagination for large datasets
- Use `startAfter()` for efficient queries

### Real-time Updates

- Use onSnapshot() for live updates
- Unsubscribe listeners when components unmount

## 🚨 Troubleshooting

### "Permission Denied" Errors

- Check Firestore security rules
- Ensure user has `shopId` field
- Verify `role` is set correctly

### "No Index" Errors

- Firestore will suggest index creation
- Click the link in console to auto-create

### Authentication Not Working

- Verify Firebase config in `.env.local`
- Check reCAPTCHA settings
- For phone auth, implement backend service

## 📚 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/start)
- [React Native Firebase Guide](https://rnfirebase.io)
- [Expo Documentation](https://docs.expo.dev)

## 💡 Production Checklist

- [ ] Replace mock authentication with real Firebase Auth
- [ ] Implement backend phone verification service
- [ ] Enable HTTPS for all API calls
- [ ] Set up proper error logging
- [ ] Configure Firebase backup rules
- [ ] Enable SSL for Firebase realtime database
- [ ] Test with production data
- [ ] Set up monitoring and alerts
- [ ] Implement rate limiting
- [ ] Review and test security rules

---

**Version:** 1.0.0  
**Last Updated:** January 2024
