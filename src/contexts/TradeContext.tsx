
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Trade } from '../types/trade';

interface TradeContextType {
  trades: Trade[];
  addTrade: (trade: Trade) => void;
  updateTrade: (id: string, trade: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;
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

  // Load trades from localStorage on mount
  useEffect(() => {
    const savedTrades = localStorage.getItem('chartJournalTrades');
    if (savedTrades) {
      setTrades(JSON.parse(savedTrades));
    }
  }, []);

  // Save trades to localStorage whenever trades change
  useEffect(() => {
    localStorage.setItem('chartJournalTrades', JSON.stringify(trades));
  }, [trades]);

  const addTrade = (trade: Trade) => {
    setTrades(prev => [...prev, trade]);
  };

  const updateTrade = (id: string, updatedTrade: Partial<Trade>) => {
    setTrades(prev => prev.map(trade => 
      trade.id === id ? { ...trade, ...updatedTrade } : trade
    ));
  };

  const deleteTrade = (id: string) => {
    setTrades(prev => prev.filter(trade => trade.id !== id));
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
