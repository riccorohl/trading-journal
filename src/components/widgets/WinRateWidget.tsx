import React from 'react';
import { WidgetProps } from '../../types/widget';
import { getWidgetSizeInfo } from '../ui/WidgetContainer';

const WinRateWidget: React.FC<WidgetProps> = ({ metrics, size }) => {
  const sizeInfo = getWidgetSizeInfo(size);
  return (
    <div className="flex flex-col justify-center h-full">
      <div className={`font-bold text-gray-900 ${sizeInfo.isCompact ? 'text-xl' : 'text-3xl'}`}>
        {metrics.winRate.toFixed(1)}%
      </div>
      {!sizeInfo.isCompact && (
        <div className="text-sm text-gray-500 mt-1">
          {Math.round((metrics.winRate / 100) * metrics.totalTrades)} wins
        </div>
      )}
    </div>
  );
};

export default WinRateWidget;
