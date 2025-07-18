import { Trade } from '../types/trade';
import { tradeService } from './firebaseService';

/**
 * Sample Forex Trades for Demo/Testing
 * Realistic trading scenarios with variety of outcomes and strategies
 */
export const sampleForexTrades: Omit<Trade, 'id'>[] = [
  {
    symbol: 'EURUSD',
    date: '2024-12-08',
    timeIn: '08:30:00',
    timeOut: '10:15:00',
    side: 'long',
    entryPrice: 1.05420,
    exitPrice: 1.05580,
    quantity: 0.1, // 0.1 lots = 10,000 units
    pnl: 160.00,
    commission: 3.50,
    stopLoss: 1.05200,
    takeProfit: 1.05700,
    strategy: 'Breakout',
    marketConditions: 'Bullish trend continuation',
    timeframe: '1H',
    confidence: 8,
    emotions: 'Confident',
    notes: 'Clean breakout above resistance with good volume. Followed trend perfectly.',
    status: 'closed',
    riskAmount: 220.00,
    rMultiple: 0.73
  },
  {
    symbol: 'GBPJPY',
    date: '2024-12-08',
    timeIn: '13:45:00',
    timeOut: '14:20:00',
    side: 'short',
    entryPrice: 196.85,
    exitPrice: 196.45,
    quantity: 0.05, // 0.05 lots
    pnl: 130.50,
    commission: 4.20,
    stopLoss: 197.20,
    takeProfit: 196.30,
    strategy: 'Reversal',
    marketConditions: 'Overbought conditions',
    timeframe: '15M',
    confidence: 7,
    emotions: 'Cautious',
    notes: 'RSI divergence signaled reversal. Quick scalp trade on JPY strength.',
    status: 'closed',
    riskAmount: 175.00,
    rMultiple: 0.75
  },
  {
    symbol: 'AUDUSD',
    date: '2024-12-07',
    timeIn: '22:10:00',
    timeOut: '23:55:00',
    side: 'long',
    entryPrice: 0.64150,
    exitPrice: 0.63980,
    quantity: 0.15,
    pnl: -255.00,
    commission: 2.80,
    stopLoss: 0.63950,
    takeProfit: 0.64500,
    strategy: 'Support Bounce',
    marketConditions: 'Ranging market',
    timeframe: '4H',
    confidence: 6,
    emotions: 'Frustrated',
    notes: 'Support level failed to hold. Should have waited for clearer confirmation.',
    status: 'closed',
    riskAmount: 300.00,
    rMultiple: -0.85
  },
  {
    symbol: 'USDJPY',
    date: '2024-12-07',
    timeIn: '15:30:00',
    timeOut: '16:45:00',
    side: 'short',
    entryPrice: 149.85,
    exitPrice: 149.25,
    quantity: 0.08,
    pnl: 320.00,
    commission: 3.20,
    stopLoss: 150.40,
    takeProfit: 149.00,
    strategy: 'News Trading',
    marketConditions: 'USD weakness after data',
    timeframe: '5M',
    confidence: 9,
    emotions: 'Excited',
    notes: 'Perfect news trade! Weak US employment data triggered massive USD sell-off.',
    status: 'closed',
    riskAmount: 440.00,
    rMultiple: 0.73
  },
  {
    symbol: 'EURGBP',
    date: '2024-12-06',
    timeIn: '11:20:00',
    timeOut: '12:10:00',
    side: 'long',
    entryPrice: 0.83240,
    exitPrice: 0.83420,
    quantity: 0.12,
    pnl: 216.00,
    commission: 2.50,
    stopLoss: 0.83100,
    takeProfit: 0.83450,
    strategy: 'Channel Trading',
    marketConditions: 'Consolidation',
    timeframe: '1H',
    confidence: 7,
    emotions: 'Patient',
    notes: 'Nice bounce from channel bottom. Textbook technical analysis trade.',
    status: 'closed',
    riskAmount: 168.00,
    rMultiple: 1.29
  },
  {
    symbol: 'USDCAD',
    date: '2024-12-06',
    timeIn: '19:15:00',
    timeOut: '20:05:00',
    side: 'short',
    entryPrice: 1.41250,
    exitPrice: 1.41580,
    quantity: 0.1,
    pnl: -330.00,
    commission: 3.80,
    stopLoss: 1.41600,
    takeProfit: 1.40800,
    strategy: 'Trend Following',
    marketConditions: 'Strong CAD resistance',
    timeframe: '30M',
    confidence: 5,
    emotions: 'Disappointed',
    notes: 'Misjudged CAD strength. Oil prices supported CAD more than expected.',
    status: 'closed',
    riskAmount: 350.00,
    rMultiple: -0.94
  },
  {
    symbol: 'NZDUSD',
    date: '2024-12-05',
    timeIn: '02:30:00',
    timeOut: '04:15:00',
    side: 'long',
    entryPrice: 0.58450,
    exitPrice: 0.58720,
    quantity: 0.06,
    pnl: 162.00,
    commission: 2.10,
    stopLoss: 0.58200,
    takeProfit: 0.58800,
    strategy: 'Asian Session',
    marketConditions: 'Risk-on sentiment',
    timeframe: '1H',
    confidence: 8,
    emotions: 'Calm',
    notes: 'Good risk-on trade during Asian session. NZD benefited from commodity strength.',
    status: 'closed',
    riskAmount: 150.00,
    rMultiple: 1.08
  },
  {
    symbol: 'EURJPY',
    date: '2024-12-05',
    timeIn: '14:00:00',
    timeOut: '14:25:00',
    side: 'short',
    entryPrice: 157.80,
    exitPrice: 157.45,
    quantity: 0.04,
    pnl: 98.50,
    commission: 1.80,
    stopLoss: 158.20,
    takeProfit: 157.20,
    strategy: 'Scalping',
    marketConditions: 'High volatility',
    timeframe: '5M',
    confidence: 6,
    emotions: 'Focused',
    notes: 'Quick scalp during London session. Perfect execution on small target.',
    status: 'closed',
    riskAmount: 160.00,
    rMultiple: 0.62
  },
  {
    symbol: 'GBPUSD',
    date: '2024-12-04',
    timeIn: '16:45:00',
    timeOut: '18:30:00',
    side: 'long',
    entryPrice: 1.27150,
    exitPrice: 1.27850,
    quantity: 0.2,
    pnl: 1400.00,
    commission: 4.50,
    stopLoss: 1.26800,
    takeProfit: 1.28000,
    strategy: 'Momentum',
    marketConditions: 'Strong GBP rally',
    timeframe: '15M',
    confidence: 9,
    emotions: 'Thrilled',
    notes: 'Massive GBP rally after Bank of England hints. Rode the momentum perfectly!',
    status: 'closed',
    riskAmount: 700.00,
    rMultiple: 2.00
  },
  {
    symbol: 'USDCHF',
    date: '2024-12-04',
    timeIn: '09:30:00',
    timeOut: '10:15:00',
    side: 'short',
    entryPrice: 0.88450,
    exitPrice: 0.88520,
    quantity: 0.08,
    pnl: -56.00,
    commission: 2.40,
    stopLoss: 0.88550,
    takeProfit: 0.88200,
    strategy: 'Range Trading',
    marketConditions: 'Choppy sideways movement',
    timeframe: '30M',
    confidence: 4,
    emotions: 'Uncertain',
    notes: 'Small loss in choppy conditions. Market was too indecisive for clear direction.',
    status: 'closed',
    riskAmount: 80.00,
    rMultiple: -0.70
  }
];

/**
 * Add sample trades to a user's account
 * Useful for demo purposes and testing
 */
export async function addSampleTrades(userId: string): Promise<void> {
  try {
    console.log('Adding sample forex trades for user:', userId);
    
    for (const trade of sampleForexTrades) {
      await tradeService.addTrade(userId, {
        ...trade,
        notes: `${trade.notes} [SAMPLE DATA - Can be deleted]`
      });
    }
    
    console.log(`Successfully added ${sampleForexTrades.length} sample trades`);
  } catch (error) {
    console.error('Error adding sample trades:', error);
    throw error;
  }
}

/**
 * Remove all sample trades from a user's account
 * Identifies trades by the [SAMPLE DATA] marker in notes
 */
export async function removeSampleTrades(userId: string): Promise<number> {
  try {
    console.log('Removing sample trades for user:', userId);
    
    // Get all trades
    const allTrades = await tradeService.getTrades(userId);
    
    // Find sample trades (marked with [SAMPLE DATA])
    const sampleTrades = allTrades.filter(trade => 
      trade.notes?.includes('[SAMPLE DATA - Can be deleted]')
    );
    
    // Delete each sample trade
    for (const trade of sampleTrades) {
      await tradeService.deleteTrade(userId, trade.id);
    }
    
    console.log(`Successfully removed ${sampleTrades.length} sample trades`);
    return sampleTrades.length;
  } catch (error) {
    console.error('Error removing sample trades:', error);
    throw error;
  }
}

/**
 * Check if user has sample trades
 */
export async function hasSampleTrades(userId: string): Promise<boolean> {
  try {
    const allTrades = await tradeService.getTrades(userId);
    return allTrades.some(trade => 
      trade.notes?.includes('[SAMPLE DATA - Can be deleted]')
    );
  } catch (error) {
    console.error('Error checking for sample trades:', error);
    return false;
  }
}
