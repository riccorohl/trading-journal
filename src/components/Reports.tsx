import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTradeContext } from '@/contexts/TradeContext';
import { TrendingUp, TrendingDown, Target, DollarSign } from 'lucide-react';

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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net P&L</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.netPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(metrics.netPnL)}
            </div>
            <p className="text-xs text-muted-foreground">
              Gross: {formatCurrency(metrics.totalPnL)} | Fees: {formatCurrency(metrics.totalCommissions)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(metrics.winRate)}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.winningTrades}W / {metrics.losingTrades}L / {metrics.totalTrades} Total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Factor</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.profitFactor >= 1.5 ? 'text-green-600' : metrics.profitFactor >= 1 ? 'text-yellow-600' : 'text-red-600'}`}>
              {metrics.profitFactor === 999 ? '∞' : metrics.profitFactor.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg Win: {formatCurrency(metrics.avgWin)} | Avg Loss: {formatCurrency(metrics.avgLoss)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTrades}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.winningTrades} winners, {metrics.losingTrades} losers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Trading Statistics</h4>
              <div className="space-y-1 text-sm">
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
                  <span className={`font-medium ${metrics.profitFactor >= 1.5 ? 'text-green-600' : metrics.profitFactor >= 1 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {metrics.profitFactor === 999 ? '∞' : metrics.profitFactor.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Win/Loss Analysis</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Winning Trades:</span>
                  <span className="text-green-600 font-medium">{metrics.winningTrades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Losing Trades:</span>
                  <span className="text-red-600 font-medium">{metrics.losingTrades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Win:</span>
                  <span className="text-green-600 font-medium">{formatCurrency(metrics.avgWin)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Loss:</span>
                  <span className="text-red-600 font-medium">{formatCurrency(metrics.avgLoss)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Financial Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Gross P&L:</span>
                  <span className={`font-medium ${metrics.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(metrics.totalPnL)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Commissions:</span>
                  <span className="text-red-600 font-medium">{formatCurrency(metrics.totalCommissions)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Net P&L:</span>
                  <span className={`font-medium ${metrics.netPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(metrics.netPnL)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Section */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Analytics Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Additional charts and analytics will be added here:
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Equity curve visualization</li>
            <li>• Monthly performance breakdown</li>
            <li>• Symbol performance analysis</li>
            <li>• Long vs Short comparison</li>
            <li>• Risk management metrics</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;