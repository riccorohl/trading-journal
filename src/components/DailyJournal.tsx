
import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Calendar, Plus, Clock, DollarSign, TrendingUp, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

const mockEntries: JournalEntry[] = [
  {
    date: 'Mon, May 05, 2025',
    netPnL: 0,
    totalTrades: 0,
    winners: 0,
    losers: 0,
    grossPnL: 0,
    commissions: 0,
    winrate: 0,
    volume: 0,
    profitFactor: 0
  },
  {
    date: 'Fri, Apr 04, 2025',
    netPnL: 0,
    totalTrades: 0,
    winners: 0,
    losers: 0,
    grossPnL: 0,
    commissions: 0,
    winrate: 0,
    volume: 0,
    profitFactor: 0
  },
  {
    date: 'Fri, Aug 09, 2024',
    netPnL: 0,
    totalTrades: 0,
    winners: 0,
    losers: 0,
    grossPnL: 0,
    commissions: 0,
    winrate: 0,
    volume: 0,
    profitFactor: 0
  }
];

const DailyJournal: React.FC = () => {
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [selectedMonth, setSelectedMonth] = useState('May 2025');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const toggleExpanded = (date: string) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedEntries(newExpanded);
  };

  const openDay = (date: string) => {
    setSelectedDay(date);
  };

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
          <button className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded">
            Collapse all
          </button>
          <button className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded">
            Expand all
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">{selectedMonth}</span>
          <div className="flex items-center space-x-2">
            <button className="p-1 hover:bg-gray-100 rounded">←</button>
            <button className="p-1 hover:bg-gray-100 rounded">→</button>
          </div>
        </div>
      </div>

      {/* Journal Entries */}
      <div className="space-y-4">
        {mockEntries.map((entry) => {
          const isExpanded = expandedEntries.has(entry.date);
          
          return (
            <div key={entry.date} className="bg-white rounded-lg border border-gray-200">
              {/* Entry Header */}
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
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
                    <p className="text-sm text-gray-500">Net P&L ${entry.netPnL.toFixed(2)}</p>
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
                    No Closed NET P&L on this day
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
                      <div className="text-lg font-semibold text-gray-900">${entry.grossPnL.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">Gross P&L</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">${entry.commissions.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">Commissions</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">--</div>
                      <div className="text-sm text-gray-500">Winrate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{entry.losers}</div>
                      <div className="text-sm text-gray-500">Losers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{entry.volume}</div>
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
        })}
      </div>

      {/* Open Day Modal */}
      <Dialog open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Trading Day - {selectedDay}</span>
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trades">Trades</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="review">Review</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">Net P&L</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">$0.00</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">Total Trades</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">0</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-600">Win Rate</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">--%</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-600">Events</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">0</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Market Conditions</h3>
                  <Input placeholder="e.g., Trending market, high volatility..." />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="trades" className="mt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-900">Trades for this day</h3>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Trade
                  </Button>
                </div>
                <div className="text-center py-8 text-gray-500">
                  No trades recorded for this day
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="notes" className="mt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="premarket-notes">Pre-Market Notes</Label>
                  <Textarea 
                    id="premarket-notes"
                    placeholder="Market outlook, planned trades, strategy for the day..."
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="trading-notes">Trading Notes</Label>
                  <Textarea 
                    id="trading-notes"
                    placeholder="Real-time observations, trade decisions, market behavior..."
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="post-market-notes">Post-Market Notes</Label>
                  <Textarea 
                    id="post-market-notes"
                    placeholder="Reflection on the day, lessons learned, what to improve..."
                    rows={4}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="review" className="mt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="what-went-well">What went well?</Label>
                  <Textarea 
                    id="what-went-well"
                    placeholder="Successful trades, good decisions, strategy execution..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="what-to-improve">What could be improved?</Label>
                  <Textarea 
                    id="what-to-improve"
                    placeholder="Mistakes made, areas for improvement, strategy adjustments..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="key-lessons">Key lessons learned</Label>
                  <Textarea 
                    id="key-lessons"
                    placeholder="Important insights, market observations, personal development..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="tomorrow-plan">Plan for tomorrow</Label>
                  <Textarea 
                    id="tomorrow-plan"
                    placeholder="Strategy adjustments, focus areas, specific goals..."
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
            <Button variant="outline" onClick={() => setSelectedDay(null)}>
              Close
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DailyJournal;
