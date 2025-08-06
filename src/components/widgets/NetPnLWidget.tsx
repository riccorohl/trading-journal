import React from 'react';
import { WidgetProps } from '../../types/widget';
import { getWidgetSizeInfo } from '../ui/WidgetContainer';

const NetPnLWidget: React.FC<WidgetProps> = ({ metrics, size }) => {
  const sizeInfo = getWidgetSizeInfo(size);
  return (
    <div className="flex flex-col justify-center h-full">
      <div className={`font-bold text-gray-900 ${sizeInfo.isCompact ? 'text-xl' : 'text-3xl'}`}>
        ${metrics.netPnL.toFixed(2)}
      </div>
      {!sizeInfo.isCompact && (
        <div className="text-sm text-gray-500 mt-1">
          {metrics.totalTrades} trades
        </div>
      )}
    </div>
  );
};

export default NetPnLWidget;
