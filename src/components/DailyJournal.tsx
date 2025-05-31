
import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Eye, Calendar } from 'lucide-react';

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

  const toggleExpanded = (date: string) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedEntries(newExpanded);
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
                
                <button className="flex items-center space-x-2 px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
                  <Eye className="w-4 h-4" />
                  <span>View note</span>
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
    </div>
  );
};

export default DailyJournal;
