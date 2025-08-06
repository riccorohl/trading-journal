import React from 'react';
import { WidgetProps } from '../../types/widget';
import MetricWidgetLayout from './MetricWidgetLayout';

const AvgWinLossWidget: React.FC<WidgetProps> = ({ metrics }) => (
  <MetricWidgetLayout
    mainValue={metrics.avgLoss > 0 ? (metrics.avgWin / metrics.avgLoss).toFixed(1) : '0'}
    subtitle={`$${metrics.avgWin.toFixed(2)} / $${metrics.avgLoss.toFixed(2)}`}
  />
);

export default AvgWinLossWidget;
