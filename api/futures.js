// Vercel API route for Yahoo Finance data
// File: api/futures.js

import axios from 'axios';

// Symbol mapping for futures
const SYMBOL_MAP = {
  'MES': 'MES=F',
  'ES': 'ES=F', 
  'MNQ': 'MNQ=F',
  'NQ': 'NQ=F'
};

// Yahoo Finance URL builder
function buildYahooUrl(symbol, period1, period2, interval = '1m') {
  const yahooSymbol = SYMBOL_MAP[symbol] || `${symbol}=F`;
  return `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?period1=${period1}&period2=${period2}&interval=${interval}&includePrePost=false`;
}

// Convert Yahoo Finance data to TradingView format
function convertToTradingViewFormat(yahooData) {
  if (!yahooData.chart || !yahooData.chart.result || !yahooData.chart.result[0]) {
    throw new Error('Invalid Yahoo Finance response');
  }

  const result = yahooData.chart.result[0];
  const timestamps = result.timestamp;
  const quotes = result.indicators.quote[0];
  
  if (!timestamps || !quotes) {
    throw new Error('No price data available');
  }

  const data = [];
  
  for (let i = 0; i < timestamps.length; i++) {
    // Skip bars with null values
    if (quotes.open[i] === null || quotes.close[i] === null) continue;
    
    data.push({
      time: timestamps[i],
      open: parseFloat(quotes.open[i].toFixed(2)),
      high: parseFloat(quotes.high[i].toFixed(2)),
      low: parseFloat(quotes.low[i].toFixed(2)),
      close: parseFloat(quotes.close[i].toFixed(2)),
      volume: quotes.volume[i] || 0
    });
  }
  
  return data.sort((a, b) => a.time - b.time);
}

// Main API handler
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { symbol } = req.query;
    const { start, end, interval = '1m' } = req.query;
    
    if (!symbol || !start || !end) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters: symbol, start, end' 
      });
    }
    
    // Convert dates to Unix timestamps with timezone handling
    const startDate = new Date(start + 'T00:00:00-05:00'); // EST timezone
    const endDate = new Date(end + 'T23:59:59-05:00');     // EST timezone
    
    const startTime = Math.floor(startDate.getTime() / 1000);
    const endTime = Math.floor(endDate.getTime() / 1000);
    
    console.log(`Fetching ${symbol} data from ${start} to ${end} (${interval})`);
    
    // Build Yahoo Finance URL
    const url = buildYahooUrl(symbol, startTime, endTime, interval);
    
    // Fetch data from Yahoo Finance
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000 // 10 second timeout
    });
    
    // Convert to TradingView format
    const data = convertToTradingViewFormat(response.data);
    
    console.log(`Successfully fetched ${data.length} data points for ${symbol}`);
    
    res.json({
      success: true,
      symbol: symbol,
      data: data,
      count: data.length
    });
    
  } catch (error) {
    console.error('Error fetching Yahoo Finance data:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
