import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTradeContext } from '@/contexts/TradeContext';
import { TrendingUp, TrendingDown, Target, DollarSign } from 'lucide-react';
import MetricCard from './MetricCard';
import { 
  ChartContainer, 
  ChartTooltip 
} from '@/components/ui/chart';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';

const Reports: React.FC = () => {
  const { trades } = useTradeContext();

  // Filter only closed trades for analysis
  const closedTrades = useMemo(() => {
    return trades.filter(trade => trade.status === 'closed' && trade.pnl !== undefined && trade.pnl !== null);
  }, [trades]);

  // Calculate key metrics
  const metrics = useMemo(() => {
    if (closedTrades.length === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalPnL: 0,
        avgWin: 0,
        avgLoss: 0,
        profitFactor: 0,
        totalCommissions: 0,
        netPnL: 0
      };
    }

    const winningTrades = closedTrades.filter(trade => trade.pnl > 0);
    const losingTrades = closedTrades.filter(trade => trade.pnl < 0);
    
    const totalPnL = closedTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const totalCommissions = closedTrades.reduce((sum, trade) => sum + (trade.commission || 0), 0);
    
    const grossWins = winningTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const grossLosses = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.pnl, 0));
    
    const avgWin = winningTrades.length > 0 ? grossWins / winningTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? grossLosses / losingTrades.length : 0;

    return {
      totalTrades: closedTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0,
      totalPnL,
      avgWin,
      avgLoss,
      profitFactor: grossLosses > 0 ? grossWins / grossLosses : grossWins > 0 ? 999 : 0,
      totalCommissions,
      netPnL: totalPnL - totalCommissions
    };
  }, [closedTrades]);

  // Prepare data for equity curve
  const equityCurveData = useMemo(() => {
    if (closedTrades.length === 0) return [];
    
    const sortedTrades = [...closedTrades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let runningBalance = 0;
    
    return sortedTrades.map((trade, index) => {
      runningBalance += trade.pnl - (trade.commission || 0);
      return {
        trade: index + 1,
        balance: runningBalance,
        date: new Date(trade.date).toLocaleDateString(),
        symbol: trade.symbol,
        pnl: trade.pnl
      };
    });
  }, [closedTrades]);

  // Prepare data for monthly performance
  const monthlyData = useMemo(() => {
    if (closedTrades.length === 0) return [];
    
    const monthlyMap = new Map<string, { pnl: number, trades: number }>();
    
    closedTrades.forEach(trade => {
      const date = new Date(trade.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const existing = monthlyMap.get(monthKey) || { pnl: 0, trades: 0 };
      
      monthlyMap.set(monthKey, {
        pnl: existing.pnl + trade.pnl - (trade.commission || 0),
        trades: existing.trades + 1
      });
    });
    
    return Array.from(monthlyMap.entries())
      .sort()
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        pnl: data.pnl,
        trades: data.trades
      }));
  }, [closedTrades]);

  // Prepare data for symbol performance
  const symbolData = useMemo(() => {
    if (closedTrades.length === 0) return [];
    
    const symbolMap = new Map<string, { pnl: number, trades: number, wins: number }>();
    
    closedTrades.forEach(trade => {
      const existing = symbolMap.get(trade.symbol) || { pnl: 0, trades: 0, wins: 0 };
      
      symbolMap.set(trade.symbol, {
        pnl: existing.pnl + trade.pnl - (trade.commission || 0),
        trades: existing.trades + 1,
        wins: existing.wins + (trade.pnl > 0 ? 1 : 0)
      });
    });
    
    return Array.from(symbolMap.entries())
      .map(([symbol, data]) => ({
        symbol,
        pnl: data.pnl,
        trades: data.trades,
        winRate: (data.wins / data.trades) * 100
      }))
      .sort((a, b) => b.pnl - a.pnl)
      .slice(0, 10); // Top 10 symbols
  }, [closedTrades]);

  // Win/Loss distribution data
  const winLossData = useMemo(() => {
    if (closedTrades.length === 0) return [];
    
    return [
      {
        name: 'Winning Trades',
        value: metrics.winningTrades,
        fill: '#10b981'
      },
      {
        name: 'Losing Trades', 
        value: metrics.losingTrades,
        fill: '#ef4444'
      }
    ];
  }, [metrics]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (closedTrades.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Trading Reports</h1>
            <p className="text-gray-600 mt-1">Comprehensive analysis of your trading performance</p>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>No Trading Data Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Complete some trades to view your performance analytics. Your reports will include win rates, 
              profit factors, equity curves, and detailed performance breakdowns.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trading Reports</h1>
          <p className="text-gray-600 mt-1">Comprehensive analysis of your trading performance</p>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Net P&L"
          value={formatCurrency(metrics.netPnL)}
          subtitle={`Gross: ${formatCurrency(metrics.totalPnL)} | Fees: ${formatCurrency(metrics.totalCommissions)}`}
          color={metrics.netPnL >= 0 ? 'green' : 'red'}
        />
        <MetricCard
          title="Win Rate"
          value={formatPercentage(metrics.winRate)}
          subtitle={`${metrics.winningTrades}W / ${metrics.losingTrades}L / ${metrics.totalTrades} Total`}
          color={metrics.winRate >= 50 ? 'green' : 'red'}
        />
        <MetricCard
          title="Profit Factor"
          value={metrics.profitFactor === 999 ? '∞' : metrics.profitFactor.toFixed(2)}
          subtitle={`Avg Win: ${formatCurrency(metrics.avgWin)} | Avg Loss: ${formatCurrency(metrics.avgLoss)}`}
          color={metrics.profitFactor >= 1 ? 'green' : 'red'}
        />
        <MetricCard
          title="Total Trades"
          value={metrics.totalTrades.toString()}
          subtitle={`${metrics.winningTrades} winners, ${metrics.losingTrades} losers`}
          color="blue"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equity Curve */}
        <Card>
          <CardHeader>
            <CardTitle>Equity Curve</CardTitle>
            <p className="text-sm text-gray-600">Your account balance over time</p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{
              balance: { label: "Balance", color: "#2563eb" }
            }} className="h-64">
              <LineChart data={equityCurveData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="trade" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <ChartTooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border rounded shadow">
                          <p className="font-medium">Trade #{label}</p>
                          <p className="text-sm text-gray-600">{data.date}</p>
                          <p className="text-sm">Symbol: {data.symbol}</p>
                          <p className="text-sm">Trade P&L: {formatCurrency(data.pnl)}</p>
                          <p className="font-medium">Balance: {formatCurrency(data.balance)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  dot={{ fill: '#2563eb', strokeWidth: 0, r: 3 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Win/Loss Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Win/Loss Distribution</CardTitle>
            <p className="text-sm text-gray-600">Breakdown of winning vs losing trades</p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{
              wins: { label: "Wins", color: "#10b981" },
              losses: { label: "Losses", color: "#ef4444" }
            }} className="h-64">
              <PieChart>
                <Pie
                  data={winLossData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                />
                <ChartTooltip />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Monthly Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
            <p className="text-sm text-gray-600">P&L breakdown by month</p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{
              pnl: { label: "P&L", color: "#059669" }
            }} className="h-64">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <ChartTooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border rounded shadow">
                          <p className="font-medium">{label}</p>
                          <p className="text-sm">P&L: {formatCurrency(data.pnl)}</p>
                          <p className="text-sm">Trades: {data.trades}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="pnl" 
                  fill="#059669"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Symbol Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Symbols</CardTitle>
            <p className="text-sm text-gray-600">Performance by trading symbol</p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{
              pnl: { label: "P&L", color: "#7c3aed" }
            }} className="h-64">
              <BarChart data={symbolData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                <YAxis dataKey="symbol" type="category" width={60} />
                <ChartTooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border rounded shadow">
                          <p className="font-medium">{label}</p>
                          <p className="text-sm">P&L: {formatCurrency(data.pnl)}</p>
                          <p className="text-sm">Trades: {data.trades}</p>
                          <p className="text-sm">Win Rate: {data.winRate.toFixed(1)}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="pnl" 
                  fill="#7c3aed"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Trading Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Trades:</span>
                <span className="font-medium">{metrics.totalTrades}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Win Rate:</span>
                <span className="font-medium">{formatPercentage(metrics.winRate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Profit Factor:</span>
                <span className="font-medium">{metrics.profitFactor === 999 ? '∞' : metrics.profitFactor.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Win/Loss Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Winning Trades:</span>
                <span className="font-medium text-green-600">{metrics.winningTrades}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Losing Trades:</span>
                <span className="font-medium text-red-600">{metrics.losingTrades}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Win:</span>
                <span className="font-medium text-green-600">{formatCurrency(metrics.avgWin)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Loss:</span>
                <span className="font-medium text-red-600">{formatCurrency(metrics.avgLoss)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Gross P&L:</span>
                <span className="font-medium">{formatCurrency(metrics.totalPnL)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Commissions:</span>
                <span className="font-medium text-red-600">{formatCurrency(metrics.totalCommissions)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Net P&L:</span>
                <span className={`font-medium ${metrics.netPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(metrics.netPnL)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
