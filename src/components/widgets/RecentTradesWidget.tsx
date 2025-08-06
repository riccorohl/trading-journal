import React from 'react';
import { WidgetProps } from '../../types/widget';
import { Trade } from '../../types/trade';

const RecentTradesWidget: React.FC<WidgetProps> = ({ trades, handleTradeClick, size }) => {
  const isCompact = size.h <= 2;
  return (
    <div className="flex-1 overflow-y-auto pr-2">
      <ul className="space-y-2">
        {trades.slice(0, isCompact ? 3 : 10).map((trade: Trade) => (
          <li
            key={trade.id}
            onClick={() => handleTradeClick(trade.id)}
            className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors duration-150"
          >
            <div>
              <span className="font-semibold text-gray-800">{trade.pair}</span>
              <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${trade.type === 'buy' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                {trade.type}
              </span>
            </div>
            <div className={`font-semibold ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentTradesWidget;
