import React from 'react';
import { WidgetProps } from '../../types/widget';

const NetPnlHeader: React.FC<WidgetProps> = ({ metrics }) => {
  const trend = metrics.pnlTrend > 0 ? 'up' : 'down';
  return <div className={`text-xl ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>{trend === 'up' ? '↗' : '↘'}</div>;
};

export default NetPnlHeader;
