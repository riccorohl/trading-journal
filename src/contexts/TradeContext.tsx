import React, { createContext, useContext, useState, useEffect } from 'react';
import { Trade } from '../types/trade';
import { tradeService } from '../lib/firebaseService';
import { DataMigrationService } from '../lib/dataMigration';
import { useAuth } from './AuthContext';

interface TradeContextType {
  trades: Trade[];
  loading: boolean;
  addTrade: (trade: Trade) => Promise<void>;
  updateTrade: (id: string, trade: Partial<Trade>) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
  getTradesByDate: (date: string) => Trade[];
  getTotalPnL: () => number;
  getWinRate: () => number;
  getProfitFactor: () => number;
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
  const { user } = useAuth();

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

  const getTradesByDate = (date: string) => {
    return trades.filter(trade => trade.date === date);
  };

  const getTotalPnL = () => {
    return trades.reduce((total, trade) => total + (trade.pnl || 0), 0);
  };

  const getWinRate = () => {
    const closedTrades = trades.filter(trade => trade.status === 'closed');
    if (closedTrades.length === 0) return 0;
    const winningTrades = closedTrades.filter(trade => (trade.pnl || 0) > 0);
    return (winningTrades.length / closedTrades.length) * 100;
  };

  const getProfitFactor = () => {
    const closedTrades = trades.filter(trade => trade.status === 'closed');
    const wins = closedTrades.filter(trade => (trade.pnl || 0) > 0);
    const losses = closedTrades.filter(trade => (trade.pnl || 0) < 0);
    
    const totalWins = wins.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const totalLosses = Math.abs(losses.reduce((sum, trade) => sum + (trade.pnl || 0), 0));
    
    return totalLosses === 0 ? 0 : totalWins / totalLosses;
  };

  return (
    <TradeContext.Provider value={{
      trades,
      loading,
      addTrade,
      updateTrade,
      deleteTrade,
      getTradesByDate,
      getTotalPnL,
      getWinRate,
      getProfitFactor,
    }}>
      {children}
    </TradeContext.Provider>
  );
};
