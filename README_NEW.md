# 📱 Khata App - Digital Udhar Ledger

> **Digitize your kirana store's credit management with Khata - the all-in-one solution for managing customer credit (udhar), transactions, and payments.**

![Khata](https://img.shields.io/badge/React%20Native-Expo-blue)
![Firebase](https://img.shields.io/badge/Backend-Firebase-orange)
![License](https://img.shields.io/badge/License-MIT-green)

## 🎯 What is Khata?

Khata is a modern mobile app that digitizes the traditional Indian "Udhar Ledger" (credit ledger). It helps kirana store owners:

✅ Manage customer credit quickly and efficiently  
✅ Track all transactions in real-time  
✅ Identify high-risk customers automatically  
✅ Send payment reminders via WhatsApp  
✅ View analytics and insights  
✅ Work offline with automatic sync

## 🚀 Key Features

### 📋 Customer Management

- Add, edit, and delete customers
- Instant search by name/phone with fuzzy matching
- View customer profile and transaction history
- Phone-based customer identification

### 💰 Transaction System

- Record credit purchases (Udhar)
- Track payments (Debit)
- Add notes to transactions
- Automatic balance calculation
- Complete transaction history with running balance

### 🔴 Risk Assessment

- Automatic risk level calculation
- High-risk alerts for overdue payments
- Color-coded risk indicators (🟢 Low, 🟠 Medium, 🔴 High)
- Days since last payment tracking

### 📊 Analytics Dashboard

- Total outstanding amount
- Customer statistics
- Top debtors list
- Recent transactions feed
- Smart insights

### 💬 WhatsApp Integration

- Pre-filled payment reminder messages
- One-tap WhatsApp messaging
- Automatic calculation of days overdue
- Deep linking for direct contact

### 🔐 Authentication

- Secure phone OTP login
- Session persistence
- Auto-login on app restart
- Role-based access control

### 📴 Offline Support

- Local data caching
- Automatic sync when online
- Works without internet
- Offline transaction recording

## 🛠️ Tech Stack

| Layer                | Technology                     |
| -------------------- | ------------------------------ |
| **Frontend**         | Expo React Native + TypeScript |
| **UI Library**       | React Native Paper             |
| **State Management** | Zustand                        |
| **Backend**          | Firebase                       |
| **Database**         | Firestore                      |
| **Authentication**   | Firebase Auth (Phone OTP)      |
| **Storage**          | AsyncStorage                   |
| **Search**           | Fuse.js (Fuzzy Search)         |
| **Animations**       | React Native Reanimated        |
| **Forms**            | React Native TextInput         |

## 📦 Installation

### Prerequisites

```bash
# Install Node.js (v16 or higher)
# Install Expo CLI
npm install -g expo-cli

# Install Git
```

### Setup

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/khata.git
cd khata
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure Firebase**
   Create `.env.local` file:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed Firebase setup guide.

4. **Start the app**

```bash
npm start

# Choose platform:
# Press 'i' for iOS simulator
# Press 'a' for Android emulator
# Scan QR code to open on device
```

## 📂 Project Structure

```
khata/
├── app/                          # Expo Router screens
│   ├── (tabs)/                  # Tab-based navigation
│   │   ├── dashboard.tsx        # Main dashboard
│   │   ├── customers.tsx        # Customers list
│   │   └── analytics.tsx        # Analytics & insights
│   ├── login.tsx                # Login screen
│   ├── add-customer.tsx         # Add customer form
│   ├── settings.tsx             # Settings screen
│   └── customer/[id].tsx        # Customer detail
├── screens/                      # Screen components
│   ├── LoginScreen.tsx
│   ├── DashboardScreen.tsx
│   ├── AddCustomerScreen.tsx
│   ├── TransactionScreen.tsx
│   └── CustomerDetailScreen.tsx
├── components/                   # Reusable components
│   └── ui/
│       ├── Button.tsx           # Animated button
│       ├── SearchBar.tsx        # Search component
│       ├── CustomerCard.tsx     # Customer card
│       └── StateIndicators.tsx  # Loading, Empty, Error states
├── services/                     # Business logic layer
│   ├── auth.ts                  # Authentication
│   └── firestore.ts             # Database operations
├── store/                        # Zustand state management
│   ├── authStore.ts             # Auth state
│   ├── dataStore.ts             # Data state
│   └── uiStore.ts               # UI state
├── hooks/                        # Custom React hooks
│   ├── useData.ts               # Data loading hooks
│   └── useStorage.ts            # Storage hooks
├── utils/                        # Utility functions
│   └── helpers.ts               # Helper functions
├── types/                        # TypeScript definitions
│   └── index.ts                 # Type definitions
├── config/                       # Configuration
│   ├── firebase.ts              # Firebase config
│   └── firebaseRules.ts         # Security rules
└── constants/                    # Constants
    └── theme.ts                 # Design tokens
```

## 🎨 Design System

### Colors

- **Primary**: #2563EB (Blue)
- **Success**: #10B981 (Green)
- **Warning**: #F59E0B (Amber)
- **Danger**: #DC2626 (Red)
- **Background**: #F9FAFB (Light Gray)
- **Surface**: #FFFFFF (White)

### Typography

- **Display**: 28px, Bold (700)
- **Heading**: 20px, Bold (700)
- **Subheading**: 16px, Semibold (600)
- **Body**: 14px, Regular (400)
- **Small**: 12px, Regular (400)

### Spacing

- **xs**: 4px
- **sm**: 8px
- **md**: 12px
- **lg**: 16px
- **xl**: 24px
- **2xl**: 32px

## 🔄 Data Flow

```
User Input → Component → Zustand Store → Firebase Service → Firestore
     ↓                                                            ↓
  AsyncStorage ← Zustand Store ← Local Cache ← Real-time Listeners
```

## 🔐 Security

### Authentication

- Phone OTP verification
- Session persistence
- Secure token storage

### Data Protection

- Firestore security rules
- Role-based access control
- Data validation
- Input sanitization

### Privacy

- No third-party access
- Encrypted storage
- HTTPS only
- GDPR compliant

## 📚 API Reference

### Customer Service

```typescript
// Create customer
await customerService.createCustomer(customerData);

// Get customer
await customerService.getCustomer(customerId);

// Update customer
await customerService.updateCustomer(customerId, updates);

// Search customers
await customerService.searchCustomers(shopId, phone);
```

### Transaction Service

```typescript
// Create transaction
await transactionService.createTransaction(transactionData);

// Get transactions
await transactionService.getTransactionsByCustomer(customerId);

// Get ledger
await transactionService.getCustomerLedger(customerId);
```

### Authentication Service

```typescript
// Send OTP
await authService.sendOTP(phoneNumber);

// Verify OTP
await authService.verifyOTP(phoneNumber, otp);

// Sign out
await authService.signOut();
```

## 🚀 Usage Guide

### Adding a Customer

1. Go to **Customers** tab
2. Click **➕ Add Customer** button
3. Fill in details:
   - Customer Name (required)
   - Phone Number (required, 10 digits)
   - Address (optional)
   - Email (optional)
4. Click **Add Customer**

### Recording a Transaction

1. Select customer from **Customers** or **Dashboard**
2. Click **➕ Add Transaction**
3. Choose transaction type:
   - **Udhar**: Customer purchased on credit
   - **Payment**: Customer paid you
4. Enter amount and optional note
5. Click **Add Transaction**

### Viewing Ledger

1. Select any customer
2. View full transaction history
3. See running balance after each transaction
4. Filter and search transactions

### Sending WhatsApp Message

1. Open customer detail
2. Click **💬 WhatsApp** button
3. Pre-filled message will open WhatsApp
4. Review and send

### Analyzing Metrics

1. Go to **Analytics** tab
2. View key metrics
3. See top debtors
4. Check recent transactions
5. Read insights

## 🧪 Testing

### Test Credentials

- **Phone**: Any 10-digit number
- **OTP**: 123456
- **Shop Name**: Test Shop
- **Name**: Test User

### Mock Data

The app comes with mock data for testing. To use real Firebase:

1. Set up Firebase project (see FIREBASE_SETUP.md)
2. Update `.env.local` with credentials
3. Restart app

## 📈 Performance Optimization

### Implemented

- ✅ Pagination for large datasets
- ✅ Optimized Firestore queries with indexes
- ✅ Local caching with AsyncStorage
- ✅ Lazy loading of components
- ✅ Efficient re-renders with Zustand

### Best Practices

- Use pagination for 100+ records
- Create Firestore indexes
- Debounce search queries
- Unsubscribe from listeners
- Profile with React DevTools

## 🐛 Troubleshooting

### App crashes on startup

- Clear cache: `npm start -- --reset-cache`
- Delete node_modules: `rm -rf node_modules && npm install`

### Firebase authentication not working

- Check `.env.local` credentials
- Verify Firebase project is active
- Check Firestore rules

### Data not syncing

- Check internet connection
- Verify Firebase security rules
- Check browser console for errors

### Performance issues

- Check AsyncStorage size
- Reduce Firestore read/writes
- Optimize re-renders
- Profile with React Profiler

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Standards

- TypeScript for all files
- 2-space indentation
- Comment complex logic
- Test before submitting PR

## 📋 Roadmap

### Phase 1 (Current)

- ✅ Customer management
- ✅ Transaction ledger
- ✅ Basic analytics
- ✅ WhatsApp integration

### Phase 2 (Planned)

- 📅 PDF export
- 📅 Multi-shop support
- 📅 Customer app (view their balance)
- 📅 Voice-based entry (Hindi/English)
- 📅 Barcode billing

### Phase 3 (Future)

- 🔮 AI-powered risk prediction
- 🔮 Automatic payment reminders
- 🔮 Integration with payment gateways
- 🔮 Advanced analytics
- 🔮 Inventory management

## 📝 License

MIT License - see LICENSE file for details

## 👨‍💼 Support

- **Documentation**: See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
- **Issues**: Create an issue on GitHub
- **Email**: support@khata.app
- **WhatsApp**: Contact us on WhatsApp

## 🙏 Acknowledgments

Built with ❤️ for Indian kirana store owners.

---

**Made with Expo React Native + Firebase**  
**Version 1.0.0** | **Last Updated: January 2024**
