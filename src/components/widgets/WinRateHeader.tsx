import React from 'react';
import { WidgetProps } from '../../types/widget';
import { getWidgetSizeInfo } from '../ui/WidgetContainer';

const WinRateHeader: React.FC<WidgetProps> = ({ metrics, size }) => {
  if (getWidgetSizeInfo(size).isCompact) return null;
  return (
    <div className="relative w-8 h-8">
      <svg className="w-full h-full" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="24" stroke="#ef4444" strokeWidth="6" fill="none" />
        <circle cx="32" cy="32" r="24" stroke="#10b981" strokeWidth="6" fill="none" strokeDasharray={`${(metrics.winRate / 100) * 150} 150`} transform="rotate(-90 32 32)" />
      </svg>
    </div>
  );
};

export default WinRateHeader;
