import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, DollarSign, TrendingUp, Brain } from 'lucide-react';
import TradingViewLightweightChart from './TradingViewLightweightChart';
import TradingViewFallback from './TradingViewFallback';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

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
  confidence?: number;
  emotions?: string;
  marketConditions?: string;
  lessons?: string;
  analysis?: string;
}

interface TradeReviewModalProps {
  trade: Trade | null;
  isOpen: boolean;
  onClose: () => void;
}

// Basic chart component focused on working functionality
const BasicChart: React.FC<{ trade: Trade }> = ({ trade }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<any>(null);
  const [timeframe, setTimeframe] = useState('1h');
  const [status, setStatus] = useState('Loading...');

  const generateData = (tf: string) => {
    const tradeDate = new Date(trade.date);
    
    // Parse trade time (assuming timeIn is in HH:MM format)
    const tradeTime = trade.timeIn ? trade.timeIn.split(':') : ['9', '0'];
    const tradeHour = parseInt(tradeTime[0]);
    const tradeMinute = parseInt(tradeTime[1]);
    
    // Set trade date with actual time
    tradeDate.setHours(tradeHour, tradeMinute, 0, 0);
    
    // End time: 4:00 PM EST (16:00) on trade date
    const endDate = new Date(trade.date);
    endDate.setHours(16, 0, 0, 0);
    const endTime = endDate.getTime();
    
    // Start time: 6 days before trade date at 9:30 AM EST
    const startDate = new Date(trade.date);
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(9, 30, 0, 0);
    const startTime = startDate.getTime();
    
    const intervals = {
      '1m': 1 * 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '30m': 30 * 60 * 1000, 
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000
    };
    
    const interval = intervals[tf as keyof typeof intervals];
    const data = [];
    let currentTime = startTime;
    
    // Base price for different futures symbols (updated to realistic June 2025 levels)
    const symbolPrices = {
      'MES': trade.entryPrice || 5950,   // E-mini S&P 500 (correct range)
      'MNQ': trade.entryPrice || 20500,  // E-mini Nasdaq  
      'ES': trade.entryPrice || 5950,    // S&P 500 full size
      'NQ': trade.entryPrice || 20500    // Nasdaq full size
    };
    
    let basePrice = symbolPrices[trade.symbol as keyof typeof symbolPrices] || trade.entryPrice || 11550;
    let lastClose = basePrice;
    
    // Adjust volatility based on timeframe
    const volatilityMap = {
      '1m': { range: 1, trend: 0.1 },
      '5m': { range: 3, trend: 0.2 },
      '15m': { range: 5, trend: 0.3 },
      '30m': { range: 8, trend: 0.5 },
      '1h': { range: 15, trend: 1.0 },
      '4h': { range: 30, trend: 2.0 }
    };
    
    const { range, trend } = volatilityMap[tf as keyof typeof volatilityMap];
    
    while (currentTime <= endTime) {
      const currentDate = new Date(currentTime);
      const hour = currentDate.getHours();
      const minute = currentDate.getMinutes();
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
      
      // Skip weekends (Saturday and Sunday)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        currentTime += interval;
        continue;
      }
      
      // Main trading hours: 9:30 AM to 4:00 PM EST
      const isMainSession = (hour > 9 || (hour === 9 && minute >= 30)) && hour < 16;
      
      // Skip non-trading hours completely for cleaner charts
      if (!isMainSession) {
        currentTime += interval;
        continue;
      }
      
      const volumeMultiplier = 1.0; // Full volume during market hours
      
      const open = lastClose;
      
      // Create realistic price movement with micro trends
      const microTrend = (Math.random() - 0.5) * trend * volumeMultiplier;
      const noise = (Math.random() - 0.5) * range * volumeMultiplier;
      const close = open + microTrend + noise;
      
      // Calculate high/low with realistic wicks
      const wickRange = range * 0.5 * volumeMultiplier;
      const high = Math.max(open, close) + Math.random() * wickRange;
      const low = Math.min(open, close) - Math.random() * wickRange;
      
      data.push({
        time: Math.floor(currentTime / 1000),
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2))
      });
      
      lastClose = close;
      currentTime += interval;
    }
    
    return data.sort((a, b) => a.time - b.time);
  };

  const createChart = async () => {
    try {
      setStatus('Loading chart...');
      const charts = await import('lightweight-charts');
      
      if (!chartRef.current) return;
      
      // Remove existing chart
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
      }
      
      // Create new chart
      const chart = charts.createChart(chartRef.current, {
        width: 700,
        height: 400,
        layout: {
          background: { type: charts.ColorType.Solid, color: '#ffffff' },
          textColor: '#333333',
          fontSize: 12,
        },
        grid: {
          vertLines: { color: '#f0f0f0' },
          horzLines: { color: '#f0f0f0' },
        },
        crosshair: {
          mode: charts.CrosshairMode.Normal,
        },
        rightPriceScale: {
          borderColor: '#cccccc',
          scaleMargins: {
            top: 0.1,
            bottom: 0.1,
          },
        },
        timeScale: {
          borderColor: '#cccccc',
          timeVisible: true,
          secondsVisible: false,
        },
        handleScroll: {
          mouseWheel: true,
          pressedMouseMove: true,
        },
        handleScale: {
          axisPressedMouseMove: true,
          mouseWheel: true,
          pinch: true,
        },
      });
      
      chartInstanceRef.current = chart;
      
      // Add candlestick series
      const series = chart.addSeries(charts.CandlestickSeries, {
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });
      
      // Set data
      const data = generateData(timeframe);
      series.setData(data);
      
      // Add entry price line
      if (trade.entryPrice) {
        series.createPriceLine({
          price: trade.entryPrice,
          color: '#2196F3',
          lineWidth: 2,
          lineStyle: charts.LineStyle.Solid,
          axisLabelVisible: true,
          title: `Entry: $${trade.entryPrice}`,
        });
      }
      
      // Add exit price line (if trade is closed)
      if (trade.exitPrice) {
        const isProfit = (trade.side === 'long' && trade.exitPrice > trade.entryPrice) ||
                        (trade.side === 'short' && trade.exitPrice < trade.entryPrice);
        
        series.createPriceLine({
          price: trade.exitPrice,
          color: isProfit ? '#4CAF50' : '#F44336',
          lineWidth: 2,
          lineStyle: charts.LineStyle.Solid,
          axisLabelVisible: true,
          title: `Exit: $${trade.exitPrice}`,
        });
      }
      
      // Add stop loss line (if set)
      if (trade.stopLoss) {
        series.createPriceLine({
          price: trade.stopLoss,
          color: '#FF5722',
          lineWidth: 1,
          lineStyle: charts.LineStyle.Dashed,
          axisLabelVisible: true,
          title: `Stop: $${trade.stopLoss}`,
        });
      }
      
      // Add take profit line (if set)
      if (trade.takeProfit) {
        series.createPriceLine({
          price: trade.takeProfit,
          color: '#8BC34A',
          lineWidth: 1,
          lineStyle: charts.LineStyle.Dashed,
          axisLabelVisible: true,
          title: `Target: $${trade.takeProfit}`,
        });
      }
      
      chart.timeScale().fitContent();
      
      const dataPoints = data.length;
      setStatus(`${trade.symbol} - ${timeframe} - 6 days + trade day (${dataPoints} bars)`);
      
    } catch (error) {
      console.error('Chart error:', error);
      setStatus(`Error: ${error}`);
    }
  };

  useEffect(() => {
    createChart();
  }, [timeframe, trade]);

  return (
    <div className="w-full h-full p-4">
      {/* Timeframe buttons */}
      <div className="flex gap-2 mb-4">
        {['1m', '5m', '15m', '30m', '1h', '4h'].map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-3 py-1 rounded text-sm font-medium ${
              timeframe === tf
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>
      
      {/* Status */}
      <div className="text-center text-sm text-gray-600 mb-2">
        {status}
      </div>
      
      {/* Chart container */}
      <div className="flex justify-center">
        <div 
          ref={chartRef}
          className="border rounded"
          style={{ width: '700px', height: '400px' }}
        />
      </div>
    </div>
  );
};

const TradeReviewModal: React.FC<TradeReviewModalProps> = ({
  trade,
  isOpen,
  onClose,
}) => {
  // Don't render if trade is null - MUST be before any hooks
  if (!trade) {
    return null;
  }

  const [notes, setNotes] = useState(trade.notes || '');
  const [analysis, setAnalysis] = useState(trade.analysis || '');
  const [lessons, setLessons] = useState(trade.lessons || '');

  const rMultiple = trade.pnl && trade.stopLoss 
    ? Math.abs(trade.pnl / (Math.abs(trade.entryPrice - trade.stopLoss) * trade.quantity))
    : 0;

  const handleSave = () => {
    console.log('Saving trade review:', { notes, analysis, lessons });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold">{trade.symbol}</span>
              <Badge variant={trade.side === 'long' ? 'default' : 'destructive'}>
                {trade.side.toUpperCase()}
              </Badge>
              <Badge variant={trade.pnl && trade.pnl >= 0 ? 'default' : 'destructive'}>
                {trade.pnl ? `${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toFixed(2)}` : 'Open'}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-12 gap-6 h-[80vh]">
          {/* Chart Section */}
          <div className="col-span-8">
            <Tabs defaultValue="chart" className="h-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="chart">Chart</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chart" className="h-[calc(100%-3rem)] mt-4">
                <BasicChart trade={trade} />
              </TabsContent>
              
              <TabsContent value="analysis" className="h-[calc(100%-3rem)] mt-4">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Trade Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[calc(100%-5rem)]">
                    <Textarea
                      placeholder="What worked? What didn't? Market conditions, entry timing, exit strategy..."
                      value={analysis}
                      onChange={(e) => setAnalysis(e.target.value)}
                      className="h-full resize-none"
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notes" className="h-[calc(100%-3rem)] mt-4">
                <div className="space-y-4 h-full">
                  <Card className="h-1/2">
                    <CardHeader>
                      <CardTitle>Trade Notes</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[calc(100%-4rem)]">
                      <Textarea
                        placeholder="General notes about this trade..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="h-full resize-none"
                      />
                    </CardContent>
                  </Card>
                  
                  <Card className="h-1/2">
                    <CardHeader>
                      <CardTitle>Lessons Learned</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[calc(100%-4rem)]">
                      <Textarea
                        placeholder="Key takeaways for future trades..."
                        value={lessons}
                        onChange={(e) => setLessons(e.target.value)}
                        className="h-full resize-none"
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Stats Sidebar */}
          <div className="col-span-4 space-y-4 overflow-y-auto">
            {/* Trade Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Trade Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-600">Date</div>
                    <div className="font-medium">{trade.date}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Quantity</div>
                    <div className="font-medium">{trade.quantity}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Time In</div>
                    <div className="font-medium">{trade.timeIn || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Time Out</div>
                    <div className="font-medium">{trade.timeOut || 'N/A'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* P&L Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  P&L Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-600">Entry Price</div>
                    <div className="font-medium">${trade.entryPrice}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Exit Price</div>
                    <div className="font-medium">{trade.exitPrice ? `$${trade.exitPrice}` : 'Open'}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Gross P&L</div>
                    <div className={`font-medium ${trade.pnl && trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {trade.pnl ? `${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toFixed(2)}` : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Commission</div>
                    <div className="font-medium">${trade.commission || 0}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button onClick={handleSave} className="w-full">
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TradeReviewModal;