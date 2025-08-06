import { format, startOfDay, endOfDay, addDays, parseISO } from 'date-fns';

// Types for economic calendar data
export interface EconomicEvent {
  id: string;
  name: string;
  country: string;
  currency: string;
  date: string;
  time: string;
  impact: 'high' | 'medium' | 'low';
  forecast: string;
  previous: string;
  actual?: string;
  category: 'interest-rate' | 'employment' | 'inflation' | 'gdp' | 'trade' | 'manufacturing' | 'consumer' | 'other';
  description?: string;
}


export interface MarketCorrelation {
  eventId: string;
  currencyPair: string;
  expectedVolatility: 'high' | 'medium' | 'low';
  historicalImpact: number; // percentage change
  tradingRecommendation: string;
}

// API Configuration
interface ApiConfig {
  name: string;
  baseUrl: string;
  apiKey?: string;
  rateLimit: number; // requests per minute
  endpoints: {
    calendar: string;
    news: string;
  };
}

// Service class for economic calendar data
class EconomicCalendarService {
  private cache: Map<string, { data: EconomicEvent[] | unknown; timestamp: number }> = new Map();
  private cacheTimeout = 15 * 60 * 1000; // 15 minutes
  private requestCount = 0;
  private requestWindow = Date.now();
  
  // Multiple API configurations for redundancy
  private apis: ApiConfig[] = [
    {
      name: 'alpha_vantage',
      baseUrl: 'https://www.alphavantage.co/query',
      apiKey: undefined, // Will be set when API keys are configured
      rateLimit: 5, // 5 requests per minute for free tier
      endpoints: {
        calendar: 'function=NEWS_SENTIMENT',
        news: 'function=NEWS_SENTIMENT'
      }
    },
    {
      name: 'financial_modeling_prep',
      baseUrl: 'https://financialmodelingprep.com/api/v3',
      apiKey: undefined, // Will be set when API keys are configured
      rateLimit: 10,
      endpoints: {
        calendar: 'economic_calendar',
        news: 'stock_news'
      }
    }
  ];

  // Sample data for development and fallback
  private sampleEvents: EconomicEvent[] = [
    {
      id: 'fed_rate_decision_2025_07_24',
      name: 'Federal Reserve Interest Rate Decision',
      country: 'United States',
      currency: 'USD',
      date: '2025-07-24',
      time: '18:00',
      impact: 'high',
      forecast: '5.50%',
      previous: '5.25%',
      category: 'interest-rate',
      description: 'The Federal Reserve announces its decision on the federal funds rate after the FOMC meeting.'
    },
    {
      id: 'ecb_rate_decision_2025_07_25',
      name: 'ECB Interest Rate Decision',
      country: 'Eurozone',
      currency: 'EUR',
      date: '2025-07-25',
      time: '12:45',
      impact: 'high',
      forecast: '4.00%',
      previous: '4.00%',
      category: 'interest-rate',
      description: 'European Central Bank announces its monetary policy decision.'
    },
    {
      id: 'us_cpi_2025_07_25',
      name: 'Consumer Price Index m/m',
      country: 'United States',
      currency: 'USD',
      date: '2025-07-25',
      time: '12:30',
      impact: 'high',
      forecast: '0.3%',
      previous: '0.4%',
      category: 'inflation',
      description: 'Monthly change in consumer prices, key inflation indicator.'
    },
    {
      id: 'uk_gdp_2025_07_25',
      name: 'GDP Growth Rate q/q',
      country: 'United Kingdom',
      currency: 'GBP',
      date: '2025-07-25',
      time: '06:00',
      impact: 'medium',
      forecast: '0.3%',
      previous: '0.1%',
      category: 'gdp',
      description: 'Quarterly gross domestic product growth rate.'
    },
    {
      id: 'jpy_boj_meeting_2025_07_26',
      name: 'Bank of Japan Monetary Policy Meeting',
      country: 'Japan',
      currency: 'JPY',
      date: '2025-07-26',
      time: '03:00',
      impact: 'high',
      forecast: '-0.10%',
      previous: '-0.10%',
      category: 'interest-rate',
      description: 'Bank of Japan announces monetary policy decisions.'
    }
  ];


  // Rate limiting check
  private canMakeRequest(): boolean {
    const now = Date.now();
    const windowDuration = 60 * 1000; // 1 minute
    
    if (now - this.requestWindow > windowDuration) {
      this.requestCount = 0;
      this.requestWindow = now;
    }
    
    return this.requestCount < 5; // Conservative limit
  }

  // Cache management
  private getCached(key: string): EconomicEvent[] | unknown | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: EconomicEvent[] | unknown): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // Get economic events for a date range
  async getEconomicEvents(startDate: Date, endDate: Date): Promise<EconomicEvent[]> {
    const cacheKey = `events_${format(startDate, 'yyyy-MM-dd')}_${format(endDate, 'yyyy-MM-dd')}`;
    
    // Check cache first
    const cached = this.getCached(cacheKey);
    if (cached) {
      return cached as EconomicEvent[];
    }

    try {
      // Try to fetch from APIs (implementation would go here)
      // For now, return filtered sample data
      const filteredEvents = this.sampleEvents.filter(event => {
        const eventDate = parseISO(event.date);
        return eventDate >= startOfDay(startDate) && eventDate <= endOfDay(endDate);
      });

      this.setCache(cacheKey, filteredEvents);
      return filteredEvents;
    } catch (error) {
      console.warn('Failed to fetch economic events from APIs, using sample data:', error);
      
      // Fallback to sample data
      const filteredEvents = this.sampleEvents.filter(event => {
        const eventDate = parseISO(event.date);
        return eventDate >= startOfDay(startDate) && eventDate <= endOfDay(endDate);
      });
      
      return filteredEvents;
    }
  }

  // Get economic events for today
  async getTodaysEvents(): Promise<EconomicEvent[]> {
    const today = new Date();
    return this.getEconomicEvents(today, today);
  }

  // Get events for the next week
  async getUpcomingEvents(days: number = 7): Promise<EconomicEvent[]> {
    const today = new Date();
    const futureDate = addDays(today, days);
    return this.getEconomicEvents(today, futureDate);
  }

  // Get high impact events only
  async getHighImpactEvents(startDate: Date, endDate: Date): Promise<EconomicEvent[]> {
    const allEvents = await this.getEconomicEvents(startDate, endDate);
    return allEvents.filter(event => event.impact === 'high');
  }


  // Get events by currency
  async getEventsByCurrency(currency: string, days: number = 7): Promise<EconomicEvent[]> {
    const events = await this.getUpcomingEvents(days);
    return events.filter(event => 
      event.currency.toUpperCase() === currency.toUpperCase()
    );
  }

  // Get market impact analysis
  async getMarketCorrelations(currencyPair: string): Promise<MarketCorrelation[]> {
    // Sample correlation data - in production this would analyze historical data
    const correlations: MarketCorrelation[] = [
      {
        eventId: 'fed_rate_decision_2025_07_24',
        currencyPair: 'EUR/USD',
        expectedVolatility: 'high',
        historicalImpact: 1.2,
        tradingRecommendation: 'High volatility expected. Consider reducing position size and widening stops.'
      },
      {
        eventId: 'ecb_rate_decision_2025_07_25',
        currencyPair: 'EUR/USD',
        expectedVolatility: 'high',
        historicalImpact: 0.8,
        tradingRecommendation: 'EUR strength likely if hawkish tone. Watch for policy guidance.'
      }
    ];

    return correlations.filter(corr => 
      corr.currencyPair.toUpperCase() === currencyPair.toUpperCase()
    );
  }

  // Analyze impact on specific trade
  analyzeTradeRisk(tradeDate: string, tradePair: string): {
    riskLevel: 'low' | 'medium' | 'high';
    events: EconomicEvent[];
    recommendations: string[];
  } {
    const tradeDateObj = parseISO(tradeDate);
    const relevantEvents = this.sampleEvents.filter(event => {
      const eventDate = parseISO(event.date);
      const dayDiff = Math.abs((eventDate.getTime() - tradeDateObj.getTime()) / (1000 * 60 * 60 * 24));
      return dayDiff <= 1; // Events within 1 day
    });

    const highImpactEvents = relevantEvents.filter(event => event.impact === 'high');
    const pairCurrencies = tradePair.split('/').map(c => c.trim().toUpperCase());
    const relevantCurrencyEvents = relevantEvents.filter(event => 
      pairCurrencies.includes(event.currency.toUpperCase())
    );

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    const recommendations: string[] = [];

    if (highImpactEvents.length > 0 || relevantCurrencyEvents.length > 1) {
      riskLevel = 'high';
      recommendations.push('High-impact economic events scheduled. Consider reducing position size.');
      recommendations.push('Monitor news closely and be prepared for increased volatility.');
    } else if (relevantCurrencyEvents.length === 1) {
      riskLevel = 'medium';
      recommendations.push('Economic event may affect your trade. Monitor for volatility.');
    } else {
      recommendations.push('No major economic events detected for this trade period.');
    }

    return {
      riskLevel,
      events: relevantCurrencyEvents,
      recommendations
    };
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache stats
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const economicCalendarService = new EconomicCalendarService();

// Export utility functions
export const formatEventTime = (date: string, time: string): string => {
  try {
    const eventDateTime = parseISO(`${date}T${time}:00`);
    return format(eventDateTime, 'MMM dd, HH:mm');
  } catch {
    return `${date} ${time}`;
  }
};

export const getImpactColor = (impact: string): string => {
  switch (impact) {
    case 'high': return 'bg-red-100 text-red-800 border-red-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getCurrencyFlag = (currency: string): string => {
  const flags: Record<string, string> = {
    'USD': '🇺🇸',
    'EUR': '🇪🇺',
    'GBP': '🇬🇧',
    'JPY': '🇯🇵',
    'AUD': '🇦🇺',
    'CAD': '🇨🇦',
    'CHF': '🇨🇭',
    'NZD': '🇳🇿'
  };
  return flags[currency.toUpperCase()] || '🌍';
};
