import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTradeContext } from '../contexts/TradeContext';
import { Trade } from '../lib/firebaseService';
import { Calendar, ChevronDown, ChevronRight, ChevronLeft, FileText } from 'lucide-react';
import DailyJournalView from './DailyJournalView';

interface JournalEntry {
  date: string;
  netPnL: number;
  totalTrades: number;
  winners: number;
  losers: number;
  grossPnL: number;
  commissions: number;
  winrate: number;
  volume: number;
  profitFactor: number;
}

interface DailyJournalProps {
  selectedDate?: string;
}

const DailyJournal: React.FC<DailyJournalProps> = ({ selectedDate }) => {
  const navigate = useNavigate();
  const { trades } = useTradeContext();
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showJournalView, setShowJournalView] = useState(false);

  // Auto-open the selected date from calendar
  useEffect(() => {
    if (selectedDate) {
      console.log('DailyJournal received selectedDate:', selectedDate);
      setSelectedDay(selectedDate);
    }
  }, [selectedDate]);

  // Generate journal entries from actual trades only
  const generateJournalEntries = () => {
    const tradesByDate = new Map<string, Trade[]>();
    
    // Filter trades by current month and year
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Group trades by date for the current month
    trades.forEach(trade => {
      // Parse the trade date (YYYY-MM-DD format)
      const [year, month, day] = trade.date.split('-').map(Number);
      
      if (month - 1 === currentMonth && year === currentYear) {
        const date = trade.date; // Keep original YYYY-MM-DD format
        
        if (!tradesByDate.has(date)) {
          tradesByDate.set(date, []);
        }
        tradesByDate.get(date)!.push(trade);
      }
    });

    // Create journal entries only for dates with trades
    const entries: JournalEntry[] = [];
    
    tradesByDate.forEach((dayTrades, date) => {
      const tradeData = getTradeDataForDate(date);
      
      // Format date for display
      const [year, month, day] = date.split('-').map(Number);
      const displayDate = new Date(year, month - 1, day).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      });
      
      entries.push({
        date: displayDate,
        netPnL: tradeData.netPnL,
        totalTrades: tradeData.totalTrades,
        winners: tradeData.winners,
        losers: tradeData.losers,
        grossPnL: tradeData.netPnL,
        commissions: 0,
        winrate: tradeData.winrate,
        volume: 0,
        profitFactor: 0
      });
    });

    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getTradeDataForDate = (dateString: string) => {
    console.log('Getting trade data for date:', dateString);
    
    // dateString is in YYYY-MM-DD format from trades
    const dayTrades = trades.filter(trade => {
      console.log('Comparing trade.date:', trade.date, 'with dateString:', dateString);
      return trade.date === dateString;
    });
    
    console.log('Found trades:', dayTrades.length);
    
    const closedTrades = dayTrades.filter(trade => trade.status === 'closed');
    const winners = closedTrades.filter(trade => (trade.pnl || 0) > 0);
    const losers = closedTrades.filter(trade => (trade.pnl || 0) < 0);
    const netPnL = closedTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const winRate = closedTrades.length > 0 ? (winners.length / closedTrades.length) * 100 : 0;

    return {
      netPnL,
      totalTrades: dayTrades.length,
      winners: winners.length,
      losers: losers.length,
      winrate: winRate,
      trades: dayTrades
    };
  };

  const toggleExpanded = (date: string) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedEntries(newExpanded);
  };

  const collapseAll = () => {
    setExpandedEntries(new Set());
  };

  const expandAll = () => {
    const allDates = new Set(generateJournalEntries().map(entry => entry.date));
    setExpandedEntries(allDates);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
    // Clear expanded entries when changing months
    setExpandedEntries(new Set());
  };

  const openDay = (date: string) => {
    console.log('Opening day:', date);
    // Convert display date back to YYYY-MM-DD format
    const displayDate = new Date(date);
    const isoDate = displayDate.toISOString().split('T')[0];
    console.log('Converted to ISO date:', isoDate);
    setSelectedDay(isoDate);
    setShowJournalView(true);
  };

  const handleTradeClick = (trade: Trade) => {
    navigate(`/trade/${trade.id}`);
  };

  const handleCloseJournalView = () => {
    setShowJournalView(false);
  };

  const getTradesForSelectedDay = () => {
    if (!selectedDay) return [];
    console.log('Getting trades for selected day:', selectedDay);
    
    // selectedDay is now in YYYY-MM-DD format
    const dayTrades = trades.filter(trade => {
      console.log('Checking trade:', trade.date, 'against selected day:', selectedDay);
      return trade.date === selectedDay;
    });
    
    console.log('Found trades for selected day:', dayTrades.length);
    return dayTrades;
  };

  const getSelectedDayData = () => {
    if (!selectedDay) return { netPnL: 0, totalTrades: 0, winrate: 0 };
    return getTradeDataForDate(selectedDay);
  };

  const formatSelectedDayForDisplay = () => {
    if (!selectedDay) return '';
    // selectedDay is in YYYY-MM-DD format, convert to display format
    const [year, month, day] = selectedDay.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const journalEntries = generateJournalEntries();
  const currentMonthYear = currentDate.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  // If journal view is open, show it instead of the regular view
  if (showJournalView && selectedDay) {
    const [year, month, day] = selectedDay.split('-').map(Number);
    const selectedDateObj = new Date(year, month - 1, day);
    return (
      <DailyJournalView 
        selectedDate={selectedDateObj} 
        onClose={handleCloseJournalView} 
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Daily Journal</h1>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Calendar className="w-4 h-4" />
            <span>Start my day</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={collapseAll}
            className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            Collapse all
          </button>
          <button 
            onClick={expandAll}
            className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            Expand all
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">{currentMonthYear}</span>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => navigateMonth('prev')}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigateMonth('next')}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Journal Entries */}
      <div className="space-y-4">
        {journalEntries.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No trades recorded for {currentMonthYear}</p>
            <p className="text-sm text-gray-400 mt-2">
              Your trades will appear here as you log them
            </p>
          </div>
        ) : (
          journalEntries.map((entry) => (
            <div key={entry.date} className="bg-white rounded-lg shadow">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => toggleExpanded(entry.date)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {expandedEntries.has(entry.date) ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                    <div>
                      <h3 className="font-medium text-gray-900">{entry.date}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{entry.totalTrades} trades</span>
                        <span>•</span>
                        <span>{entry.winners}W / {entry.losers}L</span>
                        <span>•</span>
                        <span>{entry.winrate.toFixed(1)}% win rate</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className={`text-lg font-semibold ${
                      entry.netPnL >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${entry.netPnL.toFixed(2)}
                    </div>
                    <button
                      onClick={() => openDay(entry.date)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Open Day
                    </button>
                  </div>
                </div>

                {/* Expanded Trade Details */}
                {expandedEntries.has(entry.date) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="space-y-2">
                      {(() => {
                        const dayData = getTradeDataForDate(
                          new Date(entry.date).toISOString().split('T')[0]
                        );
                        return dayData.trades.map((trade) => (
                          <div
                            key={trade.id}
                            onClick={() => handleTradeClick(trade)}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="font-medium">{trade.symbol}</span>
                              <span className={`px-2 py-1 text-xs rounded ${
                                trade.direction === 'LONG' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {trade.direction}
                              </span>
                              <span className="text-sm text-gray-500">
                                {trade.timeIn} - {trade.timeOut}
                              </span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`font-medium ${
                                (trade.pnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                ${(trade.pnl || 0).toFixed(2)}
                              </span>
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>


    </div>
  );
};

export default DailyJournal;
