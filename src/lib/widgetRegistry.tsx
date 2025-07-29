import React from 'react';
import MetricCard from '../components/MetricCard';
import CalendarWidget from '../components/CalendarWidget';

export interface WidgetConfig {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  defaultLayout: {
    w: number;
    h: number;
  };
  minSize: {
    w: number;
    h: number;
  };
  category: 'metrics' | 'charts' | 'analytics' | 'tools';
  description: string;
}

// Shared metric widget structure for perfect alignment - UPDATED
const MetricWidgetLayout: React.FC<{
  title: string;
  mainValue: string;
  subtitle?: string;
  icon?: React.ReactNode;
}> = ({ title, mainValue, subtitle, icon }) => {
  return (
    <div className="grid grid-cols-[1fr_auto] h-full">
      {/* Column 1: Main Content */}
      <div className="flex flex-col">
        <h3 className="text-sm font-medium text-gray-600">
          {title}
        </h3>
        <div className="mt-auto">
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {mainValue}
          </div>
          <div className="text-sm text-gray-500" style={{ minHeight: '1.25rem' }}>
            {subtitle || '\u00A0'}
          </div>
        </div>
      </div>

      {/* Column 2: Icon */}
      <div className="w-8 flex items-start justify-center">
        {icon}
      </div>
    </div>
  );
};

// Individual widget components using the shared layout
const NetPnLWidget: React.FC<{ metrics: any; size?: { w: number; h: number } }> = ({ metrics, size }) => {
  const isCompact = size && size.w <= 2;
  const trend = metrics.netPnL >= 0 ? 'up' : 'down';
  const trendIcon = (
    <div className={`text-xl ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
      {trend === 'up' ? '↗' : '↘'}
    </div>
  );

  return (
    <MetricWidgetLayout
      title="Net P&L"
      mainValue={`$${metrics.netPnL.toFixed(2)}`}
      subtitle={!isCompact ? `${metrics.totalTrades} trades` : undefined}
      icon={trendIcon}
    />
  );
};

const TradeExpectancyWidget: React.FC<{ metrics: any; size?: { w: number; h: number } }> = ({ metrics, size }) => {
  return (
    <MetricWidgetLayout
      title="Trade Expectancy"
      mainValue={`$${metrics.tradeExpectancy.toFixed(2)}`}
      subtitle="Per trade"
    />
  );
};

const ProfitFactorWidget: React.FC<{ metrics: any; size?: { w: number; h: number } }> = ({ metrics, size }) => {
  const showChart = size && size.w >= 2;
  const chartIcon = (
    <div className="relative w-8 h-8">
      <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 64 64">
        <circle
          cx="32"
          cy="32"
          r="24"
          stroke="#e5e7eb"
          strokeWidth="6"
          fill="none"
        />
        <circle
          cx="32"
          cy="32"
          r="24"
          stroke="#10b981"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${Math.min(metrics.profitFactor / 5, 1) * 150} 150`}
        />
      </svg>
    </div>
  );

  return (
    <MetricWidgetLayout
      title="Profit Factor"
      mainValue={metrics.profitFactor.toFixed(2)}
      icon={showChart ? chartIcon : undefined}
    />
  );
};

const WinRateWidget: React.FC<{ metrics: any; size?: { w: number; h: number } }> = ({ metrics, size }) => {
  const showChart = size && size.w >= 2;
  const chartIcon = (
    <div className="relative w-8 h-8">
      <svg className="w-8 h-8" viewBox="0 0 64 64">
        <circle
          cx="32"
          cy="32"
          r="24"
          stroke="#ef4444"
          strokeWidth="6"
          fill="none"
        />
        <circle
          cx="32"
          cy="32"
          r="24"
          stroke="#10b981"
          strokeWidth="6"
          fill="none"
          strokeDasharray={`${(metrics.winRate / 100) * 150} 150`}
          transform="rotate(-90 32 32)"
        />
      </svg>
    </div>
  );

  return (
    <MetricWidgetLayout
      title="Win %"
      mainValue={`${metrics.winRate.toFixed(2)}%`}
      subtitle={`${Math.round((metrics.winRate / 100) * metrics.totalTrades)} wins`}
      icon={showChart ? chartIcon : undefined}
    />
  );
};

const AvgWinLossWidget: React.FC<{ metrics: any; size?: { w: number; h: number } }> = ({ metrics, size }) => {
  return (
    <MetricWidgetLayout
      title="Avg win/loss trade"
      mainValue={metrics.avgLoss > 0 ? (metrics.avgWin / metrics.avgLoss).toFixed(1) : '0'}
      subtitle={`$${metrics.avgWin.toFixed(2)} / $${metrics.avgLoss.toFixed(2)}`}
    />
  );
};

const ZellaScoreWidget: React.FC<{ metrics: any; size?: { w: number; h: number } }> = ({ metrics, size }) => {
  const isCompact = size && size.w <= 2;
  const isExpanded = size && size.w >= 4;

  return (
    <>
      {isCompact ? (
        <div className="flex-1 flex flex-col justify-center items-center">
          <div className="text-lg font-semibold text-gray-900">Zella Score</div>
          <div className="text-3xl font-bold text-purple-600">{Math.round(metrics.zellaScore)}</div>
          <div className="text-xs text-green-600">+1</div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Zella Score</h3>
            <span className="text-sm text-gray-500">ⓘ</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-32 h-32 mb-4">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 144 144">
                <circle cx="72" cy="72" r="60" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke="#8b5cf6"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${(metrics.zellaScore / 100) * 377} 377`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{Math.round(metrics.zellaScore)}</div>
                  <div className="text-xs text-green-600">+1</div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <span className="text-lg font-semibold text-gray-900">Your Zella Score: {Math.round(metrics.zellaScore)}</span>
            </div>
          </div>
        </>
      )}
    </>
  );
};

const RecentTradesWidget: React.FC<{ trades: any[]; handleTradeClick: (trade: any) => void; size?: { w: number; h: number } }> = ({ 
  trades, 
  handleTradeClick, 
  size 
}) => {
  const isCompact = size && size.w <= 2;
  const isExpanded = size && size.w >= 4;
  const recentTrades = trades.slice(0, isExpanded ? 6 : isCompact ? 2 : 4);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">Recent Trades</h3>
      </div>

      <div className="flex-1 overflow-y-auto -mr-4 pr-4">
        {recentTrades.length > 0 ? (
          <div className="space-y-2">
            {recentTrades.map((trade) => (
              <div
                key={trade.id}
                className="flex justify-between items-center p-2 border border-gray-100 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleTradeClick(trade)}
              >
                <div className="flex items-center space-x-2">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{trade.currencyPair}</div>
                    {!isCompact && <div className="text-xs text-gray-500">{new Date(trade.date).toLocaleDateString()}</div>}
                  </div>
                  {!isCompact && (
                    <span
                      className={`px-1 py-0.5 text-xs font-semibold rounded ${
                        trade.side === 'long' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {trade.side?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${(trade.pnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trade.pnl ? `$${trade.pnl.toFixed(2)}` : 'Open'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p className="text-sm">No recent trades</p>
          </div>
        )}
      </div>
    </>
  );
};

const CalendarWidgetWrapper: React.FC<{ trades: any[]; onDateClick: (date: string) => void }> = ({ 
  trades, 
  onDateClick 
}) => {
  return (
    <CalendarWidget trades={trades} onDateClick={onDateClick} />
  );
};

// Widget Registry
export const WIDGET_REGISTRY: WidgetConfig[] = [
  {
    id: 'netPnl',
    title: 'Net P&L',
    component: NetPnLWidget,
    defaultLayout: { w: 2, h: 2 },
    minSize: { w: 1, h: 2 },
    category: 'metrics',
    description: 'Shows your total net profit and loss'
  },
  {
    id: 'tradeExpectancy',
    title: 'Trade Expectancy',
    component: TradeExpectancyWidget,
    defaultLayout: { w: 2, h: 2 },
    minSize: { w: 1, h: 2 },
    category: 'metrics',
    description: 'Average expected profit per trade'
  },
  {
    id: 'profitFactor',
    title: 'Profit Factor',
    component: ProfitFactorWidget,
    defaultLayout: { w: 2, h: 2 },
    minSize: { w: 1, h: 2 },
    category: 'metrics',
    description: 'Ratio of gross profit to gross loss'
  },
  {
    id: 'winRate',
    title: 'Win Rate',
    component: WinRateWidget,
    defaultLayout: { w: 2, h: 2 },
    minSize: { w: 1, h: 2 },
    category: 'metrics',
    description: 'Percentage of winning trades'
  },
  {
    id: 'avgWinLoss',
    title: 'Avg Win/Loss',
    component: AvgWinLossWidget,
    defaultLayout: { w: 2, h: 2 },
    minSize: { w: 1, h: 2 },
    category: 'metrics',
    description: 'Average win compared to average loss'
  },
  {
    id: 'zellaScore',
    title: 'Zella Score',
    component: ZellaScoreWidget,
    defaultLayout: { w: 3, h: 4 },
    minSize: { w: 2, h: 3 },
    category: 'analytics',
    description: 'Overall trading performance score'
  },
  {
    id: 'recentTrades',
    title: 'Recent Trades',
    component: RecentTradesWidget,
    defaultLayout: { w: 3, h: 4 },
    minSize: { w: 2, h: 3 },
    category: 'analytics',
    description: 'List of your most recent trades'
  },
  {
    id: 'calendar',
    title: 'Trading Calendar',
    component: CalendarWidgetWrapper,
    defaultLayout: { w: 10, h: 5 },
    minSize: { w: 6, h: 4 },
    category: 'tools',
    description: 'Calendar view of your trading activity'
  }
];

// Default dashboard layout - mimics the original clean structure
export const DEFAULT_ACTIVE_WIDGETS = [
  'netPnl',
  'tradeExpectancy', 
  'profitFactor',
  'winRate',
  'avgWinLoss',
  'zellaScore',
  'recentTrades',
  'calendar'
];

// Helper function to get widget by ID
export const getWidgetById = (id: string): WidgetConfig | undefined => {
  return WIDGET_REGISTRY.find(widget => widget.id === id);
};

// Helper function to get available widgets (not currently active)
export const getAvailableWidgets = (activeWidgets: string[]): WidgetConfig[] => {
  return WIDGET_REGISTRY.filter(widget => !activeWidgets.includes(widget.id));
};
