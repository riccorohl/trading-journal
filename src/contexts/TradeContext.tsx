import React, { createContext, useContext, useState, useEffect } from 'react';
import { Trade, TradingAccount, AccountStats } from '../types/trade';
import { tradeService } from '../lib/firebaseService';
import { accountService } from '../lib/accountService';
import { DataMigrationService } from '../lib/dataMigration';
import { useAuth } from './AuthContext';

interface TradeContextType {
  // Trade management
  trades: Trade[];
  loading: boolean;
  addTrade: (trade: Trade) => Promise<void>;
  updateTrade: (id: string, trade: Partial<Trade>) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
  getTradesByDate: (date: string) => Trade[];
  
  // Account management (NEW)
  accounts: TradingAccount[];
  currentAccount: TradingAccount | null;
  accountsLoading: boolean;
  addAccount: (account: Omit<TradingAccount, 'id'>) => Promise<void>;
  updateAccount: (id: string, account: Partial<TradingAccount>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  setActiveAccount: (accountId: string) => Promise<void>;
  
  // Analytics (updated for account support)
  getTotalPnL: (accountId?: string) => number;
  getWinRate: (accountId?: string) => number;
  getProfitFactor: (accountId?: string) => number;
  getAccountStats: (accountId: string) => AccountStats;
  getCurrentAccountTrades: () => Trade[];
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export const useTradeContext = () => {
  const context = useContext(TradeContext);
  if (!context) {
    throw new Error('useTradeContext must be used within a TradeProvider');
  }
  return context;
};

export const TradeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Account management state (NEW)
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [currentAccount, setCurrentAccount] = useState<TradingAccount | null>(null);
  const [accountsLoading, setAccountsLoading] = useState(true);
  
  const { user } = useAuth();

  // Load accounts from Firebase when user changes
  useEffect(() => {
    if (!user) {
      setAccounts([]);
      setCurrentAccount(null);
      setAccountsLoading(false);
      return;
    }

    setAccountsLoading(true);
    
    // Subscribe to real-time account updates
    const unsubscribe = accountService.subscribeToAccounts(user.uid, (updatedAccounts) => {
      setAccounts(updatedAccounts);
      
      // Set current account to the active one, or first one if none active
      const activeAccount = updatedAccounts.find(acc => acc.isActive) || updatedAccounts[0] || null;
      setCurrentAccount(activeAccount);
      
      setAccountsLoading(false);
      
      // Create default account if no accounts exist
      if (updatedAccounts.length === 0) {
        accountService.createDefaultAccount(user.uid).catch(console.error);
      }
    });

    return unsubscribe;
  }, [user]);

  // Load trades from Firebase when user changes
  useEffect(() => {
    if (!user) {
      setTrades([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Subscribe to real-time updates
    const unsubscribe = tradeService.subscribeToTrades(user.uid, (updatedTrades) => {
      setTrades(updatedTrades);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  // Migrate existing localStorage data to Firebase (one-time operation)
  useEffect(() => {
    const migrateLocalStorageData = async () => {
      if (!user) return;

      // Use the enhanced migration service
      try {
        const result = await DataMigrationService.migrateToFirebase(user.uid);
        if (result.success) {
          console.log('Migration completed:', result.migrated);
        } else {
          console.warn('Migration completed with errors:', result.errors);
        }
      } catch (error) {
        console.error('Error during migration:', error);
      }
    };

    migrateLocalStorageData();
  }, [user]);

  const addTrade = async (trade: Trade) => {
    if (!user) {
      throw new Error('User must be authenticated to add trades');
    }

    try {
      const { id, ...tradeData } = trade;
      await tradeService.addTrade(user.uid, tradeData);
      // The real-time subscription will update the trades state
    } catch (error) {
      console.error('Error adding trade:', error);
      throw error;
    }
  };

  const updateTrade = async (id: string, updatedTrade: Partial<Trade>) => {
    if (!user) {
      throw new Error('User must be authenticated to update trades');
    }

    try {
      await tradeService.updateTrade(user.uid, id, updatedTrade);
      // The real-time subscription will update the trades state
    } catch (error) {
      console.error('Error updating trade:', error);
      throw error;
    }
  };

  const deleteTrade = async (id: string) => {
    if (!user) {
      throw new Error('User must be authenticated to delete trades');
    }

    try {
      await tradeService.deleteTrade(user.uid, id);
      // The real-time subscription will update the trades state
    } catch (error) {
      console.error('Error deleting trade:', error);
      throw error;
    }
  };

  // Account management functions (NEW)
  const addAccount = async (account: Omit<TradingAccount, 'id'>) => {
    if (!user) {
      throw new Error('User must be authenticated to add accounts');
    }

    try {
      await accountService.addAccount(user.uid, account);
      // The real-time subscription will update the accounts state
    } catch (error) {
      console.error('Error adding account:', error);
      throw error;
    }
  };

  const updateAccount = async (id: string, updatedAccount: Partial<TradingAccount>) => {
    if (!user) {
      throw new Error('User must be authenticated to update accounts');
    }

    try {
      await accountService.updateAccount(user.uid, id, updatedAccount);
      // The real-time subscription will update the accounts state
    } catch (error) {
      console.error('Error updating account:', error);
      throw error;
    }
  };

  const deleteAccount = async (id: string) => {
    if (!user) {
      throw new Error('User must be authenticated to delete accounts');
    }

    try {
      await accountService.deleteAccount(user.uid, id);
      // The real-time subscription will update the accounts state
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  };

  const setActiveAccount = async (accountId: string) => {
    if (!user) {
      throw new Error('User must be authenticated to set active account');
    }

    try {
      await accountService.setActiveAccount(user.uid, accountId);
      // The real-time subscription will update the accounts state
    } catch (error) {
      console.error('Error setting active account:', error);
      throw error;
    }
  };

  // Updated analytics functions to support account filtering
  const getTradesByDate = (date: string) => {
    return trades.filter(trade => trade.date === date);
  };

  const getTotalPnL = (accountId?: string) => {
    const filteredTrades = accountId 
      ? trades.filter(trade => trade.accountId === accountId)
      : trades;
    return filteredTrades.reduce((total, trade) => total + (trade.pnl || 0), 0);
  };

  const getWinRate = (accountId?: string) => {
    const filteredTrades = accountId 
      ? trades.filter(trade => trade.accountId === accountId)
      : trades;
    const closedTrades = filteredTrades.filter(trade => trade.status === 'closed');
    if (closedTrades.length === 0) return 0;
    const winningTrades = closedTrades.filter(trade => (trade.pnl || 0) > 0);
    return (winningTrades.length / closedTrades.length) * 100;
  };

  const getProfitFactor = (accountId?: string) => {
    const filteredTrades = accountId 
      ? trades.filter(trade => trade.accountId === accountId)
      : trades;
    const closedTrades = filteredTrades.filter(trade => trade.status === 'closed');
    const wins = closedTrades.filter(trade => (trade.pnl || 0) > 0);
    const losses = closedTrades.filter(trade => (trade.pnl || 0) < 0);
    
    const totalWins = wins.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const totalLosses = Math.abs(losses.reduce((sum, trade) => sum + (trade.pnl || 0), 0));
    
    return totalLosses === 0 ? 0 : totalWins / totalLosses;
  };

  const getAccountStats = (accountId: string): AccountStats => {
    return accountService.calculateAccountStats(accountId, trades);
  };

  const getCurrentAccountTrades = (): Trade[] => {
    if (!currentAccount) return [];
    return trades.filter(trade => trade.accountId === currentAccount.id);
  };

  return (
    <TradeContext.Provider value={{
      // Trade management
      trades,
      loading,
      addTrade,
      updateTrade,
      deleteTrade,
      getTradesByDate,
      
      // Account management
      accounts,
      currentAccount,
      accountsLoading,
      addAccount,
      updateAccount,
      deleteAccount,
      setActiveAccount,
      
      // Analytics
      getTotalPnL,
      getWinRate,
      getProfitFactor,
      getAccountStats,
      getCurrentAccountTrades,
    }}>
      {children}
    </TradeContext.Provider>
  );
};
