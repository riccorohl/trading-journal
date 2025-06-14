import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  DocumentData,
  QuerySnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { Trade } from '../types/trade';

// Collection names
const TRADES_COLLECTION = 'trades';
const JOURNALS_COLLECTION = 'journals';
const PLAYBOOKS_COLLECTION = 'playbooks';

// User-specific collection paths
const getUserTradesCollection = (userId: string) => 
  collection(db, 'users', userId, TRADES_COLLECTION);

const getUserJournalsCollection = (userId: string) => 
  collection(db, 'users', userId, JOURNALS_COLLECTION);

const getUserPlaybooksCollection = (userId: string) => 
  collection(db, 'users', userId, PLAYBOOKS_COLLECTION);

// Convert Firestore document to Trade object
const convertFirestoreToTrade = (doc: DocumentData): Trade => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    // Keep dates as strings to avoid timezone conversion issues
    date: data.date, // Keep as-is since we're storing as YYYY-MM-DD strings
    timeIn: data.timeIn instanceof Timestamp ? data.timeIn.toDate().toISOString() : data.timeIn,
    timeOut: data.timeOut instanceof Timestamp ? data.timeOut?.toDate().toISOString() : data.timeOut,
  } as Trade;
};

// Convert Trade object to Firestore document
const convertTradeToFirestore = (trade: Omit<Trade, 'id'>) => {
  // Remove undefined values to avoid Firebase errors
  const cleanedTrade = Object.entries(trade).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as any);

  return {
    ...cleanedTrade,
    // Convert date strings to Firestore timestamps if needed
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
};

// Trade CRUD Operations
export const tradeService = {
  // Add a new trade
  async addTrade(userId: string, trade: Omit<Trade, 'id'>): Promise<string> {
    try {
      console.log('Firebase addTrade called with:', { userId, trade });
      const tradesCollection = getUserTradesCollection(userId);
      console.log('Got trades collection:', tradesCollection);
      const tradeData = convertTradeToFirestore(trade);
      console.log('Converted trade data:', tradeData);
      const docRef = await addDoc(tradesCollection, tradeData);
      console.log('Successfully added trade with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding trade:', error);
      throw error;
    }
  },

  // Get all trades for a user
  async getTrades(userId: string): Promise<Trade[]> {
    try {
      const tradesCollection = getUserTradesCollection(userId);
      const q = query(tradesCollection, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(convertFirestoreToTrade);
    } catch (error) {
      console.error('Error getting trades:', error);
      throw error;
    }
  },

  // Get trades by date
  async getTradesByDate(userId: string, date: string): Promise<Trade[]> {
    try {
      const tradesCollection = getUserTradesCollection(userId);
      const q = query(tradesCollection, where('date', '==', date));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(convertFirestoreToTrade);
    } catch (error) {
      console.error('Error getting trades by date:', error);
      throw error;
    }
  },

  // Update a trade
  async updateTrade(userId: string, tradeId: string, updates: Partial<Trade>): Promise<void> {
    try {
      const tradeDoc = doc(getUserTradesCollection(userId), tradeId);
      await updateDoc(tradeDoc, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating trade:', error);
      throw error;
    }
  },

  // Delete a trade
  async deleteTrade(userId: string, tradeId: string): Promise<void> {
    try {
      const tradeDoc = doc(getUserTradesCollection(userId), tradeId);
      await deleteDoc(tradeDoc);
    } catch (error) {
      console.error('Error deleting trade:', error);
      throw error;
    }
  },

  // Subscribe to real-time updates
  subscribeToTrades(userId: string, callback: (trades: Trade[]) => void): () => void {
    const tradesCollection = getUserTradesCollection(userId);
    const q = query(tradesCollection, orderBy('date', 'desc'));
    
    return onSnapshot(q, (querySnapshot: QuerySnapshot) => {
      const trades = querySnapshot.docs.map(convertFirestoreToTrade);
      callback(trades);
    }, (error) => {
      console.error('Error in trades subscription:', error);
    });
  },
};

// Journal Entry interface
export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood?: string;
  marketConditions?: string;
  lessonsLearned?: string;
  goals?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Journal CRUD Operations
export const journalService = {
  // Add a new journal entry
  async addJournalEntry(userId: string, entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const journalsCollection = getUserJournalsCollection(userId);
      const docRef = await addDoc(journalsCollection, {
        ...entry,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding journal entry:', error);
      throw error;
    }
  },

  // Get journal entries
  async getJournalEntries(userId: string): Promise<JournalEntry[]> {
    try {
      const journalsCollection = getUserJournalsCollection(userId);
      const q = query(journalsCollection, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as JournalEntry[];
    } catch (error) {
      console.error('Error getting journal entries:', error);
      throw error;
    }
  },

  // Update journal entry
  async updateJournalEntry(userId: string, entryId: string, updates: Partial<JournalEntry>): Promise<void> {
    try {
      const entryDoc = doc(getUserJournalsCollection(userId), entryId);
      await updateDoc(entryDoc, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating journal entry:', error);
      throw error;
    }
  },

  // Delete journal entry
  async deleteJournalEntry(userId: string, entryId: string): Promise<void> {
    try {
      const entryDoc = doc(getUserJournalsCollection(userId), entryId);
      await deleteDoc(entryDoc);
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      throw error;
    }
  },
};

// Playbook interface
export interface Playbook {
  id: string;
  name: string;
  description: string;
  setup: string;
  entry: string;
  exit: string;
  riskManagement: string;
  examples?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Playbook CRUD Operations
export const playbookService = {
  // Add a new playbook
  async addPlaybook(userId: string, playbook: Omit<Playbook, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const playbooksCollection = getUserPlaybooksCollection(userId);
      const docRef = await addDoc(playbooksCollection, {
        ...playbook,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding playbook:', error);
      throw error;
    }
  },

  // Get playbooks
  async getPlaybooks(userId: string): Promise<Playbook[]> {
    try {
      const playbooksCollection = getUserPlaybooksCollection(userId);
      const q = query(playbooksCollection, orderBy('name'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Playbook[];
    } catch (error) {
      console.error('Error getting playbooks:', error);
      throw error;
    }
  },

  // Update playbook
  async updatePlaybook(userId: string, playbookId: string, updates: Partial<Playbook>): Promise<void> {
    try {
      const playbookDoc = doc(getUserPlaybooksCollection(userId), playbookId);
      await updateDoc(playbookDoc, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating playbook:', error);
      throw error;
    }
  },

  // Delete playbook
  async deletePlaybook(userId: string, playbookId: string): Promise<void> {
    try {
      const playbookDoc = doc(getUserPlaybooksCollection(userId), playbookId);
      await deleteDoc(playbookDoc);
    } catch (error) {
      console.error('Error deleting playbook:', error);
      throw error;
    }
  },
};
