import React from 'react';
import { Trade } from '../types/trade';

export interface DashboardWidget {
  id: string;
  label: string;
  category: 'performance' | 'risk' | 'analytics' | 'activity';
  icon?: React.ReactNode;
  getValue: (trades: Trade[]) => {
    value: string | number;
    subtitle?: string;
    progress?: number;
    color?: 'green' | 'red' | 'blue' | 'gray';
    trend?: 'up' | 'down' | 'neutral';
  };
  description?: string;
}

export const AVAILABLE_WIDGETS: DashboardWidget[] = [
  // Performance Metrics
  {
    id: 'netPnl',
    label: 'Net P&L',
    category: 'performance',
    getValue: (trades) => {
      const closedTrades = trades.filter(trade => trade.status === 'closed');
      const totalPnL = closedTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
      const totalCommissions = closedTrades.reduce((sum, trade) => sum + (trade.commission || 0), 0);
      const netPnL = totalPnL - totalCommissions;
      
      return {
        value: `$${netPnL.toFixed(2)}`,
        subtitle: `${closedTrades.length} trades`,
        color: netPnL >= 0 ? 'green' : 'red',
        trend: netPnL >= 0 ? 'up' : 'down'
      };
    },
    description: 'Total profit/loss after commissions'
  },
  {
    id: 'tradeExpectancy',
    label: 'Trade Expectancy',
    category: 'performance',
    getValue: (trades) => {
      const closedTrades = trades.filter(trade => trade.status === 'closed');
      if (closedTrades.length === 0) return { value: '$0.00', subtitle: 'Per trade', color: 'gray' };
      
      const totalPnL = closedTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
      const totalCommissions = closedTrades.reduce((sum, trade) => sum + (trade.commission || 0), 0);
      const expectancy = (totalPnL - totalCommissions) / closedTrades.length;
      
      return {
        value: `$${expectancy.toFixed(2)}`,
        subtitle: `${closedTrades.length} trades`,
        color: expectancy >= 0 ? 'green' : 'red',
        trend: expectancy >= 0 ? 'up' : 'down'
      };
    },
    description: 'Average profit/loss per trade'
  },
  {
    id: 'profitFactor',
    label: 'Profit Factor',
    category: 'performance',
    getValue: (trades) => {
      const closedTrades = trades.filter(trade => trade.status === 'closed');
      const winningTrades = closedTrades.filter(trade => (trade.pnl || 0) > 0);
      const losingTrades = closedTrades.filter(trade => (trade.pnl || 0) < 0);
      
      const grossWins = winningTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
      const grossLosses = Math.abs(losingTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0));
      
      const factor = grossLosses > 0 ? grossWins / grossLosses : grossWins > 0 ? 999 : 0;
      const progress = Math.min(factor / 5 * 100, 100);
      
      return {
        value: factor.toFixed(2),
        subtitle: `${winningTrades.length}W / ${losingTrades.length}L`,
        progress: progress,
        color: factor >= 1.5 ? 'green' : factor >= 1 ? 'blue' : 'red',
        trend: factor >= 1.2 ? 'up' : factor < 0.8 ? 'down' : undefined
      };
    },
    description: 'Ratio of gross profits to gross losses'
  },
  {
    id: 'winRate',
    label: 'Win Rate',
    category: 'performance',
    getValue: (trades) => {
      const closedTrades = trades.filter(trade => trade.status === 'closed');
      if (closedTrades.length === 0) return { value: '0.0%', progress: 0, subtitle: '0 trades', color: 'gray' };
      
      const winners = closedTrades.filter(trade => (trade.pnl || 0) > 0);
      const rate = (winners.length / closedTrades.length) * 100;
      
      return {
        value: `${rate.toFixed(1)}%`,
        subtitle: `${winners.length} of ${closedTrades.length} trades`,
        progress: rate,
        color: rate >= 60 ? 'green' : rate >= 40 ? 'blue' : 'red',
        trend: rate >= 55 ? 'up' : rate < 35 ? 'down' : undefined
      };
    },
    description: 'Percentage of profitable trades'
  },
  {
    id: 'avgWinLoss',
    label: 'Avg Win/Loss',
    category: 'performance',
    getValue: (trades) => {
      const closedTrades = trades.filter(trade => trade.status === 'closed');
      const winningTrades = closedTrades.filter(trade => (trade.pnl || 0) > 0);
      const losingTrades = closedTrades.filter(trade => (trade.pnl || 0) < 0);
      
      const avgWin = winningTrades.length > 0 ? 
        winningTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0) / winningTrades.length : 0;
      const avgLoss = losingTrades.length > 0 ? 
        Math.abs(losingTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0) / losingTrades.length) : 0;
      
      const ratio = avgLoss > 0 ? avgWin / avgLoss : 0;
      
      return {
        value: ratio.toFixed(1),
        subtitle: `$${avgWin.toFixed(2)} / $${avgLoss.toFixed(2)}`,
        color: ratio >= 1.5 ? 'green' : ratio >= 1 ? 'blue' : 'red'
      };
    },
    description: 'Ratio of average winning to losing trade'
  },

  // Risk Metrics
  {
    id: 'maxDrawdown',
    label: 'Max Drawdown',
    category: 'risk',
    getValue: (trades) => {
      const sortedTrades = trades
        .filter(trade => trade.status === 'closed')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      let peak = 0;
      let maxDD = 0;
      let running = 0;
      
      sortedTrades.forEach(trade => {
        running += (trade.pnl || 0) - (trade.commission || 0);
        if (running > peak) peak = running;
        const drawdown = peak - running;
        if (drawdown > maxDD) maxDD = drawdown;
      });
      
      return {
        value: `-$${maxDD.toFixed(2)}`,
        color: 'red'
      };
    },
    description: 'Maximum peak-to-trough decline'
  },
  {
    id: 'sharpeRatio',
    label: 'Sharpe Ratio',
    category: 'risk',
    getValue: (trades) => {
      const closedTrades = trades.filter(trade => trade.status === 'closed');
      if (closedTrades.length < 2) return { value: '0.00' };
      
      const returns = closedTrades.map(t => (t.pnl || 0) - (t.commission || 0));
      const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
      const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
      const stdDev = Math.sqrt(variance);
      const sharpe = stdDev > 0 ? avgReturn / stdDev : 0;
      
      return {
        value: sharpe.toFixed(2),
        color: sharpe >= 1 ? 'green' : sharpe >= 0.5 ? 'blue' : 'red'
      };
    },
    description: 'Risk-adjusted return measure'
  },
  {
    id: 'totalRisk',
    label: 'Total Risk',
    category: 'risk',
    getValue: (trades) => {
      const total = trades.reduce((sum, trade) => sum + (trade.riskAmount || 0), 0);
      return {
        value: `$${total.toFixed(2)}`,
        color: 'blue'
      };
    },
    description: 'Total amount at risk across all trades'
  },

  // Analytics
  {
    id: 'avgRMultiple',
    label: 'Avg R-Multiple',
    category: 'analytics',
    getValue: (trades) => {
      const validTrades = trades.filter(t => t.rMultiple && t.status === 'closed');
      if (validTrades.length === 0) return { value: '0.00R' };
      
      const avg = validTrades.reduce((sum, t) => sum + (t.rMultiple || 0), 0) / validTrades.length;
      return {
        value: `${avg.toFixed(2)}R`,
        color: avg >= 1 ? 'green' : avg >= 0 ? 'blue' : 'red'
      };
    },
    description: 'Average risk-to-reward ratio'
  },
  {
    id: 'totalPips',
    label: 'Total Pips',
    category: 'analytics',
    getValue: (trades) => {
      const total = trades.reduce((sum, trade) => sum + (trade.pips || 0), 0);
      return {
        value: `${total > 0 ? '+' : ''}${total.toFixed(1)}`,
        color: total >= 0 ? 'green' : 'red'
      };
    },
    description: 'Cumulative pips gained/lost'
  },
  {
    id: 'avgPips',
    label: 'Avg Pips',
    category: 'analytics',
    getValue: (trades) => {
      const closedTrades = trades.filter(trade => trade.status === 'closed');
      if (closedTrades.length === 0) return { value: '0.0' };
      
      const total = closedTrades.reduce((sum, trade) => sum + (trade.pips || 0), 0);
      const avg = total / closedTrades.length;
      return {
        value: `${avg > 0 ? '+' : ''}${avg.toFixed(1)}`,
        color: avg >= 0 ? 'green' : 'red'
      };
    },
    description: 'Average pips per trade'
  },
  {
    id: 'bestTrade',
    label: 'Best Trade',
    category: 'analytics',
    getValue: (trades) => {
      const closedTrades = trades.filter(trade => trade.status === 'closed');
      if (closedTrades.length === 0) return { value: '$0.00', color: 'green' };
      
      const best = closedTrades.reduce((max, trade) => 
        (trade.pnl || 0) > (max.pnl || 0) ? trade : max
      );
      return {
        value: `$${(best.pnl || 0).toFixed(2)}`,
        color: 'green'
      };
    },
    description: 'Most profitable single trade'
  },
  {
    id: 'worstTrade',
    label: 'Worst Trade',
    category: 'analytics',
    getValue: (trades) => {
      const closedTrades = trades.filter(trade => trade.status === 'closed');
      if (closedTrades.length === 0) return { value: '$0.00', color: 'red' };
      
      const worst = closedTrades.reduce((min, trade) => 
        (trade.pnl || 0) < (min.pnl || 0) ? trade : min
      );
      return {
        value: `$${(worst.pnl || 0).toFixed(2)}`,
        color: 'red'
      };
    },
    description: 'Most losing single trade'
  },

  // Activity
  {
    id: 'totalTrades',
    label: 'Total Trades',
    category: 'activity',
    getValue: (trades) => ({
      value: trades.length.toString(),
      subtitle: 'All time',
      color: 'blue'
    }),
    description: 'Total number of trades executed'
  },
  {
    id: 'activeDays',
    label: 'Active Days',
    category: 'activity',
    getValue: (trades) => {
      const uniqueDays = new Set(trades.map(t => t.date?.split('T')[0])).size;
      return {
        value: uniqueDays.toString(),
        subtitle: 'Trading days',
        color: 'blue'
      };
    },
    description: 'Number of days with trading activity'
  },
  {
    id: 'avgTradesPerDay',
    label: 'Trades/Day',
    category: 'activity',
    getValue: (trades) => {
      const uniqueDays = new Set(trades.map(t => t.date?.split('T')[0])).size;
      const avg = uniqueDays > 0 ? trades.length / uniqueDays : 0;
      return {
        value: avg.toFixed(1),
        subtitle: 'Average',
        color: 'blue'
      };
    },
    description: 'Average trades per trading day'
  },
  {
    id: 'zellaScore',
    label: 'Zella Score',
    category: 'performance',
    getValue: (trades) => {
      const closedTrades = trades.filter(trade => trade.status === 'closed');
      if (closedTrades.length === 0) return { value: '0', progress: 0 };
      
      const winningTrades = closedTrades.filter(trade => (trade.pnl || 0) > 0);
      const losingTrades = closedTrades.filter(trade => (trade.pnl || 0) < 0);
      
      const grossWins = winningTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
      const grossLosses = Math.abs(losingTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0));
      
      const winRate = (winningTrades.length / closedTrades.length) * 100;
      const profitFactor = grossLosses > 0 ? grossWins / grossLosses : grossWins > 0 ? 10 : 0;
      const avgWin = winningTrades.length > 0 ? grossWins / winningTrades.length : 0;
      const avgLoss = losingTrades.length > 0 ? grossLosses / losingTrades.length : 0;
      const avgWinLoss = avgLoss > 0 ? avgWin / avgLoss : 0;
      
      // Zella Score calculation (0-100)
      const zellaScore = Math.min(100, Math.max(0, 
        (winRate * 0.3) + 
        (Math.min(profitFactor * 10, 50) * 0.4) + 
        (Math.min(avgWinLoss, 10) * 0.3 * 10)
      ));
      
      return {
        value: Math.round(zellaScore).toString(),
        progress: zellaScore,
        color: zellaScore >= 70 ? 'green' : zellaScore >= 50 ? 'blue' : 'red'
      };
    },
    description: 'Overall trading performance score'
  }
];

export const DEFAULT_DASHBOARD_WIDGETS = [
  'netPnl',
  'tradeExpectancy', 
  'profitFactor',
  'winRate'
];
