import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTradeContext } from '../contexts/TradeContext';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import CalendarWidget from './CalendarWidget';
import MetricCard from './MetricCard';
import DayTradesModal from './DayTradesModal';
import AccountSelector from './AccountSelector';
import { formatDateForTable } from '../lib/dateUtils';
import { Trade } from '../types/trade';
import { addSampleTrades, removeSampleTrades, hasSampleTrades } from '../lib/sampleData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

interface DashboardProps {
  onNavigateToJournal?: (date: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigateToJournal }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trades, loading } = useTradeContext();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [chartTimeframe, setChartTimeframe] = useState<'week' | 'month' | 'year'>('month');
  const [sampleDataLoading, setSampleDataLoading] = useState(false);
  const [showSampleDataOption, setShowSampleDataOption] = useState(false);

  const handleTradeClick = (trade: Trade) => {
    navigate(`/trade/${trade.id}`);
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
    // Close day modal and navigate to trade details
    setIsDayModalOpen(false);
    navigate(`/trade/${trade.id}`);
  };

  // Check if we should show sample data option
  useEffect(() => {
    const checkSampleDataStatus = async () => {
      if (user && trades.length === 0) {
        const hasSamples = await hasSampleTrades(user.uid);
        setShowSampleDataOption(!hasSamples);
      } else {
        setShowSampleDataOption(false);
      }
    };

    checkSampleDataStatus();
  }, [user, trades.length]);

  // Handle loading sample data
  const handleLoadSampleData = async () => {
    if (!user) return;
    
    setSampleDataLoading(true);
    try {
      await addSampleTrades(user.uid);
      setShowSampleDataOption(false);
      // Show success message or toast here if desired
    } catch (error) {
      console.error('Error loading sample data:', error);
      // Show error message or toast here if desired
    } finally {
      setSampleDataLoading(false);
    }
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

  // Prepare chart data based on timeframe
  const chartData = useMemo(() => {
    const closedTrades = trades
      .filter(trade => trade.status === 'closed' && trade.pnl !== undefined)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (closedTrades.length === 0) return [];

    const now = new Date();
    let startDate: Date;
    
    // Set date range based on timeframe
    switch (chartTimeframe) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
    }

    // Filter trades within timeframe
    const filteredTrades = closedTrades.filter(trade => 
      new Date(trade.date) >= startDate
    );

    let cumulativePnL = 0;
    const dailyData = new Map();

    // Fill in all dates in range with zero values
    const currentDate = new Date(startDate);
    while (currentDate <= now) {
      const dateStr = currentDate.toISOString().split('T')[0];
      dailyData.set(dateStr, {
        date: dateStr,
        dailyPnL: 0,
        cumulativePnL: 0,
        trades: 0,
        formattedDate: chartTimeframe === 'year' 
          ? currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          : currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Add actual trade data
    filteredTrades.forEach(trade => {
      const pnl = (trade.pnl || 0) - (trade.commission || 0);
      cumulativePnL += pnl;
      
      const date = trade.date;
      if (dailyData.has(date)) {
        const existing = dailyData.get(date);
        dailyData.set(date, {
          ...existing,
          dailyPnL: existing.dailyPnL + pnl,
          cumulativePnL,
          trades: existing.trades + 1
        });
      }
    });

    // Update cumulative PnL for all subsequent days
    const sortedData = Array.from(dailyData.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    let runningTotal = 0;
    sortedData.forEach(day => {
      runningTotal += day.dailyPnL;
      day.cumulativePnL = runningTotal;
    });

    return sortedData;
  }, [trades, chartTimeframe]);

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

        {/* Account Selector */}
        <AccountSelector />

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
              <div className="flex items-center space-x-2">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {(['week', 'month', 'year'] as const).map((period) => (
                    <button
                      key={period}
                      onClick={() => setChartTimeframe(period)}
                      className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                        chartTimeframe === period
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </button>
                  ))}
                </div>
                <span className="text-sm text-gray-500">ⓘ</span>
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="formattedDate" 
                    fontSize={12}
                    angle={chartTimeframe === 'year' ? 0 : -45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Cumulative P&L']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cumulativePnL" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fill="url(#colorPnL)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Net Daily P&L */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Net Daily P&L</h3>
              <div className="flex items-center space-x-2">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {(['week', 'month', 'year'] as const).map((period) => (
                    <button
                      key={period}
                      onClick={() => setChartTimeframe(period)}
                      className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                        chartTimeframe === period
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </button>
                  ))}
                </div>
                <span className="text-sm text-gray-500">ⓘ</span>
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="formattedDate" 
                    fontSize={12}
                    angle={chartTimeframe === 'year' ? 0 : -45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Daily P&L']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Bar 
                    dataKey="dailyPnL"
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
                        <div className="font-medium text-gray-900">{trade.currencyPair}</div>
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
                <div className="mb-4">
                  <p className="text-lg mb-2">No trades yet!</p>
                  <p className="text-sm">Start by adding your first trade or load sample data to explore features.</p>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={handleLoadSampleData}
                    disabled={sampleDataLoading}
                    className="inline-flex items-center px-4 py-2 border border-purple-300 rounded-md shadow-sm text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {sampleDataLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                        Loading Sample Data...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Load 10 Sample Forex Trades
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-400">Sample data can be deleted anytime</p>
                </div>
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
