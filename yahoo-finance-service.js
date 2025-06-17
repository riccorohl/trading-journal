// Yahoo Finance Data Service
// Simple Node.js service to fetch futures data

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

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
    
    // Convert timestamp to local date for market hours check
    const date = new Date(timestamps[i] * 1000);
    
    // Check if it's a weekend
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    
    // For now, include all trading hours data - let frontend handle filtering
    // This ensures we get June 13th data if it exists
    
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

// API endpoint to fetch futures data
app.get('/api/futures/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { start, end, interval = '1m' } = req.query;
    
    // Convert dates to Unix timestamps with timezone handling
    const startDate = new Date(start + 'T00:00:00-05:00'); // EST timezone
    const endDate = new Date(end + 'T23:59:59-05:00');     // EST timezone
    
    const startTime = Math.floor(startDate.getTime() / 1000);
    const endTime = Math.floor(endDate.getTime() / 1000);
    
    console.log(`Start: ${start} -> ${startDate.toISOString()} -> ${startTime}`);
    console.log(`End: ${end} -> ${endDate.toISOString()} -> ${endTime}`);
    
    console.log(`Fetching ${symbol} data from ${start} to ${end} (${interval})`);
    console.log(`Start timestamp: ${startTime} (${new Date(startTime * 1000).toISOString()})`);
    console.log(`End timestamp: ${endTime} (${new Date(endTime * 1000).toISOString()})`);
    
    // Build Yahoo Finance URL
    const url = buildYahooUrl(symbol, startTime, endTime, interval);
    
    // Fetch data from Yahoo Finance
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    // Convert to TradingView format
    const data = convertToTradingViewFormat(response.data);
    
    console.log(`Successfully fetched ${data.length} data points for ${symbol}`);
    
    // Debug: Log first and last data points
    if (data.length > 0) {
      const firstPoint = new Date(data[0].time * 1000);
      const lastPoint = new Date(data[data.length - 1].time * 1000);
      console.log(`Data range: ${firstPoint.toISOString()} to ${lastPoint.toISOString()}`);
      console.log(`First bar: ${firstPoint.toDateString()}`);
      console.log(`Last bar: ${lastPoint.toDateString()}`);
    }
    
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
});

// API endpoint to fetch prebuilds for the current user
app.get('/api/prebuilds', async (req, res) => {
  try {
    // In a real application, you would have authentication and user context.
    // For now, we'll assume a user is logged in and return an empty array.
    const prebuilds = []; 
    res.json({
      success: true,
      data: prebuilds,
      count: prebuilds.length,
    });
  } catch (error) {
    console.error('Error fetching prebuilds:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Yahoo Finance Futures Data' });
});

app.listen(PORT, () => {
  console.log(`🚀 Yahoo Finance service running on http://localhost:${PORT}`);
  console.log(`📊 Supported symbols: ${Object.keys(SYMBOL_MAP).join(', ')}`);
});
