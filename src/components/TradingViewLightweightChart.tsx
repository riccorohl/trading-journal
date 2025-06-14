import React, { useEffect, useRef, useState } from 'react';

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
  const [isLibraryAvailable, setIsLibraryAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkLibrary = async () => {
      try {
        await import('lightweight-charts');
        setIsLibraryAvailable(true);
      } catch (err) {
        console.error('Failed to load lightweight-charts:', err);
        setError('lightweight-charts library not available. Run: npm install lightweight-charts');
      }
    };

    checkLibrary();
  }, []);

  if (error) {
    return (
      <div className={`flex items-center justify-center h-96 bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center p-4">
          <div className="text-red-500 text-lg font-medium mb-2">Chart Library Error</div>
          <div className="text-gray-600 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (!isLibraryAvailable) {
    return (
      <div className={`flex items-center justify-center h-96 bg-gray-50 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <div className="text-gray-600 mt-4">Loading chart library...</div>
        </div>
      </div>
    );
  }

  return <ActualChart trade={trade} className={className} />;
};

// Separate component that only renders when library is confirmed available
const ActualChart: React.FC<TradingViewLightweightChartProps> = ({ trade, className = "" }) => {
  const [chartContainer, setChartContainer] = useState<HTMLDivElement | null>(null);
  const chartRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    console.log('ActualChart mounted, starting initialization...');

    const initChart = async () => {
      // Wait for the next frame to ensure DOM is ready
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      if (!mountedRef.current) {
        console.log('Component unmounted before chart creation');
        return;
      }

      if (!chartContainer) {
        console.log('Container ref is null');
        setError('Chart container not available');
        return;
      }

      console.log('Container found, creating chart...');
      console.log('Container details:', {
        width: chartContainer.clientWidth,
        height: chartContainer.clientHeight,
        visible: chartContainer.offsetParent !== null
      });

      try {
        const charts = await import('lightweight-charts');
        
        // Clean up previous chart
        if (chartRef.current) {
          chartRef.current.remove();
        }

        // Force container size if needed
        const containerWidth = Math.max(chartContainer.clientWidth, 600);

        // Generate sample data
        const generateSampleData = () => {
          const data = [];
          const entryTime = new Date(`${trade.date}T${trade.timeIn || '09:30'}`);
          
          for (let i = -12; i <= 12; i++) {
            const time = new Date(entryTime.getTime() + i * 60 * 60 * 1000);
            const basePrice = trade.entryPrice;
            const randomChange = (Math.random() - 0.5) * 0.02;
            
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

        // Create chart
        const chart = charts.createChart(chartContainer, {
          width: containerWidth,
          height: 400,
          layout: {
            background: { type: charts.ColorType.Solid, color: '#ffffff' },
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

        if (!mountedRef.current) return;

        console.log('Chart created successfully');
        chartRef.current = chart;

        // Create candlestick series
        const candlestickSeries = chart.addCandlestickSeries({
          upColor: '#26a69a',
          downColor: '#ef5350',
          borderVisible: false,
          wickUpColor: '#26a69a',
          wickDownColor: '#ef5350',
        });

        // Set data
        const sampleData = generateSampleData();
        candlestickSeries.setData(sampleData);

        // Add price lines
        candlestickSeries.createPriceLine({
          price: trade.entryPrice,
          color: '#2196F3',
          lineWidth: 2,
          lineStyle: charts.LineStyle.Solid,
          axisLabelVisible: true,
          title: `Entry: $${trade.entryPrice}`,
        });

        if (trade.exitPrice) {
          candlestickSeries.createPriceLine({
            price: trade.exitPrice,
            color: (trade.pnl || 0) >= 0 ? '#4CAF50' : '#F44336',
            lineWidth: 2,
            lineStyle: charts.LineStyle.Solid,
            axisLabelVisible: true,
            title: `Exit: $${trade.exitPrice}`,
          });
        }

        if (trade.stopLoss) {
          candlestickSeries.createPriceLine({
            price: trade.stopLoss,
            color: '#F44336',
            lineWidth: 1,
            lineStyle: charts.LineStyle.Dashed,
            axisLabelVisible: true,
            title: `Stop: $${trade.stopLoss}`,
          });
        }

        if (trade.takeProfit) {
          candlestickSeries.createPriceLine({
            price: trade.takeProfit,
            color: '#4CAF50',
            lineWidth: 1,
            lineStyle: charts.LineStyle.Dashed,
            axisLabelVisible: true,
            title: `Target: $${trade.takeProfit}`,
          });
        }

        // Fit content
        chart.timeScale().fitContent();

        console.log('Chart setup completed successfully');
        setIsLoading(false);
        setError(null);

      } catch (err) {
        console.error('Chart creation failed:', err);
        setError(`Chart creation failed: ${err}`);
        setIsLoading(false);
      }
    };

    // Start initialization with a small delay
    const timer = setTimeout(initChart, 100);

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [trade]);

  if (error) {
    return (
      <div className={`flex items-center justify-center h-96 bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center p-4">
          <div className="text-red-500 text-lg font-medium mb-2">Chart Error</div>
          <div className="text-gray-600 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-96 bg-gray-50 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <div className="text-gray-600 mt-4">Creating chart...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={setChartContainer}
        className="w-full h-96 bg-white rounded-lg border"
        style={{ 
          minWidth: '600px', 
          minHeight: '400px',
          display: 'block',
          position: 'relative'
        }}
      />
      
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