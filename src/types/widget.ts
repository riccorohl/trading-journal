import { Trade } from './trade';

export interface Metrics {
  netPnL: number;
  totalTrades: number;
  tradeExpectancy: number;
  profitFactor: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  zellaScore: number;
}

export type WidgetCategory = 'overview' | 'performance' | 'trades' | 'analysis';

export interface WidgetProps {
  metrics: Metrics;
  trades: Trade[];
  size: { w: number; h: number };
  onDateClick?: (date: string) => void;
  handleTradeClick?: (tradeId: string) => void;
}

export interface WidgetConfig {
  id: string;
  title: string;
  component: React.ComponentType<Partial<WidgetProps>>;
  headerActions?: React.ComponentType<Partial<WidgetProps>>;
  defaultLayout: { w: number; h: number };
  minSize?: { w: number; h: number };
  maxSize?: { w: number; h: number };
  category: WidgetCategory;
  description: string;
  defaultSize: {
    w: number;
    h: number;
  };
}
