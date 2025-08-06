import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from './ui/button';
import moment from 'moment';
import { Trade } from '../types/trade';

interface PerformanceChartWidgetProps {
  trades: Trade[];
  size: { w: number; h: number };
}

const PerformanceChartWidget: React.FC<PerformanceChartWidgetProps> = ({ trades, size }) => {
  const [timeRange, setTimeRange] = useState('all');

  const chartData = useMemo(() => {
    // Calculate daily P&L
    const dailyPnl = trades.reduce((acc, trade) => {
      if (trade.status === 'closed' && trade.pnl !== undefined) {
        const date = moment(trade.date).format('YYYY-MM-DD');
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += trade.pnl;
      }
      return acc;
    }, {} as Record<string, number>);

    const allData = Object.entries(dailyPnl)
      .map(([date, pnl]) => ({ date, pnl }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Filter data based on time range
    const filteredData = allData.filter(item => {
      const date = moment(item.date);
      const now = moment();
      switch (timeRange) {
        case 'week':
          return date.isSame(now, 'week');
        case 'month':
          return date.isSame(now, 'month');
        case 'year':
          return date.isSame(now, 'year');
        default: // 'all'
          return true;
      }
    });

    return filteredData;
  }, [trades, timeRange]);

  // Calculate gradient offset based on data range
  const gradientOffset = useMemo(() => {
    if (chartData.length === 0) return '50%';
    
    const pnlValues = chartData.map(item => item.pnl as number);
    const maxPnl = Math.max(...pnlValues);
    const minPnl = Math.min(...pnlValues);
    
    // Handle edge cases
    if (minPnl >= 0) return '100%'; // All positive, entire area should be green
    if (maxPnl <= 0) return '0%';   // All negative, entire area should be red
    
    // Calculate where zero falls in the range (as percentage from top)
    // Since the gradient goes from top (y1=0) to bottom (y2=1),
    // and the chart displays max at top, min at bottom,
    // the zero line position is: maxPnl / (maxPnl - minPnl)
    const zeroPosition = maxPnl / (maxPnl - minPnl);
    return `${(zeroPosition * 100).toFixed(1)}%`;
  }, [chartData]);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex space-x-2 p-4">
        <Button 
          variant={timeRange === 'week' ? 'default' : 'outline'} 
          onClick={() => setTimeRange('week')}
          size="sm"
        >
          Week
        </Button>
        <Button 
          variant={timeRange === 'month' ? 'default' : 'outline'} 
          onClick={() => setTimeRange('month')}
          size="sm"
        >
          Month
        </Button>
        <Button 
          variant={timeRange === 'year' ? 'default' : 'outline'} 
          onClick={() => setTimeRange('year')}
          size="sm"
        >
          Year
        </Button>
        <Button 
          variant={timeRange === 'all' ? 'default' : 'outline'} 
          onClick={() => setTimeRange('all')}
          size="sm"
        >
          All
        </Button>
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 50,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af" 
              fontSize={12} 
              tickFormatter={(value) => moment(value).format('MMM DD')}
            />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
              }}
              labelFormatter={(value) => moment(value).format('MMMM DD, YYYY')}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Daily P&L']}
            />
            <defs>
              <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                <stop offset={gradientOffset} stopColor="#22c55e" stopOpacity={0.8}/>
                <stop offset={gradientOffset} stopColor="#ef4444" stopOpacity={0.8}/>
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="pnl" 
              stroke="#8884d8" 
              fill="url(#colorPnl)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceChartWidget;
