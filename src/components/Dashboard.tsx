import React from 'react';
import { useTradeContext } from '../contexts/TradeContext';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { formatDateForTable } from '../lib/dateUtils';

interface DashboardProps {
  onNavigateToJournal?: (date: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigateToJournal }) => {
  const { user } = useAuth();
  const { trades, loading } = useTradeContext();

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Zella Trade Scribe</h1>
          <p className="text-gray-600 mt-2">
            Hello {user?.displayName || user?.email}! Your trading journal is ready.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Trades</h3>
          <p className="text-2xl font-bold text-gray-900">{trades.length}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Open Trades</h3>
          <p className="text-2xl font-bold text-blue-600">
            {trades.filter(trade => trade.status === 'open').length}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Closed Trades</h3>
          <p className="text-2xl font-bold text-green-600">
            {trades.filter(trade => trade.status === 'closed').length}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total P&L</h3>
          <p className="text-2xl font-bold text-gray-900">
            ${trades.reduce((total, trade) => total + (trade.pnl || 0), 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h2>
        <div className="space-y-3">
          <p className="text-gray-600">
            🎉 <strong>Success!</strong> Firebase authentication is working and you're logged in.
          </p>
          <p className="text-gray-600">
            📊 Use the sidebar to navigate between different sections of your trading journal.
          </p>
          <p className="text-gray-600">
            ➕ Click "Add Trade" to start logging your trades.
          </p>
          <p className="text-gray-600">
            📈 Your data will automatically sync across all your devices.
          </p>
        </div>
      </div>

      {/* Recent Trades */}
      {trades.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Trades</h2>
          <div className="space-y-2">
            {trades.slice(0, 5).map((trade) => (
              <div key={trade.id} className="flex justify-between items-center py-2 border-b">
                <div>
                  <span className="font-medium">{trade.symbol}</span>
                  <span className="text-gray-500 ml-2">{formatDateForTable(trade.date)}</span>
                </div>
                <div className={`font-medium ${(trade.pnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trade.pnl ? `$${trade.pnl.toFixed(2)}` : '-'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
