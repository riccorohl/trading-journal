import React from 'react';
import { WidgetProps } from '../../types/widget';
import MetricWidgetLayout from './MetricWidgetLayout';

const TradeExpectancyWidget: React.FC<WidgetProps> = ({ metrics }) => (
  <MetricWidgetLayout mainValue={`$${metrics.tradeExpectancy.toFixed(2)}`} subtitle="Per trade" />
);

export default TradeExpectancyWidget;
