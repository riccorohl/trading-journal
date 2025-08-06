import React from 'react';
import { WidgetProps } from '../../types/widget';
import { getWidgetSizeInfo } from '../ui/WidgetContainer';

const ProfitFactorHeader: React.FC<WidgetProps> = ({ metrics, size }) => {
  if (getWidgetSizeInfo(size).isCompact) return null;
  return (
    <div className="relative w-8 h-8">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="24" stroke="#e5e7eb" strokeWidth="6" fill="none" />
        <circle cx="32" cy="32" r="24" stroke="#10b981" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray={`${Math.min(metrics.profitFactor / 5, 1) * 150} 150`} />
      </svg>
    </div>
  );
};

export default ProfitFactorHeader;
