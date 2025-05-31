
import React from 'react';
import MetricCard from './MetricCard';
import { Upload } from 'lucide-react';

const TradeLog: React.FC = () => {
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
          <div className="text-3xl font-bold text-gray-900">$0.00</div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard 
          title="Profit factor" 
          value="N/A" 
          color="red"
          showProgress={true}
          progressValue={0}
        />
        <MetricCard 
          title="Trade win %" 
          value="0%" 
          color="red"
          showProgress={true}
          progressValue={0}
        />
        <MetricCard 
          title="Avg win/loss trade" 
          value="--" 
          subtitle="--"
          color="green"
        />
      </div>

      {/* Empty State */}
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
    </div>
  );
};

export default TradeLog;
