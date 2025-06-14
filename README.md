# Zella Trade Scribe 📈

A modern, feature-rich trading journal application built with React, TypeScript, and Firebase. Inspired by professional trading platforms like Tradezella, Tradervue, and TraderSync.

## ✨ Features

### 📊 Trading Management
- **Trade Logging**: Comprehensive trade entry with all essential fields
- **Real-time Synchronization**: Automatic data sync across devices
- **Trade Analytics**: P&L tracking, win rate, profit factor, and more
- **Trade Status**: Track open and closed positions
- **Risk Management**: R-multiple calculation and risk tracking

### 📖 Journal & Documentation
- **Daily Journal**: Record thoughts, market observations, and lessons learned
- **Trading Playbooks**: Create and manage trading strategies and setups
- **Trade Notes**: Detailed notes for each trade including emotions and market conditions

### 📈 Analytics & Insights
- **Performance Metrics**: Total P&L, win rate, profit factor, average win/loss
- **Visual Charts**: Performance visualization with Recharts
- **Calendar Integration**: Track trading activity by date
- **Filtering & Sorting**: Advanced trade filtering and sorting capabilities

### 🔐 Authentication & Security
- **Email/Password Authentication**: Secure user registration and login
- **Google OAuth**: Quick sign-in with Google
- **Password Reset**: Secure password recovery
- **User Profiles**: Personalized user experience

### 🔄 Data Migration
- **Automatic Migration**: Seamless transition from localStorage to Firebase
- **Data Backup**: Export and backup capabilities
- **Real-time Updates**: Live data synchronization across devices

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd zella-trade-scribe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Firebase**
   ```bash
   npm install firebase
   ```

4. **Set up Firebase**
   - Follow the [Firebase Setup Guide](./Firebase_Setup_Guide.md)
   - Create a Firebase project
   - Enable Authentication and Firestore
   - Get your Firebase configuration

5. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your Firebase configuration in the `.env` file:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

## 🏗️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework

### UI Components
- **shadcn/ui** - Beautiful and accessible React components
- **Radix UI** - Low-level UI primitives
- **Lucide React** - Beautiful icons
- **Recharts** - Composable charting library

### Backend & Data
- **Firebase** - Backend-as-a-Service
- **Firestore** - NoSQL document database
- **Firebase Auth** - Authentication service
- **Firebase Storage** - File storage (for screenshots)

### State Management
- **React Context** - Global state management
- **React Query** - Server state management
- **React Hook Form** - Form state management

### Validation & Forms
- **Zod** - TypeScript-first schema validation
- **React Hook Form** - Performant forms with easy validation

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── AuthForm.tsx    # Authentication component
│   ├── Dashboard.tsx   # Main dashboard
│   ├── TradeLog.tsx    # Trade listing and management
│   ├── AddTrade.tsx    # Trade entry form
│   └── ...
├── contexts/           # React contexts
│   ├── AuthContext.tsx # Authentication state
│   └── TradeContext.tsx # Trade data state
├── lib/               # Utility libraries
│   ├── firebase.ts    # Firebase configuration
│   ├── firebaseService.ts # Firebase CRUD operations
│   ├── authService.ts # Authentication services
│   └── dataMigration.ts # Migration utilities
├── types/             # TypeScript type definitions
│   └── trade.ts       # Trade-related types
├── hooks/             # Custom React hooks
└── pages/             # Page components
```

## 🔥 Firebase Setup

### Required Services
1. **Authentication** - Email/Password and Google providers
2. **Firestore Database** - Document storage
3. **Storage** (Optional) - For trade screenshots

### Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## 📊 Data Structure

### Trade Model
```typescript
interface Trade {
  id: string;
  symbol: string;
  date: string;
  timeIn: string;
  timeOut?: string;
  side: 'long' | 'short';
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  pnl?: number;
  commission: number;
  stopLoss?: number;
  takeProfit?: number;
  strategy?: string;
  marketConditions?: string;
  timeframe?: string;
  confidence?: number;
  emotions?: string;
  notes?: string;
  screenshots?: string[];
  status: 'open' | 'closed';
  riskAmount?: number;
  rMultiple?: number;
}
```

## 🔄 Migration from localStorage

The app automatically migrates existing localStorage data to Firebase:

1. **Automatic Detection**: Checks for existing localStorage data on sign-in
2. **One-time Migration**: Migrates trades, journal entries, and playbooks
3. **Data Validation**: Ensures data integrity during migration
4. **Cleanup**: Removes localStorage data after successful migration

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Environment Variables for Production
Set up environment variables in your hosting platform or use Firebase configuration.

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style
- **ESLint** - Code linting
- **TypeScript** - Type checking
- **Prettier** - Code formatting (recommended)

## 🔍 Features Roadmap

### ✅ Completed
- User authentication (email/password, Google)
- Trade CRUD operations
- Real-time data synchronization
- Dashboard with key metrics
- Data migration from localStorage
- Responsive design

### 🚧 In Progress
- Trade import/export functionality
- Advanced analytics and reporting
- Trading strategy backtesting
- Performance comparison tools

### 📋 Planned
- Mobile app (React Native)
- Advanced charting integration
- AI-powered trade insights
- Multi-timeframe analysis
- Community features
- API integrations with brokers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 [Firebase Setup Guide](./Firebase_Setup_Guide.md)
- 🐛 [Issue Tracker](https://github.com/your-repo/issues)
- 📧 [Email Support](mailto:support@example.com)

## 🙏 Acknowledgments

- Inspired by [Tradezella](https://tradezella.com/), [Tradervue](https://www.tradervue.com/), and [TraderSync](https://tradersync.com/)
- Built with [shadcn/ui](https://ui.shadcn.com/) components
- Icons by [Lucide](https://lucide.dev/)
- Charts by [Recharts](https://recharts.org/)

---

Made with ❤️ for traders, by traders.
