import React, { useEffect, useRef } from 'react';
import { Trade } from '../types/trade';

interface TradingViewChartProps {
  trade: Trade;
  height?: number;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ 
  trade, 
  height = 500 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any existing content
    containerRef.current.innerHTML = '';

    // Create TradingView widget script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    
    // Map common futures symbols to TradingView format
    const getSymbolForTradingView = (symbol: string) => {
      const futuresMap: { [key: string]: string } = {
        'MES': 'CME_MINI:ES1!',     // E-mini S&P 500
        'MNQ': 'CME_MINI:NQ1!',     // E-mini Nasdaq
        'MYM': 'CME_MINI:YM1!',     // E-mini Dow
        'MRB': 'CME_MINI:RTY1!',    // E-mini Russell 2000
        'ES': 'CME:ES1!',           // S&P 500 Futures
        'NQ': 'CME:NQ1!',           // Nasdaq Futures
        'YM': 'CME:YM1!',           // Dow Futures
        'RTY': 'CME:RTY1!',         // Russell 2000 Futures
        'CL': 'NYMEX:CL1!',         // Crude Oil
        'GC': 'COMEX:GC1!',         // Gold
        'SI': 'COMEX:SI1!',         // Silver
        'ZB': 'CBOT:ZB1!',          // 30Y Treasury Bond
        'ZN': 'CBOT:ZN1!',          // 10Y Treasury Note
        'ZF': 'CBOT:ZF1!',          // 5Y Treasury Note
        'ZS': 'CBOT:ZS1!',          // Soybeans
        'ZC': 'CBOT:ZC1!',          // Corn
        'ZW': 'CBOT:ZW1!',          // Wheat
      };
      
      return futuresMap[symbol.toUpperCase()] || symbol;
    };

    const config = {
      "autosize": true,
      "symbol": getSymbolForTradingView(trade.symbol),
      "interval": "D",
      "timezone": "Etc/UTC",
      "theme": "light",
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "allow_symbol_change": true,
      "calendar": false,
      "support_host": "https://www.tradingview.com"
    };

    script.innerHTML = JSON.stringify(config);

    // Create container for the widget
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container';
    widgetContainer.style.height = '100%';
    widgetContainer.style.width = '100%';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = 'calc(100% - 32px)';
    widgetDiv.style.width = '100%';

    const copyright = document.createElement('div');
    copyright.className = 'tradingview-widget-copyright';
    copyright.innerHTML = '<a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span class="blue-text">Track all markets on TradingView</span></a>';

    widgetContainer.appendChild(widgetDiv);
    widgetContainer.appendChild(copyright);
    widgetContainer.appendChild(script);

    containerRef.current.appendChild(widgetContainer);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [trade.symbol]);

  return (
    <div className="relative w-full h-full">
      {/* Trade Information Overlay - Left Side */}
      <div className="absolute top-4 left-4 bg-white bg-opacity-95 p-3 rounded-lg shadow-lg border border-gray-200 z-20">
        <div className="text-sm space-y-1">
          <div className="font-semibold text-gray-900">{trade.symbol}</div>
          <div className="text-gray-600">
            <span className={`px-2 py-1 text-xs rounded ${
              trade.side === 'long' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {trade.side.toUpperCase()}
            </span>
          </div>
          <div className="text-gray-600 text-xs">
            {new Date(trade.date).toLocaleDateString()} • {trade.timeIn}
            {trade.timeOut && ` - ${trade.timeOut}`}
          </div>
        </div>
      </div>

      {/* Price Markers - Right Side */}
      <div className="absolute top-4 right-4 space-y-2 z-20">
        {/* Entry Price Marker */}
        <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg border-l-4 border-blue-800">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wide">Entry</div>
              <div className="text-lg font-bold">${trade.entryPrice.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Exit Price Marker */}
        {trade.exitPrice && (
          <div className={`${trade.pnl && trade.pnl >= 0 ? 'bg-green-600 border-green-800' : 'bg-red-600 border-red-800'} text-white px-4 py-2 rounded-lg shadow-lg border-l-4`}>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 ${trade.pnl && trade.pnl >= 0 ? 'bg-green-300' : 'bg-red-300'} rounded-full`}></div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wide">Exit</div>
                <div className="text-lg font-bold">${trade.exitPrice.toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Stop Loss Marker */}
        {trade.stopLoss && (
          <div className="bg-red-500 text-white px-3 py-2 rounded-lg shadow-lg border-l-4 border-red-700">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-300 rounded-full"></div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wide">Stop</div>
                <div className="text-sm font-bold">${trade.stopLoss.toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Take Profit Marker */}
        {trade.takeProfit && (
          <div className="bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg border-l-4 border-green-700">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-300 rounded-full"></div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wide">Target</div>
                <div className="text-sm font-bold">${trade.takeProfit.toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* P&L Display - Bottom Right */}
      {trade.pnl !== undefined && (
        <div className="absolute bottom-8 right-4 z-20">
          <div className={`${trade.pnl >= 0 ? 'bg-green-600' : 'bg-red-600'} text-white px-4 py-3 rounded-lg shadow-lg`}>
            <div className="text-center">
              <div className="text-xs font-medium uppercase tracking-wide">Total P&L</div>
              <div className="text-xl font-bold">
                {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
              </div>
              {trade.riskAmount && trade.rMultiple && (
                <div className="text-xs opacity-90">
                  {trade.rMultiple > 0 ? '+' : ''}{trade.rMultiple.toFixed(2)}R
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div 
        ref={containerRef} 
        className="w-full h-full rounded-lg overflow-hidden border border-gray-200"
        style={{ height: `${height}px` }}
      />
    </div>
  );
};

export default TradingViewChart;
