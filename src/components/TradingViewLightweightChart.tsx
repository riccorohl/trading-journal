import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, LineStyle, ColorType } from 'lightweight-charts';

interface Trade {
  id: string;
  symbol: string;
  date: string;
  timeIn: string;
  timeOut?: string;
  side: 'long' | 'short';
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  stopLoss?: number;
  takeProfit?: number;
  pnl?: number;
  commission?: number;
  strategy?: string;
  notes?: string;
}

interface TradingViewLightweightChartProps {
  trade: Trade;
  className?: string;
}

const TradingViewLightweightChart: React.FC<TradingViewLightweightChartProps> = ({ 
  trade, 
  className = "" 
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate simple sample data around the trade
  const generateSampleData = () => {
    const data = [];
    const entryTime = new Date(`${trade.date}T${trade.timeIn || '09:30'}`);
    
    // Generate 24 hours of data around the trade
    for (let i = -12; i <= 12; i++) {
      const time = new Date(entryTime.getTime() + i * 60 * 60 * 1000);
      const basePrice = trade.entryPrice;
      const randomChange = (Math.random() - 0.5) * 0.02; // 2% volatility
      
      const open = basePrice * (1 + randomChange);
      const close = open * (1 + (Math.random() - 0.5) * 0.01);
      const high = Math.max(open, close) * (1 + Math.random() * 0.005);
      const low = Math.min(open, close) * (1 - Math.random() * 0.005);
      
      data.push({
        time: Math.floor(time.getTime() / 1000),
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2))
      });
    }
    
    return data.sort((a, b) => a.time - b.time);
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    try {
      // Clean up previous chart
      if (chartRef.current) {
        chartRef.current.remove();
      }

      // Create new chart
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 400,
        layout: {
          background: { type: ColorType.Solid, color: '#ffffff' },
          textColor: '#333333',
        },
        grid: {
          vertLines: { color: '#e1e5e9' },
          horzLines: { color: '#e1e5e9' },
        },
        rightPriceScale: {
          borderColor: '#cccccc',
        },
        timeScale: {
          borderColor: '#cccccc',
          timeVisible: true,
        },
      });

      chartRef.current = chart;

      // Create candlestick series
      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });

      // Generate and set data
      const sampleData = generateSampleData();
      candlestickSeries.setData(sampleData);

      // Add entry price line
      candlestickSeries.createPriceLine({
        price: trade.entryPrice,
        color: '#2196F3',
        lineWidth: 2,
        lineStyle: LineStyle.Solid,
        axisLabelVisible: true,
        title: `Entry: $${trade.entryPrice}`,
      });

      // Add exit price line if available
      if (trade.exitPrice) {
        candlestickSeries.createPriceLine({
          price: trade.exitPrice,
          color: (trade.pnl || 0) >= 0 ? '#4CAF50' : '#F44336',
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
          axisLabelVisible: true,
          title: `Exit: $${trade.exitPrice}`,
        });
      }

      // Add stop loss line if available
      if (trade.stopLoss) {
        candlestickSeries.createPriceLine({
          price: trade.stopLoss,
          color: '#F44336',
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: `Stop: $${trade.stopLoss}`,
        });
      }

      // Add take profit line if available
      if (trade.takeProfit) {
        candlestickSeries.createPriceLine({
          price: trade.takeProfit,
          color: '#4CAF50',
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: `Target: $${trade.takeProfit}`,
        });
      }

      // Fit content
      chart.timeScale().fitContent();

      setIsLoading(false);
      setError(null);

      // Handle resize
      const handleResize = () => {
        if (chartContainerRef.current && chart) {
          chart.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (chart) {
          chart.remove();
        }
      };

    } catch (err) {
      console.error('Chart creation error:', err);
      setError(`Failed to create chart: ${err}`);
      setIsLoading(false);
    }
  }, [trade]);

  if (error) {
    return (
      <div className={`flex items-center justify-center h-96 bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center p-4">
          <div className="text-red-500 text-lg font-medium mb-2">Chart Error</div>
          <div className="text-gray-600 text-sm">{error}</div>
          <div className="text-gray-500 text-xs mt-2">
            Make sure 'lightweight-charts' is installed: npm install lightweight-charts
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-96 bg-gray-50 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <div className="text-gray-600 mt-4">Loading chart...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={chartContainerRef} className="w-full h-96" />
      
      {/* Chart Info */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
        <div className="text-sm font-medium text-gray-900 mb-2">{trade.symbol}</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Entry: ${trade.entryPrice}</span>
          </div>
          {trade.exitPrice && (
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${(trade.pnl || 0) >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>Exit: ${trade.exitPrice}</span>
            </div>
          )}
        </div>
      </div>

      {/* P&L Badge */}
      {trade.pnl && (
        <div className="absolute top-4 right-4">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            trade.pnl >= 0 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
};

export default TradingViewLightweightChart;