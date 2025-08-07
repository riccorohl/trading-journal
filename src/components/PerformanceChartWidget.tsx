import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { BarChart3, TrendingUp } from 'lucide-react';
import { ChartContainer, ChartTooltip } from './ui/chart';
import moment from 'moment';
import { Trade } from '../types/trade';

interface PerformanceChartWidgetProps {
  trades: Trade[];
  size?: { w: number; h: number };
}

const PerformanceChartWidget: React.FC<PerformanceChartWidgetProps> = ({ trades }) => {
  const [selectedRange, setSelectedRange] = useState('all');

  const timeRanges = [
    { label: '7D', value: 'week' },
    { label: '1M', value: 'month' },
    { label: '3M', value: 'quarter' },
    { label: '1Y', value: 'year' },
    { label: 'All', value: 'all' }
  ];

  const performanceData = useMemo(() => {
    // Calculate cumulative P&L over time
    const closedTrades = trades
      .filter(trade => trade.status === 'closed' && trade.pnl !== undefined)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let cumulativePnL = 0;
    const dailyData: Record<string, { value: number; trades: number; date: string }> = {};

    closedTrades.forEach(trade => {
      const date = moment(trade.date).format('MMM DD');
      cumulativePnL += trade.pnl || 0;
      
      if (!dailyData[date]) {
        dailyData[date] = { value: 0, trades: 0, date };
      }
      dailyData[date].value = cumulativePnL;
      dailyData[date].trades += 1;
    });

    const allData = Object.values(dailyData);

    // Filter data based on time range
    const filteredData = allData.filter(item => {
      const date = moment(item.date, 'MMM DD');
      const now = moment();
      switch (selectedRange) {
        case 'week':
          return date.isAfter(now.clone().subtract(7, 'days'));
        case 'month':
          return date.isAfter(now.clone().subtract(1, 'month'));
        case 'quarter':
          return date.isAfter(now.clone().subtract(3, 'months'));
        case 'year':
          return date.isAfter(now.clone().subtract(1, 'year'));
        default: // 'all'
          return true;
      }
    });

    return filteredData;
  }, [trades, selectedRange]);

  const currentValue = performanceData.length > 0 ? performanceData[performanceData.length - 1]?.value || 0 : 0;
  const previousValue = performanceData.length > 1 ? performanceData[performanceData.length - 2]?.value || 0 : 0;
  const change = currentValue - previousValue;
  const changePercent = previousValue !== 0 ? ((change / Math.abs(previousValue)) * 100).toFixed(1) : '0.0';

  // Calculate summary stats
  const values = performanceData.map(d => d.value).filter(v => v !== undefined);
  const bestDay = values.length > 0 ? Math.max(...values.map((v, i) => i > 0 ? v - (values[i-1] || 0) : 0)) : 0;
  const worstDay = values.length > 0 ? Math.min(...values.map((v, i) => i > 0 ? v - (values[i-1] || 0) : 0)) : 0;
  const avgDaily = values.length > 1 ? (currentValue - (values[0] || 0)) / (values.length - 1) : 0;

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            Performance Chart
          </CardTitle>
          <p className="text-sm text-muted-foreground">Cumulative P&L over time</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={change >= 0 ? "default" : "destructive"} className="gap-1">
            <TrendingUp className={`h-3 w-3 ${change < 0 ? "rotate-180" : ""}`} />
            {change >= 0 ? "+" : ""}{changePercent}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Time Range Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
            {timeRanges.map((range) => (
              <Button
                key={range.value}
                variant={selectedRange === range.value ? "default" : "ghost"}
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={() => setSelectedRange(range.value)}
              >
                {range.label}
              </Button>
            ))}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              ${currentValue.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              Current P&L
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[200px] w-full">
          <ChartContainer
            config={{
              value: {
                label: "P&L",
                color: "hsl(var(--chart-1))",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => `$${value}`}
                />
                <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="2 2" />
                <ChartTooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length && payload[0]) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-background border rounded-lg shadow-lg p-3">
                          <p className="font-medium">{label}</p>
                          <p className={`text-sm ${data.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            P&L: ${data.value.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Trades: {data.trades}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#colorProfit)"
                  fillOpacity={1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 pt-2 border-t">
          <div className="text-center">
            <div className="text-sm font-medium">Best Day</div>
            <div className="text-xs text-green-600">
              {bestDay > 0 ? `+$${bestDay.toFixed(2)}` : '$0.00'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium">Worst Day</div>
            <div className="text-xs text-red-600">
              {worstDay < 0 ? `-$${Math.abs(worstDay).toFixed(2)}` : '$0.00'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium">Avg Daily</div>
            <div className="text-xs text-muted-foreground">
              {avgDaily >= 0 ? '+' : ''}${avgDaily.toFixed(2)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceChartWidget;
