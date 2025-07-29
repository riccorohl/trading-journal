import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  DocumentData,
  QuerySnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { TradingAccount, AccountStats, Trade } from '../types/trade';

// Collection names
const ACCOUNTS_COLLECTION = 'accounts';

// User-specific collection paths
const getUserAccountsCollection = (userId: string) => 
  collection(db, 'users', userId, ACCOUNTS_COLLECTION);

// Convert Firestore document to TradingAccount object
const convertFirestoreToAccount = (doc: DocumentData): TradingAccount => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
  } as TradingAccount;
};

// Convert TradingAccount object to Firestore document
const convertAccountToFirestore = (account: Omit<TradingAccount, 'id'>) => {
  // Remove undefined values to avoid Firebase errors
  const cleanedAccount = Object.entries(account).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, unknown>);

  return {
    ...cleanedAccount,
    createdAt: cleanedAccount.createdAt || Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
};

// Account CRUD Operations
export const accountService = {
  // Add a new trading account
  async addAccount(userId: string, account: Omit<TradingAccount, 'id'>): Promise<string> {
    try {
      console.log('Firebase addAccount called with:', { userId, account });
      const accountsCollection = getUserAccountsCollection(userId);
      const accountData = convertAccountToFirestore(account);
      console.log('Converted account data:', accountData);
      const docRef = await addDoc(accountsCollection, accountData);
      console.log('Successfully added account with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding account:', error);
      throw error;
    }
  },

  // Get all accounts for a user
  async getAccounts(userId: string): Promise<TradingAccount[]> {
    try {
      const accountsCollection = getUserAccountsCollection(userId);
      const q = query(accountsCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(convertFirestoreToAccount);
    } catch (error) {
      console.error('Error getting accounts:', error);
      throw error;
    }
  },

  // Update an account
  async updateAccount(userId: string, accountId: string, updates: Partial<TradingAccount>): Promise<void> {
    try {
      const accountDoc = doc(getUserAccountsCollection(userId), accountId);
      await updateDoc(accountDoc, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating account:', error);
      throw error;
    }
  },

  // Delete an account
  async deleteAccount(userId: string, accountId: string): Promise<void> {
    try {
      const accountDoc = doc(getUserAccountsCollection(userId), accountId);
      await deleteDoc(accountDoc);
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  },

  // Subscribe to real-time account updates
  subscribeToAccounts(userId: string, callback: (accounts: TradingAccount[]) => void): () => void {
    const accountsCollection = getUserAccountsCollection(userId);
    const q = query(accountsCollection, orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (querySnapshot: QuerySnapshot) => {
      const accounts = querySnapshot.docs.map(convertFirestoreToAccount);
      callback(accounts);
    }, (error) => {
      console.error('Error in accounts subscription:', error);
    });
  },

  // Set account as active (deactivate others)
  async setActiveAccount(userId: string, accountId: string): Promise<void> {
    try {
      // First, get all accounts
      const accounts = await this.getAccounts(userId);
      
      // Update all accounts to inactive, then set the selected one as active
      const updatePromises = accounts.map(account => {
        const isActive = account.id === accountId;
        return this.updateAccount(userId, account.id, { isActive });
      });
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error setting active account:', error);
      throw error;
    }
  },

  // Calculate account statistics from trades
  calculateAccountStats(accountId: string, trades: Trade[]): AccountStats {
    const accountTrades = trades.filter(trade => trade.accountId === accountId);
    const closedTrades = accountTrades.filter(trade => trade.status === 'closed');
    
    if (closedTrades.length === 0) {
      return {
        accountId,
        totalTrades: accountTrades.length,
        totalPnL: 0,
        winRate: 0,
        profitFactor: 0,
        maxDrawdown: 0,
        currentBalance: 0,
        roi: 0,
        averageWin: 0,
        averageLoss: 0,
        largestWin: 0,
        largestLoss: 0,
        winStreak: 0,
        lossStreak: 0,
      };
    }

    // Basic calculations
    const totalPnL = closedTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const wins = closedTrades.filter(trade => (trade.pnl || 0) > 0);
    const losses = closedTrades.filter(trade => (trade.pnl || 0) < 0);
    
    const winRate = (wins.length / closedTrades.length) * 100;
    const totalWins = wins.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const totalLosses = Math.abs(losses.reduce((sum, trade) => sum + (trade.pnl || 0), 0));
    const profitFactor = totalLosses === 0 ? (totalWins > 0 ? Infinity : 0) : totalWins / totalLosses;
    
    const averageWin = wins.length > 0 ? totalWins / wins.length : 0;
    const averageLoss = losses.length > 0 ? totalLosses / losses.length : 0;
    
    const largestWin = wins.length > 0 ? Math.max(...wins.map(trade => trade.pnl || 0)) : 0;
    const largestLoss = losses.length > 0 ? Math.min(...losses.map(trade => trade.pnl || 0)) : 0;

    // Calculate max drawdown
    let runningBalance = 0;
    let maxBalance = 0;
    let maxDrawdown = 0;
    
    for (const trade of closedTrades.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())) {
      runningBalance += trade.pnl || 0;
      maxBalance = Math.max(maxBalance, runningBalance);
      const currentDrawdown = maxBalance - runningBalance;
      maxDrawdown = Math.max(maxDrawdown, currentDrawdown);
    }

    // Calculate streaks
    let currentStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    let isWinning = false;
    
    for (const trade of closedTrades.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())) {
      const isWin = (trade.pnl || 0) > 0;
      
      if (isWin) {
        if (isWinning) {
          currentStreak++;
        } else {
          currentStreak = 1;
          isWinning = true;
        }
        maxWinStreak = Math.max(maxWinStreak, currentStreak);
      } else {
        if (!isWinning) {
          currentStreak++;
        } else {
          currentStreak = 1;
          isWinning = false;
        }
        maxLossStreak = Math.max(maxLossStreak, currentStreak);
      }
    }

    return {
      accountId,
      totalTrades: accountTrades.length,
      totalPnL,
      winRate,
      profitFactor,
      maxDrawdown,
      currentBalance: totalPnL, // This would need to be calculated with initial balance
      roi: 0, // Would need initial balance to calculate
      averageWin,
      averageLoss,
      largestWin,
      largestLoss: Math.abs(largestLoss),
      winStreak: maxWinStreak,
      lossStreak: maxLossStreak,
    };
  },

  // Create default account for new users
  async createDefaultAccount(userId: string): Promise<string> {
    const defaultAccount: Omit<TradingAccount, 'id'> = {
      name: 'Default Account',
      type: 'demo',
      broker: 'Manual Entry',
      currency: 'USD',
      balance: 10000,
      initialBalance: 10000,
      platform: 'manual',
      description: 'Default trading account',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.addAccount(userId, defaultAccount);
  },
};
