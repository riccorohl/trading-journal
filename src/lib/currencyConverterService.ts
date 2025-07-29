import { Trade } from '../types/trade';

export interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  timestamp: Date;
  source: string;
  bid?: number;
  ask?: number;
  spread?: number;
}

export interface CurrencyConversion {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  convertedAmount: number;
  rate: number;
  timestamp: Date;
  fees?: number;
  totalCost?: number;
}

export interface HistoricalRate {
  date: string;
  rate: number;
  high: number;
  low: number;
  volume?: number;
}

export interface CurrencyPair {
  pair: string;
  baseCurrency: string;
  quoteCurrency: string;
  currentRate: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h?: number;
}

export interface ConversionAnalysis {
  fromCurrency: string;
  toCurrency: string;
  currentRate: number;
  analysis: {
    trend: 'bullish' | 'bearish' | 'neutral';
    strength: number; // 0-1
    volatility: number;
    recommendation: 'buy' | 'sell' | 'hold' | 'wait';
    confidence: number;
  };
  historicalData: HistoricalRate[];
  nextUpdate: Date;
}

interface ApiConfig {
  name: string;
  baseUrl: string;
  rateLimit: number;
  endpoints: {
    rates: string;
    historical: string;
    pairs: string;
  };
}

export class CurrencyConverterService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private requestCounts: Map<string, number[]> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes for real-time rates
  private historicalCacheTimeout = 60 * 60 * 1000; // 1 hour for historical data
  
  private apis: ApiConfig[] = [
    {
      name: 'exchangerate_api',
      baseUrl: 'https://api.exchangerate-api.com/v4',
      rateLimit: 10, // requests per minute
      endpoints: {
        rates: 'latest',
        historical: 'history',
        pairs: 'latest'
      }
    },
    {
      name: 'fixer_io',
      baseUrl: 'https://api.fixer.io/v1',
      rateLimit: 5,
      endpoints: {
        rates: 'latest',
        historical: 'historical',
        pairs: 'latest'
      }
    }
  ];

  private majorCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'];
  private commonPairs = [
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD',
    'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'AUD/JPY', 'GBP/CHF'
  ];

  private canMakeRequest(apiName: string): boolean {
    const now = Date.now();
    const requests = this.requestCounts.get(apiName) || [];
    const recentRequests = requests.filter(time => now - time < 60000);
    this.requestCounts.set(apiName, recentRequests);
    
    const api = this.apis.find(a => a.name === apiName);
    return recentRequests.length < (api?.rateLimit || 5);
  }

  private getCached(key: string, isHistorical = false): any | null {
    const cached = this.cache.get(key);
    const timeout = isHistorical ? this.historicalCacheTimeout : this.cacheTimeout;
    
    if (cached && Date.now() - cached.timestamp < timeout) {
      return cached.data;
    }
    return null;
  }

  private setCached(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async getExchangeRates(baseCurrency = 'USD'): Promise<ExchangeRate[]> {
    const cacheKey = `rates_${baseCurrency}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      // Try live APIs first
      for (const api of this.apis) {
        if (this.canMakeRequest(api.name)) {
          try {
            const rates = await this.fetchRatesFromApi(api, baseCurrency);
            if (rates.length > 0) {
              this.setCached(cacheKey, rates);
              return rates;
            }
          } catch (error) {
            console.warn(`API ${api.name} failed:`, error);
            continue;
          }
        }
      }

      // Fallback to sample data
      const sampleRates = this.generateSampleRates(baseCurrency);
      this.setCached(cacheKey, sampleRates);
      return sampleRates;
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      return this.generateSampleRates(baseCurrency);
    }
  }

  private async fetchRatesFromApi(api: ApiConfig, baseCurrency: string): Promise<ExchangeRate[]> {
    const url = `${api.baseUrl}/${api.endpoints.rates}/${baseCurrency}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return this.parseApiResponse(data, baseCurrency, api.name);
  }

  private parseApiResponse(data: any, baseCurrency: string, source: string): ExchangeRate[] {
    const rates: ExchangeRate[] = [];
    const timestamp = new Date();

    if (data.rates) {
      for (const [currency, rate] of Object.entries(data.rates)) {
        if (typeof rate === 'number') {
          rates.push({
            fromCurrency: baseCurrency,
            toCurrency: currency as string,
            rate: rate,
            timestamp,
            source,
            bid: rate * 0.9995, // Approximate bid
            ask: rate * 1.0005, // Approximate ask
            spread: rate * 0.001 // Approximate spread
          });
        }
      }
    }

    return rates;
  }

  private generateSampleRates(baseCurrency = 'USD'): ExchangeRate[] {
    const sampleRates: { [key: string]: number } = {
      'USD': 1.0000,
      'EUR': 0.8500,
      'GBP': 0.7300,
      'JPY': 150.00,
      'AUD': 1.5200,
      'CAD': 1.3600,
      'CHF': 0.9100,
      'NZD': 1.6400
    };

    const baseRate = sampleRates[baseCurrency] || 1;
    const timestamp = new Date();

    return this.majorCurrencies
      .filter(currency => currency !== baseCurrency)
      .map(currency => {
        const rate = (sampleRates[currency] || 1) / baseRate;
        const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
        const adjustedRate = rate * (1 + variation);

        return {
          fromCurrency: baseCurrency,
          toCurrency: currency,
          rate: adjustedRate,
          timestamp,
          source: 'sample_data',
          bid: adjustedRate * 0.9995,
          ask: adjustedRate * 1.0005,
          spread: adjustedRate * 0.001
        };
      });
  }

  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    includeFees = false
  ): Promise<CurrencyConversion> {
    if (fromCurrency === toCurrency) {
      return {
        amount,
        fromCurrency,
        toCurrency,
        convertedAmount: amount,
        rate: 1,
        timestamp: new Date(),
        fees: 0,
        totalCost: amount
      };
    }

    const rates = await this.getExchangeRates(fromCurrency);
    const targetRate = rates.find(r => r.toCurrency === toCurrency);

    if (!targetRate) {
      // Try reverse conversion
      const reverseRates = await this.getExchangeRates(toCurrency);
      const reverseRate = reverseRates.find(r => r.toCurrency === fromCurrency);
      
      if (reverseRate) {
        const rate = 1 / reverseRate.rate;
        const convertedAmount = amount * rate;
        const fees = includeFees ? convertedAmount * 0.001 : 0; // 0.1% fee
        
        return {
          amount,
          fromCurrency,
          toCurrency,
          convertedAmount,
          rate,
          timestamp: new Date(),
          fees,
          totalCost: convertedAmount + fees
        };
      }
      
      throw new Error(`Exchange rate not found for ${fromCurrency}/${toCurrency}`);
    }

    const convertedAmount = amount * targetRate.rate;
    const fees = includeFees ? convertedAmount * 0.001 : 0; // 0.1% fee

    return {
      amount,
      fromCurrency,
      toCurrency,
      convertedAmount,
      rate: targetRate.rate,
      timestamp: new Date(),
      fees,
      totalCost: convertedAmount + fees
    };
  }

  async getCurrencyPairs(): Promise<CurrencyPair[]> {
    const cacheKey = 'currency_pairs';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const pairs: CurrencyPair[] = [];
      
      for (const pairString of this.commonPairs) {
        const [base, quote] = pairString.split('/');
        const conversion = await this.convertCurrency(1, base, quote);
        
        // Generate sample market data
        const change24h = (Math.random() - 0.5) * 0.02; // ±1% change
        const changePercent24h = change24h * 100;
        const high24h = conversion.rate * (1 + Math.abs(change24h) + Math.random() * 0.01);
        const low24h = conversion.rate * (1 - Math.abs(change24h) - Math.random() * 0.01);

        pairs.push({
          pair: pairString,
          baseCurrency: base,
          quoteCurrency: quote,
          currentRate: conversion.rate,
          change24h,
          changePercent24h,
          high24h,
          low24h,
          volume24h: Math.random() * 1000000 // Sample volume
        });
      }

      this.setCached(cacheKey, pairs);
      return pairs;
    } catch (error) {
      console.error('Error fetching currency pairs:', error);
      return this.generateSamplePairs();
    }
  }

  private generateSamplePairs(): CurrencyPair[] {
    return this.commonPairs.map(pairString => {
      const [base, quote] = pairString.split('/');
      const baseRate = Math.random() * 2 + 0.5; // Random rate between 0.5-2.5
      const change24h = (Math.random() - 0.5) * 0.02;
      
      return {
        pair: pairString,
        baseCurrency: base,
        quoteCurrency: quote,
        currentRate: baseRate,
        change24h,
        changePercent24h: change24h * 100,
        high24h: baseRate * (1 + Math.abs(change24h) + 0.005),
        low24h: baseRate * (1 - Math.abs(change24h) - 0.005),
        volume24h: Math.random() * 1000000
      };
    });
  }

  async getHistoricalRates(
    fromCurrency: string,
    toCurrency: string,
    days = 30
  ): Promise<HistoricalRate[]> {
    const cacheKey = `historical_${fromCurrency}_${toCurrency}_${days}`;
    const cached = this.getCached(cacheKey, true);
    if (cached) return cached;

    try {
      // Generate sample historical data
      const historicalData = this.generateHistoricalData(fromCurrency, toCurrency, days);
      this.setCached(cacheKey, historicalData);
      return historicalData;
    } catch (error) {
      console.error('Error fetching historical rates:', error);
      return this.generateHistoricalData(fromCurrency, toCurrency, days);
    }
  }

  private generateHistoricalData(
    fromCurrency: string,
    toCurrency: string,
    days: number
  ): HistoricalRate[] {
    const data: HistoricalRate[] = [];
    const currentDate = new Date();
    const baseRate = Math.random() * 2 + 0.5; // Starting rate
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      
      // Generate realistic price movement
      const trend = Math.sin(i / 10) * 0.1; // Cyclical trend
      const noise = (Math.random() - 0.5) * 0.02; // Random noise
      const rate = baseRate * (1 + trend + noise);
      
      const high = rate * (1 + Math.random() * 0.01);
      const low = rate * (1 - Math.random() * 0.01);
      
      data.push({
        date: date.toISOString().split('T')[0],
        rate: parseFloat(rate.toFixed(6)),
        high: parseFloat(high.toFixed(6)),
        low: parseFloat(low.toFixed(6)),
        volume: Math.random() * 100000
      });
    }
    
    return data;
  }

  async analyzeConversion(
    fromCurrency: string,
    toCurrency: string
  ): Promise<ConversionAnalysis> {
    const cacheKey = `analysis_${fromCurrency}_${toCurrency}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const conversion = await this.convertCurrency(1, fromCurrency, toCurrency);
      const historicalData = await this.getHistoricalRates(fromCurrency, toCurrency, 30);
      
      // Calculate trend and volatility
      const recentRates = historicalData.slice(-7).map(h => h.rate);
      const olderRates = historicalData.slice(0, 7).map(h => h.rate);
      
      const recentAvg = recentRates.reduce((a, b) => a + b, 0) / recentRates.length;
      const olderAvg = olderRates.reduce((a, b) => a + b, 0) / olderRates.length;
      
      const trendDirection = recentAvg > olderAvg ? 'bullish' : 
                           recentAvg < olderAvg ? 'bearish' : 'neutral';
      
      const trendStrength = Math.abs(recentAvg - olderAvg) / olderAvg;
      
      // Calculate volatility
      const rates = historicalData.map(h => h.rate);
      const mean = rates.reduce((a, b) => a + b, 0) / rates.length;
      const variance = rates.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / rates.length;
      const volatility = Math.sqrt(variance) / mean;
      
      // Generate recommendation
      let recommendation: 'buy' | 'sell' | 'hold' | 'wait';
      let confidence = 0.5;
      
      if (trendDirection === 'bullish' && trendStrength > 0.01) {
        recommendation = 'buy';
        confidence = Math.min(0.9, 0.5 + trendStrength * 10);
      } else if (trendDirection === 'bearish' && trendStrength > 0.01) {
        recommendation = 'sell';
        confidence = Math.min(0.9, 0.5 + trendStrength * 10);
      } else if (volatility > 0.02) {
        recommendation = 'wait';
        confidence = 0.7;
      } else {
        recommendation = 'hold';
        confidence = 0.6;
      }

      const analysis: ConversionAnalysis = {
        fromCurrency,
        toCurrency,
        currentRate: conversion.rate,
        analysis: {
          trend: trendDirection,
          strength: trendStrength,
          volatility,
          recommendation,
          confidence
        },
        historicalData,
        nextUpdate: new Date(Date.now() + this.cacheTimeout)
      };

      this.setCached(cacheKey, analysis);
      return analysis;
    } catch (error) {
      console.error('Error analyzing conversion:', error);
      throw error;
    }
  }

  // Integration with trading data
  analyzeTradeConversions(trades: Trade[]): {
    totalConversions: number;
    averageRate: number;
    bestRate: number;
    worstRate: number;
    totalVolume: number;
    currencyBreakdown: { [key: string]: number };
  } {
    if (!trades.length) {
      return {
        totalConversions: 0,
        averageRate: 0,
        bestRate: 0,
        worstRate: 0,
        totalVolume: 0,
        currencyBreakdown: {}
      };
    }

    const conversions = trades.map(trade => {
      const [base, quote] = trade.pair.split('/');
      return {
        pair: trade.pair,
        rate: trade.entryPrice,
        volume: trade.lotSize,
        baseCurrency: base,
        quoteCurrency: quote
      };
    });

    const rates = conversions.map(c => c.rate);
    const volumes = conversions.map(c => c.volume);
    
    const currencyBreakdown: { [key: string]: number } = {};
    conversions.forEach(conv => {
      currencyBreakdown[conv.baseCurrency] = (currencyBreakdown[conv.baseCurrency] || 0) + conv.volume;
      currencyBreakdown[conv.quoteCurrency] = (currencyBreakdown[conv.quoteCurrency] || 0) + conv.volume;
    });

    return {
      totalConversions: conversions.length,
      averageRate: rates.reduce((a, b) => a + b, 0) / rates.length,
      bestRate: Math.max(...rates),
      worstRate: Math.min(...rates),
      totalVolume: volumes.reduce((a, b) => a + b, 0),
      currencyBreakdown
    };
  }

  // Utility methods
  formatRate(rate: number, precision = 6): string {
    return rate.toFixed(precision);
  }

  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(amount);
  }

  getCurrencySymbol(currency: string): string {
    const symbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CHF': 'CHF',
      'AUD': 'A$',
      'CAD': 'C$',
      'NZD': 'NZ$'
    };
    return symbols[currency] || currency;
  }
}

// Export singleton instance
export const currencyConverterService = new CurrencyConverterService();
