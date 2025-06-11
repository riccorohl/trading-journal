
import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Calendar, Plus, Clock, DollarSign, TrendingUp, FileText, X, BarChart3 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTradeContext } from '../contexts/TradeContext';
import TradeReviewModal from './TradeReviewModal';
import { Trade } from '../types/trade';

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
  selectedDate?: string | null;
}

const DailyJournal: React.FC<DailyJournalProps> = ({ selectedDate }) => {
  const { trades } = useTradeContext();
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

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
  };

  const handleTradeClick = (trade: Trade) => {
    setSelectedTrade(trade);
    setIsReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
    setSelectedTrade(null);
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
              ←
            </button>
            <button 
              onClick={() => navigateMonth('next')}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Journal Entries */}
      <div className="space-y-4">
        {journalEntries.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No trades for {currentMonthYear}</h3>
            <p className="text-gray-500">Add some trades to see your daily journal entries</p>
          </div>
        ) : (
          journalEntries.map((entry) => {
            const isExpanded = expandedEntries.has(entry.date);
            
            return (
              <div key={entry.date} className="bg-white rounded-lg border border-gray-200">
                {/* Entry Header */}
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpanded(entry.date)}
                >
                  <div className="flex items-center space-x-3">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900">{entry.date}</h3>
                      <p className={`text-sm ${entry.netPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Net P&L ${entry.netPnL.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    className="flex items-center space-x-2 px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDay(entry.date);
                    }}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Open Day</span>
                  </button>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-200 p-4">
                    <div className="text-center text-gray-500 mb-4">
                      {entry.totalTrades === 0 ? 'No trades on this day' : `${entry.totalTrades} trades on this day`}
                    </div>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">{entry.totalTrades}</div>
                        <div className="text-sm text-gray-500">Total trades</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">{entry.winners}</div>
                        <div className="text-sm text-gray-500">Winners</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-semibold ${entry.netPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${entry.netPnL.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">Gross P&L</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">$0.00</div>
                        <div className="text-sm text-gray-500">Commissions</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {entry.totalTrades === 0 ? '--' : `${entry.winrate.toFixed(1)}%`}
                        </div>
                        <div className="text-sm text-gray-500">Winrate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">{entry.losers}</div>
                        <div className="text-sm text-gray-500">Losers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">0</div>
                        <div className="text-sm text-gray-500">Volume</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">--</div>
                        <div className="text-sm text-gray-500">Profit factor</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Enhanced Notebook-Style Modal */}
      <Dialog open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 overflow-hidden">
          {/* Custom Header */}
          <div className="flex items-center justify-between p-6 border-b bg-white">
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Trading Journal - {formatSelectedDayForDisplay()}</h1>
            </div>
            <button 
              onClick={() => setSelectedDay(null)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Main Content Area */}
          <div className="flex h-full overflow-hidden">
            {/* Left Sidebar - Trades & Summary */}
            <div className="w-80 border-r bg-gray-50 flex flex-col">
              {/* Daily Summary */}
              <div className="p-4 border-b bg-white">
                <h3 className="font-semibold text-gray-900 mb-3">Daily Summary</h3>
                <div className="grid grid-cols-2 gap-3">
                  {(() => {
                    const dayData = getSelectedDayData();
                    return (
                      <>
                        <div className="text-center p-2 bg-blue-50 rounded-lg">
                          <div className={`text-lg font-bold ${dayData.netPnL >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            ${dayData.netPnL.toFixed(2)}
                          </div>
                          <div className="text-xs text-blue-600">Net P&L</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded-lg">
                          <div className="text-lg font-bold text-green-600">{dayData.totalTrades}</div>
                          <div className="text-xs text-green-600">Trades</div>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded-lg">
                          <div className="text-lg font-bold text-purple-600">
                            {dayData.totalTrades === 0 ? '--' : `${dayData.winrate.toFixed(0)}`}%
                          </div>
                          <div className="text-xs text-purple-600">Win Rate</div>
                        </div>
                        <div className="text-center p-2 bg-orange-50 rounded-lg">
                          <div className="text-lg font-bold text-orange-600">0</div>
                          <div className="text-xs text-orange-600">Events</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Trades List */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-900">Trades</h3>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  
                  {/* Real Trade Items */}
                  <div className="space-y-2">
                    {getTradesForSelectedDay().length > 0 ? (
                      getTradesForSelectedDay().map((trade) => (
                        <div 
                          key={trade.id}
                          className="p-3 bg-white rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => handleTradeClick(trade)}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-sm">{trade.symbol}</span>
                            {trade.pnl !== undefined ? (
                              <span className={`text-sm font-medium ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-gray-500 text-sm">Open</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {trade.timeIn} - {trade.quantity} {trade.side === 'long' ? 'long' : 'short'}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-400">Click to review</span>
                            <BarChart3 className="w-3 h-3 text-gray-400" />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        No trades recorded for this day
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Main Area - Notebook */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Tabs */}
              <div className="border-b bg-white">
                <Tabs defaultValue="notes" className="w-full">
                  <TabsList className="w-full justify-start h-12 bg-transparent border-0 rounded-none">
                    <TabsTrigger 
                      value="notes" 
                      className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
                    >
                      Notes & Analysis
                    </TabsTrigger>
                    <TabsTrigger 
                      value="review" 
                      className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
                    >
                      Review & Reflection
                    </TabsTrigger>
                    <TabsTrigger 
                      value="strategy" 
                      className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
                    >
                      Strategy & Rules
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Tab Content */}
                  <div className="flex-1 overflow-y-auto">
                    <TabsContent value="notes" className="p-6 space-y-6 m-0">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="premarket-notes" className="text-base font-semibold">Pre-Market Analysis</Label>
                          <Textarea 
                            id="premarket-notes"
                            placeholder="Market outlook, planned trades, key levels to watch, earnings/events today..."
                            className="mt-2 min-h-[200px] resize-none"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="market-conditions" className="text-base font-semibold">Market Conditions</Label>
                          <Textarea 
                            id="market-conditions"
                            placeholder="Overall market sentiment, volatility, trends, sector rotation..."
                            className="mt-2 min-h-[200px] resize-none"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="trading-notes" className="text-base font-semibold">Live Trading Notes</Label>
                          <Textarea 
                            id="trading-notes"
                            placeholder="Real-time observations, trade entries/exits, market reactions..."
                            className="mt-2 min-h-[200px] resize-none"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="post-market-notes" className="text-base font-semibold">Post-Market Summary</Label>
                          <Textarea 
                            id="post-market-notes"
                            placeholder="How the day played out, major moves, key observations..."
                            className="mt-2 min-h-[200px] resize-none"
                          />
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="review" className="p-6 space-y-6 m-0">
                      <div className="space-y-6">
                        <div>
                          <Label htmlFor="what-went-well" className="text-base font-semibold">What Went Well Today?</Label>
                          <Textarea 
                            id="what-went-well"
                            placeholder="Successful trades, good decisions, discipline followed, emotions managed well..."
                            className="mt-2 min-h-[150px] resize-none"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="what-to-improve" className="text-base font-semibold">Areas for Improvement</Label>
                          <Textarea 
                            id="what-to-improve"
                            placeholder="Mistakes made, rules broken, emotional reactions, missed opportunities..."
                            className="mt-2 min-h-[150px] resize-none"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="key-lessons" className="text-base font-semibold">Key Lessons Learned</Label>
                          <Textarea 
                            id="key-lessons"
                            placeholder="Important insights, market behavior patterns, personal development..."
                            className="mt-2 min-h-[150px] resize-none"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="tomorrow-plan" className="text-base font-semibold">Tomorrow's Game Plan</Label>
                          <Textarea 
                            id="tomorrow-plan"
                            placeholder="Strategy adjustments, watchlist, key levels, focus areas..."
                            className="mt-2 min-h-[150px] resize-none"
                          />
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="strategy" className="p-6 space-y-6 m-0">
                      <div className="space-y-6">
                        <div>
                          <Label htmlFor="rules-followed" className="text-base font-semibold">Trading Rules Followed</Label>
                          <Textarea 
                            id="rules-followed"
                            placeholder="Which rules did I follow today? Risk management, position sizing, stop losses..."
                            className="mt-2 min-h-[150px] resize-none"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="rules-broken" className="text-base font-semibold">Rules Broken (if any)</Label>
                          <Textarea 
                            id="rules-broken"
                            placeholder="Any deviations from my trading plan? Why did this happen?"
                            className="mt-2 min-h-[150px] resize-none"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="strategy-performance" className="text-base font-semibold">Strategy Performance</Label>
                          <Textarea 
                            id="strategy-performance"
                            placeholder="How well did my main strategies work today? Any adjustments needed?"
                            className="mt-2 min-h-[150px] resize-none"
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t bg-white">
            <Button variant="outline" onClick={() => setSelectedDay(null)}>
              Close
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <TradeReviewModal 
        trade={selectedTrade}
        isOpen={isReviewModalOpen}
        onClose={handleCloseReviewModal}
      />
    </div>
  );
};

export default DailyJournal;
