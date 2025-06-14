import React from 'react';
import { useTradeContext } from '../contexts/TradeContext';

const TradeLogTest: React.FC = () => {
  const { trades, loading } = useTradeContext();

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Trade Log</h1>
        <p>Loading trades...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Trade Log</h1>
      <p>Found {trades.length} trades</p>
      
      {trades.length === 0 ? (
        <p className="text-gray-500">No trades found. Add some trades to see them here!</p>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Symbol</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Side</th>
                <th className="px-4 py-2 text-left">Entry</th>
                <th className="px-4 py-2 text-left">Exit</th>
                <th className="px-4 py-2 text-left">P&L</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr key={trade.id} className="border-t">
                  <td className="px-4 py-2">{trade.symbol}</td>
                  <td className="px-4 py-2">{trade.date}</td>
                  <td className="px-4 py-2">
                    <span className={trade.side === 'long' ? 'text-green-600' : 'text-red-600'}>
                      {trade.side.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-2">${trade.entryPrice}</td>
                  <td className="px-4 py-2">{trade.exitPrice ? `$${trade.exitPrice}` : 'Open'}</td>
                  <td className="px-4 py-2">
                    {trade.pnl ? (
                      <span className={trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                        ${trade.pnl.toFixed(2)}
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TradeLogTest;