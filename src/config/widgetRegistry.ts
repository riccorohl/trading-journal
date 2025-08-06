import { WidgetConfig, WidgetCategory } from '../types/widget';
import {
  NetPnLWidget,
  TradeExpectancyWidget,
  ProfitFactorWidget,
  WinRateWidget,
  AvgWinLossWidget,
  ZellaScoreWidget,
  RecentTradesWidget,
  NetPnlHeader,
  ProfitFactorHeader,
  WinRateHeader,
} from '../lib/widgetRegistry';
import PerformanceChartWidget from '../components/PerformanceChartWidget';
import CalendarWidget from '../components/CalendarWidget';

export const WIDGET_REGISTRY: WidgetConfig[] = [
  // Category: 'overview' - These will be in the static top bar
  { id: 'netPnl', title: 'Net P&L', component: NetPnLWidget, headerActions: NetPnlHeader, defaultLayout: { w: 2, h: 1 }, minSize: { w: 1, h: 1 }, category: 'overview', description: 'Shows your total net profit and loss' },
  { id: 'tradeExpectancy', title: 'Trade Expectancy', component: TradeExpectancyWidget, defaultLayout: { w: 2, h: 1 }, minSize: { w: 2, h: 1 }, category: 'overview', description: 'Average expected profit per trade' },
  { id: 'profitFactor', title: 'Profit Factor', component: ProfitFactorWidget, headerActions: ProfitFactorHeader, defaultLayout: { w: 2, h: 1 }, minSize: { w: 1, h: 1 }, category: 'overview', description: 'Ratio of gross profit to gross loss' },
  { id: 'winRate', title: 'Win Rate', component: WinRateWidget, headerActions: WinRateHeader, defaultLayout: { w: 2, h: 1 }, minSize: { w: 1, h: 1 }, category: 'overview', description: 'Percentage of winning trades' },
  { id: 'avgWinLoss', title: 'Avg Win/Loss', component: AvgWinLossWidget, defaultLayout: { w: 2, h: 1 }, minSize: { w: 2, h: 1 }, category: 'overview', description: 'Average win compared to average loss' },
  
  // Categories for the customizable grid
  { id: 'zellaScore', title: 'Zella Score', component: ZellaScoreWidget, defaultLayout: { w: 6, h: 4 }, minSize: { w: 6, h: 4 }, category: 'analysis', description: 'Overall trading performance score' },
  { id: 'recentTrades', title: 'Recent Trades', component: RecentTradesWidget, defaultLayout: { w: 6, h: 4 }, minSize: { w: 6, h: 4 }, category: 'trades', description: 'List of your most recent trades' },
  { id: 'performanceChart', title: 'Performance Chart', component: PerformanceChartWidget, defaultLayout: { w: 6, h: 4 }, minSize: { w: 6, h: 4 }, category: 'performance', description: 'Cumulative P&L over time' },
  { id: 'calendar', title: 'Trading Calendar', component: CalendarWidget, defaultLayout: { w: 6, h: 4 }, minSize: { w: 6, h: 4 }, category: 'analysis', description: 'Calendar view of your trading activity' }
];

// Default dashboard layout
export const DEFAULT_METRIC_WIDGETS = ['netPnl', 'tradeExpectancy', 'profitFactor', 'winRate', 'avgWinLoss'];
export const DEFAULT_MAIN_WIDGETS = ['performanceChart', 'calendar', 'recentTrades', 'zellaScore'];

// Helper functions
export const getWidgetById = (id: string): WidgetConfig | undefined => WIDGET_REGISTRY.find(widget => widget.id === id);
export const getWidgetsByCategory = (category: WidgetCategory): WidgetConfig[] => WIDGET_REGISTRY.filter(widget => widget.category === category);
export const getAvailableWidgets = (activeWidgets: string[]): WidgetConfig[] => WIDGET_REGISTRY.filter(widget => !activeWidgets.includes(widget.id) && widget.category !== 'overview');
