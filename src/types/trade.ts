
export interface Trade {
  id: string;
  symbol: string;
  date: string;
  timeIn: string;
  timeOut?: string;
  side: 'long' | 'short';
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  pnl?: number;
  commission: number;
  stopLoss?: number;
  takeProfit?: number;
  strategy?: string;
  marketConditions?: string;
  timeframe?: string;
  confidence?: number;
  emotions?: string;
  notes?: string;
  screenshots?: string[];
  status: 'open' | 'closed';
  riskAmount?: number;
  rMultiple?: number;
}

export interface TradeFormData {
  symbol: string;
  date: string;
  timeIn: string;
  timeOut: string;
  side: 'long' | 'short';
  entryPrice: string;
  exitPrice: string;
  quantity: string;
  commission: string;
  stopLoss: string;
  takeProfit: string;
  strategy: string;
  marketConditions: string;
  timeframe: string;
  confidence: string;
  emotions: string;
  notes: string;
  riskAmount: string;
}
