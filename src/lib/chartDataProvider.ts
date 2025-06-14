// Helper function to generate sample OHLC data for testing
// In a real application, you'd fetch this from a financial data API

export interface CandlestickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export const generateSampleOHLCData = (
  symbol: string, 
  entryPrice: number, 
  entryDate: string, 
  daysRange: number = 3
): CandlestickData[] => {
  const data: CandlestickData[] = [];
  const startDate = new Date(entryDate);
  
  // Start a few days before the trade
  startDate.setDate(startDate.getDate() - Math.floor(daysRange / 2));
  
  let currentPrice = entryPrice * 0.998; // Start slightly below entry price
  
  // Generate hourly data for the range
  const hoursToGenerate = daysRange * 24;
  
  for (let i = 0; i < hoursToGenerate; i++) {
    const currentTime = new Date(startDate.getTime() + i * 60 * 60 * 1000);
    
    // Skip weekends for realistic market data
    if (currentTime.getDay() === 0 || currentTime.getDay() === 6) {
      continue;
    }
    
    // Generate realistic price movement
    const volatility = getVolatilityForSymbol(symbol);
    const trend = Math.sin(i / 10) * 0.001; // Slight trending
    const randomChange = (Math.random() - 0.5) * volatility;
    
    const open = currentPrice;
    const change = trend + randomChange;
    const close = open * (1 + change);
    
    // Generate high/low based on volatility
    const range = Math.abs(change) + Math.random() * volatility * 0.5;
    const high = Math.max(open, close) * (1 + range);
    const low = Math.min(open, close) * (1 - range);
    
    data.push({
      time: Math.floor(currentTime.getTime() / 1000),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(Math.random() * 10000) + 1000
    });
    
    currentPrice = close;
  }
  
  return data;
};

const getVolatilityForSymbol = (symbol: string): number => {
  // Different symbols have different typical volatilities
  const volatilityMap: { [key: string]: number } = {
    'MES': 0.015,  // E-mini S&P 500
    'MNQ': 0.020,  // E-mini Nasdaq
    'MYM': 0.012,  // E-mini Dow
    'ES': 0.015,   // S&P 500
    'NQ': 0.020,   // Nasdaq
    'YM': 0.012,   // Dow
    'CL': 0.025,   // Crude Oil
    'GC': 0.018,   // Gold
    'ZB': 0.008,   // 30Y Treasury
    'ZN': 0.006,   // 10Y Treasury
  };
  
  return volatilityMap[symbol] || 0.015; // Default volatility
};