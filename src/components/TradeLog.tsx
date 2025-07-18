import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MetricCard from './MetricCard';
import EditTradeModal from './EditTradeModal';
import { Upload, Edit, Trash2, BarChart3, Filter, X, ChevronDown, Search } from 'lucide-react';
import { useTradeContext } from '../contexts/TradeContext';
import { Trade } from '../types/trade';
import { formatDateForTable } from '../lib/dateUtils';

const TradeLog: React.FC = () => {
  const navigate = useNavigate();
  const { trades, deleteTrade, getTotalPnL, getWinRate, getProfitFactor } = useTradeContext();
  const [editingTradeId, setEditingTradeId] = useState<string | null>(null);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    symbol: '',
    side: 'all' as 'all' | 'long' | 'short',
    status: 'all' as 'all' | 'open' | 'closed',
    dateFrom: '',
    dateTo: '',
    minPnL: '',
    maxPnL: '',
  });
  
  // Dropdown ref for click outside handling
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Filter trades based on current filter settings
  const filteredTrades = useMemo(() => {
    return trades.filter(trade => {
      // Universal search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const searchableFields = [
          trade.symbol?.toLowerCase() || '',
          trade.side?.toLowerCase() || '',
          trade.status?.toLowerCase() || '',
          trade.date || '',
          trade.entryPrice?.toString() || '',
          trade.exitPrice?.toString() || '',
          trade.quantity?.toString() || '',
          trade.pnl?.toString() || '',
          trade.commission?.toString() || '',
          trade.notes?.toLowerCase() || '',
          trade.strategy?.toLowerCase() || '',
          trade.timeIn || '',
          trade.timeOut || '',
          // Add any other trade fields that exist
        ].join(' ');
        
        if (!searchableFields.includes(query)) {
          return false;
        }
      }
      
      // Symbol filter
      if (filters.symbol && !trade.symbol.toLowerCase().includes(filters.symbol.toLowerCase())) {
        return false;
      }
      
      // Side filter
      if (filters.side !== 'all' && trade.side !== filters.side) {
        return false;
      }
      
      // Status filter
      if (filters.status !== 'all' && trade.status !== filters.status) {
        return false;
      }
      
      // Date range filter
      if (filters.dateFrom && trade.date < filters.dateFrom) {
        return false;
      }
      if (filters.dateTo && trade.date > filters.dateTo) {
        return false;
      }
      
      // P&L range filter (only for closed trades with P&L)
      if (trade.pnl !== undefined && trade.pnl !== null) {
        if (filters.minPnL && trade.pnl < parseFloat(filters.minPnL)) {
          return false;
        }
        if (filters.maxPnL && trade.pnl > parseFloat(filters.maxPnL)) {
          return false;
        }
      }
      
      return true;
    });
  }, [trades, filters, searchQuery]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return searchQuery.trim() !== '' ||
           filters.symbol !== '' ||
           filters.side !== 'all' ||
           filters.status !== 'all' ||
           filters.dateFrom !== '' ||
           filters.dateTo !== '' ||
           filters.minPnL !== '' ||
           filters.maxPnL !== '';
  }, [filters, searchQuery]);

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setFilters({
      symbol: '',
      side: 'all',
      status: 'all',
      dateFrom: '',
      dateTo: '',
      minPnL: '',
      maxPnL: '',
    });
  };

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

  // Navigate to trade details page
  const handleReviewTrade = (trade: Trade) => {
    navigate(`/trade/${trade.id}`);
  };

  const handleTradeClick = (trade: Trade) => {
    navigate(`/trade/${trade.id}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trades</h1>
          <p className="text-gray-600 mt-1">View and manage all your trading activity</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Net cumulative P&L" 
          value={`$${totalPnL.toFixed(2)}`}
          color={totalPnL >= 0 ? "green" : "red"}
        />
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
          color={closedTrades.length === 0 ? "red" : avgWin > 0 ? "green" : "red"}
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3">
        <div className="flex items-center space-x-4">
          {/* Universal Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search trades..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Trade Count */}
          <div className="text-sm text-gray-500">
            {filteredTrades.length} {filteredTrades.length === 1 ? 'trade' : 'trades'}
          </div>
          {/* Filter Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
              {hasActiveFilters && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-500 rounded-full">
                  {Object.values(filters).filter(value => value !== '' && value !== 'all').length}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showFilters && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-900">Filter Trades</h3>
                    {hasActiveFilters && (
                      <button
                        onClick={resetFilters}
                        className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        <X className="w-3 h-3" />
                        <span>Clear all</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Symbol Filter */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Symbol
                      </label>
                      <input
                        type="text"
                        placeholder="Search symbols..."
                        value={filters.symbol}
                        onChange={(e) => setFilters(prev => ({ ...prev, symbol: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Side and Status Filters */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Side
                        </label>
                        <select
                          value={filters.side}
                          onChange={(e) => setFilters(prev => ({ ...prev, side: e.target.value as 'all' | 'long' | 'short' }))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="all">All</option>
                          <option value="long">Long</option>
                          <option value="short">Short</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          value={filters.status}
                          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as 'all' | 'open' | 'closed' }))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="all">All</option>
                          <option value="open">Open</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                    </div>

                    {/* Date Range Filters */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Date From
                        </label>
                        <input
                          type="date"
                          value={filters.dateFrom}
                          onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Date To
                        </label>
                        <input
                          type="date"
                          value={filters.dateTo}
                          onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* P&L Range Filters */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Min P&L
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="e.g. -100"
                          value={filters.minPnL}
                          onChange={(e) => setFilters(prev => ({ ...prev, minPnL: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Max P&L
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="e.g. 500"
                          value={filters.maxPnL}
                          onChange={(e) => setFilters(prev => ({ ...prev, maxPnL: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Results Count */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                      Showing {filteredTrades.length} of {trades.length} trades
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trades Table or Empty State */}
      {filteredTrades.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
              {trades.length === 0 ? (
                <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <Filter className="w-full h-full" />
              )}
            </div>
            
            {trades.length === 0 ? (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No trades to show here</h3>
                <p className="text-gray-500 mb-6">Start by importing your trades or adding them manually</p>
                
                <button className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors mx-auto">
                  <Upload className="w-4 h-4" />
                  <span>Import trades</span>
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No trades match your filters</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filter criteria or clearing all filters</p>
                
                <button 
                  onClick={resetFilters}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors mx-auto"
                >
                  <X className="w-4 h-4" />
                  <span>Clear all filters</span>
                </button>
              </>
            )}
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
                {filteredTrades.map((trade) => (
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

      <EditTradeModal 
        trade={trades.find(t => t.id === editingTradeId) || null}
        isOpen={editingTradeId !== null}
        onClose={() => setEditingTradeId(null)}
      />
    </div>
  );
};

export default TradeLog;
