import React from 'react';
import { useTradeContext } from '../contexts/TradeContext';

const DailyJournalTest: React.FC = () => {
  const { trades, loading } = useTradeContext();

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Journal</h1>
        <p>Loading...</p>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const todayTrades = trades.filter(trade => trade.date === today);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Journal</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Today's Summary</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-gray-600">Total Trades</div>
            <div className="text-2xl font-bold">{todayTrades.length}</div>
          </div>
          <div>
            <div className="text-gray-600">Total P&L</div>
            <div className="text-2xl font-bold">
              ${todayTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0).toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-gray-600">Win Rate</div>
            <div className="text-2xl font-bold">
              {todayTrades.length > 0 
                ? `${((todayTrades.filter(t => (t.pnl || 0) > 0).length / todayTrades.length) * 100).toFixed(1)}%`
                : '0%'
              }
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Today's Trades</h2>
        {todayTrades.length === 0 ? (
          <p className="text-gray-500">No trades today. Start trading to see them here!</p>
        ) : (
          <div className="space-y-3">
            {todayTrades.map((trade) => (
              <div key={trade.id} className="border rounded p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium">{trade.symbol}</span>
                    <span className={`ml-2 px-2 py-1 rounded text-sm ${
                      trade.side === 'long' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {trade.side.toUpperCase()}
                    </span>
                  </div>
                  <div className={`font-medium ${
                    (trade.pnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trade.pnl ? `$${trade.pnl.toFixed(2)}` : 'Open'}
                  </div>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Entry: ${trade.entryPrice} | Exit: {trade.exitPrice ? `$${trade.exitPrice}` : 'Open'}
                </div>
                {trade.notes && (
                  <div className="text-sm text-gray-600 mt-1">
                    Notes: {trade.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Journal Entry</h2>
        <textarea 
          className="w-full h-32 p-3 border rounded-lg resize-none"
          placeholder="Write about today's trading session..."
        />
        <button className="mt-3 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Save Entry
        </button>
      </div>
    </div>
  );
};

export default DailyJournalTest;