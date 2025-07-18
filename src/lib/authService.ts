import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// User profile interface
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  lastLoginAt: Date;
  preferences?: {
    currency: string;
    timezone: string;
    theme: string;
  };
}

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

export const authService = {
  // Sign up with email and password
  async signUp(email: string, password: string, displayName: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update user profile
      await updateProfile(user, { displayName });
      
      // Create user document in Firestore
      await this.createUserProfile(user, { displayName });
      
      return user;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  },

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login
      await this.updateLastLogin(userCredential.user.uid);
      
      return userCredential.user;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  },

  // Sign in with Google
  async signInWithGoogle(): Promise<User> {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;
      
      // Check if user profile exists, create if not
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await this.createUserProfile(user);
      } else {
        await this.updateLastLogin(user.uid);
      }
      
      return user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  },

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },

  // Reset password
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  },

  // Create user profile in Firestore
  async createUserProfile(user: User, additionalData?: { displayName?: string; [key: string]: unknown }): Promise<void> {
    try {
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName: additionalData?.displayName || user.displayName || '',
        photoURL: user.photoURL || undefined,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        preferences: {
          currency: 'USD',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          theme: 'light',
        },
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  },

  // Update last login
  async updateLastLogin(uid: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, { lastLoginAt: new Date() }, { merge: true });
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  },

  // Get user profile
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      return userDoc.exists() ? (userDoc.data() as UserProfile) : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  },

  // Subscribe to auth state changes
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  },

  // Get current user
  getCurrentUser(): User | null {
    return auth.currentUser;
  },
};
