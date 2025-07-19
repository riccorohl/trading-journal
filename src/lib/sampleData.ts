import { Trade } from '../types/trade';
import { tradeService } from './firebaseService';

/**
 * Sample Forex Trades for Demo/Testing
 * Realistic trading scenarios with variety of outcomes and strategies
 */
export const sampleForexTrades: Omit<Trade, 'id'>[] = [
  {
    currencyPair: 'EUR/USD',
    date: '2024-12-08',
    timeIn: '08:30:00',
    timeOut: '10:15:00',
    session: 'european',
    side: 'long',
    entryPrice: 1.05420,
    exitPrice: 1.05580,
    spread: 1.2,
    lotSize: 0.1,
    lotType: 'standard',
    units: 10000,
    pips: 16.0,
    pipValue: 1.0,
    pnl: 160.00,
    commission: 3.50,
    swap: 0,
    stopLoss: 1.05200,
    takeProfit: 1.05700,
    leverage: 30,
    marginUsed: 352.00,
    accountCurrency: 'USD',
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
    currencyPair: 'GBP/JPY',
    date: '2024-12-08',
    timeIn: '13:45:00',
    timeOut: '14:20:00',
    session: 'overlap',
    side: 'short',
    entryPrice: 196.85,
    exitPrice: 196.45,
    spread: 2.1,
    lotSize: 0.05,
    lotType: 'standard',
    units: 5000,
    pips: 40.0,
    pipValue: 0.65,
    pnl: 130.50,
    commission: 4.20,
    swap: -1.50,
    stopLoss: 197.20,
    takeProfit: 196.30,
    leverage: 50,
    marginUsed: 197.00,
    accountCurrency: 'USD',
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
    currencyPair: 'AUD/USD',
    date: '2024-12-07',
    timeIn: '22:10:00',
    timeOut: '23:55:00',
    session: 'asian',
    side: 'long',
    entryPrice: 0.64150,
    exitPrice: 0.63980,
    spread: 1.5,
    lotSize: 0.15,
    lotType: 'standard',
    units: 15000,
    pips: -17.0,
    pipValue: 1.5,
    pnl: -255.00,
    commission: 2.80,
    swap: 0.75,
    stopLoss: 0.63950,
    takeProfit: 0.64500,
    leverage: 25,
    marginUsed: 385.00,
    accountCurrency: 'USD',
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
    currencyPair: 'USD/JPY',
    date: '2024-12-07',
    timeIn: '15:30:00',
    timeOut: '16:45:00',
    session: 'us',
    side: 'short',
    entryPrice: 149.85,
    exitPrice: 149.25,
    spread: 1.8,
    lotSize: 0.08,
    lotType: 'standard',
    units: 8000,
    pips: 60.0,
    pipValue: 0.533,
    pnl: 320.00,
    commission: 3.20,
    swap: -2.10,
    stopLoss: 150.40,
    takeProfit: 149.00,
    leverage: 40,
    marginUsed: 300.00,
    accountCurrency: 'USD',
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
    currencyPair: 'EUR/GBP',
    date: '2024-12-06',
    timeIn: '11:20:00',
    timeOut: '12:10:00',
    session: 'european',
    side: 'long',
    entryPrice: 0.83240,
    exitPrice: 0.83420,
    spread: 1.0,
    lotSize: 0.12,
    lotType: 'standard',
    units: 12000,
    pips: 18.0,
    pipValue: 1.2,
    pnl: 216.00,
    commission: 2.50,
    swap: 0.50,
    stopLoss: 0.83100,
    takeProfit: 0.83450,
    leverage: 33,
    marginUsed: 302.00,
    accountCurrency: 'USD',
    strategy: 'Channel Trading',
    marketConditions: 'Consolidation',
    timeframe: '1H',
    confidence: 7,
    emotions: 'Patient',
    notes: 'Nice bounce from channel bottom. Textbook technical analysis trade.',
    status: 'closed',
    riskAmount: 168.00,
    rMultiple: 1.29
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
