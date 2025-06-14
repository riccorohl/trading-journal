# Firebase Setup Guide for Zella Trade Scribe

## Prerequisites

1. **Install Firebase CLI** (if you haven't already):
   ```bash
   npm install -g firebase-tools
   ```

2. **Install Firebase SDK** (add this to your project):
   ```bash
   npm install firebase
   ```

## Firebase Project Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `zella-trade-scribe` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication

1. In the Firebase console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable these providers:
   - **Email/Password**: Click and toggle "Enable"
   - **Google**: Click, toggle "Enable", add your email in the support email field

### 3. Create Firestore Database

1. Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location closest to your users
5. Click "Done"

### 4. Get Firebase Configuration

1. In Project Overview, click the gear icon ⚙️
2. Click "Project settings"
3. Scroll down to "Your apps"
4. Click the "</>" (Web) icon
5. Register your app with nickname: "zella-trade-scribe-web"
6. Copy the `firebaseConfig` object

### 5. Update Firebase Configuration

Replace the placeholder values in `src/lib/firebase.ts` with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-actual-app-id"
};
```

### 6. Configure Firestore Security Rules (Optional for Production)

In the Firebase console, go to Firestore → Rules and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Allow access to user's sub-collections
      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### 7. Configure Firebase Storage (Optional - for trade screenshots)

1. Go to "Storage" in Firebase console
2. Click "Get started"
3. Choose "Start in test mode"
4. Select a location
5. Click "Done"

## Development vs Production

### Test Mode (Development)
- Firestore rules allow all reads/writes
- Good for development and testing

### Production Mode
- Implement proper security rules
- Set up environment variables for config
- Enable Firebase App Check for additional security

## Environment Variables (Recommended for Production)

Create a `.env` file in your project root:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

Then update `src/lib/firebase.ts` to use environment variables:

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

## Data Migration

The app includes automatic migration from localStorage to Firebase:

1. When a user first signs in, the app checks for existing trades in localStorage
2. If found and the user has no trades in Firebase, it migrates them automatically
3. After successful migration, localStorage data is cleared

## Features Implemented

### ✅ Authentication
- Email/password sign up and sign in
- Google OAuth sign in
- Password reset functionality
- User profile management

### ✅ Data Management
- Real-time trade synchronization
- User-specific data isolation
- Automatic localStorage migration
- Error handling and retries

### ✅ Security
- User-based data access control
- Firebase security rules ready
- Proper error handling

## Next Steps

1. **Install Firebase**: `npm install firebase`
2. **Set up Firebase project** following the steps above
3. **Update configuration** in `src/lib/firebase.ts`
4. **Test the application** with authentication and data persistence
5. **Deploy to production** when ready

## Troubleshooting

### Common Issues

1. **"Firebase: Error (auth/configuration-not-found)"**
   - Make sure you've added your web app to Firebase project
   - Check that all config values are correct

2. **"FirebaseError: Missing or insufficient permissions"**
   - Check Firestore security rules
   - Ensure user is authenticated before accessing data

3. **"Module not found: firebase"**
   - Run `npm install firebase`
   - Restart your development server

4. **Real-time updates not working**
   - Check your internet connection
   - Verify Firestore rules allow read access
   - Check browser console for errors

## Support

For additional help:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Getting Started](https://firebase.google.com/docs/firestore)
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
