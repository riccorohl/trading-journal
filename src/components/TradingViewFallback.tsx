import React from 'react';

interface TradingViewFallbackProps {
  trade: any;
  className?: string;
}

const TradingViewFallback: React.FC<TradingViewFallbackProps> = ({ trade, className = "" }) => {
  return (
    <div className={`flex items-center justify-center h-96 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 ${className}`}>
      <div className="text-center p-6">
        <div className="text-gray-600 text-lg font-medium mb-2">Chart Preview</div>
        <div className="text-gray-500 mb-4">
          Install: <code className="bg-gray-200 px-2 py-1 rounded text-sm">npm install lightweight-charts</code>
        </div>
        <div className="space-y-2 text-sm">
          <div><strong>Symbol:</strong> {trade.symbol}</div>
          <div><strong>Entry:</strong> ${trade.entryPrice}</div>
          {trade.exitPrice && <div><strong>Exit:</strong> ${trade.exitPrice}</div>}
          {trade.pnl && (
            <div className={trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
              <strong>P&L:</strong> ${trade.pnl.toFixed(2)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradingViewFallback;