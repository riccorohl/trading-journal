import React from 'react';
import { X, TrendingUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react';
import { Trade } from '../types/trade';
import { formatDateForTable } from '../lib/dateUtils';

interface DayTradesModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  trades: Trade[];
  onTradeClick?: (trade: Trade) => void;
}

const DayTradesModal: React.FC<DayTradesModalProps> = ({
  isOpen,
  onClose,
  date,
  trades,
  onTradeClick
}) => {
  if (!isOpen) return null;

  // Calculate day metrics
  const dayMetrics = React.useMemo(() => {
    const closedTrades = trades.filter(trade => trade.status === 'closed');
    const totalPnL = closedTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const totalCommissions = closedTrades.reduce((sum, trade) => sum + (trade.commission || 0), 0);
    const netPnL = totalPnL - totalCommissions;
    
    const winningTrades = closedTrades.filter(trade => (trade.pnl || 0) > 0);
    const losingTrades = closedTrades.filter(trade => (trade.pnl || 0) < 0);
    
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
    const avgTrade = closedTrades.length > 0 ? netPnL / closedTrades.length : 0;
    
    return {
      totalTrades: trades.length,
      closedTrades: closedTrades.length,
      openTrades: trades.filter(trade => trade.status === 'open').length,
      netPnL,
      winRate,
      avgTrade,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length
    };
  }, [trades]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Trading Day Summary
              </h2>
              <p className="text-sm text-gray-600">{formatDate(date)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Day Metrics */}
        <div className="p-6 border-b border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Net P&L</span>
              </div>
              <div className={`text-2xl font-bold ${
                dayMetrics.netPnL >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ${dayMetrics.netPnL >= 0 ? '+' : ''}${dayMetrics.netPnL.toFixed(2)}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-gray-600">Total Trades</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {dayMetrics.totalTrades}
              </div>
              <div className="text-xs text-gray-500">
                {dayMetrics.closedTrades} closed, {dayMetrics.openTrades} open
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-gray-600">Win Rate</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {dayMetrics.winRate.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">
                {dayMetrics.winningTrades}W / {dayMetrics.losingTrades}L
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-gray-600">Avg Trade</span>
              </div>
              <div className={`text-2xl font-bold ${
                dayMetrics.avgTrade >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ${dayMetrics.avgTrade >= 0 ? '+' : ''}${dayMetrics.avgTrade.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Trades List */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Trades ({trades.length})
          </h3>
          
          {trades.length > 0 ? (
            <div className="space-y-3">
              {trades.map((trade) => (
                <div 
                  key={trade.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onTradeClick && onTradeClick(trade)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Symbol & Side */}
                      <div>
                        <div className="font-semibold text-gray-900 text-lg">
                          {trade.symbol}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            trade.side === 'long' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {trade.side.toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            trade.status === 'open'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {trade.status.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Trade Details */}
                      <div className="hidden md:block">
                        <div className="text-sm text-gray-600">
                          <div>Entry: <span className="font-medium">${trade.entryPrice.toFixed(2)}</span></div>
                          {trade.exitPrice && (
                            <div>Exit: <span className="font-medium">${trade.exitPrice.toFixed(2)}</span></div>
                          )}
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="hidden md:block">
                        <div className="text-sm text-gray-600">
                          <div>Qty: <span className="font-medium">{trade.quantity}</span></div>
                          {trade.timeIn && (
                            <div>Time: <span className="font-medium">{trade.timeIn}</span></div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* P&L and Trend */}
                    <div className="flex items-center space-x-3">
                      {trade.pnl !== undefined && trade.pnl !== null && (
                        <div className="flex items-center space-x-2">
                          {trade.pnl >= 0 ? (
                            <TrendingUp className="w-5 h-5 text-green-600" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-600" />
                          )}
                          <div className={`text-lg font-bold ${
                            trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            ${trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                          </div>
                        </div>
                      )}
                      
                      {trade.status === 'open' && (
                        <div className="text-lg font-medium text-blue-600">
                          OPEN
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes (if any) */}
                  {trade.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Notes:</span> {trade.notes}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p>No trades recorded for this day</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DayTradesModal;