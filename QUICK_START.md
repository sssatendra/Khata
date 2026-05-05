# 🚀 Khata App - Quick Start Guide

## ⚡ 5-Minute Setup

### 1. Install Dependencies

```bash
cd khata
npm install
```

### 2. Start the App

```bash
npm start
```

### 3. Open in Simulator/Device

```
Press 'i' for iOS simulator
Press 'a' for Android emulator
Scan QR code for device
```

### 4. Test Login

- **Phone**: 9876543210 (any 10 digits)
- **OTP**: 123456
- **Shop Name**: My Store
- **Name**: John Doe
- Click **Verify & Continue**

### 5. Try Features

- ✅ Go to **Customers** tab → Add a customer
- ✅ Select customer → Add transaction (Credit/Debit)
- ✅ View **Dashboard** for analytics
- ✅ Check **Analytics** tab for insights

---

## 📋 What's Included

### ✅ Core Features

- 📱 Phone OTP authentication (mock)
- 👥 Customer management (add, edit, delete)
- 💰 Transaction ledger (credit, debit)
- 📊 Dashboard with analytics
- 🔴 Risk assessment (Low/Medium/High)
- 💬 WhatsApp integration
- 📴 Offline support
- ⚙️ Settings screen

### ✅ Technical Features

- TypeScript for type safety
- Zustand for state management
- Firestore for database (ready)
- AsyncStorage for offline
- React Native Reanimated animations
- Responsive design

### ✅ Documentation

- Complete README
- Firebase setup guide
- Implementation summary
- Type definitions
- Code comments

---

## 🎯 Next Steps

### For Development

1. Read `FIREBASE_SETUP.md` to configure Firebase
2. Replace mock auth with real Firebase Auth
3. Update `.env.local` with Firebase credentials
4. Test with real Firestore database

### For Production

1. Set up Firebase project
2. Configure phone authentication
3. Deploy app to App Store/Play Store
4. Set up cloud functions
5. Monitor with Firebase Analytics

---

## 📁 File Structure

```
khata/
├── app/                    # Navigation & pages
├── screens/               # Main screens
├── components/            # UI components
├── services/             # Firebase services
├── store/                # State management
├── hooks/                # Custom hooks
├── utils/                # Helpers
├── types/                # TypeScript types
├── config/               # Configuration
├── package.json          # Dependencies
├── FIREBASE_SETUP.md     # Firebase guide
├── README_NEW.md         # Full documentation
├── IMPLEMENTATION_SUMMARY.md
└── .env.example          # Env template
```

---

## 🔑 Key Files to Know

| File                       | What it does               |
| -------------------------- | -------------------------- |
| `app/_layout.tsx`          | Main app navigation        |
| `app/(tabs)/dashboard.tsx` | Dashboard screen           |
| `services/firestore.ts`    | Database operations        |
| `store/authStore.ts`       | Authentication state       |
| `store/dataStore.ts`       | Customer/Transaction state |
| `components/ui/Button.tsx` | Animated button            |
| `types/index.ts`           | TypeScript definitions     |

---

## 💡 Common Tasks

### Add New Screen

1. Create file in `app/` or `screens/`
2. Export component
3. Add to navigation in `_layout.tsx`

### Add New Data Field

1. Update type in `types/index.ts`
2. Update Firestore service
3. Update UI components

### Add Feature

1. Create service in `services/`
2. Create store in `store/` (if needed)
3. Create screens
4. Add navigation
5. Test

---

## 🧪 Testing

### Test Users

```
Phone: 9876543210 (or any 10 digits)
OTP: 123456
Role: Admin
```

### Test Transactions

```
Credit (Udhar): +1000
Debit (Payment): -500
Check running balance
```

### Test Search

```
Type customer name → Results appear
Type phone → Filtered list
Clear search → Back to all
```

---

## 🐛 Troubleshooting

### App won't start

```bash
npm start -- --reset-cache
rm -rf node_modules && npm install
```

### Firebase errors

- Check `.env.local` file
- Verify Firebase credentials
- Check Firestore rules

### UI looks wrong

- Clear simulator cache
- Rebuild app
- Check React Native version

---

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [Firebase Docs](https://firebase.google.com/docs)
- [Zustand GitHub](https://github.com/pmndrs/zustand)

---

## 🚀 Deploy

### To Test Device

1. Run `npm start`
2. Scan QR code with phone camera
3. App opens in Expo Go

### To App Store

1. Set up Apple Developer account
2. Run `expo build:ios`
3. Upload to App Store

### To Play Store

1. Set up Google Play account
2. Run `expo build:android`
3. Upload to Play Store

---

## 💬 Features Explained

### Dashboard

- Shows total outstanding amount
- Lists high-risk customers
- Quick action buttons
- Recent transactions

### Customers

- Search and filter
- View all customers
- Sorted by balance
- Color-coded risk levels

### Analytics

- Total metrics
- Top debtors
- Recent transactions
- Smart insights

### Transactions

- Record credit (Udhar)
- Record payment (Debit)
- Add notes
- Auto-calculate balance

### Ledger

- Full history
- Running balance
- Transaction details
- Sorted chronologically

---

## ✨ Tips & Tricks

**Fast Navigation**

- Swipe back on iOS
- Tap back button on Android
- Use tab bar to jump between screens

**Search Tips**

- Search by first letter
- Search by phone
- Fuzzy matching enabled

**Risk Management**

- 🟢 Green = Safe
- 🟠 Orange = Watch
- 🔴 Red = Action needed

**WhatsApp Message**

- Pre-filled with balance
- Days overdue calculated
- One-tap send

---

## 📞 Need Help?

1. Check `FIREBASE_SETUP.md` for Firebase issues
2. Check `README_NEW.md` for features
3. Check `IMPLEMENTATION_SUMMARY.md` for architecture
4. Check inline code comments

---

**Ready to build? Start with `npm start`! 🚀**
