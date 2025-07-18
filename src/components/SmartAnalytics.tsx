import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { useTradeContext } from '../contexts/TradeContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle, 
  DollarSign, 
  Clock,
  Calendar,
  BarChart3,
  Zap,
  Star,
  Activity,
  Shield,
  Flame
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface AnalyticsMetrics {
  // Core Performance
  totalTrades: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  totalPnL: number;
  
  // Risk Metrics  
  maxDrawdown: number;
  recoveryFactor: number;
  riskScore: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  
  // Time-based
  bestTradingDay: string;
  bestTradingHour: number;
  avgHoldTime: number;
  
  // Advanced Insights
  winRateBySymbol: Record<string, number>;
  pnlByTimeframe: Record<string, number>;
  performanceScore: number;
  confidenceAccuracy: number;
}

const SmartAnalytics: React.FC = () => {
  const { trades } = useTradeContext();

  // Smart analytics that work with ANY data completeness level
  const analytics = useMemo((): AnalyticsMetrics => {
    const closedTrades = trades.filter(trade => 
      trade.status === 'closed' || 
      (trade.pnl !== undefined && trade.pnl !== null)
    );

    if (closedTrades.length === 0) {
      return {
        totalTrades: 0, winRate: 0, avgWin: 0, avgLoss: 0, profitFactor: 0,
        totalPnL: 0, maxDrawdown: 0, recoveryFactor: 0, riskScore: 0,
        consecutiveWins: 0, consecutiveLosses: 0, bestTradingDay: 'None',
        bestTradingHour: 0, avgHoldTime: 0, winRateBySymbol: {},
        pnlByTimeframe: {}, performanceScore: 0, confidenceAccuracy: 0
      };
    }

    // Core Performance Metrics
    const wins = closedTrades.filter(t => t.pnl && t.pnl > 0);
    const losses = closedTrades.filter(t => t.pnl && t.pnl < 0);
    const winRate = (wins.length / closedTrades.length) * 100;
    
    const totalPnL = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const avgWin = wins.length > 0 ? wins.reduce((sum, t) => sum + (t.pnl || 0), 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((sum, t) => sum + (t.pnl || 0), 0)) / losses.length : 0;
    const profitFactor = avgLoss > 0 ? (avgWin * wins.length) / (avgLoss * losses.length) : 999;

    // Risk Analysis
    let runningPnL = 0;
    let peak = 0;
    let maxDrawdown = 0;
    const equityCurve: number[] = [];
    
    closedTrades
      .sort((a, b) => new Date(a.date + ' ' + (a.timeIn || '00:00')).getTime() - 
                     new Date(b.date + ' ' + (b.timeIn || '00:00')).getTime())
      .forEach(trade => {
        runningPnL += trade.pnl || 0;
        equityCurve.push(runningPnL);
        
        if (runningPnL > peak) peak = runningPnL;
        const currentDrawdown = peak - runningPnL;
        if (currentDrawdown > maxDrawdown) maxDrawdown = currentDrawdown;
      });

    // Consecutive streaks
    let currentWinStreak = 0;
    let currentLossStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    
    closedTrades.forEach(trade => {
      if (trade.pnl && trade.pnl > 0) {
        currentWinStreak++;
        currentLossStreak = 0;
        maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
      } else if (trade.pnl && trade.pnl < 0) {
        currentLossStreak++;
        currentWinStreak = 0;
        maxLossStreak = Math.max(maxLossStreak, currentLossStreak);
      }
    });

    // Time-based Analysis
    const dayPnL: Record<string, number> = {};
    const hourPnL: Record<number, number> = {};
    
    closedTrades.forEach(trade => {
      // Day of week analysis
      const dayOfWeek = new Date(trade.date).toLocaleDateString('en-US', { weekday: 'long' });
      dayPnL[dayOfWeek] = (dayPnL[dayOfWeek] || 0) + (trade.pnl || 0);
      
      // Hour analysis (if time data available)
      if (trade.timeIn) {
        const hour = parseInt(trade.timeIn.split(':')[0]);
        hourPnL[hour] = (hourPnL[hour] || 0) + (trade.pnl || 0);
      }
    });

    const bestTradingDay = Object.entries(dayPnL).reduce((best, [day, pnl]) => 
      pnl > (dayPnL[best] || -Infinity) ? day : best, 'None');
    const bestTradingHour = Object.entries(hourPnL).reduce((best, [hour, pnl]) => 
      pnl > (hourPnL[parseInt(best)] || -Infinity) ? parseInt(hour) : parseInt(best), 0);

    // Symbol Analysis
    const symbolStats: Record<string, { wins: number; total: number }> = {};
    closedTrades.forEach(trade => {
      if (!symbolStats[trade.symbol]) {
        symbolStats[trade.symbol] = { wins: 0, total: 0 };
      }
      symbolStats[trade.symbol].total++;
      if (trade.pnl && trade.pnl > 0) {
        symbolStats[trade.symbol].wins++;
      }
    });

    const winRateBySymbol = Object.entries(symbolStats).reduce((acc, [symbol, stats]) => {
      acc[symbol] = (stats.wins / stats.total) * 100;
      return acc;
    }, {} as Record<string, number>);

    // Timeframe Analysis (if available)
    const timeframePnL = closedTrades.reduce((acc, trade) => {
      const tf = trade.timeframe || 'Unknown';
      acc[tf] = (acc[tf] || 0) + (trade.pnl || 0);
      return acc;
    }, {} as Record<string, number>);

    // Risk Score (0-100, lower is better)
    const volatility = equityCurve.length > 1 ? 
      Math.sqrt(equityCurve.reduce((sum, val, i) => {
        if (i === 0) return 0;
        const change = val - equityCurve[i-1];
        return sum + Math.pow(change, 2);
      }, 0) / (equityCurve.length - 1)) : 0;
    
    const riskScore = Math.min(100, (maxDrawdown / Math.abs(totalPnL || 1)) * 100 + (volatility / 100));

    // Performance Score (0-100, higher is better)
    const performanceScore = Math.min(100, 
      (winRate * 0.3) + 
      (Math.min(profitFactor, 10) * 10 * 0.4) + 
      (Math.max(0, 100 - riskScore) * 0.3)
    );

    // Confidence Accuracy (if confidence data available)
    const tradesWithConfidence = closedTrades.filter(t => t.confidence !== undefined);
    let confidenceAccuracy = 0;
    if (tradesWithConfidence.length > 0) {
      const correctPredictions = tradesWithConfidence.filter(t => {
        const isWin = (t.pnl || 0) > 0;
        const wasConfident = (t.confidence || 0) >= 7;
        return (isWin && wasConfident) || (!isWin && !wasConfident);
      });
      confidenceAccuracy = (correctPredictions.length / tradesWithConfidence.length) * 100;
    }

    return {
      totalTrades: closedTrades.length,
      winRate,
      avgWin,
      avgLoss,
      profitFactor,
      totalPnL,
      maxDrawdown,
      recoveryFactor: maxDrawdown > 0 ? totalPnL / maxDrawdown : 999,
      riskScore,
      consecutiveWins: maxWinStreak,
      consecutiveLosses: maxLossStreak,
      bestTradingDay,
      bestTradingHour,
      avgHoldTime: 0, // Would need time calculations
      winRateBySymbol,
      pnlByTimeframe: timeframePnL,
      performanceScore,
      confidenceAccuracy
    };
  }, [trades]);

  // Data for charts
  const equityData = useMemo(() => {
    const closedTrades = trades.filter(trade => 
      trade.status === 'closed' || (trade.pnl !== undefined && trade.pnl !== null)
    );
    
    let runningPnL = 0;
    return closedTrades
      .sort((a, b) => new Date(a.date + ' ' + (a.timeIn || '00:00')).getTime() - 
                     new Date(b.date + ' ' + (b.timeIn || '00:00')).getTime())
      .map((trade, index) => {
        runningPnL += trade.pnl || 0;
        return {
          trade: index + 1,
          equity: runningPnL,
          date: trade.date,
          symbol: trade.symbol,
          pnl: trade.pnl || 0
        };
      });
  }, [trades]);

  const symbolPerformanceData = useMemo(() => {
    return Object.entries(analytics.winRateBySymbol)
      .map(([symbol, winRate]) => ({
        symbol,
        winRate: Number(winRate.toFixed(1)),
        trades: trades.filter(t => t.symbol === symbol && (t.status === 'closed' || t.pnl !== undefined)).length
      }))
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 8);
  }, [analytics.winRateBySymbol, trades]);

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRiskColor = (score: number) => {
    if (score <= 20) return 'text-green-600 bg-green-100';
    if (score <= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (analytics.totalTrades === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Trading Data Yet</h3>
          <p className="text-gray-600 mb-4">Add some trades to see powerful analytics and insights</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <Zap className="h-5 w-5 text-blue-600 inline mr-2" />
            <span className="text-sm text-blue-800">
              Even quick trades (30-second entries) provide valuable insights!
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Smart Analytics</h2>
          <p className="text-gray-600">AI-powered insights from your trading data</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-sm">
            {analytics.totalTrades} trades analyzed
          </Badge>
          <Badge className={getPerformanceColor(analytics.performanceScore)}>
            <Star className="w-3 h-3 mr-1" />
            Performance: {analytics.performanceScore.toFixed(0)}/100
          </Badge>
        </div>
      </div>

      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-gray-900">
                {analytics.winRate.toFixed(1)}%
              </div>
              {analytics.winRate >= 50 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </div>
            <Progress value={analytics.winRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Profit Factor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-gray-900">
                {analytics.profitFactor === 999 ? '∞' : analytics.profitFactor.toFixed(2)}
              </div>
              <Target className={`h-4 w-4 ${analytics.profitFactor >= 1.5 ? 'text-green-500' : 'text-red-500'}`} />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Avg Win: ${analytics.avgWin.toFixed(0)} | Avg Loss: ${analytics.avgLoss.toFixed(0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-gray-900">
                {analytics.riskScore.toFixed(0)}
              </div>
              <Shield className={`h-4 w-4 ${analytics.riskScore <= 30 ? 'text-green-500' : 'text-red-500'}`} />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Max DD: ${analytics.maxDrawdown.toFixed(0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`text-2xl font-bold ${analytics.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${analytics.totalPnL >= 0 ? '+' : ''}{analytics.totalPnL.toFixed(0)}
              </div>
              <DollarSign className={`h-4 w-4 ${analytics.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {analytics.totalTrades} trades
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equity Curve */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-600" />
              Equity Curve
            </CardTitle>
            <CardDescription>Your account performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityData}>
                  <defs>
                    <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="trade" stroke="#666" fontSize={12} />
                  <YAxis tickFormatter={(value) => `$${value}`} stroke="#666" fontSize={12} />
                  <Tooltip 
                    formatter={(value: number | string, name: string) => [`$${value}`, 'Equity']}
                    labelFormatter={(label) => `Trade #${label}`}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="equity" 
                    stroke="#3B82F6" 
                    fillOpacity={1} 
                    fill="url(#equityGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Symbol Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Flame className="h-5 w-5 mr-2 text-orange-600" />
              Symbol Performance
            </CardTitle>
            <CardDescription>Win rate by trading instrument</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={symbolPerformanceData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} stroke="#666" fontSize={12} />
                  <YAxis dataKey="symbol" type="category" width={60} stroke="#666" fontSize={12} />
                  <Tooltip 
                    formatter={(value: number | string, name: string, props: { payload: { trades: number } }) => [
                      `${value}%`, 
                      `Win Rate (${props.payload.trades} trades)`
                    ]}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px'
                    }}
                  />
                  <Bar 
                    dataKey="winRate" 
                    fill="#10B981"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-green-600">
              <TrendingUp className="h-5 w-5 mr-2" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {analytics.winRate >= 55 && (
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                High win rate ({analytics.winRate.toFixed(1)}%)
              </div>
            )}
            {analytics.profitFactor >= 1.5 && (
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Strong profit factor ({analytics.profitFactor.toFixed(2)})
              </div>
            )}
            {analytics.consecutiveWins >= 3 && (
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Good winning streaks (max {analytics.consecutiveWins})
              </div>
            )}
            {analytics.bestTradingDay !== 'None' && (
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Best day: {analytics.bestTradingDay}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {analytics.winRate < 45 && (
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                Low win rate ({analytics.winRate.toFixed(1)}%)
              </div>
            )}
            {analytics.profitFactor < 1.2 && (
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                Weak profit factor ({analytics.profitFactor.toFixed(2)})
              </div>
            )}
            {analytics.riskScore > 50 && (
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                High risk exposure ({analytics.riskScore.toFixed(0)})
              </div>
            )}
            {analytics.consecutiveLosses >= 5 && (
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                Long losing streaks (max {analytics.consecutiveLosses})
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-blue-600">
              <Clock className="h-5 w-5 mr-2" />
              Time Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Best trading day:</span>
              <span className="font-medium">{analytics.bestTradingDay}</span>
            </div>
            {analytics.bestTradingHour > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span>Best trading hour:</span>
                <span className="font-medium">{analytics.bestTradingHour}:00</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span>Total trades:</span>
              <span className="font-medium">{analytics.totalTrades}</span>
            </div>
            {analytics.confidenceAccuracy > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span>Confidence accuracy:</span>
                <span className="font-medium">{analytics.confidenceAccuracy.toFixed(1)}%</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SmartAnalytics;