import {
  doc,
  setDoc,
  getDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Layout } from 'react-grid-layout';

// User dashboard document path
const getUserDashboardDoc = (userId: string) => 
  doc(db, 'users', userId, 'dashboard', 'layout');

// Dashboard layout interface
export interface DashboardLayout {
  layouts: Layout[];
  mainWidgets: string[];
  lastUpdated: string;
}

interface FirestoreData {
  layouts?: Layout[];
  mainWidgets?: string[];
  lastUpdated?: Timestamp | string;
}

// Convert Firestore document to DashboardLayout object
const convertFirestoreToDashboard = (data: FirestoreData): DashboardLayout => ({
  layouts: data.layouts || [],
  mainWidgets: data.mainWidgets || [],
  lastUpdated: data.lastUpdated instanceof Timestamp 
    ? data.lastUpdated.toDate().toISOString() 
    : (data.lastUpdated || new Date().toISOString()),
});

// Convert DashboardLayout object to Firestore document
const convertDashboardToFirestore = (layout: DashboardLayout) => ({
  layouts: layout.layouts,
  mainWidgets: layout.mainWidgets,
  lastUpdated: Timestamp.now(),
});

// Dashboard Service
export const dashboardService = {
  // Save user's dashboard layout
  async saveUserLayout(userId: string, layouts: Layout[], mainWidgets: string[]): Promise<void> {
    try {
      console.log('Saving dashboard layout for user:', userId);
      const dashboardDoc = getUserDashboardDoc(userId);
      
      const dashboardData: DashboardLayout = {
        layouts,
        mainWidgets,
        lastUpdated: new Date().toISOString(),
      };
      
      const firestoreData = convertDashboardToFirestore(dashboardData);
      await setDoc(dashboardDoc, firestoreData);
      
      console.log('Dashboard layout saved successfully');
    } catch (error) {
      console.error('Error saving dashboard layout:', error);
      throw error;
    }
  },

  // Get user's dashboard layout
  async getUserLayout(userId: string): Promise<DashboardLayout | null> {
    try {
      console.log('Loading dashboard layout for user:', userId);
      const dashboardDoc = getUserDashboardDoc(userId);
      const docSnap = await getDoc(dashboardDoc);
      
      if (docSnap.exists()) {
        const layout = convertFirestoreToDashboard(docSnap.data());
        console.log('Dashboard layout loaded successfully');
        return layout;
      } else {
        console.log('No saved dashboard layout found');
        return null;
      }
    } catch (error) {
      console.error('Error loading dashboard layout:', error);
      throw error;
    }
  },

  // Delete user's dashboard layout (reset to default)
  async resetUserLayout(userId: string): Promise<void> {
    try {
      console.log('Resetting dashboard layout for user:', userId);
      const dashboardDoc = getUserDashboardDoc(userId);
      
      // Save empty layout to reset to defaults
      await setDoc(dashboardDoc, {
        layouts: [],
        mainWidgets: [],
        lastUpdated: Timestamp.now(),
      });
      
      console.log('Dashboard layout reset successfully');
    } catch (error) {
      console.error('Error resetting dashboard layout:', error);
      throw error;
    }
  },
};
