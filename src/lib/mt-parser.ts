/**
 * MT4/MT5 Trading Platform Parser
 * Sophisticated parser for MetaTrader 4 and MetaTrader 5 export files
 * Supports various broker formats and provides professional-grade validation
 */

export interface MT4Trade {
  ticket: string
  openTime: Date
  type: 'buy' | 'sell'
  lots: number
  item: string // currency pair
  openPrice: number
  sl: number // stop loss
  tp: number // take profit
  closeTime: Date
  closePrice: number
  commission: number
  taxes: number
  swap: number
  profit: number
}

export interface MT5Trade {
  ticket: string
  time: Date
  type: 'buy' | 'sell'
  volume: number
  symbol: string
  price: number
  sl: number
  tp: number
  time_1: Date // close time
  price_1: number // close price
  commission: number
  swap: number
  profit: number
}

export interface ParsedMTTrade {
  id: string
  openTime: Date
  closeTime: Date
  symbol: string
  type: 'buy' | 'sell'
  volume: number
  openPrice: number
  closePrice: number
  stopLoss: number
  takeProfit: number
  commission: number
  swap: number
  profit: number
  pips?: number
  platform: 'MT4' | 'MT5'
}

/**
 * Parse MT4 CSV export file
 * MT4 typically exports in this format:
 * Ticket,Open Time,Type,Size,Item,Price,S/L,T/P,Close Time,Price,Commission,Taxes,Swap,Profit
 */
export function parseMT4CSV(csvContent: string): ParsedMTTrade[] {
  try {
    const lines = csvContent.split('\n').filter(line => line.trim())
    
    if (lines.length === 0) {
      throw new Error('CSV file is empty')
    }

    // Get headers and normalize them
    const headers = lines[0].split(',').map(h => 
      h.trim().replace(/"/g, '').toLowerCase()
    )

    // Parse data rows
    const trades: ParsedMTTrade[] = []
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
      
      if (values.length < headers.length) continue // Skip incomplete rows
      
      const row: { [key: string]: string } = {}
      headers.forEach((header, index) => {
        row[normalizeHeader(header)] = values[index] || ''
      })

      // Convert to ParsedMTTrade
      const trade = convertRowToTrade(row, 'MT4')
      if (trade && trade.id && trade.symbol) {
        trades.push(trade)
      }
    }

    return trades
  } catch (error) {
    console.error('Error parsing MT4 CSV:', error)
    throw new Error('Failed to parse MT4 CSV file. Please check the file format.')
  }
}

/**
 * Parse MT5 CSV export file
 * Similar to MT4 but with slightly different column names
 */
export function parseMT5CSV(csvContent: string): ParsedMTTrade[] {
  try {
    const lines = csvContent.split('\n').filter(line => line.trim())
    
    if (lines.length === 0) {
      throw new Error('CSV file is empty')
    }

    const headers = lines[0].split(',').map(h => 
      h.trim().replace(/"/g, '').toLowerCase()
    )

    const trades: ParsedMTTrade[] = []
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
      
      if (values.length < headers.length) continue
      
      const row: { [key: string]: string } = {}
      headers.forEach((header, index) => {
        row[normalizeHeader(header)] = values[index] || ''
      })

      const trade = convertRowToTrade(row, 'MT5')
      if (trade && trade.id && trade.symbol) {
        trades.push(trade)
      }
    }

    return trades
  } catch (error) {
    console.error('Error parsing MT5 CSV:', error)
    throw new Error('Failed to parse MT5 CSV file. Please check the file format.')
  }
}

/**
 * Auto-detect and parse MT4/MT5 file based on content
 */
export function parseMetaTraderFile(file: File): Promise<ParsedMTTrade[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        
        // Try to detect file type based on headers
        const firstLine = content.split('\n')[0].toLowerCase()
        
        let trades: ParsedMTTrade[]
        
        if (detectMT4Format(firstLine)) {
          trades = parseMT4CSV(content)
        } else if (detectMT5Format(firstLine)) {
          trades = parseMT5CSV(content)
        } else {
          // Try both formats and use the one that returns more valid trades
          let mt4Trades: ParsedMTTrade[] = []
          let mt5Trades: ParsedMTTrade[] = []
          
          try {
            mt4Trades = parseMT4CSV(content)
          } catch (e) {
            // Silent fail
          }
          
          try {
            mt5Trades = parseMT5CSV(content)
          } catch (e) {
            // Silent fail
          }
          
          if (mt4Trades.length > mt5Trades.length) {
            trades = mt4Trades
          } else if (mt5Trades.length > 0) {
            trades = mt5Trades
          } else {
            throw new Error('Unsupported file format. Please export from MT4/MT5 as CSV.')
          }
        }
        
        resolve(trades)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsText(file)
  })
}

/**
 * Detect MT4 format based on headers
 */
function detectMT4Format(firstLine: string): boolean {
  const indicators = ['ticket', 'open time', 'type', 'size', 'item', 'close time']
  return indicators.some(indicator => firstLine.includes(indicator))
}

/**
 * Detect MT5 format based on headers
 */
function detectMT5Format(firstLine: string): boolean {
  const indicators = ['ticket', 'time', 'type', 'volume', 'symbol', 'time', 'price']
  return indicators.some(indicator => firstLine.includes(indicator))
}

/**
 * Normalize header names for consistent parsing
 */
function normalizeHeader(header: string): string {
  const normalized = header.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim()
  
  // Map common variations to standard names
  const headerMap: { [key: string]: string } = {
    'ticket': 'id',
    'order': 'id',
    'deal': 'id',
    'opentime': 'opentime',
    'time': 'opentime',
    'closetime': 'closetime',
    'time1': 'closetime',
    'type': 'type',
    'side': 'type',
    'size': 'volume',
    'lots': 'volume',
    'volume': 'volume',
    'item': 'symbol',
    'symbol': 'symbol',
    'pair': 'symbol',
    'price': 'openprice',
    'openprice': 'openprice',
    'price1': 'closeprice',
    'closeprice': 'closeprice',
    'sl': 'stoploss',
    'stoploss': 'stoploss',
    'tp': 'takeprofit',
    'takeprofit': 'takeprofit',
    'commission': 'commission',
    'swap': 'swap',
    'profit': 'profit',
    'pnl': 'profit'
  }
  
  return headerMap[normalized] || normalized
}

/**
 * Convert parsed row to ParsedMTTrade object
 */
function convertRowToTrade(row: { [key: string]: string }, platform: 'MT4' | 'MT5'): ParsedMTTrade | null {
  try {
    const trade: ParsedMTTrade = {
      id: row.id || '',
      openTime: parseDateTime(row.opentime || ''),
      closeTime: parseDateTime(row.closetime || row.opentime || ''),
      symbol: (row.symbol || '').toUpperCase(),
      type: parseTradeType(row.type || ''),
      volume: parseFloat(row.volume || '0'),
      openPrice: parseFloat(row.openprice || '0'),
      closePrice: parseFloat(row.closeprice || row.openprice || '0'),
      stopLoss: parseFloat(row.stoploss || '0'),
      takeProfit: parseFloat(row.takeprofit || '0'),
      commission: parseFloat(row.commission || '0'),
      swap: parseFloat(row.swap || '0'),
      profit: parseFloat(row.profit || '0'),
      platform
    }

    // Calculate pips for forex pairs
    if (trade.symbol && trade.openPrice && trade.closePrice) {
      trade.pips = calculatePips(trade.symbol, trade.openPrice, trade.closePrice, trade.type)
    }

    return trade
  } catch (error) {
    console.warn('Error converting row to trade:', error, row)
    return null
  }
}

/**
 * Parse various date/time formats from MT4/MT5
 */
function parseDateTime(dateStr: string): Date {
  if (!dateStr) return new Date()
  
  // Handle common MT4/MT5 date formats
  // Examples: "2024.01.15 10:30:00", "2024-01-15 10:30", "15.01.2024 10:30"
  const cleaned = dateStr
    .replace(/[-.]/g, '/')
    .replace(/(\d{4})\/(\d{2})\/(\d{2})/, '$2/$3/$1') // Convert YYYY/MM/DD to MM/DD/YYYY
    .trim()
  
  const date = new Date(cleaned)
  
  if (isNaN(date.getTime())) {
    console.warn(`Could not parse date: ${dateStr}`)
    return new Date()
  }
  
  return date
}

/**
 * Parse trade type from various formats
 */
function parseTradeType(typeStr: string): 'buy' | 'sell' {
  if (!typeStr) return 'buy'
  
  const type = typeStr.toLowerCase().trim()
  
  if (type.includes('sell') || type.includes('short') || type === 's' || type === '1') {
    return 'sell'
  }
  
  return 'buy' // default to buy
}

/**
 * Calculate pips for a forex trade
 * This is a simplified calculation - real implementation would need
 * more sophisticated pip value calculations per currency pair
 */
function calculatePips(symbol: string, openPrice: number, closePrice: number, type: 'buy' | 'sell'): number {
  if (!symbol || !openPrice || !closePrice) return 0
  
  // Determine pip size based on currency pair
  let pipSize = 0.0001 // Default for most major pairs
  
  // JPY pairs typically have 2 decimal places
  if (symbol.includes('JPY')) {
    pipSize = 0.01
  }
  
  // Some brokers use 5-digit pricing for EUR/USD, GBP/USD, etc.
  // We'll detect this by checking decimal places
  const openPriceStr = openPrice.toString()
  const decimalPlaces = openPriceStr.includes('.') ? openPriceStr.split('.')[1].length : 0
  
  if (decimalPlaces >= 5 && !symbol.includes('JPY')) {
    pipSize = 0.00001
  } else if (decimalPlaces >= 3 && symbol.includes('JPY')) {
    pipSize = 0.001
  }
  
  const priceDiff = type === 'buy' 
    ? closePrice - openPrice 
    : openPrice - closePrice
  
  return Math.round((priceDiff / pipSize) * 10) / 10 // Round to 1 decimal place
}

/**
 * Validate that parsed trades are reasonable
 */
export function validateMTTrades(trades: ParsedMTTrade[]): { valid: ParsedMTTrade[], invalid: { trade: ParsedMTTrade; errors: string[] }[] } {
  const valid: ParsedMTTrade[] = []
  const invalid: { trade: ParsedMTTrade; errors: string[] }[] = []
  
  trades.forEach(trade => {
    const errors: string[] = []
    
    if (!trade.id) errors.push('Missing trade ID')
    if (!trade.symbol) errors.push('Missing symbol')
    if (trade.volume <= 0) errors.push('Invalid volume')
    if (trade.openPrice <= 0) errors.push('Invalid open price')
    if (trade.closePrice <= 0) errors.push('Invalid close price')
    if (trade.openTime > trade.closeTime) errors.push('Open time after close time')
    
    if (errors.length === 0) {
      valid.push(trade)
    } else {
      invalid.push({ trade, errors })
    }
  })
  
  return { valid, invalid }
}

/**
 * Convert ParsedMTTrade to your app's Trade interface
 */
export function convertMTTradeToAppTrade(mtTrade: ParsedMTTrade): {
  id: string;
  symbol: string;
  date: string;
  timeIn: string;
  timeOut: string;
  side: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  commission: number;
  result: string;
  notes: string;
  status: string;
} {
  return {
    id: mtTrade.id,
    symbol: mtTrade.symbol,
    date: mtTrade.openTime.toISOString().split('T')[0],
    timeIn: mtTrade.openTime.toTimeString().split(' ')[0],
    timeOut: mtTrade.closeTime.toTimeString().split(' ')[0],
    side: mtTrade.type === 'buy' ? 'long' : 'short',
    entryPrice: mtTrade.openPrice,
    exitPrice: mtTrade.closePrice,
    quantity: mtTrade.volume,
    pnl: mtTrade.profit,
    commission: Math.abs(mtTrade.commission), // Ensure positive
    stopLoss: mtTrade.stopLoss || undefined,
    takeProfit: mtTrade.takeProfit || undefined,
    status: 'closed' as const,
    notes: `Imported from ${mtTrade.platform}. Pips: ${mtTrade.pips || 'N/A'}. Swap: ${mtTrade.swap}`,
    timeframe: '1H', // Default timeframe, user can modify
    strategy: 'Imported', // Default strategy, user can modify
  }
}
