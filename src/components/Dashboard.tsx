
import React from 'react';
import MetricCard from './MetricCard';
import { TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { useTradeContext } from '../contexts/TradeContext';

const Dashboard: React.FC = () => {
  const { getTotalPnL, getWinRate, getProfitFactor, trades } = useTradeContext();
  
  const totalPnL = getTotalPnL();
  const winRate = getWinRate();
  const profitFactor = getProfitFactor();
  const closedTrades = trades.filter(trade => trade.status === 'closed');
  const winners = closedTrades.filter(trade => (trade.pnl || 0) > 0);
  const losers = closedTrades.filter(trade => (trade.pnl || 0) < 0);
  const avgWin = winners.length > 0 ? winners.reduce((sum, trade) => sum + (trade.pnl || 0), 0) / winners.length : 0;
  const avgLoss = losers.length > 0 ? Math.abs(losers.reduce((sum, trade) => sum + (trade.pnl || 0), 0) / losers.length) : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Calendar className="w-4 h-4" />
            <span>Start my day</span>
          </button>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <MetricCard 
          title="Net P&L" 
          value={totalPnL === 0 ? "--" : `$${totalPnL.toFixed(2)}`}
          subtitle={trades.length.toString()}
          color={totalPnL >= 0 ? "green" : "red"}
        />
        <MetricCard 
          title="Trade win %" 
          value={closedTrades.length === 0 ? "--" : `${winRate.toFixed(1)}%`}
          color={winRate >= 50 ? "green" : "red"}
          showProgress={true}
          progressValue={Math.round(winRate)}
        />
        <MetricCard 
          title="Profit factor" 
          value={closedTrades.length === 0 ? "--" : profitFactor.toFixed(2)}
          color={profitFactor >= 1 ? "green" : "red"}
          showProgress={true}
          progressValue={Math.min(Math.round(profitFactor * 50), 100)}
        />
        <MetricCard 
          title="Day win %" 
          value="--" 
          color="red"
          showProgress={true}
          progressValue={0}
        />
        <MetricCard 
          title="Avg win/loss trade" 
          value={winners.length === 0 ? "--" : `$${avgWin.toFixed(2)}`}
          subtitle={losers.length === 0 ? "--" : `$${avgLoss.toFixed(2)}`}
          color="green"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Zella Score */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 flex items-center">
              Journal score
              <span className="ml-1 text-gray-400">ⓘ</span>
            </h3>
          </div>
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="w-32 h-32 border-4 border-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400">📊</span>
              </div>
              <p className="text-sm text-gray-500">
                {trades.length === 0 
                  ? "Available once there is at least 1 trade." 
                  : "Coming soon - analyzing your trading performance."
                }
              </p>
            </div>
          </div>
        </div>

        {/* Daily Net Cumulative P&L */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 flex items-center">
              Daily net cumulative P&L
              <span className="ml-1 text-gray-400">ⓘ</span>
            </h3>
          </div>
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="w-24 h-24 text-gray-300 mx-auto mb-4">
                <TrendingUp className="w-full h-full" />
              </div>
              <p className="text-sm text-gray-500">
                {trades.length === 0 
                  ? "No daily net cumulative P&L to show here"
                  : "Chart visualization coming soon"
                }
              </p>
            </div>
          </div>
        </div>

        {/* Net Daily P&L */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 flex items-center">
              Net daily P&L
              <span className="ml-1 text-gray-400">ⓘ</span>
            </h3>
          </div>
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="w-24 h-24 text-gray-300 mx-auto mb-4">
                <DollarSign className="w-full h-full" />
              </div>
              <p className="text-sm text-gray-500">
                {trades.length === 0 
                  ? "No net daily P&L to show here"
                  : "Chart visualization coming soon"
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
