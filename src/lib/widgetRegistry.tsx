import React from 'react';
import CalendarWidget from '../components/CalendarWidget';
import PerformanceChartWidget from '../components/PerformanceChartWidget';
import { getWidgetSizeInfo } from '../components/ui/WidgetContainer';
import { WidgetProps, Metrics } from '../types/widget';
import { Trade } from '../types/trade';

export type WidgetCategory = 'metrics' | 'charts' | 'analytics' | 'tools';

export interface WidgetConfig {
  id: string;
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  headerActions?: React.ComponentType<any>;
  defaultLayout: {
    w: number;
    h: number;
  };
  minSize: {
    w: number;
    h: number;
  };
  maxSize?: {
    w: number;
    h: number;
  };
  category: WidgetCategory;
  description: string;
}

// SHARED LAYOUTS & COMPONENTS

const MetricWidgetLayout: React.FC<{
  mainValue: string;
  subtitle?: string;
  icon?: React.ReactNode;
}> = ({ mainValue, subtitle }) => {
  return (
    <div className="flex flex-col justify-center h-full text-center">
      <div className="text-3xl font-bold text-gray-900 mb-1">
        {mainValue}
      </div>
      <div className="text-sm text-gray-500" style={{ minHeight: '1.25rem' }}>
        {subtitle || '\u00A0'}
      </div>
    </div>
  );
};

// WIDGET CONTENT COMPONENTS (Purely for content, no containers)

const NetPnLWidget: React.FC<{ metrics: Metrics; size: { w: number; h: number } }> = ({ metrics, size }) => {
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

const TradeExpectancyWidget: React.FC<{ metrics: Metrics }> = ({ metrics }) => (
  <MetricWidgetLayout mainValue={`$${metrics.tradeExpectancy.toFixed(2)}`} subtitle="Per trade" />
);

const ProfitFactorWidget: React.FC<{ metrics: Metrics; size: { w: number; h: number } }> = ({ metrics, size }) => {
  const sizeInfo = getWidgetSizeInfo(size);
  return (
    <div className="flex flex-col justify-center h-full">
      <div className={`font-bold text-gray-900 ${sizeInfo.isCompact ? 'text-xl' : 'text-3xl'}`}>
        {metrics.profitFactor.toFixed(2)}
      </div>
      {!sizeInfo.isCompact && <div className="text-sm text-gray-500 mt-1">Profit vs Loss Ratio</div>}
    </div>
  );
};

const WinRateWidget: React.FC<{ metrics: Metrics; size: { w: number; h: number } }> = ({ metrics, size }) => {
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

const AvgWinLossWidget: React.FC<{ metrics: Metrics }> = ({ metrics }) => (
  <MetricWidgetLayout
    mainValue={metrics.avgLoss > 0 ? (metrics.avgWin / metrics.avgLoss).toFixed(1) : '0'}
    subtitle={`$${metrics.avgWin.toFixed(2)} / $${metrics.avgLoss.toFixed(2)}`}
  />
);

const ZellaScoreWidget: React.FC<{ metrics: Metrics; size: { w: number; h: number } }> = ({ metrics, size }) => {
  const isCompact = size.w <= 2;
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full">
      {isCompact ? (
        <>
          <div className="text-3xl font-bold text-purple-600">{Math.round(metrics.zellaScore)}</div>
          <div className="text-xs text-green-600">+1</div>
        </>
      ) : (
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 144 144">
            <circle cx="72" cy="72" r="60" stroke="#e5e7eb" strokeWidth="8" fill="none" />
            <circle
              cx="72" cy="72" r="60" stroke="#8b5cf6" strokeWidth="8" fill="none"
              strokeLinecap="round" strokeDasharray={`${(metrics.zellaScore / 100) * 377} 377`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{Math.round(metrics.zellaScore)}</div>
              <div className="text-xs text-green-600">+1</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface RecentTradesWidgetProps {
  trades: Trade[];
  handleTradeClick?: (tradeId: string) => void;
  size: { w: number; h: number };
}

const RecentTradesWidget: React.FC<RecentTradesWidgetProps> = ({ trades, handleTradeClick, size }) => {
  const isCompact = size.w <= 2;
  const numTrades = size.h > 3 ? 6 : size.h > 2 ? 4 : 2;
  const recentTrades = trades.slice(0, numTrades);

  return (
    <div className="flex-1 overflow-y-auto -mr-4 pr-4 h-full">
      {recentTrades.length > 0 ? (
        <div className="space-y-2">
          {recentTrades.map((trade) => (
            <div key={trade.id} className="flex justify-between items-center p-2 border border-gray-100 rounded hover:bg-gray-50 cursor-pointer" onClick={() => handleTradeClick?.(trade.id)}>
              <div className="flex items-center space-x-2">
                <div>
                  <div className="font-medium text-gray-900 text-sm">{trade.currencyPair}</div>
                  {!isCompact && <div className="text-xs text-gray-500">{new Date(trade.date).toLocaleDateString()}</div>}
                </div>
              </div>
              <div className={`text-sm font-medium ${(trade.pnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trade.pnl ? `$${trade.pnl.toFixed(2)}` : 'Open'}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500 h-full">
          <p className="text-sm">No recent trades</p>
        </div>
      )}
    </div>
  );
};

// HEADER ACTION COMPONENTS

const NetPnlHeader: React.FC<{ metrics: Metrics }> = ({ metrics }) => {
  const trend = metrics.netPnL >= 0 ? 'up' : 'down';
  return <div className={`text-xl ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>{trend === 'up' ? '↗' : '↘'}</div>;
};

const ProfitFactorHeader: React.FC<{ metrics: Metrics; size: { w: number; h: number } }> = ({ metrics, size }) => {
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

const WinRateHeader: React.FC<{ metrics: Metrics; size: { w: number; h: number } }> = ({ metrics, size }) => {
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

// WIDGET REGISTRY

export const WIDGET_REGISTRY: WidgetConfig[] = [
  // Category: 'metrics' - These will be in the static top bar
  { id: 'netPnl', title: 'Net P&L', component: NetPnLWidget, headerActions: NetPnlHeader, defaultLayout: { w: 2, h: 1 }, minSize: { w: 1, h: 1 }, category: 'metrics', description: 'Shows your total net profit and loss' },
  { id: 'tradeExpectancy', title: 'Trade Expectancy', component: TradeExpectancyWidget, defaultLayout: { w: 2, h: 1 }, minSize: { w: 2, h: 1 }, category: 'metrics', description: 'Average expected profit per trade' },
  { id: 'profitFactor', title: 'Profit Factor', component: ProfitFactorWidget, headerActions: ProfitFactorHeader, defaultLayout: { w: 2, h: 1 }, minSize: { w: 1, h: 1 }, category: 'metrics', description: 'Ratio of gross profit to gross loss' },
  { id: 'winRate', title: 'Win Rate', component: WinRateWidget, headerActions: WinRateHeader, defaultLayout: { w: 2, h: 1 }, minSize: { w: 1, h: 1 }, category: 'metrics', description: 'Percentage of winning trades' },
  { id: 'avgWinLoss', title: 'Avg Win/Loss', component: AvgWinLossWidget, defaultLayout: { w: 2, h: 1 }, minSize: { w: 2, h: 1 }, category: 'metrics', description: 'Average win compared to average loss' },
  
  // Category: 'analytics' & 'tools' - These will be in the customizable grid
  { id: 'zellaScore', title: 'Zella Score', component: ZellaScoreWidget, defaultLayout: { w: 6, h: 4 }, minSize: { w: 6, h: 4 }, category: 'analytics', description: 'Overall trading performance score' },
  { id: 'recentTrades', title: 'Recent Trades', component: RecentTradesWidget, defaultLayout: { w: 6, h: 4 }, minSize: { w: 6, h: 4 }, category: 'analytics', description: 'List of your most recent trades' },
  { id: 'performanceChart', title: 'Performance Chart', component: PerformanceChartWidget, defaultLayout: { w: 6, h: 4 }, minSize: { w: 6, h: 4 }, category: 'charts', description: 'Cumulative P&L over time' },
  { id: 'calendar', title: '', component: CalendarWidget, defaultLayout: { w: 6, h: 4 }, minSize: { w: 6, h: 4 }, category: 'tools', description: '' }
];

// Default dashboard layout
export const DEFAULT_METRIC_WIDGETS = ['netPnl', 'tradeExpectancy', 'profitFactor', 'winRate', 'avgWinLoss'];
export const DEFAULT_MAIN_WIDGETS = ['calendar'];

// Helper functions
export const getWidgetById = (id: string): WidgetConfig | undefined => WIDGET_REGISTRY.find(widget => widget.id === id);
export const getWidgetsByCategory = (category: WidgetCategory): WidgetConfig[] => WIDGET_REGISTRY.filter(widget => widget.category === category);
export const getAvailableWidgets = (activeWidgets: string[]): WidgetConfig[] => WIDGET_REGISTRY.filter(widget => !activeWidgets.includes(widget.id) && widget.category !== 'metrics');
