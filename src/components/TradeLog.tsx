import React, { useState } from 'react';
import MetricCard from './MetricCard';
import TradeDetailModal from './TradeDetailModal';
import TradeReviewModal from './TradeReviewModal';
import EditTradeModal from './EditTradeModal';
import { Upload, Edit, Trash2, BarChart3 } from 'lucide-react';
import { useTradeContext } from '../contexts/TradeContext';
import { Trade } from '../types/trade';
import { formatDateForTable } from '../lib/dateUtils';

const TradeLog: React.FC = () => {
  const { trades, deleteTrade, getTotalPnL, getWinRate, getProfitFactor } = useTradeContext();
  const [editingTradeId, setEditingTradeId] = useState<string | null>(null);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  
  const totalPnL = getTotalPnL();
  const winRate = getWinRate();
  const profitFactor = getProfitFactor();
  const closedTrades = trades.filter(trade => trade.status === 'closed');
  const winners = closedTrades.filter(trade => (trade.pnl || 0) > 0);
  const losers = closedTrades.filter(trade => (trade.pnl || 0) < 0);
  const avgWin = winners.length > 0 ? winners.reduce((sum, trade) => sum + (trade.pnl || 0), 0) / winners.length : 0;
  const avgLoss = losers.length > 0 ? Math.abs(losers.reduce((sum, trade) => sum + (trade.pnl || 0), 0) / losers.length) : 0;

  const handleDeleteTrade = (tradeId: string) => {
    if (window.confirm('Are you sure you want to delete this trade?')) {
      deleteTrade(tradeId);
    }
  };

  const handleEditTrade = (tradeId: string) => {
    setEditingTradeId(tradeId);
  };

  const handleReviewTrade = (trade: Trade) => {
    setSelectedTrade(trade);
    setIsReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
    setSelectedTrade(null);
  };

  const handleTradeClick = (trade: Trade) => {
    setSelectedTrade(trade);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedTrade(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Trade Log</h1>
      </div>

      {/* Top Section */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-600 mb-2">Net cumulative P&L</h2>
          <div className={`text-3xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${totalPnL.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard 
          title="Profit factor" 
          value={closedTrades.length === 0 ? "N/A" : profitFactor.toFixed(2)}
          color={profitFactor >= 1 ? "green" : "red"}
          showProgress={true}
          progressValue={Math.min(Math.round(profitFactor * 50), 100)}
        />
        <MetricCard 
          title="Trade win %" 
          value={closedTrades.length === 0 ? "0%" : `${winRate.toFixed(1)}%`}
          color={winRate >= 50 ? "green" : "red"}
          showProgress={true}
          progressValue={Math.round(winRate)}
        />
        <MetricCard 
          title="Avg win/loss trade" 
          value={winners.length === 0 ? "--" : `$${avgWin.toFixed(2)}`}
          subtitle={losers.length === 0 ? "--" : `$${avgLoss.toFixed(2)}`}
          color="green"
        />
      </div>

      {/* Trades Table or Empty State */}
      {trades.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No trades to show here</h3>
            <p className="text-gray-500 mb-6">Start by importing your trades or adding them manually</p>
            
            <button className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors mx-auto">
              <Upload className="w-4 h-4" />
              <span>Import trades</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Symbol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Side
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    P&L
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trades.map((trade) => (
                  <tr 
                    key={trade.id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleTradeClick(trade)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {trade.symbol}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateForTable(trade.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        trade.side === 'long' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {trade.side.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${trade.entryPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {trade.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {trade.pnl !== undefined ? (
                        <span className={trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                          ${trade.pnl.toFixed(2)}
                        </span>
                      ) : (
                        '--'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        trade.status === 'closed' 
                          ? 'bg-gray-100 text-gray-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {trade.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReviewTrade(trade);
                          }}
                          className="text-purple-600 hover:text-purple-900 transition-colors"
                          title="Review Trade"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTrade(trade.id);
                          }}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTrade(trade.id);
                          }}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <TradeDetailModal 
        trade={selectedTrade}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
      />

      <TradeReviewModal 
        trade={selectedTrade}
        isOpen={isReviewModalOpen}
        onClose={handleCloseReviewModal}
      />

      <EditTradeModal 
        trade={trades.find(t => t.id === editingTradeId) || null}
        isOpen={editingTradeId !== null}
        onClose={() => setEditingTradeId(null)}
      />
    </div>
  );
};

export default TradeLog;
