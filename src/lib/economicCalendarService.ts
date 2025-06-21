// MyFXBook Economic Calendar Service
// This service handles fetching and parsing economic calendar data from MyFXBook's XML endpoint

export interface EconomicEvent {
  id: string;
  title: string;
  country: string;
  currency: string;
  date: string;
  time: string;
  impact: 'Low' | 'Medium' | 'High';
  actual?: string;
  forecast?: string;
  previous?: string;
  description?: string;
}

// MyFXBook XML endpoint configuration
const MYFXBOOK_BASE_URL = 'http://www.myfxbook.com/calendar_statement.xml';

/**
 * Generates MyFXBook XML URL with parameters
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @param currencies - Array of currency codes (default: ['USD'])
 * @param impacts - Array of impact levels (default: ['2', '3'] for Medium/High)
 */
export const generateMyFXBookURL = (
  startDate: string,
  endDate: string,
  currencies: string[] = ['USD'],
  impacts: string[] = ['2', '3']
): string => {
  const filter = `${impacts.join('-')}_${currencies.join('-')}`;
  const params = new URLSearchParams({
    start: `${startDate} 00:00`,
    end: `${endDate} 23:59`,
    filter: filter,
    calPeriod: '10'
  });
  
  return `${MYFXBOOK_BASE_URL}?${params.toString()}`;
};

/**
 * Parses XML response from MyFXBook into EconomicEvent objects
 * @param xmlText - Raw XML response text
 * @returns Array of EconomicEvent objects
 */
export const parseMyFXBookXML = (xmlText: string): EconomicEvent[] => {
  try {
    // Log the raw XML for debugging
    console.log('Raw XML from MyFXBook:', xmlText.substring(0, 200));
    
    // Check if XML is empty or invalid
    if (!xmlText || xmlText.trim().length === 0) {
      console.error('Empty XML response from MyFXBook');
      return [];
    }
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      console.error('XML parsing error:', parseError.textContent);
      return [];
    }

    const events: EconomicEvent[] = [];
    const eventElements = xmlDoc.querySelectorAll('event');

    eventElements.forEach((eventEl, index) => {
      try {
        const title = eventEl.querySelector('title')?.textContent || 'Unknown Event';
        const country = eventEl.querySelector('country')?.textContent || 'USA';
        const currency = eventEl.querySelector('currency')?.textContent || 'USD';
        const date = eventEl.querySelector('date')?.textContent || '';
        const time = eventEl.querySelector('time')?.textContent || '';
        const impact = parseImpact(eventEl.querySelector('impact')?.textContent || '');
        const actual = eventEl.querySelector('actual')?.textContent;
        const forecast = eventEl.querySelector('forecast')?.textContent;
        const previous = eventEl.querySelector('previous')?.textContent;
        const description = eventEl.querySelector('description')?.textContent;

        events.push({
          id: `myfxbook-${index}-${Date.now()}`,
          title,
          country,
          currency,
          date,
          time,
          impact,
          actual: actual || undefined,
          forecast: forecast || undefined,
          previous: previous || undefined,
          description: description || undefined
        });
      } catch (error) {
        console.error('Error parsing individual event:', error);
      }
    });

    return events;
  } catch (error) {
    console.error('Error parsing MyFXBook XML:', error);
    return [];
  }
};

/**
 * Converts MyFXBook impact values to our standard format
 * @param impact - MyFXBook impact value
 * @returns Standardized impact level
 */
const parseImpact = (impact: string): 'Low' | 'Medium' | 'High' => {
  const impactLower = impact.toLowerCase();
  
  if (impactLower.includes('high') || impact === '3') {
    return 'High';
  } else if (impactLower.includes('medium') || impact === '2') {
    return 'Medium';
  } else {
    return 'Low';
  }
};

/**
 * Fetches economic events from MyFXBook
 * Note: Due to CORS restrictions, this function may need to be called through a proxy
 * or backend service in production
 */
export const fetchEconomicEvents = async (
  startDate: string,
  endDate: string,
  currencies: string[] = ['USD']
): Promise<EconomicEvent[]> => {
  try {
    // Use Firebase Function URL (force production URL for now)
    const functionUrl = 'https://us-central1-tradejournal-b5c65.cloudfunctions.net/economicCalendarProxy';
    
    const params = new URLSearchParams({
      start: `${startDate} 00:00`,
      end: `${endDate} 23:59`,
      filter: `2-3_${currencies.join('-')}`,
      calPeriod: '10'
    });
    
    console.log('Fetching from Firebase Function:', `${functionUrl}?${params.toString()}`);
    
    const response = await fetch(`${functionUrl}?${params.toString()}`);
    
    console.log('Function response status:', response.status);
    console.log('Function response headers:', response.headers);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const xmlText = await response.text();
    const events = parseMyFXBookXML(xmlText);
    
    // If no events found, log for debugging
    if (events.length === 0) {
      console.log('No events parsed from XML. Raw XML:', xmlText.substring(0, 500));
    }
    
    return events;
  } catch (error) {
    console.error('Error fetching from Firebase Function:', error);
    
    // Return sample data for development/fallback
    console.log('Falling back to sample data');
    return getSampleEconomicEvents();
  }
};

/**
 * Returns sample economic events for development and testing
 */
export const getSampleEconomicEvents = (): EconomicEvent[] => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(today.getDate() + 2);

  return [
    {
      id: 'sample-1',
      title: 'Core CPI m/m',
      country: 'USA',
      currency: 'USD',
      date: yesterday.toISOString().split('T')[0],
      time: '08:30',
      impact: 'High',
      actual: '0.3%',
      forecast: '0.2%',
      previous: '0.3%',
      description: 'Core Consumer Price Index measures the change in the price of goods and services purchased by consumers, excluding food and energy.'
    },
    {
      id: 'sample-2',
      title: 'Initial Jobless Claims',
      country: 'USA',
      currency: 'USD',
      date: today.toISOString().split('T')[0],
      time: '08:30',
      impact: 'Medium',
      actual: '215K',
      forecast: '210K',
      previous: '219K',
      description: 'The number of individuals who filed for unemployment insurance for the first time during the past week.'
    },
    {
      id: 'sample-3',
      title: 'Fed Chair Powell Speaks',
      country: 'USA',
      currency: 'USD',
      date: today.toISOString().split('T')[0],
      time: '14:00',
      impact: 'High',
      description: 'Federal Reserve Chairman Jerome Powell speaks about monetary policy and economic outlook.'
    },
    {
      id: 'sample-4',
      title: 'Retail Sales m/m',
      country: 'USA',
      currency: 'USD',
      date: tomorrow.toISOString().split('T')[0],
      time: '08:30',
      impact: 'Medium',
      forecast: '0.2%',
      previous: '0.1%',
      description: 'The change in the total value of sales at the retail level.'
    },
    {
      id: 'sample-5',
      title: 'Producer Price Index m/m',
      country: 'USA',
      currency: 'USD',
      date: tomorrow.toISOString().split('T')[0],
      time: '08:30',
      impact: 'High',
      forecast: '0.1%',
      previous: '0.2%',
      description: 'Producer Price Index measures the average change in selling prices received by domestic producers.'
    },
    {
      id: 'sample-6',
      title: 'Building Permits',
      country: 'USA',
      currency: 'USD',
      date: dayAfter.toISOString().split('T')[0],
      time: '08:30',
      impact: 'Low',
      forecast: '1.43M',
      previous: '1.42M',
      description: 'The number of new residential building permits issued by the government.'
    },
    {
      id: 'sample-7',
      title: 'Consumer Confidence',
      country: 'USA',
      currency: 'USD',
      date: dayAfter.toISOString().split('T')[0],
      time: '10:00',
      impact: 'Medium',
      forecast: '102.5',
      previous: '101.3',
      description: 'Consumer Confidence measures the level of confidence that consumers have in economic activity.'
    }
  ];
};

/**
 * Helper function to format dates for MyFXBook API
 */
export const formatDateForAPI = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Gets date range for today
 */
export const getTodayRange = (): { start: string; end: string } => {
  const today = new Date();
  return {
    start: formatDateForAPI(today),
    end: formatDateForAPI(today)
  };
};

/**
 * Gets date range for this week
 */
export const getWeekRange = (): { start: string; end: string } => {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)
  
  return {
    start: formatDateForAPI(weekStart),
    end: formatDateForAPI(weekEnd)
  };
};