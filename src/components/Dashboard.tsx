import React, { useState, useMemo } from 'react';
import { useTradeContext } from '../contexts/TradeContext';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import TradeReviewModal from './TradeReviewModal';
import CalendarWidget from './CalendarWidget';
import MetricCard from './MetricCard';
import DayTradesModal from './DayTradesModal';
import { formatDateForTable } from '../lib/dateUtils';
import { Trade } from '../types/trade';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface DashboardProps {
  onNavigateToJournal?: (date: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigateToJournal }) => {
  const { user } = useAuth();
  const { trades, loading } = useTradeContext();
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);

  const handleTradeClick = (trade: Trade) => {
    setSelectedTrade(trade);
    setIsReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
    setSelectedTrade(null);
  };

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setIsDayModalOpen(true);
  };

  const handleCloseDayModal = () => {
    setIsDayModalOpen(false);
    setSelectedDate('');
  };

  const handleDayTradeClick = (trade: Trade) => {
    // Close day modal and open trade review modal
    setIsDayModalOpen(false);
    setSelectedTrade(trade);
    setIsReviewModalOpen(true);
  };

  // Calculate metrics
  const metrics = useMemo(() => {
    const closedTrades = trades.filter(trade => trade.status === 'closed' && trade.pnl !== undefined);
    
    if (closedTrades.length === 0) {
      return {
        netPnL: 0,
        tradeExpectancy: 0,
        profitFactor: 0,
        winRate: 0,
        avgWin: 0,
        avgLoss: 0,
        totalTrades: 0,
        zellaScore: 0
      };
    }

    const totalPnL = closedTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const totalCommissions = closedTrades.reduce((sum, trade) => sum + (trade.commission || 0), 0);
    const netPnL = totalPnL - totalCommissions;
    
    const winningTrades = closedTrades.filter(trade => (trade.pnl || 0) > 0);
    const losingTrades = closedTrades.filter(trade => (trade.pnl || 0) < 0);
    
    const grossWins = winningTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const grossLosses = Math.abs(losingTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0));
    
    const winRate = (winningTrades.length / closedTrades.length) * 100;
    const avgWin = winningTrades.length > 0 ? grossWins / winningTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? grossLosses / losingTrades.length : 0;
    const profitFactor = grossLosses > 0 ? grossWins / grossLosses : grossWins > 0 ? 999 : 0;
    const tradeExpectancy = closedTrades.length > 0 ? netPnL / closedTrades.length : 0;
    
    // Simple Zella Score calculation (0-100)
    const zellaScore = Math.min(100, Math.max(0, 
      (winRate * 0.3) + 
      (Math.min(profitFactor * 10, 50) * 0.4) + 
      (Math.min(avgWin / Math.max(avgLoss, 1), 10) * 0.3 * 10)
    ));

    return {
      netPnL,
      tradeExpectancy,
      profitFactor,
      winRate,
      avgWin,
      avgLoss,
      totalTrades: closedTrades.length,
      zellaScore
    };
  }, [trades]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const closedTrades = trades
      .filter(trade => trade.status === 'closed' && trade.pnl !== undefined)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let cumulativePnL = 0;
    const dailyData = new Map();

    closedTrades.forEach(trade => {
      const pnl = (trade.pnl || 0) - (trade.commission || 0);
      cumulativePnL += pnl;
      
      const date = trade.date;
      if (dailyData.has(date)) {
        const existing = dailyData.get(date);
        dailyData.set(date, {
          ...existing,
          dailyPnL: existing.dailyPnL + pnl,
          cumulativePnL
        });
      } else {
        dailyData.set(date, {
          date,
          dailyPnL: pnl,
          cumulativePnL,
          trades: 1
        });
      }
    });

    return Array.from(dailyData.values());
  }, [trades]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const recentTrades = trades.slice(0, 4);

  return (
    <>
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Good morning {user?.displayName?.split(' ')[0] || 'Trader'}!
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Last imported 2 months ago
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <MetricCard
            title="Net P&L"
            value={`$${metrics.netPnL.toFixed(2)}`}
            subtitle={`${metrics.totalTrades} trades`}
            trend={metrics.netPnL >= 0 ? 'up' : 'down'}
          />
          
          <MetricCard
            title="Trade Expectancy"
            value={`$${metrics.tradeExpectancy.toFixed(2)}`}
            subtitle="Per trade"
          />
          
          <MetricCard
            title="Profit Factor"
            value={metrics.profitFactor.toFixed(2)}
            subtitle=""
            showChart={true}
            chartData={[
              { name: 'Factor', value: Math.min(metrics.profitFactor, 5) }
            ]}
          />
          
          <MetricCard
            title="Win %"
            value={`${metrics.winRate.toFixed(2)}%`}
            subtitle={`${Math.round(metrics.winRate / 100 * metrics.totalTrades)} wins`}
            showChart={true}
            chartData={[
              { name: 'Wins', value: metrics.winRate },
              { name: 'Losses', value: 100 - metrics.winRate }
            ]}
          />
          
          <MetricCard
            title="Avg win/loss trade"
            value={metrics.avgLoss > 0 ? (metrics.avgWin / metrics.avgLoss).toFixed(1) : '0'}
            subtitle={`$${metrics.avgWin.toFixed(2)} / $${metrics.avgLoss.toFixed(2)}`}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Zella Score */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Zella Score</h3>
              <span className="text-sm text-gray-500">ⓘ</span>
            </div>
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 144 144">
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke="#8b5cf6"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${(metrics.zellaScore / 100) * 377} 377`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round(metrics.zellaScore)}
                    </div>
                    <div className="text-xs text-green-600">+1</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Avg win/loss</span>
                <span>Profit factor</span>
              </div>
              <div className="text-center mt-2">
                <span className="text-lg font-semibold text-gray-900">
                  Your Zella Score: {Math.round(metrics.zellaScore)}
                </span>
              </div>
            </div>
          </div>

          {/* Daily Net Cumulative P&L */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Daily Net Cumulative P&L</h3>
              <span className="text-sm text-gray-500">ⓘ</span>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, 'P&L']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cumulativePnL" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fill="#10b981"
                    fillOpacity={0.1}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Net Daily P&L */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Net Daily P&L</h3>
              <span className="text-sm text-gray-500">ⓘ</span>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Daily P&L']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Bar 
                    dataKey="dailyPnL" 
                    fill={(entry) => entry >= 0 ? '#10b981' : '#ef4444'}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.dailyPnL >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Row - Recent Trades and Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Trades */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Trades</h3>
            </div>
            
            {recentTrades.length > 0 ? (
              <div className="space-y-3">
                {recentTrades.map((trade) => (
                  <div 
                    key={trade.id} 
                    className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleTradeClick(trade)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{trade.symbol}</div>
                        <div className="text-gray-500">{formatDateForTable(trade.date)}</div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        trade.side === 'long' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {trade.side.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${(trade.pnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trade.pnl ? `$${trade.pnl.toFixed(2)}` : 'Open'}
                      </div>
                      <div className="text-xs text-gray-500">
                        ${trade.entryPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No trades yet. Start by adding your first trade!
              </div>
            )}
          </div>

          {/* Calendar */}
          <div className="bg-white p-6 rounded-lg shadow">
            <CalendarWidget 
              trades={trades} 
              onDateClick={handleDateClick}
            />
          </div>
        </div>
      </div>

      {/* Trade Review Modal */}
      {selectedTrade && (
        <TradeReviewModal
          trade={selectedTrade}
          isOpen={isReviewModalOpen}
          onClose={handleCloseReviewModal}
        />
      )}

      {/* Day Trades Modal */}
      {isDayModalOpen && (
        <DayTradesModal
          isOpen={isDayModalOpen}
          onClose={handleCloseDayModal}
          date={selectedDate}
          trades={trades.filter(trade => trade.date === selectedDate)}
          onTradeClick={handleDayTradeClick}
        />
      )}
    </>
  );
};

export default Dashboard;