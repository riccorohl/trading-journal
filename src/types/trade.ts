
export interface Trade {
  id: string;
  
  // Account Information (NEW)
  accountId: string; // References the trading account this trade belongs to
  
  // Currency Pair Information
  currencyPair: string; // e.g., "EUR/USD", "GBP/JPY"
  
  // Timing Information
  date: string;
  timeIn: string;
  timeOut?: string;
  session?: 'asian' | 'european' | 'us' | 'overlap'; // Trading session
  
  // Trade Direction
  side: 'long' | 'short';
  
  // Pricing Information
  entryPrice: number;
  exitPrice?: number;
  spread?: number; // Entry spread in pips
  
  // Position Sizing (Forex-specific)
  lotSize: number; // e.g., 1.5 for 1.5 lots
  lotType: 'standard' | 'mini' | 'micro'; // 100k, 10k, 1k units
  units: number; // Actual units traded (calculated from lotSize * lotType)
  
  // Risk Management
  stopLoss?: number;
  takeProfit?: number;
  riskAmount?: number; // Risk amount in account currency
  rMultiple?: number; // Risk-reward multiple
  leverage?: number; // e.g., 50 for 50:1 leverage
  marginUsed?: number; // Margin used in account currency
  
  // P&L Information (Forex-specific)
  pips?: number; // Pips gained/lost
  pipValue?: number; // Value per pip in account currency
  pnl?: number; // P&L in account currency
  commission: number; // Commission/fees
  swap?: number; // Overnight financing costs
  
  // Account Information (DEPRECATED - replaced by Account interface)
  accountCurrency: string; // USD, EUR, GBP, etc.
  
  // Strategy & Analysis
  strategy?: string;
  marketConditions?: string;
  timeframe?: string;
  confidence?: number;
  emotions?: string;
  notes?: string;
  screenshots?: string[];
  
  // Trade Status
  status: 'open' | 'closed';
}

// Trading Account Interface (NEW)
export interface TradingAccount {
  id: string;
  name: string; // User-friendly name like "Live Account", "Demo MT4", etc.
  type: 'live' | 'demo'; // Account type
  broker: string; // Broker name
  currency: string; // Account base currency (USD, EUR, etc.)
  balance: number; // Current account balance
  initialBalance: number; // Starting balance for calculations
  platform: 'mt4' | 'mt5' | 'manual' | 'other'; // Trading platform
  description?: string; // Optional description
  isActive: boolean; // Whether this account is currently active
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// Account Form Data Interface (NEW)
export interface AccountFormData {
  name: string;
  type: 'live' | 'demo';
  broker: string;
  currency: string;
  balance: string;
  initialBalance: string;
  platform: 'mt4' | 'mt5' | 'manual' | 'other';
  description: string;
}

// Account Statistics Interface (NEW)
export interface AccountStats {
  accountId: string;
  totalTrades: number;
  totalPnL: number;
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  currentBalance: number;
  roi: number; // Return on Investment
  sharpeRatio?: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  winStreak: number;
  lossStreak: number;
}


export interface TradeFormData {
  // Currency Pair Information
  currencyPair: string;
  
  // Timing Information
  date: string;
  timeIn: string;
  timeOut: string;
  session: string;
  
  // Trade Direction
  side: 'long' | 'short';
  
  // Pricing Information
  entryPrice: string;
  exitPrice: string;
  spread: string;
  
  // Position Sizing (Forex-specific)
  lotSize: string;
  lotType: 'standard' | 'mini' | 'micro';
  
  // Risk Management
  stopLoss: string;
  takeProfit: string;
  riskAmount: string;
  leverage: string;
  
  // P&L Information
  commission: string;
  swap: string;
  
  // Account Information
  accountCurrency: string;
  
  // Strategy & Analysis
  strategy: string;
  marketConditions: string;
  timeframe: string;
  confidence: string;
  emotions: string;
  notes: string;
}

// Forex-specific constants and utilities
export const CURRENCY_PAIRS = {
  MAJOR: [
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 
    'AUD/USD', 'USD/CAD', 'NZD/USD'
  ],
  MINOR: [
    'EUR/GBP', 'EUR/JPY', 'EUR/CHF', 'EUR/AUD', 
    'EUR/CAD', 'GBP/JPY', 'GBP/CHF', 'AUD/JPY'
  ],
  EXOTIC: [
    'USD/ZAR', 'USD/TRY', 'USD/MXN', 'EUR/TRY',
    'GBP/ZAR', 'AUD/ZAR'
  ]
} as const;

export const LOT_SIZES = {
  standard: 100000,
  mini: 10000,
  micro: 1000
} as const;

export const TRADING_SESSIONS = {
  asian: { name: 'Asian', hours: '21:00-06:00 GMT' },
  european: { name: 'European', hours: '07:00-16:00 GMT' },
  us: { name: 'US', hours: '13:00-22:00 GMT' },
  overlap: { name: 'Overlap', hours: 'Multiple sessions' }
} as const;

// Utility function to determine pip decimal places
export const getPipDecimalPlaces = (currencyPair: string): number => {
  const jpyPairs = ['JPY', 'HUF', 'KRW', 'CLP', 'ISK', 'PYG'];
  const baseCurrency = currencyPair.split('/')[1];
  return jpyPairs.includes(baseCurrency || '') ? 2 : 4;
};

// Utility function to calculate pip value
export const calculatePipValue = (
  currencyPair: string, 
  lotSize: number, 
  lotType: keyof typeof LOT_SIZES,
  accountCurrency: string = 'USD'
): number => {
  const units = lotSize * LOT_SIZES[lotType];
  const pipDecimals = getPipDecimalPlaces(currencyPair);
  const pipSize = Math.pow(10, -pipDecimals);
  
  // Simplified calculation - in real implementation, would need current exchange rates
  // This assumes USD account currency and provides base calculation
  return (pipSize * units);
};

// Utility function to calculate pips from price difference
export const calculatePips = (
  entryPrice: number, 
  exitPrice: number, 
  currencyPair: string, 
  side: 'long' | 'short'
): number => {
  const pipDecimals = getPipDecimalPlaces(currencyPair);
  const pipSize = Math.pow(10, -pipDecimals);
  
  let priceDifference = exitPrice - entryPrice;
  if (side === 'short') {
    priceDifference = entryPrice - exitPrice;
  }
  
  return priceDifference / pipSize;
};
