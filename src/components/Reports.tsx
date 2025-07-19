import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTradeContext } from '@/contexts/TradeContext';
import { TrendingUp, TrendingDown, Target, DollarSign, BarChart3, Shield, Clock, Activity, Zap } from 'lucide-react';
import MetricCard from './MetricCard';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid } from 'recharts';

const Reports: React.FC = () => {
        const { trades } = useTradeContext();
        const [timePeriod, setTimePeriod] = useState<'day' | 'week' | 'month'>('month');
      
        // Filter only closed trades for analysis
        const closedTrades = useMemo(() => {
          return trades.filter(trade => trade.status === 'closed' && trade.pnl !== undefined && trade.pnl !== null);
        }, [trades]);

        // Filter trades by selected time period
        const filteredTrades = useMemo(() => {
          const now = new Date();
          const filterDate = new Date();
          
          switch (timePeriod) {
            case 'day':
              filterDate.setDate(now.getDate() - 30); // Last 30 days
              break;
            case 'week':
              filterDate.setDate(now.getDate() - 90); // Last ~13 weeks
              break;
            case 'month':
              filterDate.setFullYear(now.getFullYear() - 1); // Last 12 months
              break;
          }
          
          return closedTrades.filter(trade => new Date(trade.date) >= filterDate);
        }, [closedTrades, timePeriod]);
      
        // Calculate key metrics
        const metrics = useMemo(() => {
          if (filteredTrades.length === 0) {
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
              netPnL: 0,
              maxDrawdown: 0,
              riskRewardRatio: 0,
              expectancy: 0,
              avgHoldingPeriod: 0,
              tradingFrequency: 0,
              sharpeRatio: 0,
              sortinoRatio: 0,
              calmarRatio: 0,
              largestWin: 0,
              largestLoss: 0
            };
          }
      
          const winningTrades = filteredTrades.filter(trade => trade.pnl > 0);
          const losingTrades = filteredTrades.filter(trade => trade.pnl < 0);
          
          const totalPnL = filteredTrades.reduce((sum, trade) => sum + trade.pnl, 0);
          const totalCommissions = filteredTrades.reduce((sum, trade) => sum + (trade.commission || 0), 0);
          
          const grossWins = winningTrades.reduce((sum, trade) => sum + trade.pnl, 0);
          const grossLosses = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.pnl, 0));
          
          const avgWin = winningTrades.length > 0 ? grossWins / winningTrades.length : 0;
          const avgLoss = losingTrades.length > 0 ? grossLosses / losingTrades.length : 0;
          const winRate = filteredTrades.length > 0 ? (winningTrades.length / filteredTrades.length) * 100 : 0;
          
          // Largest win/loss
          const largestWin = filteredTrades.length > 0 ? Math.max(...filteredTrades.map(t => t.pnl)) : 0;
          const largestLoss = filteredTrades.length > 0 ? Math.min(...filteredTrades.map(t => t.pnl)) : 0;
      
          // Maximum Drawdown
          let runningPnL = 0;
          let peak = 0;
          let maxDrawdown = 0;
          
          for (const trade of closedTrades) {
            runningPnL += trade.pnl;
            if (runningPnL > peak) {
              peak = runningPnL;
            }
            const drawdown = peak - runningPnL;
            if (drawdown > maxDrawdown) {
              maxDrawdown = drawdown;
            }
          }
      
          // Risk-Reward Ratio
          const riskRewardRatio = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? 999 : 0;
      
          // Expectancy
          const expectancy = filteredTrades.length > 0 ? totalPnL / filteredTrades.length : 0;
      
          // Average Holding Period (in hours)
          const tradesWithDuration = filteredTrades.filter(trade => 
            trade.timeIn && trade.timeOut && 
            trade.date && 
            new Date(`${trade.date} ${trade.timeOut}`) > new Date(`${trade.date} ${trade.timeIn}`)
          );
          
          let avgHoldingPeriod = 0;
          if (tradesWithDuration.length > 0) {
            const totalHours = tradesWithDuration.reduce((sum, trade) => {
              const entryTime = new Date(`${trade.date} ${trade.timeIn}`);
              const exitTime = new Date(`${trade.date} ${trade.timeOut}`);
              const durationHours = (exitTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60);
              return sum + durationHours;
            }, 0);
            avgHoldingPeriod = totalHours / tradesWithDuration.length;
          }
      
          // Trading Frequency
          const tradingFrequency = (() => {
            if (filteredTrades.length === 0) return 0;
            
            const dates = filteredTrades.map(trade => new Date(trade.date)).sort((a, b) => a.getTime() - b.getTime());
            const firstDate = dates[0];
            const lastDate = dates[dates.length - 1];
            const monthsDiff = (lastDate.getFullYear() - firstDate.getFullYear()) * 12 + 
                              (lastDate.getMonth() - firstDate.getMonth()) + 1;
            
            return filteredTrades.length / Math.max(monthsDiff, 1);
          })();
      
          // Sharpe Ratio
          const returns = filteredTrades.map(trade => trade.pnl);
          const avgReturn = returns.length > 0 ? returns.reduce((sum, ret) => sum + ret, 0) / returns.length : 0;
          const returnVariance = returns.length > 0 ? 
            returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length : 0;
          const returnStdDev = Math.sqrt(returnVariance);
          const sharpeRatio = returnStdDev > 0 ? avgReturn / returnStdDev : 0;
      
          // Sortino Ratio
          const negativeReturns = returns.filter(ret => ret < avgReturn);
          const downsideVariance = negativeReturns.length > 0 ?
      negativeReturns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / negativeReturns.length : 0;
          const downsideStdDev = Math.sqrt(downsideVariance);
          const sortinoRatio = downsideStdDev > 0 ? avgReturn / downsideStdDev : 0;
      
          // Calmar Ratio
          const calmarRatio = maxDrawdown > 0 ? (totalPnL * 12 / Math.max(tradingFrequency * 12, 1)) / maxDrawdown : 0;
      
          return {
            totalTrades: filteredTrades.length,
            winningTrades: winningTrades.length,
            losingTrades: losingTrades.length,
            winRate,
            totalPnL,
            avgWin,
            avgLoss,
            profitFactor: grossLosses > 0 ? grossWins / grossLosses : grossWins > 0 ? 999 : 0,
            totalCommissions,
            netPnL: totalPnL - totalCommissions,
            maxDrawdown,
            riskRewardRatio,
            expectancy,
            avgHoldingPeriod,
            tradingFrequency,
            sharpeRatio,
            sortinoRatio,
            calmarRatio,
            largestWin,
            largestLoss
          };
        }, [filteredTrades]);
      
        // Forex-specific analytics data
        const forexAnalytics = useMemo(() => {
          if (filteredTrades.length === 0) return {
            currencyPairData: [],
            sessionData: [],
            pipAnalysis: {},
            spreadCosts: 0,
            swapCosts: 0,
            baseCurrencyData: [],
            quoteCurrencyData: []
          };

          // Currency Pair Performance Analysis
          const pairMap = new Map<string, { trades: number; wins: number; totalPnL: number; totalPips: number; avgSpread: number }>();
          
          filteredTrades.forEach(trade => {
            const pair = trade.currencyPair || 'Unknown';
            const existing = pairMap.get(pair) || { trades: 0, wins: 0, totalPnL: 0, totalPips: 0, avgSpread: 0 };
            
            pairMap.set(pair, {
              trades: existing.trades + 1,
              wins: existing.wins + (trade.pnl > 0 ? 1 : 0),
              totalPnL: existing.totalPnL + trade.pnl,
              totalPips: existing.totalPips + (trade.pips || 0),
              avgSpread: existing.avgSpread + (trade.spread || 0)
            });
          });

          const currencyPairData = Array.from(pairMap.entries()).map(([pair, data]) => ({
            pair,
            trades: data.trades,
            winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
            totalPnL: data.totalPnL,
            avgPnL: data.totalPnL / data.trades,
            totalPips: data.totalPips,
            avgPips: data.totalPips / data.trades,
            avgSpread: data.avgSpread / data.trades
          })).sort((a, b) => b.totalPnL - a.totalPnL);

          // Trading Session Performance Analysis
          const sessionMap = new Map<string, { trades: number; wins: number; totalPnL: number; totalPips: number }>();
          
          filteredTrades.forEach(trade => {
            const session = trade.session || 'unknown';
            const existing = sessionMap.get(session) || { trades: 0, wins: 0, totalPnL: 0, totalPips: 0 };
            
            sessionMap.set(session, {
              trades: existing.trades + 1,
              wins: existing.wins + (trade.pnl > 0 ? 1 : 0),
              totalPnL: existing.totalPnL + trade.pnl,
              totalPips: existing.totalPips + (trade.pips || 0)
            });
          });

          const sessionData = Array.from(sessionMap.entries()).map(([session, data]) => ({
            session: session.charAt(0).toUpperCase() + session.slice(1),
            trades: data.trades,
            winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
            totalPnL: data.totalPnL,
            avgPnL: data.totalPnL / data.trades,
            totalPips: data.totalPips,
            avgPips: data.totalPips / data.trades
          }));

          // Pip Analysis
          const pipValues = filteredTrades.filter(t => t.pips !== undefined).map(t => t.pips!);
          const pipAnalysis = {
            avgPipsPerTrade: pipValues.length > 0 ? pipValues.reduce((sum, pips) => sum + pips, 0) / pipValues.length : 0,
            maxPips: pipValues.length > 0 ? Math.max(...pipValues) : 0,
            minPips: pipValues.length > 0 ? Math.min(...pipValues) : 0,
            totalPips: pipValues.reduce((sum, pips) => sum + pips, 0),
            pipEfficiency: pipValues.length > 0 ? (pipValues.filter(p => p > 0).length / pipValues.length) * 100 : 0
          };

          // Cost Analysis
          const spreadCosts = filteredTrades.reduce((sum, trade) => sum + ((trade.spread || 0) * (trade.pipValue || 0)), 0);
          const swapCosts = filteredTrades.reduce((sum, trade) => sum + (trade.swap || 0), 0);

          return {
            currencyPairData,
            sessionData,
            pipAnalysis,
            spreadCosts,
            swapCosts
          };
        }, [filteredTrades]);

        // Prepare data for detailed analytics charts
        const equityCurveData = useMemo(() => {
          if (filteredTrades.length === 0) return [];
          
          const sortedTrades = [...filteredTrades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          let runningBalance = 0;
          
          return sortedTrades.map((trade, index) => {
            runningBalance += trade.pnl - (trade.commission || 0);
            return {
              trade: index + 1,
              balance: runningBalance,
              date: new Date(trade.date).toLocaleDateString(),
              currencyPair: trade.currencyPair || 'Unknown',
              pnl: trade.pnl,
              pips: trade.pips || 0
            };
          });
        }, [filteredTrades]);
      
        const timeBasedData = useMemo(() => {
          if (filteredTrades.length === 0) return [];
          
          const dataMap = new Map<string, { pnl: number, trades: number }>();
          
          filteredTrades.forEach(trade => {
            const date = new Date(trade.date);
            let timeKey: string;
            
            switch (timePeriod) {
              case 'day': {
                timeKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
                break;
              }
              case 'week': {
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay()); // Start of week
                timeKey = weekStart.toISOString().split('T')[0];
                break;
              }
              case 'month':
              default: {
                timeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                break;
              }
            }
            
            const existing = dataMap.get(timeKey) || { pnl: 0, trades: 0 };
            
            dataMap.set(timeKey, {
              pnl: existing.pnl + trade.pnl - (trade.commission || 0),
              trades: existing.trades + 1
            });
          });
          
          return Array.from(dataMap.entries())
            .sort()
            .map(([timeKey, data]) => {
              let displayLabel: string;
              
              if (timePeriod === 'week') {
                const weekStart = new Date(timeKey);
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                displayLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
              } else if (timePeriod === 'day') {
                displayLabel = new Date(timeKey).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              } else {
                displayLabel = new Date(timeKey + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
              }
              
              return {
                period: displayLabel,
                pnl: data.pnl,
                trades: data.trades
              };
            });
        }, [filteredTrades, timePeriod]);
      
        const winLossDistribution = useMemo(() => {
          if (filteredTrades.length === 0) return [];
          
          return [
            {
              name: 'Wins',
              value: metrics.winningTrades,
              fill: '#10b981'
            },
            {
              name: 'Losses', 
              value: metrics.losingTrades,
              fill: '#ef4444'
            }
          ];
        }, [metrics, filteredTrades]);
      
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
            <p className="text-gray-600 mt-1">Deep analysis of your trading performance</p>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              No Trading Data Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Complete some trades to unlock powerful analytics. You'll get detailed insights into your win rates, 
              profit factors, risk metrics, and performance trends to help optimize your trading strategy.
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
          <p className="text-gray-600 mt-1">Deep analysis of your trading performance</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Activity className="w-4 h-4" />
          {metrics.totalTrades} trades analyzed ({timePeriod === 'day' ? 'last 30 days' : timePeriod === 'week' ? 'last 13 weeks' : 'last 12 months'})
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="detailed" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Detailed Metrics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - Now shows visual charts and insights */}
        <TabsContent value="overview" className="space-y-6">
          {/* Time Period Filter Tabs */}
          <div className="flex justify-start">
            <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
              <button
                onClick={() => setTimePeriod('day')}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                  timePeriod === 'day' ? 'bg-background text-foreground shadow-sm' : ''
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setTimePeriod('week')}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                  timePeriod === 'week' ? 'bg-background text-foreground shadow-sm' : ''
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setTimePeriod('month')}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                  timePeriod === 'month' ? 'bg-background text-foreground shadow-sm' : ''
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          {/* Show message if no data for selected period */}
          {filteredTrades.length === 0 && closedTrades.length > 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-500">
                  No trades found for the selected {timePeriod === 'day' ? 'daily' : timePeriod === 'week' ? 'weekly' : 'monthly'} period.
                  <br />
                  Try selecting a different time range or add more trades.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Key Insights - Prime spot for AI-powered insights for paid users */}
          {filteredTrades.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  AI Trading Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Performance Analysis</h4>
                      <p className="text-sm text-gray-600">
                        {metrics.winRate >= 50 
                          ? `Strong win rate of ${formatPercentage(metrics.winRate)} indicates good trade selection.`
                          : `Win rate of ${formatPercentage(metrics.winRate)} suggests room for improvement in trade selection.`
                        }
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Risk Management</h4>
                      <p className="text-sm text-gray-600">
                        {metrics.riskRewardRatio >= 2 
                          ? `Excellent risk/reward ratio of ${metrics.riskRewardRatio.toFixed(2)}:1 shows disciplined risk management.`
                          : `Risk/reward ratio of ${metrics.riskRewardRatio.toFixed(2)}:1 could be improved with better position sizing.`
                        }
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Drawdown Control</h4>
                      <p className="text-sm text-gray-600">
                        {metrics.maxDrawdown <= Math.abs(metrics.totalPnL * 0.15)
                          ? `Well-controlled drawdown of ${formatCurrency(metrics.maxDrawdown)} shows good risk management.`
                          : `Consider reducing position sizes to limit drawdown below ${formatCurrency(Math.abs(metrics.totalPnL * 0.15))}.`
                        }
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Trading Efficiency</h4>
                      <p className="text-sm text-gray-600">
                        {metrics.expectancy > 0 
                          ? `Positive expectancy of ${formatCurrency(metrics.expectancy)} per trade indicates a profitable system.`
                          : `Negative expectancy suggests need to review strategy and improve trade selection.`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Forex-Specific Analytics */}
          {filteredTrades.length > 0 && (
            <>
              {/* Currency Pair Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Currency Pair Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      {forexAnalytics.currencyPairData.slice(0, 5).map((pair, index) => (
                        <div key={pair.pair} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              index === 0 ? 'bg-green-500' : 
                              index === 1 ? 'bg-blue-500' : 
                              index === 2 ? 'bg-yellow-500' : 'bg-gray-400'
                            }`} />
                            <div>
                              <p className="font-medium text-gray-900">{pair.pair}</p>
                              <p className="text-xs text-gray-500">{pair.trades} trades</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium text-sm ${pair.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {pair.totalPnL >= 0 ? '+' : ''}${pair.totalPnL.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {pair.winRate.toFixed(1)}% • {pair.avgPips > 0 ? '+' : ''}{pair.avgPips.toFixed(1)} pips
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trading Session Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Trading Session Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {forexAnalytics.sessionData.map((session) => (
                      <div key={session.session} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{session.session} Session</h4>
                          <span className={`text-sm font-medium ${session.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {session.totalPnL >= 0 ? '+' : ''}${session.totalPnL.toFixed(2)}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                          <div>
                            <p className="font-medium text-gray-900">{session.trades}</p>
                            <p>Trades</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{session.winRate.toFixed(1)}%</p>
                            <p>Win Rate</p>
                          </div>
                          <div>
                            <p className={`font-medium ${session.avgPips >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {session.avgPips >= 0 ? '+' : ''}{session.avgPips.toFixed(1)}
                            </p>
                            <p>Avg Pips</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pip Analysis & Trading Costs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Pip Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">
                          {forexAnalytics.pipAnalysis.avgPipsPerTrade >= 0 ? '+' : ''}{forexAnalytics.pipAnalysis.avgPipsPerTrade?.toFixed(1) || '0.0'}
                        </p>
                        <p className="text-xs text-gray-600">Avg Pips/Trade</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">
                          {forexAnalytics.pipAnalysis.totalPips >= 0 ? '+' : ''}{forexAnalytics.pipAnalysis.totalPips?.toFixed(0) || '0'}
                        </p>
                        <p className="text-xs text-gray-600">Total Pips</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">
                          {forexAnalytics.pipAnalysis.maxPips?.toFixed(1) || '0.0'}
                        </p>
                        <p className="text-xs text-gray-600">Best Trade (Pips)</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">
                          {forexAnalytics.pipAnalysis.minPips?.toFixed(1) || '0.0'}
                        </p>
                        <p className="text-xs text-gray-600">Worst Trade (Pips)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Trading Costs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Spread Costs</p>
                          <p className="text-xs text-gray-600">Cost from bid-ask spreads</p>
                        </div>
                        <p className="font-medium text-red-600">
                          -${forexAnalytics.spreadCosts.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Swap Costs</p>
                          <p className="text-xs text-gray-600">Overnight financing fees</p>
                        </div>
                        <p className={`font-medium ${forexAnalytics.swapCosts >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {forexAnalytics.swapCosts >= 0 ? '+' : ''}${forexAnalytics.swapCosts.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Commission</p>
                          <p className="text-xs text-gray-600">Total commission paid</p>
                        </div>
                        <p className="font-medium text-red-600">
                          -${metrics.totalCommissions.toFixed(2)}
                        </p>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">Total Trading Costs</p>
                          <p className="font-bold text-red-600">
                            -${(forexAnalytics.spreadCosts + Math.abs(forexAnalytics.swapCosts) + metrics.totalCommissions).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Equity Curve */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Equity Curve
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    balance: {
                      label: "Balance",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
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
                              <p className="text-sm text-gray-600">{data.symbol}</p>
                              <p className={`text-sm font-medium ${data.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                P&L: {formatCurrency(data.pnl)}
                              </p>
                              <p className="text-sm font-medium">
                                Balance: {formatCurrency(data.balance)}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="balance" 
                      stroke="var(--color-balance)" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Win/Loss Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Win/Loss Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    wins: {
                      label: "Wins",
                      color: "#10b981",
                    },
                    losses: {
                      label: "Losses",
                      color: "#ef4444",
                    },
                  }}
                  className="h-[300px]"
                >
                  <PieChart>
                    <Pie
                      data={winLossDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    />
                    <ChartTooltip />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance by Time Period */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                {timePeriod === 'day' ? 'Daily' : timePeriod === 'week' ? 'Weekly' : 'Monthly'} Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  pnl: {
                    label: "P&L",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[400px]"
              >
                <BarChart data={timeBasedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <ChartTooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border rounded shadow">
                            <p className="font-medium">{label}</p>
                            <p className={`text-sm font-medium ${data.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              P&L: {formatCurrency(data.pnl)}
                            </p>
                            <p className="text-sm text-gray-600">
                              Trades: {data.trades}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="pnl" 
                    fill="var(--color-pnl)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>


        </TabsContent>

        {/* Detailed Metrics Tab - Now shows all the metric cards */}
        <TabsContent value="detailed" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Core Performance Metrics */}
            <MetricCard
              title="Net P&L"
              value={formatCurrency(metrics.netPnL)}
              subtitle={`Gross: ${formatCurrency(metrics.totalPnL)}`}
              color={metrics.netPnL >= 0 ? 'green' : 'red'}
              icon={<DollarSign className="w-5 h-5" />}
            />
            <MetricCard
              title="Win Rate"
              value={formatPercentage(metrics.winRate)}
              subtitle={`${metrics.winningTrades}W / ${metrics.losingTrades}L`}
              color={metrics.winRate >= 50 ? 'green' : 'red'}
              icon={<Target className="w-5 h-5" />}
            />
            <MetricCard
              title="Profit Factor"
              value={metrics.profitFactor === 999 ? '∞' : metrics.profitFactor.toFixed(2)}
              subtitle={`${formatCurrency(metrics.avgWin)} avg win`}
              color={metrics.profitFactor >= 1.5 ? 'green' : metrics.profitFactor >= 1 ? 'yellow' : 'red'}
              icon={<TrendingUp className="w-5 h-5" />}
            />
            <MetricCard
              title="Total Trades"
              value={metrics.totalTrades.toString()}
              subtitle={`${metrics.tradingFrequency.toFixed(1)} per month`}
              color="blue"
              icon={<Activity className="w-5 h-5" />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Risk Metrics */}
            <MetricCard
              title="Max Drawdown"
              value={formatCurrency(metrics.maxDrawdown)}
              subtitle="Peak to trough decline"
              color={metrics.maxDrawdown > Math.abs(metrics.totalPnL * 0.2) ? 'red' : 'green'}
              icon={<TrendingDown className="w-5 h-5" />}
            />
            <MetricCard
              title="Risk/Reward Ratio"
              value={metrics.riskRewardRatio === 999 ? '∞' : metrics.riskRewardRatio.toFixed(2)}
              subtitle={`Avg loss: ${formatCurrency(metrics.avgLoss)}`}
              color={metrics.riskRewardRatio >= 2 ? 'green' : metrics.riskRewardRatio >= 1.5 ? 'yellow' : 'red'}
              icon={<Shield className="w-5 h-5" />}
            />
            <MetricCard
              title="Expectancy"
              value={formatCurrency(metrics.expectancy)}
              subtitle="Expected value per trade"
              color={metrics.expectancy > 0 ? 'green' : 'red'}
              icon={<Target className="w-5 h-5" />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Advanced Metrics */}
            <MetricCard
              title="Sharpe Ratio"
              value={metrics.sharpeRatio.toFixed(2)}
              subtitle="Risk-adjusted return"
              color={metrics.sharpeRatio > 1 ? 'green' : metrics.sharpeRatio > 0.5 ? 'yellow' : 'red'}
            />
            <MetricCard
              title="Sortino Ratio"
              value={metrics.sortinoRatio.toFixed(2)}
              subtitle="Downside risk-adjusted"
              color={metrics.sortinoRatio > 1.5 ? 'green' : metrics.sortinoRatio > 1 ? 'yellow' : 'red'}
            />
            <MetricCard
              title="Largest Win"
              value={formatCurrency(metrics.largestWin)}
              subtitle="Best single trade"
              color="green"
            />
            <MetricCard
              title="Largest Loss"
              value={formatCurrency(metrics.largestLoss)}
              subtitle="Worst single trade"
              color="red"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Trading Behavior */}
            <MetricCard
              title="Avg Hold Time"
              value={metrics.avgHoldingPeriod > 0 ? `${metrics.avgHoldingPeriod.toFixed(1)}h` : 'N/A'}
              subtitle="Average trade duration"
              color="blue"
              icon={<Clock className="w-5 h-5" />}
            />
            <MetricCard
              title="Total Commissions"
              value={formatCurrency(metrics.totalCommissions)}
              subtitle={`${((metrics.totalCommissions / Math.abs(metrics.totalPnL)) * 100).toFixed(1)}% of gross P&L`}
              color="blue"
              icon={<DollarSign className="w-5 h-5" />}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;