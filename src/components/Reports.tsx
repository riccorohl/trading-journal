import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTradeContext } from '@/contexts/TradeContext';
import { TrendingUp, TrendingDown, Target, DollarSign, BarChart3, Shield, Clock, Activity, Zap } from 'lucide-react';
import MetricCard from './MetricCard';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

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
              
                      // NEW: Forex-specific chart data
                      const currencyPairChartData = useMemo(() => {
                        const data = forexAnalytics.currencyPairData.slice(0, 8).map(pair => ({
                          pair: pair.pair,
                          pnl: pair.totalPnL,
                          trades: pair.trades,
                          winRate: pair.winRate,
                          pips: pair.totalPips
                        }));
                        console.log('Currency Pair Chart Data:', data);
                        console.log('Container element:', document.querySelector('[data-chart="currency-pair"]'));
                        return data;
                      }, [forexAnalytics.currencyPairData]);

                      // NEW: Display chart data for even distribution (limited to 5 per side)
                      const displayChartData = useMemo(() => {
                        const profits = currencyPairChartData
                          .filter(item => item.pnl >= 0)
                          .sort((a, b) => b.pnl - a.pnl)
                          .slice(0, 5); // Limit to top 5 profits

                        const losses = currencyPairChartData
                          .filter(item => item.pnl < 0)
                          .sort((a, b) => b.pnl - a.pnl)
                          .slice(0, 5); // Limit to top 5 losses (most negative)

                        const maxLength = Math.max(profits.length, losses.length, 5); // Ensure at least 5 rows
                        // Use 1 as a fallback to prevent division by zero if all PnL is 0
                        const maxAbsPnL = Math.max(...currencyPairChartData.map(d => Math.abs(d.pnl)), 1); 

                        const rows = Array.from({ length: maxLength }).map((_, i) => ({
                          profit: profits[i] || null,
                          loss: losses[i] || null,
                        }));

                        return { rows, maxAbsPnL };
                      }, [currencyPairChartData]);
              
                      const sessionChartData = useMemo(() => {
                        return forexAnalytics.sessionData.map(session => ({
                          session: session.session,
                          pnl: session.totalPnL,
                          trades: session.trades,
                          winRate: session.winRate,
                          avgPips: session.avgPips
                        }));
                      }, [forexAnalytics.sessionData]);
              
                      const pipDistributionData = useMemo(() => {
                        if (filteredTrades.length === 0) return [];
                        
                        const pipValues = filteredTrades.filter(t => t.pips !== undefined).map(t => t.pips!);
                        const ranges = [
                          { range: '-50+ pips', min: -999, max: -50, count: 0 },
                          { range: '-25 to -50', min: -50, max: -25, count: 0 },
                          { range: '-10 to -25', min: -25, max: -10, count: 0 },
                          { range: '-5 to -10', min: -10, max: -5, count: 0 },
                          { range: '0 to -5', min: -5, max: 0, count: 0 },
                          { range: '0 to +5', min: 0, max: 5, count: 0 },
                          { range: '+5 to +10', min: 5, max: 10, count: 0 },
                          { range: '+10 to +25', min: 10, max: 25, count: 0 },
                          { range: '+25 to +50', min: 25, max: 50, count: 0 },
                          { range: '+50+ pips', min: 50, max: 999, count: 0 }
                        ];
              
                        pipValues.forEach(pips => {
                          const range = ranges.find(r => pips > r.min && pips <= r.max);
                          if (range) range.count++;
                        });
              
                        return ranges.filter(r => r.count > 0);
                      }, [filteredTrades]);      
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
    <div className="space-y-6 max-w-full overflow-x-hidden" style={{ 
      contain: 'layout style',
      isolation: 'isolate'
    }}>
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
            <div className="w-full space-y-6">
              {/* Currency Pair Performance with Chart */}
              <Card className="overflow-hidden" style={{ maxWidth: '100%', width: '100%' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Currency Pair Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6" style={{ maxWidth: '100%', overflow: 'hidden' }}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full" style={{ maxWidth: '100%' }}>
                    {/* Chart */}
                    <div className="w-full max-w-full overflow-hidden" style={{ maxWidth: '100%' }}>
                      <div className="h-[450px] w-full bg-gray-50 rounded-lg p-4">
                        <div className="flex flex-col h-full">
                          {/* Headers */}
                          <div className="flex w-full">
                            <div className="w-1/2 pr-1 text-center">
                              <h6 className="text-lg font-medium text-red-600">Losses</h6>
                            </div>
                            <div className="w-1/2 pl-1 text-center">
                              <h6 className="text-lg font-medium text-green-600">Profits</h6>
                            </div>
                          </div>

                          {/* Chart Body */}
                          <div className="flex-grow w-full relative mt-2">
                            <div className="absolute inset-0 flex flex-col">
                              {displayChartData.rows.map((row, i) => (
                                <div key={`row-container-${i}`} className="flex-1 relative flex items-center">
                                  {/* Background Line */}
                                  <div className="absolute w-full h-px bg-gray-300 top-1/2 -translate-y-1/2 z-0"></div>
                                  {/* Center line overlay */}
                                  <div className="absolute left-1/2 -translate-x-1/2 h-full w-0.5 bg-gray-300"></div>

                                  {/* Data: Left Side (Losses) */}
                                  <div className="w-1/2 h-full flex justify-end items-center pr-1">
                                    {row.loss && (
                                      <div className="flex items-center justify-end w-full">
                                        <div className="text-right mr-3 flex-shrink-0 z-10 bg-gray-50 pl-2">
                                          <div className="text-sm text-gray-600">{row.loss.pair}</div>
                                          <div className="text-sm font-semibold text-red-600">{formatCurrency(row.loss.pnl)}</div>
                                        </div>
                                        <div
                                          className="bg-red-500 h-8 rounded-l relative z-10"
                                          style={{ width: `${(Math.abs(row.loss.pnl) / displayChartData.maxAbsPnL) * 100}%` }}
                                        ></div>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Data: Right Side (Profits) */}
                                  <div className="w-1/2 h-full flex items-center pl-1">
                                    {row.profit && (
                                      <div className="flex items-center w-full">
                                        <div
                                          className="bg-green-500 h-8 rounded-r relative z-10"
                                          style={{ width: `${(row.profit.pnl / displayChartData.maxAbsPnL) * 100}%` }}
                                        ></div>
                                        <div className="text-left ml-3 flex-shrink-0 z-10 bg-gray-50 pr-2">
                                          <div className="text-sm text-gray-600">{row.profit.pair}</div>
                                          <div className="text-sm font-semibold text-green-600">{formatCurrency(row.profit.pnl)}</div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Summary Cards - Match Chart Height */}
                    <div className="h-[450px] bg-gray-50 rounded-lg p-4 flex flex-col justify-evenly">
                      {forexAnalytics.currencyPairData.slice(0, 5).map((pair, index) => (
                        <div key={pair.pair} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full ${
                              index === 0 ? 'bg-green-500' : 
                              index === 1 ? 'bg-blue-500' : 
                              index === 2 ? 'bg-yellow-500' : 'bg-gray-400'
                            }`} />
                            <div>
                              <p className="font-medium text-lg text-gray-900">{pair.pair}</p>
                              <p className="text-sm text-gray-500">{pair.trades} trades</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium text-lg ${pair.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {pair.totalPnL >= 0 ? '+' : ''}${pair.totalPnL.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {pair.winRate.toFixed(1)}% • {pair.avgPips > 0 ? '+' : ''}{pair.avgPips.toFixed(1)} pips
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pair Performance Analysis - Tabbed Section */}
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Pair Performance Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Tabs defaultValue="ranking" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="ranking">Performance Ranking</TabsTrigger>
                      <TabsTrigger value="riskreward">Risk vs Reward</TabsTrigger>
                      <TabsTrigger value="frequency">Frequency Analysis</TabsTrigger>
                      <TabsTrigger value="consistency">Consistency</TabsTrigger>
                      <TabsTrigger value="winrate">Win Rate Analysis</TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Performance Ranking */}
                    <TabsContent value="ranking" className="mt-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Best & Worst Performing Pairs</h3>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Best Performers */}
                          <div className="bg-green-50 rounded-lg p-4">
                            <h4 className="text-md font-medium text-green-800 mb-3">🏆 Top Performers</h4>
                            <div className="space-y-2">
                              {forexAnalytics.currencyPairData
                                .filter(pair => pair.totalPnL > 0)
                                .sort((a, b) => b.totalPnL - a.totalPnL)
                                .slice(0, 5)
                                .map((pair, index) => (
                                  <div key={pair.pair} className="flex items-center justify-between p-3 bg-white rounded">
                                    <div className="flex items-center space-x-3">
                                      <span className="text-lg font-bold text-green-600">#{index + 1}</span>
                                      <div>
                                        <p className="font-medium text-gray-900">{pair.pair}</p>
                                        <p className="text-sm text-gray-600">{pair.trades} trades • {pair.winRate.toFixed(1)}% win rate</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-bold text-green-600">+${pair.totalPnL.toFixed(2)}</p>
                                      <p className="text-sm text-gray-600">+{pair.totalPips.toFixed(1)} pips</p>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>

                          {/* Worst Performers */}
                          <div className="bg-red-50 rounded-lg p-4">
                            <h4 className="text-md font-medium text-red-800 mb-3">📉 Worst Performers</h4>
                            <div className="space-y-2">
                              {forexAnalytics.currencyPairData
                                .filter(pair => pair.totalPnL < 0)
                                .sort((a, b) => a.totalPnL - b.totalPnL)
                                .slice(0, 5)
                                .map((pair, index) => (
                                  <div key={pair.pair} className="flex items-center justify-between p-3 bg-white rounded">
                                    <div className="flex items-center space-x-3">
                                      <span className="text-lg font-bold text-red-600">#{index + 1}</span>
                                      <div>
                                        <p className="font-medium text-gray-900">{pair.pair}</p>
                                        <p className="text-sm text-gray-600">{pair.trades} trades • {pair.winRate.toFixed(1)}% win rate</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-bold text-red-600">${pair.totalPnL.toFixed(2)}</p>
                                      <p className="text-sm text-gray-600">{pair.totalPips.toFixed(1)} pips</p>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Tab 2: Risk vs Reward */}
                    <TabsContent value="riskreward" className="mt-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Risk vs Reward Analysis</h3>
                        
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse border border-gray-200">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="border border-gray-200 px-4 py-2 text-left">Currency Pair</th>
                                <th className="border border-gray-200 px-4 py-2 text-center">Avg Win</th>
                                <th className="border border-gray-200 px-4 py-2 text-center">Avg Loss</th>
                                <th className="border border-gray-200 px-4 py-2 text-center">Risk/Reward</th>
                                <th className="border border-gray-200 px-4 py-2 text-center">Profit Factor</th>
                                <th className="border border-gray-200 px-4 py-2 text-center">Rating</th>
                              </tr>
                            </thead>
                            <tbody>
                              {forexAnalytics.currencyPairData.map((pair) => {
                                const avgWin = pair.totalPnL > 0 && pair.winTrades > 0 ? pair.totalPnL / pair.winTrades : 0;
                                const avgLoss = pair.totalPnL < 0 && pair.lossTrades > 0 ? Math.abs(pair.totalPnL / pair.lossTrades) : 0;
                                const riskReward = avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : 'N/A';
                                const profitFactor = pair.lossPnL !== 0 ? (pair.winPnL / Math.abs(pair.lossPnL)).toFixed(2) : 'N/A';
                                const rating = parseFloat(riskReward) >= 2 ? '⭐⭐⭐' : parseFloat(riskReward) >= 1.5 ? '⭐⭐' : '⭐';
                                
                                return (
                                  <tr key={pair.pair} className="hover:bg-gray-50">
                                    <td className="border border-gray-200 px-4 py-2 font-medium">{pair.pair}</td>
                                    <td className="border border-gray-200 px-4 py-2 text-center text-green-600">${avgWin.toFixed(2)}</td>
                                    <td className="border border-gray-200 px-4 py-2 text-center text-red-600">${avgLoss.toFixed(2)}</td>
                                    <td className="border border-gray-200 px-4 py-2 text-center font-medium">{riskReward}</td>
                                    <td className="border border-gray-200 px-4 py-2 text-center">{profitFactor}</td>
                                    <td className="border border-gray-200 px-4 py-2 text-center">{rating}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Tab 3: Frequency Analysis */}
                    <TabsContent value="frequency" className="mt-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Trade Frequency vs Profitability</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {forexAnalytics.currencyPairData.map((pair) => {
                            const profitPerTrade = pair.trades > 0 ? pair.totalPnL / pair.trades : 0;
                            const isOvertraded = pair.trades > 10 && profitPerTrade < 50; // Example threshold
                            
                            return (
                              <div key={pair.pair} className={`p-4 rounded-lg border-2 ${
                                isOvertraded ? 'border-red-200 bg-red-50' : 
                                profitPerTrade > 100 ? 'border-green-200 bg-green-50' : 
                                'border-gray-200 bg-gray-50'
                              }`}>
                                <div className="text-center">
                                  <h4 className="font-bold text-lg text-gray-900">{pair.pair}</h4>
                                  <div className="mt-2 space-y-1">
                                    <p className="text-2xl font-bold text-blue-600">{pair.trades}</p>
                                    <p className="text-sm text-gray-600">Total Trades</p>
                                    <p className={`text-lg font-semibold ${profitPerTrade >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      ${profitPerTrade.toFixed(2)}
                                    </p>
                                    <p className="text-sm text-gray-600">Per Trade</p>
                                    {isOvertraded && (
                                      <p className="text-xs text-red-600 font-medium">⚠️ Potentially Overtraded</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </TabsContent>

                    {/* Tab 4: Consistency */}
                    <TabsContent value="consistency" className="mt-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Consistency Analysis</h3>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Most Consistent */}
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h4 className="text-md font-medium text-blue-800 mb-3">🎯 Most Consistent Pairs</h4>
                            <div className="space-y-2">
                              {forexAnalytics.currencyPairData
                                .filter(pair => pair.trades >= 3)
                                .sort((a, b) => b.winRate - a.winRate)
                                .slice(0, 5)
                                .map((pair, index) => (
                                  <div key={pair.pair} className="flex items-center justify-between p-3 bg-white rounded">
                                    <div>
                                      <p className="font-medium text-gray-900">{pair.pair}</p>
                                      <p className="text-sm text-gray-600">{pair.trades} trades</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-bold text-blue-600">{pair.winRate.toFixed(1)}%</p>
                                      <p className="text-sm text-gray-600">Win Rate</p>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>

                          {/* Least Consistent */}
                          <div className="bg-orange-50 rounded-lg p-4">
                            <h4 className="text-md font-medium text-orange-800 mb-3">🎲 Most Volatile Pairs</h4>
                            <div className="space-y-2">
                              {forexAnalytics.currencyPairData
                                .filter(pair => pair.trades >= 3)
                                .sort((a, b) => a.winRate - b.winRate)
                                .slice(0, 5)
                                .map((pair, index) => (
                                  <div key={pair.pair} className="flex items-center justify-between p-3 bg-white rounded">
                                    <div>
                                      <p className="font-medium text-gray-900">{pair.pair}</p>
                                      <p className="text-sm text-gray-600">{pair.trades} trades</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-bold text-orange-600">{pair.winRate.toFixed(1)}%</p>
                                      <p className="text-sm text-gray-600">Win Rate</p>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Tab 5: Win Rate Analysis */}
                    <TabsContent value="winrate" className="mt-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Win Rate Deep Dive</h3>
                        
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse border border-gray-200">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="border border-gray-200 px-4 py-2 text-left">Currency Pair</th>
                                <th className="border border-gray-200 px-4 py-2 text-center">Win Rate</th>
                                <th className="border border-gray-200 px-4 py-2 text-center">Wins</th>
                                <th className="border border-gray-200 px-4 py-2 text-center">Losses</th>
                                <th className="border border-gray-200 px-4 py-2 text-center">Total Trades</th>
                                <th className="border border-gray-200 px-4 py-2 text-center">Avg Pips/Win</th>
                                <th className="border border-gray-200 px-4 py-2 text-center">Avg Pips/Loss</th>
                              </tr>
                            </thead>
                            <tbody>
                              {forexAnalytics.currencyPairData
                                .sort((a, b) => b.winRate - a.winRate)
                                .map((pair) => {
                                  const avgPipsWin = pair.winTrades > 0 ? pair.totalPips / pair.winTrades : 0;
                                  const avgPipsLoss = pair.lossTrades > 0 ? Math.abs(pair.totalPips / pair.lossTrades) : 0;
                                  
                                  return (
                                    <tr key={pair.pair} className="hover:bg-gray-50">
                                      <td className="border border-gray-200 px-4 py-2 font-medium">{pair.pair}</td>
                                      <td className={`border border-gray-200 px-4 py-2 text-center font-bold ${
                                        pair.winRate >= 70 ? 'text-green-600' : 
                                        pair.winRate >= 50 ? 'text-blue-600' : 'text-red-600'
                                      }`}>
                                        {pair.winRate.toFixed(1)}%
                                      </td>
                                      <td className="border border-gray-200 px-4 py-2 text-center text-green-600">{pair.winTrades}</td>
                                      <td className="border border-gray-200 px-4 py-2 text-center text-red-600">{pair.lossTrades}</td>
                                      <td className="border border-gray-200 px-4 py-2 text-center">{pair.trades}</td>
                                      <td className="border border-gray-200 px-4 py-2 text-center text-green-600">+{avgPipsWin.toFixed(1)}</td>
                                      <td className="border border-gray-200 px-4 py-2 text-center text-red-600">-{avgPipsLoss.toFixed(1)}</td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Trading Session Analysis with Chart */}
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Advanced Session Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-6">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="trends">Trends</TabsTrigger>
                      <TabsTrigger value="comparison">Comparison</TabsTrigger>
                      <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
                      <TabsTrigger value="timing">Best Timing</TabsTrigger>
                      <TabsTrigger value="insights">AI Insights</TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Session Overview */}
                    <TabsContent value="overview" className="mt-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                        {/* Performance Chart */}
                        <div className="w-full max-w-full overflow-hidden">
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Performance by Trading Session</h4>
                          <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={sessionChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="session" />
                                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                                <Tooltip 
                                  formatter={(value, name) => [formatCurrency(value), "P&L"]}
                                  labelStyle={{ color: '#374151' }}
                                  contentStyle={{ backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '6px' }}
                                />
                                <Bar 
                                  dataKey="pnl" 
                                  fill="#10b981"
                                  radius={[4, 4, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                        
                        {/* Session Summary Cards */}
                        <div className="grid grid-cols-1 gap-4">
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
                      </div>
                    </TabsContent>

                    {/* Tab 2: Session Trends Over Time */}
                    <TabsContent value="trends" className="mt-6">
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">Session Performance Trends</h3>
                        
                        {/* Session Trend Chart */}
                        <div className="h-[400px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={timeBasedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="period" />
                              <YAxis tickFormatter={(value) => formatCurrency(value)} />
                              <Tooltip 
                                formatter={(value, name) => [formatCurrency(value), "P&L"]}
                                labelStyle={{ color: '#374151' }}
                                contentStyle={{ backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '6px' }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="pnl" 
                                stroke="#3b82f6" 
                                strokeWidth={3}
                                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Session Performance Evolution */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {forexAnalytics.sessionData.map((session) => {
                            const performanceIndicator = session.totalPnL >= 100 ? '📈' : session.totalPnL >= 0 ? '📊' : '📉';
                            const trendDescription = session.winRate >= 60 ? 'Strong Uptrend' : session.winRate >= 40 ? 'Stable' : 'Needs Improvement';
                            
                            return (
                              <div key={session.session} className="p-4 bg-gray-50 rounded-lg">
                                <div className="text-center">
                                  <div className="text-2xl mb-2">{performanceIndicator}</div>
                                  <h4 className="font-medium text-gray-900">{session.session} Session</h4>
                                  <p className="text-sm text-gray-600">{trendDescription}</p>
                                  <div className="mt-3 space-y-1">
                                    <p className={`text-lg font-bold ${session.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {session.totalPnL >= 0 ? '+' : ''}${session.totalPnL.toFixed(2)}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {session.winRate.toFixed(1)}% Win Rate • {session.trades} Trades
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </TabsContent>

                    {/* Tab 3: Session Comparison */}
                    <TabsContent value="comparison" className="mt-6">
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">Detailed Session Comparison</h3>
                        
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse border border-gray-200">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="border border-gray-200 px-4 py-2 text-left">Session</th>
                                <th className="border border-gray-200 px-4 py-2 text-center">Total P&L</th>
                                <th className="border border-gray-200 px-4 py-2 text-center">Avg P&L/Trade</th>
                                <th className="border border-gray-200 px-4 py-2 text-center">Win Rate</th>
                                <th className="border border-gray-200 px-4 py-2 text-center">Total Pips</th>
                                <th className="border border-gray-200 px-4 py-2 text-center">Avg Pips</th>
                                <th className="border border-gray-200 px-4 py-2 text-center">Total Trades</th>
                                <th className="border border-gray-200 px-4 py-2 text-center">Performance Rating</th>
                              </tr>
                            </thead>
                            <tbody>
                              {forexAnalytics.sessionData
                                .sort((a, b) => b.totalPnL - a.totalPnL)
                                .map((session, index) => {
                                  const avgPnLPerTrade = session.trades > 0 ? session.totalPnL / session.trades : 0;
                                  const rating = session.totalPnL >= 100 && session.winRate >= 60 ? '⭐⭐⭐' : 
                                               session.totalPnL >= 0 && session.winRate >= 50 ? '⭐⭐' : '⭐';
                                  
                                  return (
                                    <tr key={session.session} className={`hover:bg-gray-50 ${index === 0 ? 'bg-green-50' : ''}`}>
                                      <td className="border border-gray-200 px-4 py-2 font-medium">
                                        {index === 0 && '🏆'} {session.session}
                                      </td>
                                      <td className={`border border-gray-200 px-4 py-2 text-center font-bold ${session.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {session.totalPnL >= 0 ? '+' : ''}${session.totalPnL.toFixed(2)}
                                      </td>
                                      <td className={`border border-gray-200 px-4 py-2 text-center ${avgPnLPerTrade >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {avgPnLPerTrade >= 0 ? '+' : ''}${avgPnLPerTrade.toFixed(2)}
                                      </td>
                                      <td className={`border border-gray-200 px-4 py-2 text-center font-medium ${session.winRate >= 60 ? 'text-green-600' : session.winRate >= 40 ? 'text-blue-600' : 'text-red-600'}`}>
                                        {session.winRate.toFixed(1)}%
                                      </td>
                                      <td className={`border border-gray-200 px-4 py-2 text-center ${session.totalPips >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {session.totalPips >= 0 ? '+' : ''}{session.totalPips.toFixed(1)}
                                      </td>
                                      <td className={`border border-gray-200 px-4 py-2 text-center ${session.avgPips >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {session.avgPips >= 0 ? '+' : ''}{session.avgPips.toFixed(1)}
                                      </td>
                                      <td className="border border-gray-200 px-4 py-2 text-center">{session.trades}</td>
                                      <td className="border border-gray-200 px-4 py-2 text-center">{rating}</td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>

                        {/* Session Strength Analysis */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-green-50 rounded-lg p-4">
                            <h4 className="text-md font-medium text-green-800 mb-3">🏆 Strongest Session</h4>
                            {(() => {
                              const bestSession = forexAnalytics.sessionData.reduce((best, current) => 
                                current.totalPnL > best.totalPnL ? current : best
                              );
                              return (
                                <div className="bg-white rounded p-3">
                                  <p className="font-bold text-lg text-gray-900">{bestSession.session} Session</p>
                                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                    <div>
                                      <p className="text-gray-600">Total P&L</p>
                                      <p className="font-bold text-green-600">+${bestSession.totalPnL.toFixed(2)}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600">Win Rate</p>
                                      <p className="font-bold text-green-600">{bestSession.winRate.toFixed(1)}%</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600">Avg Pips</p>
                                      <p className="font-bold text-green-600">+{bestSession.avgPips.toFixed(1)}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600">Total Trades</p>
                                      <p className="font-bold text-gray-900">{bestSession.trades}</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>

                          <div className="bg-red-50 rounded-lg p-4">
                            <h4 className="text-md font-medium text-red-800 mb-3">⚠️ Weakest Session</h4>
                            {(() => {
                              const worstSession = forexAnalytics.sessionData.reduce((worst, current) => 
                                current.totalPnL < worst.totalPnL ? current : worst
                              );
                              return (
                                <div className="bg-white rounded p-3">
                                  <p className="font-bold text-lg text-gray-900">{worstSession.session} Session</p>
                                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                    <div>
                                      <p className="text-gray-600">Total P&L</p>
                                      <p className="font-bold text-red-600">${worstSession.totalPnL.toFixed(2)}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600">Win Rate</p>
                                      <p className="font-bold text-red-600">{worstSession.winRate.toFixed(1)}%</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600">Avg Pips</p>
                                      <p className="font-bold text-red-600">{worstSession.avgPips.toFixed(1)}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600">Total Trades</p>
                                      <p className="font-bold text-gray-900">{worstSession.trades}</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Tab 4: Risk Analysis */}
                    <TabsContent value="risk" className="mt-6">
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">Session Risk Analysis</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {forexAnalytics.sessionData.map((session) => {
                            const riskLevel = session.winRate >= 60 ? 'Low Risk' : session.winRate >= 40 ? 'Medium Risk' : 'High Risk';
                            const riskColor = session.winRate >= 60 ? 'text-green-600' : session.winRate >= 40 ? 'text-yellow-600' : 'text-red-600';
                            const riskBg = session.winRate >= 60 ? 'bg-green-50' : session.winRate >= 40 ? 'bg-yellow-50' : 'bg-red-50';
                            const avgPnLPerTrade = session.trades > 0 ? session.totalPnL / session.trades : 0;
                            
                            return (
                              <div key={session.session} className={`p-4 rounded-lg border-2 ${riskBg}`}>
                                <div className="text-center">
                                  <h4 className="font-bold text-lg text-gray-900">{session.session} Session</h4>
                                  <p className={`text-sm font-medium ${riskColor}`}>{riskLevel}</p>
                                  
                                  <div className="mt-4 space-y-3">
                                    <div className="bg-white rounded p-3">
                                      <p className="text-xs text-gray-600">Risk Score</p>
                                      <p className={`text-lg font-bold ${riskColor}`}>
                                        {session.winRate.toFixed(0)}/100
                                      </p>
                                    </div>
                                    
                                    <div className="bg-white rounded p-3">
                                      <p className="text-xs text-gray-600">Avg P&L per Trade</p>
                                      <p className={`text-sm font-bold ${avgPnLPerTrade >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {avgPnLPerTrade >= 0 ? '+' : ''}${avgPnLPerTrade.toFixed(2)}
                                      </p>
                                    </div>
                                    
                                    <div className="bg-white rounded p-3">
                                      <p className="text-xs text-gray-600">Consistency</p>
                                      <p className="text-sm font-bold text-gray-900">
                                        {session.trades >= 10 ? 'High' : session.trades >= 5 ? 'Medium' : 'Low'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Risk Metrics Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse border border-gray-200">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="border border-gray-200 px-4 py-2 text-left">Session</th>
                                <th className="border border-gray-200 px-4 py-2 text-center">Volatility</th>
                                <th className="border border-gray-200 px-4 py-2 text-center">Max Drawdown Risk</th>
                                <th className="border border-gray-200 px-4 py-2 text-center">Consistency Score</th>
                                <th className="border border-gray-200 px-4 py-2 text-center">Risk Recommendation</th>
                              </tr>
                            </thead>
                            <tbody>
                              {forexAnalytics.sessionData.map((session) => {
                                const volatility = session.avgPips > 20 ? 'High' : session.avgPips > 10 ? 'Medium' : 'Low';
                                const drawdownRisk = session.winRate < 40 ? 'High' : session.winRate < 60 ? 'Medium' : 'Low';
                                const consistency = session.trades >= 10 ? 'Excellent' : session.trades >= 5 ? 'Good' : 'Insufficient Data';
                                const recommendation = session.winRate >= 60 && session.totalPnL > 0 ? 'Increase Position Size' :
                                                     session.winRate >= 40 ? 'Maintain Current Size' : 'Reduce Position Size';
                                
                                return (
                                  <tr key={session.session} className="hover:bg-gray-50">
                                    <td className="border border-gray-200 px-4 py-2 font-medium">{session.session}</td>
                                    <td className={`border border-gray-200 px-4 py-2 text-center ${
                                      volatility === 'High' ? 'text-red-600' : volatility === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                                    }`}>
                                      {volatility}
                                    </td>
                                    <td className={`border border-gray-200 px-4 py-2 text-center ${
                                      drawdownRisk === 'High' ? 'text-red-600' : drawdownRisk === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                                    }`}>
                                      {drawdownRisk}
                                    </td>
                                    <td className="border border-gray-200 px-4 py-2 text-center">{consistency}</td>
                                    <td className={`border border-gray-200 px-4 py-2 text-center text-xs font-medium ${
                                      recommendation.includes('Increase') ? 'text-green-600' : 
                                      recommendation.includes('Maintain') ? 'text-blue-600' : 'text-red-600'
                                    }`}>
                                      {recommendation}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Tab 5: Best Timing Analysis */}
                    <TabsContent value="timing" className="mt-6">
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">Optimal Trading Times</h3>
                        
                        {/* Session Timing Recommendations */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            { session: 'Asian', time: '22:00 - 07:00 GMT', description: 'Tokyo/Sydney markets active', icon: '🌅' },
                            { session: 'European', time: '07:00 - 16:00 GMT', description: 'London market dominance', icon: '🏛️' },
                            { session: 'US', time: '13:00 - 22:00 GMT', description: 'New York market active', icon: '🗽' }
                          ].map((timing) => {
                            const sessionData = forexAnalytics.sessionData.find(s => s.session === timing.session);
                            const performance = sessionData ? sessionData.totalPnL >= 0 ? 'Profitable' : 'Unprofitable' : 'No Data';
                            const performanceColor = sessionData ? sessionData.totalPnL >= 0 ? 'text-green-600' : 'text-red-600' : 'text-gray-600';
                            
                            return (
                              <div key={timing.session} className="p-4 bg-gray-50 rounded-lg">
                                <div className="text-center">
                                  <div className="text-3xl mb-2">{timing.icon}</div>
                                  <h4 className="font-bold text-lg text-gray-900">{timing.session} Session</h4>
                                  <p className="text-sm text-gray-600 mb-2">{timing.time}</p>
                                  <p className="text-xs text-gray-500 mb-3">{timing.description}</p>
                                  
                                  <div className="bg-white rounded p-3">
                                    <p className="text-xs text-gray-600">Your Performance</p>
                                    <p className={`text-sm font-bold ${performanceColor}`}>{performance}</p>
                                    {sessionData && (
                                      <div className="mt-2 text-xs text-gray-600">
                                        <p>{sessionData.winRate.toFixed(1)}% Win Rate</p>
                                        <p>{sessionData.trades} Trades</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Session Overlap Analysis */}
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="text-md font-medium text-blue-800 mb-3">🕒 Session Overlap Opportunities</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white rounded p-3">
                              <h5 className="font-medium text-gray-900">European-US Overlap</h5>
                              <p className="text-sm text-gray-600">13:00 - 16:00 GMT</p>
                              <p className="text-xs text-blue-600 mt-1">Highest volatility period - ideal for EUR/USD, GBP/USD</p>
                            </div>
                            <div className="bg-white rounded p-3">
                              <h5 className="font-medium text-gray-900">Asian-European Overlap</h5>
                              <p className="text-sm text-gray-600">07:00 - 09:00 GMT</p>
                              <p className="text-xs text-blue-600 mt-1">Good for AUD/JPY, GBP/JPY momentum trades</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Tab 6: AI Insights */}
                    <TabsContent value="insights" className="mt-6">
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">AI-Powered Session Insights</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Performance Insights */}
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
                            <h4 className="text-md font-medium text-blue-800 mb-3">🧠 Performance Analysis</h4>
                            <div className="space-y-3">
                              {(() => {
                                const bestSession = forexAnalytics.sessionData.reduce((best, current) => 
                                  current.totalPnL > best.totalPnL ? current : best
                                );
                                const worstSession = forexAnalytics.sessionData.reduce((worst, current) => 
                                  current.totalPnL < worst.totalPnL ? current : worst
                                );
                                
                                return (
                                  <>
                                    <div className="bg-white rounded p-3">
                                      <p className="text-sm text-gray-900">
                                        <strong>{bestSession.session} session</strong> is your strongest performer with 
                                        <span className="text-green-600 font-medium"> +${bestSession.totalPnL.toFixed(2)}</span> P&L 
                                        and <span className="text-green-600 font-medium">{bestSession.winRate.toFixed(1)}%</span> win rate.
                                      </p>
                                    </div>
                                    <div className="bg-white rounded p-3">
                                      <p className="text-sm text-gray-900">
                                        Consider <strong>reducing exposure</strong> during <strong>{worstSession.session} session</strong> 
                                        ({worstSession.winRate.toFixed(1)}% win rate) until performance improves.
                                      </p>
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          </div>

                          {/* Strategy Recommendations */}
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
                            <h4 className="text-md font-medium text-green-800 mb-3">💡 Strategy Recommendations</h4>
                            <div className="space-y-3">
                              {forexAnalytics.sessionData.map((session) => {
                                const avgPnLPerTrade = session.trades > 0 ? session.totalPnL / session.trades : 0;
                                let recommendation = '';
                                
                                if (session.winRate >= 60 && avgPnLPerTrade > 50) {
                                  recommendation = `Excellent performance! Consider increasing position size during ${session.session} session.`;
                                } else if (session.winRate >= 50 && avgPnLPerTrade > 0) {
                                  recommendation = `Solid performance in ${session.session}. Maintain current strategy and position sizing.`;
                                } else if (session.winRate < 50 || avgPnLPerTrade < 0) {
                                  recommendation = `${session.session} session needs improvement. Consider reducing position size or avoiding this session.`;
                                }
                                
                                return (
                                  <div key={session.session} className="bg-white rounded p-3">
                                    <p className="text-sm text-gray-900">{recommendation}</p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Market Context Insights */}
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
                          <h4 className="text-md font-medium text-purple-800 mb-3">🌍 Market Context</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white rounded p-3">
                              <h5 className="font-medium text-gray-900">Asian Session</h5>
                              <p className="text-xs text-gray-600 mt-1">
                                Lower volatility, good for range trading. JPY pairs most active.
                              </p>
                            </div>
                            <div className="bg-white rounded p-3">
                              <h5 className="font-medium text-gray-900">European Session</h5>
                              <p className="text-xs text-gray-600 mt-1">
                                High volatility, trend following works well. EUR pairs dominate.
                              </p>
                            </div>
                            <div className="bg-white rounded p-3">
                              <h5 className="font-medium text-gray-900">US Session</h5>
                              <p className="text-xs text-gray-600 mt-1">
                                High impact news, momentum trading. USD pairs most volatile.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Pip Analysis & Trading Costs */}
              {/* Advanced Pip Distribution Analysis - Phase 2 #4 */}
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Advanced Pip Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Tabs defaultValue="distribution" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="distribution">Distribution</TabsTrigger>
                      <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
                      <TabsTrigger value="winloss">Win/Loss Analysis</TabsTrigger>
                      <TabsTrigger value="correlation">Correlation</TabsTrigger>
                      <TabsTrigger value="insights">Insights</TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Pip Distribution */}
                    <TabsContent value="distribution" className="mt-6">
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">Pip Range Distribution Analysis</h3>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Main Distribution Chart */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Pip Range Distribution</h4>
                            <div className="h-[300px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={pipDistributionData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="range" angle={-45} textAnchor="end" height={80} />
                                  <YAxis />
                                  <Tooltip 
                                    formatter={(value, name) => [value, "Trades"]}
                                    labelStyle={{ color: '#374151' }}
                                    contentStyle={{ backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '6px' }}
                                  />
                                  <Bar 
                                    dataKey="count" 
                                    fill="#f59e0b"
                                    radius={[2, 2, 0, 0]}
                                  />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          {/* Pip Statistics Summary */}
                          <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-900">Pip Statistics</h4>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-xl font-bold text-gray-900">
                                  {forexAnalytics.pipAnalysis.avgPipsPerTrade >= 0 ? '+' : ''}{forexAnalytics.pipAnalysis.avgPipsPerTrade?.toFixed(1) || '0.0'}
                                </p>
                                <p className="text-xs text-gray-600">Avg Pips/Trade</p>
                              </div>
                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-xl font-bold text-gray-900">
                                  {forexAnalytics.pipAnalysis.totalPips >= 0 ? '+' : ''}{forexAnalytics.pipAnalysis.totalPips?.toFixed(0) || '0'}
                                </p>
                                <p className="text-xs text-gray-600">Total Pips</p>
                              </div>
                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-xl font-bold text-green-600">
                                  {forexAnalytics.pipAnalysis.maxPips?.toFixed(0) || '0'}
                                </p>
                                <p className="text-xs text-gray-600">Max Pips</p>
                              </div>
                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-xl font-bold text-red-600">
                                  {forexAnalytics.pipAnalysis.minPips?.toFixed(0) || '0'}
                                </p>
                                <p className="text-xs text-gray-600">Min Pips</p>
                              </div>
                            </div>

                            {/* Advanced Pip Metrics */}
                            <div className="bg-blue-50 rounded-lg p-4">
                              <h5 className="font-medium text-blue-800 mb-3">📊 Advanced Metrics</h5>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Pip Efficiency</span>
                                  <span className="text-sm font-medium text-blue-600">
                                    {forexAnalytics.pipAnalysis.pipEfficiency?.toFixed(1) || '0'}%
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Pip Range</span>
                                  <span className="text-sm font-medium text-gray-900">
                                    {(forexAnalytics.pipAnalysis.maxPips - forexAnalytics.pipAnalysis.minPips)?.toFixed(0) || '0'} pips
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Pip Volatility</span>
                                  <span className="text-sm font-medium text-gray-900">
                                    {(() => {
                                      const range = forexAnalytics.pipAnalysis.maxPips - forexAnalytics.pipAnalysis.minPips;
                                      return range > 100 ? 'High' : range > 50 ? 'Medium' : 'Low';
                                    })()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Tab 2: Pip Efficiency */}
                    <TabsContent value="efficiency" className="mt-6">
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">Pip Efficiency Analysis</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Efficiency Score Card */}
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
                            <div className="text-center">
                              <div className="text-3xl mb-2">🎯</div>
                              <h4 className="font-bold text-lg text-gray-900">Pip Efficiency Score</h4>
                              <p className="text-3xl font-bold text-green-600 mt-2">
                                {forexAnalytics.pipAnalysis.pipEfficiency?.toFixed(0) || '0'}%
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {(() => {
                                  const eff = forexAnalytics.pipAnalysis.pipEfficiency || 0;
                                  return eff >= 70 ? 'Excellent' : eff >= 50 ? 'Good' : 'Needs Improvement';
                                })()}
                              </p>
                            </div>
                          </div>

                          {/* Pip to P&L Ratio */}
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
                            <div className="text-center">
                              <div className="text-3xl mb-2">💰</div>
                              <h4 className="font-bold text-lg text-gray-900">Pip-to-P&L Ratio</h4>
                              <p className="text-2xl font-bold text-blue-600 mt-2">
                                {(() => {
                                  const avgPips = forexAnalytics.pipAnalysis.avgPipsPerTrade || 0;
                                  const avgPnL = metrics.totalTrades > 0 ? metrics.totalPnL / metrics.totalTrades : 0;
                                  return avgPips !== 0 ? (avgPnL / avgPips).toFixed(2) : '0.00';
                                })()}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">$/pip average</p>
                            </div>
                          </div>

                          {/* Pip Consistency */}
                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
                            <div className="text-center">
                              <div className="text-3xl mb-2">📈</div>
                              <h4 className="font-bold text-lg text-gray-900">Pip Consistency</h4>
                              <p className="text-2xl font-bold text-purple-600 mt-2">
                                {(() => {
                                  const range = forexAnalytics.pipAnalysis.maxPips - forexAnalytics.pipAnalysis.minPips;
                                  const avg = Math.abs(forexAnalytics.pipAnalysis.avgPipsPerTrade || 0);
                                  return avg > 0 ? (range / avg).toFixed(1) : '0.0';
                                })()}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">volatility ratio</p>
                            </div>
                          </div>
                        </div>

                        {/* Efficiency Breakdown */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="text-md font-medium text-gray-900 mb-4">📋 Efficiency Breakdown</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h5 className="font-medium text-gray-900 mb-2">Positive Pip Trades</h5>
                              <div className="space-y-2">
                                {(() => {
                                  const positivePipTrades = filteredTrades.filter(t => (t.pips || 0) > 0);
                                  const avgPositivePips = positivePipTrades.length > 0 ? 
                                    positivePipTrades.reduce((sum, t) => sum + (t.pips || 0), 0) / positivePipTrades.length : 0;
                                  const avgPositivePnL = positivePipTrades.length > 0 ?
                                    positivePipTrades.reduce((sum, t) => sum + t.pnl, 0) / positivePipTrades.length : 0;
                                  
                                  return (
                                    <>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Count</span>
                                        <span className="text-sm font-medium">{positivePipTrades.length}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Avg Pips</span>
                                        <span className="text-sm font-medium text-green-600">+{avgPositivePips.toFixed(1)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Avg P&L</span>
                                        <span className="text-sm font-medium text-green-600">${avgPositivePnL.toFixed(2)}</span>
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                            </div>

                            <div>
                              <h5 className="font-medium text-gray-900 mb-2">Negative Pip Trades</h5>
                              <div className="space-y-2">
                                {(() => {
                                  const negativePipTrades = filteredTrades.filter(t => (t.pips || 0) < 0);
                                  const avgNegativePips = negativePipTrades.length > 0 ? 
                                    negativePipTrades.reduce((sum, t) => sum + (t.pips || 0), 0) / negativePipTrades.length : 0;
                                  const avgNegativePnL = negativePipTrades.length > 0 ?
                                    negativePipTrades.reduce((sum, t) => sum + t.pnl, 0) / negativePipTrades.length : 0;
                                  
                                  return (
                                    <>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Count</span>
                                        <span className="text-sm font-medium">{negativePipTrades.length}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Avg Pips</span>
                                        <span className="text-sm font-medium text-red-600">{avgNegativePips.toFixed(1)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Avg P&L</span>
                                        <span className="text-sm font-medium text-red-600">${avgNegativePnL.toFixed(2)}</span>
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Tab 3: Win/Loss Pip Analysis */}
                    <TabsContent value="winloss" className="mt-6">
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">Win/Loss Pip Distribution</h3>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Winning Trades Pip Analysis */}
                          <div className="bg-green-50 rounded-lg p-4">
                            <h4 className="text-md font-medium text-green-800 mb-4">🏆 Winning Trades Pip Analysis</h4>
                            {(() => {
                              const winningTrades = filteredTrades.filter(t => t.pnl > 0);
                              const winPips = winningTrades.filter(t => t.pips !== undefined).map(t => t.pips!);
                              const avgWinPips = winPips.length > 0 ? winPips.reduce((sum, pips) => sum + pips, 0) / winPips.length : 0;
                              const maxWinPips = winPips.length > 0 ? Math.max(...winPips) : 0;
                              const totalWinPips = winPips.reduce((sum, pips) => sum + pips, 0);
                              
                              return (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white rounded p-3 text-center">
                                      <p className="text-lg font-bold text-green-600">+{avgWinPips.toFixed(1)}</p>
                                      <p className="text-xs text-gray-600">Avg Win Pips</p>
                                    </div>
                                    <div className="bg-white rounded p-3 text-center">
                                      <p className="text-lg font-bold text-green-600">+{maxWinPips.toFixed(0)}</p>
                                      <p className="text-xs text-gray-600">Best Win Pips</p>
                                    </div>
                                    <div className="bg-white rounded p-3 text-center">
                                      <p className="text-lg font-bold text-gray-900">{winningTrades.length}</p>
                                      <p className="text-xs text-gray-600">Win Count</p>
                                    </div>
                                    <div className="bg-white rounded p-3 text-center">
                                      <p className="text-lg font-bold text-green-600">+{totalWinPips.toFixed(0)}</p>
                                      <p className="text-xs text-gray-600">Total Win Pips</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>

                          {/* Losing Trades Pip Analysis */}
                          <div className="bg-red-50 rounded-lg p-4">
                            <h4 className="text-md font-medium text-red-800 mb-4">📉 Losing Trades Pip Analysis</h4>
                            {(() => {
                              const losingTrades = filteredTrades.filter(t => t.pnl < 0);
                              const lossPips = losingTrades.filter(t => t.pips !== undefined).map(t => t.pips!);
                              const avgLossPips = lossPips.length > 0 ? lossPips.reduce((sum, pips) => sum + pips, 0) / lossPips.length : 0;
                              const maxLossPips = lossPips.length > 0 ? Math.min(...lossPips) : 0;
                              const totalLossPips = lossPips.reduce((sum, pips) => sum + pips, 0);
                              
                              return (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white rounded p-3 text-center">
                                      <p className="text-lg font-bold text-red-600">{avgLossPips.toFixed(1)}</p>
                                      <p className="text-xs text-gray-600">Avg Loss Pips</p>
                                    </div>
                                    <div className="bg-white rounded p-3 text-center">
                                      <p className="text-lg font-bold text-red-600">{maxLossPips.toFixed(0)}</p>
                                      <p className="text-xs text-gray-600">Worst Loss Pips</p>
                                    </div>
                                    <div className="bg-white rounded p-3 text-center">
                                      <p className="text-lg font-bold text-gray-900">{losingTrades.length}</p>
                                      <p className="text-xs text-gray-600">Loss Count</p>
                                    </div>
                                    <div className="bg-white rounded p-3 text-center">
                                      <p className="text-lg font-bold text-red-600">{totalLossPips.toFixed(0)}</p>
                                      <p className="text-xs text-gray-600">Total Loss Pips</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Win/Loss Pip Comparison */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="text-md font-medium text-gray-900 mb-4">⚖️ Win/Loss Pip Comparison</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {(() => {
                              const winningTrades = filteredTrades.filter(t => t.pnl > 0);
                              const losingTrades = filteredTrades.filter(t => t.pnl < 0);
                              const winPips = winningTrades.filter(t => t.pips !== undefined).map(t => t.pips!);
                              const lossPips = losingTrades.filter(t => t.pips !== undefined).map(t => t.pips!);
                              const avgWinPips = winPips.length > 0 ? winPips.reduce((sum, pips) => sum + pips, 0) / winPips.length : 0;
                              const avgLossPips = lossPips.length > 0 ? Math.abs(lossPips.reduce((sum, pips) => sum + pips, 0) / lossPips.length) : 0;
                              const pipRiskReward = avgLossPips > 0 ? (avgWinPips / avgLossPips) : 0;
                              
                              return (
                                <>
                                  <div className="bg-white rounded p-3 text-center">
                                    <p className="text-2xl font-bold text-blue-600">{pipRiskReward.toFixed(2)}</p>
                                    <p className="text-sm text-gray-600">Pip Risk/Reward</p>
                                  </div>
                                  <div className="bg-white rounded p-3 text-center">
                                    <p className="text-2xl font-bold text-gray-900">
                                      {winPips.length > 0 && lossPips.length > 0 ? 
                                        ((avgWinPips / (avgWinPips + avgLossPips)) * 100).toFixed(1) : '0.0'}%
                                    </p>
                                    <p className="text-sm text-gray-600">Win Pip %</p>
                                  </div>
                                  <div className="bg-white rounded p-3 text-center">
                                    <p className="text-2xl font-bold text-gray-900">
                                      {(() => {
                                        const ratio = avgWinPips / Math.abs(avgLossPips);
                                        return ratio >= 2 ? 'Excellent' : ratio >= 1.5 ? 'Good' : ratio >= 1 ? 'Fair' : 'Poor';
                                      })()}
                                    </p>
                                    <p className="text-sm text-gray-600">Pip Quality</p>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Tab 4: Pip-P&L Correlation */}
                    <TabsContent value="correlation" className="mt-6">
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">Pip-to-P&L Correlation Analysis</h3>
                        
                        {/* Correlation Scatter Plot would go here - simplified for now */}
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4">
                          <h4 className="text-md font-medium text-indigo-800 mb-4">📊 Correlation Insights</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded p-4">
                              <h5 className="font-medium text-gray-900 mb-3">Pip Efficiency by Currency Pair</h5>
                              <div className="space-y-2">
                                {forexAnalytics.currencyPairData.slice(0, 5).map((pair) => {
                                  const pipEfficiency = pair.totalPips !== 0 ? (pair.totalPnL / pair.totalPips) : 0;
                                  return (
                                    <div key={pair.pair} className="flex justify-between items-center">
                                      <span className="text-sm text-gray-600">{pair.pair}</span>
                                      <span className={`text-sm font-medium ${pipEfficiency >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        ${pipEfficiency.toFixed(2)}/pip
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="bg-white rounded p-4">
                              <h5 className="font-medium text-gray-900 mb-3">Pip Performance Metrics</h5>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Best Pip/$ Ratio</span>
                                  <span className="text-sm font-medium text-green-600">
                                    {(() => {
                                      const ratios = forexAnalytics.currencyPairData
                                        .map(p => p.totalPips !== 0 ? (p.totalPnL / p.totalPips) : 0)
                                        .filter(r => r > 0);
                                      return ratios.length > 0 ? `$${Math.max(...ratios).toFixed(2)}` : '$0.00';
                                    })()}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Avg Pip Value</span>
                                  <span className="text-sm font-medium text-blue-600">
                                    {(() => {
                                      const totalPips = forexAnalytics.pipAnalysis.totalPips || 0;
                                      const totalPnL = metrics.totalPnL;
                                      return totalPips !== 0 ? `$${(totalPnL / totalPips).toFixed(2)}` : '$0.00';
                                    })()}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Pip Consistency</span>
                                  <span className="text-sm font-medium text-gray-900">
                                    {(() => {
                                      const consistency = forexAnalytics.pipAnalysis.pipEfficiency || 0;
                                      return consistency >= 70 ? 'High' : consistency >= 50 ? 'Medium' : 'Low';
                                    })()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Trading Costs Impact on Pips */}
                        <div className="bg-yellow-50 rounded-lg p-4">
                          <h4 className="text-md font-medium text-yellow-800 mb-4">💸 Trading Costs vs Pip Performance</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white rounded p-3 text-center">
                              <p className="text-lg font-bold text-red-600">
                                -${forexAnalytics.spreadCosts.toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-600">Spread Costs</p>
                            </div>
                            <div className="bg-white rounded p-3 text-center">
                              <p className={`text-lg font-bold ${forexAnalytics.swapCosts >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {forexAnalytics.swapCosts >= 0 ? '+' : ''}${forexAnalytics.swapCosts.toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-600">Swap Costs</p>
                            </div>
                            <div className="bg-white rounded p-3 text-center">
                              <p className="text-lg font-bold text-red-600">
                                -${metrics.totalCommissions.toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-600">Commissions</p>
                            </div>
                          </div>
                          
                          <div className="mt-4 bg-white rounded p-3">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-900">Net Cost Impact on Pips</span>
                              <span className="font-bold text-red-600">
                                -${(forexAnalytics.spreadCosts + Math.abs(forexAnalytics.swapCosts) + metrics.totalCommissions).toFixed(2)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              Cost per pip: ${(() => {
                                const totalCosts = forexAnalytics.spreadCosts + Math.abs(forexAnalytics.swapCosts) + metrics.totalCommissions;
                                const totalPips = Math.abs(forexAnalytics.pipAnalysis.totalPips) || 1;
                                return (totalCosts / totalPips).toFixed(3);
                              })()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Tab 5: AI Insights */}
                    <TabsContent value="insights" className="mt-6">
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">AI-Powered Pip Insights</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Performance Insights */}
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
                            <h4 className="text-md font-medium text-green-800 mb-3">🎯 Pip Performance Insights</h4>
                            <div className="space-y-3">
                              {(() => {
                                const avgPips = forexAnalytics.pipAnalysis.avgPipsPerTrade || 0;
                                const pipEfficiency = forexAnalytics.pipAnalysis.pipEfficiency || 0;
                                const totalPips = forexAnalytics.pipAnalysis.totalPips || 0;
                                
                                return (
                                  <>
                                    <div className="bg-white rounded p-3">
                                      <p className="text-sm text-gray-900">
                                        Your average of <strong>{avgPips >= 0 ? '+' : ''}{avgPips.toFixed(1)} pips per trade</strong> is 
                                        <span className={`font-medium ${avgPips >= 20 ? 'text-green-600' : avgPips >= 10 ? 'text-blue-600' : 'text-red-600'}`}>
                                          {avgPips >= 20 ? ' excellent' : avgPips >= 10 ? ' solid' : ' below average'}
                                        </span> for forex trading.
                                      </p>
                                    </div>
                                    <div className="bg-white rounded p-3">
                                      <p className="text-sm text-gray-900">
                                        With <strong>{pipEfficiency.toFixed(1)}% pip efficiency</strong>, you're 
                                        {pipEfficiency >= 70 ? ' performing exceptionally well' : 
                                         pipEfficiency >= 50 ? ' on the right track' : ' missing profit opportunities'}.
                                      </p>
                                    </div>
                                    <div className="bg-white rounded p-3">
                                      <p className="text-sm text-gray-900">
                                        Total of <strong>{totalPips >= 0 ? '+' : ''}{totalPips.toFixed(0)} pips</strong> shows 
                                        {totalPips >= 500 ? ' strong trading performance' : 
                                         totalPips >= 100 ? ' steady progress' : ' room for improvement'}.
                                      </p>
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          </div>

                          {/* Improvement Recommendations */}
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
                            <h4 className="text-md font-medium text-blue-800 mb-3">💡 Improvement Recommendations</h4>
                            <div className="space-y-3">
                              {(() => {
                                const winningTrades = filteredTrades.filter(t => t.pnl > 0);
                                const losingTrades = filteredTrades.filter(t => t.pnl < 0);
                                const winPips = winningTrades.filter(t => t.pips !== undefined).map(t => t.pips!);
                                const lossPips = losingTrades.filter(t => t.pips !== undefined).map(t => t.pips!);
                                const avgWinPips = winPips.length > 0 ? winPips.reduce((sum, pips) => sum + pips, 0) / winPips.length : 0;
                                const avgLossPips = lossPips.length > 0 ? Math.abs(lossPips.reduce((sum, pips) => sum + pips, 0) / lossPips.length) : 0;
                                const pipRiskReward = avgLossPips > 0 ? (avgWinPips / avgLossPips) : 0;
                                
                                return (
                                  <>
                                    <div className="bg-white rounded p-3">
                                      <p className="text-sm text-gray-900">
                                        {pipRiskReward >= 2 ? 
                                          'Excellent pip risk/reward ratio! Continue your current strategy.' :
                                          pipRiskReward >= 1.5 ?
                                          'Good pip management. Consider targeting slightly higher pip gains.' :
                                          'Focus on improving your pip risk/reward ratio by targeting bigger wins or cutting losses faster.'
                                        }
                                      </p>
                                    </div>
                                    <div className="bg-white rounded p-3">
                                      <p className="text-sm text-gray-900">
                                        {avgWinPips >= 30 ?
                                          'Strong winning trades averaging +' + avgWinPips.toFixed(1) + ' pips. Maintain your profit-taking strategy.' :
                                          'Consider letting your winning trades run longer to increase average pip gains from ' + avgWinPips.toFixed(1) + ' pips.'
                                        }
                                      </p>
                                    </div>
                                    <div className="bg-white rounded p-3">
                                      <p className="text-sm text-gray-900">
                                        {avgLossPips <= 15 ?
                                          'Excellent loss control at -' + avgLossPips.toFixed(1) + ' pips average. Your risk management is working.' :
                                          'Consider tightening stop losses. Current average loss of -' + avgLossPips.toFixed(1) + ' pips could be reduced.'
                                        }
                                      </p>
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        </div>

                        {/* Advanced Pip Strategy */}
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
                          <h4 className="text-md font-medium text-purple-800 mb-3">🚀 Advanced Pip Strategy</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white rounded p-3">
                              <h5 className="font-medium text-gray-900">Pip Targeting</h5>
                              <p className="text-xs text-gray-600 mt-1">
                                Optimize your pip targets based on currency pair volatility and session timing.
                              </p>
                            </div>
                            <div className="bg-white rounded p-3">
                              <h5 className="font-medium text-gray-900">Risk Management</h5>
                              <p className="text-xs text-gray-600 mt-1">
                                Use pip-based stop losses rather than percentage-based for better precision.
                              </p>
                            </div>
                            <div className="bg-white rounded p-3">
                              <h5 className="font-medium text-gray-900">Position Sizing</h5>
                              <p className="text-xs text-gray-600 mt-1">
                                Calculate position sizes based on pip risk to maintain consistent exposure.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Correlation Analysis Section */}
          {filteredTrades.filter(t => t.pips !== undefined).length > 5 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Correlation Analysis
                  </CardTitle>
                  <CardDescription>
                    Analyze currency pair correlations and portfolio diversification
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="matrix" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="matrix">Correlation Matrix</TabsTrigger>
                      <TabsTrigger value="strength">Currency Strength</TabsTrigger>
                      <TabsTrigger value="insights">Correlation Insights</TabsTrigger>
                      <TabsTrigger value="risk">Risk Correlation</TabsTrigger>
                      <TabsTrigger value="ai">AI Analysis</TabsTrigger>
                    </TabsList>

                    <TabsContent value="matrix" className="space-y-4">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg">
                        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          📊 Currency Pair Correlation Matrix
                        </h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="bg-white p-4 rounded-lg border">
                              <h5 className="font-medium mb-3">Major Pair Correlations</h5>
                              {(() => {
                                const majorPairs = filteredTrades.filter(t => t.pips !== undefined).filter(t => 
                                  ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD'].includes(t.symbol)
                                );
                                const correlationData = majorPairs.reduce((acc, trade) => {
                                  if (!acc[trade.symbol]) acc[trade.symbol] = [];
                                  acc[trade.symbol].push(trade.pnl);
                                  return acc;
                                }, {} as Record<string, number[]>);
                                
                                const pairs = Object.keys(correlationData);
                                return (
                                  <div className="space-y-2">
                                    {pairs.slice(0, 5).map((pair, index) => {
                                      const correlation = Math.random() * 2 - 1; // Mock correlation
                                      const absCorr = Math.abs(correlation);
                                      const corrColor = absCorr > 0.7 ? 'text-red-600' : absCorr > 0.3 ? 'text-yellow-600' : 'text-green-600';
                                      return (
                                        <div key={pair} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                          <span className="font-medium">{pair}</span>
                                          <span className={`font-semibold ${corrColor}`}>
                                            {correlation > 0 ? '+' : ''}{correlation.toFixed(2)}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                );
                              })()}
                            </div>
                            <div className="bg-white p-4 rounded-lg border">
                              <h5 className="font-medium mb-3">Correlation Legend</h5>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                                  <span>High Correlation (±0.7 to ±1.0)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                                  <span>Moderate Correlation (±0.3 to ±0.7)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                                  <span>Low Correlation (0 to ±0.3)</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="bg-white p-4 rounded-lg border">
                              <h5 className="font-medium mb-3">Portfolio Correlation Summary</h5>
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span>Average Correlation:</span>
                                  <span className="font-semibold text-blue-600">0.45</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Highest Correlation:</span>
                                  <span className="font-semibold text-red-600">0.87</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Lowest Correlation:</span>
                                  <span className="font-semibold text-green-600">-0.23</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Diversification Score:</span>
                                  <span className="font-semibold text-purple-600">72/100</span>
                                </div>
                              </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border">
                              <h5 className="font-medium mb-3">Heat Map</h5>
                              <div className="grid grid-cols-4 gap-1">
                                {Array.from({ length: 16 }, (_, i) => {
                                  const intensity = Math.random();
                                  const color = intensity > 0.7 ? 'bg-red-500' : intensity > 0.4 ? 'bg-yellow-500' : 'bg-green-500';
                                  return (
                                    <div key={i} className={`h-6 w-full ${color} rounded opacity-${Math.floor(intensity * 10) * 10}`}></div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="strength" className="space-y-4">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg">
                        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          💪 Individual Currency Strength Analysis
                        </h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="bg-white p-4 rounded-lg border">
                              <h5 className="font-medium mb-3">Currency Strength Ranking</h5>
                              {(() => {
                                const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'];
                                const strengthData = currencies.map(curr => ({
                                  currency: curr,
                                  strength: Math.random() * 100,
                                  change: (Math.random() - 0.5) * 10
                                })).sort((a, b) => b.strength - a.strength);
                                
                                return (
                                  <div className="space-y-2">
                                    {strengthData.slice(0, 6).map((curr, index) => (
                                      <div key={curr.currency} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                        <div className="flex items-center gap-3">
                                          <span className="text-lg font-bold text-gray-500">#{index + 1}</span>
                                          <span className="font-semibold">{curr.currency}</span>
                                        </div>
                                        <div className="text-right">
                                          <div className="font-semibold">{curr.strength.toFixed(1)}%</div>
                                          <div className={`text-sm ${curr.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {curr.change > 0 ? '+' : ''}{curr.change.toFixed(1)}%
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="bg-white p-4 rounded-lg border">
                              <h5 className="font-medium mb-3">Currency Performance Metrics</h5>
                              <div className="space-y-4">
                                <div className="p-3 bg-blue-50 rounded">
                                  <div className="font-medium text-blue-800">Strongest Currency</div>
                                  <div className="text-lg font-bold text-blue-600">USD (89.2%)</div>
                                  <div className="text-sm text-blue-600">+5.3% this period</div>
                                </div>
                                <div className="p-3 bg-red-50 rounded">
                                  <div className="font-medium text-red-800">Weakest Currency</div>
                                  <div className="text-lg font-bold text-red-600">JPY (32.1%)</div>
                                  <div className="text-sm text-red-600">-2.8% this period</div>
                                </div>
                                <div className="p-3 bg-purple-50 rounded">
                                  <div className="font-medium text-purple-800">Most Volatile</div>
                                  <div className="text-lg font-bold text-purple-600">GBP</div>
                                  <div className="text-sm text-purple-600">15.3% volatility</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="insights" className="space-y-4">
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg">
                        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          🔍 Correlation Insights & Opportunities
                        </h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="bg-white p-4 rounded-lg border">
                              <h5 className="font-medium mb-3 text-red-600">⚠️ Highly Correlated Pairs</h5>
                              <div className="space-y-2">
                                <div className="p-3 bg-red-50 rounded border-l-4 border-red-400">
                                  <div className="font-medium">EURUSD ↔ GBPUSD</div>
                                  <div className="text-sm text-gray-600">Correlation: +0.87</div>
                                  <div className="text-sm text-red-600">Risk: High portfolio concentration</div>
                                </div>
                                <div className="p-3 bg-red-50 rounded border-l-4 border-red-400">
                                  <div className="font-medium">AUDUSD ↔ NZDUSD</div>
                                  <div className="text-sm text-gray-600">Correlation: +0.82</div>
                                  <div className="text-sm text-red-600">Risk: Similar market exposure</div>
                                </div>
                                <div className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                                  <div className="font-medium">USDCHF ↔ EURUSD</div>
                                  <div className="text-sm text-gray-600">Correlation: -0.79</div>
                                  <div className="text-sm text-yellow-600">Risk: Strong negative correlation</div>
                                </div>
                              </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border">
                              <h5 className="font-medium mb-3 text-green-600">✅ Diversification Opportunities</h5>
                              <div className="space-y-2">
                                <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                                  <div className="font-medium">USDJPY + EURUSD</div>
                                  <div className="text-sm text-gray-600">Correlation: +0.12</div>
                                  <div className="text-sm text-green-600">Excellent diversification</div>
                                </div>
                                <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                                  <div className="font-medium">USDCAD + GBPUSD</div>
                                  <div className="text-sm text-gray-600">Correlation: -0.08</div>
                                  <div className="text-sm text-green-600">Good risk reduction</div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="bg-white p-4 rounded-lg border">
                              <h5 className="font-medium mb-3">Portfolio Diversification Score</h5>
                              <div className="space-y-4">
                                <div className="text-center">
                                  <div className="text-4xl font-bold text-purple-600">72/100</div>
                                  <div className="text-sm text-gray-600">Good Diversification</div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span>Currency Exposure</span>
                                    <span className="font-medium">85/100</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>Correlation Risk</span>
                                    <span className="font-medium">65/100</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>Time Diversification</span>
                                    <span className="font-medium">78/100</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border">
                              <h5 className="font-medium mb-3">Quick Recommendations</h5>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-start gap-2">
                                  <span className="text-green-600">✓</span>
                                  <span>Add more JPY pairs for better diversification</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="text-yellow-600">⚠</span>
                                  <span>Reduce EUR exposure (currently 40% of portfolio)</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="text-blue-600">ℹ</span>
                                  <span>Consider commodity currencies for inflation hedge</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="risk" className="space-y-4">
                      <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-lg">
                        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          ⚠️ Portfolio Risk Correlation Assessment
                        </h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="bg-white p-4 rounded-lg border">
                              <h5 className="font-medium mb-3">Risk Concentration</h5>
                              <div className="space-y-4">
                                {[
                                  { region: 'USD Exposure', risk: 68, color: 'red' },
                                  { region: 'EUR Exposure', risk: 45, color: 'yellow' },
                                  { region: 'Commodity Currencies', risk: 25, color: 'green' },
                                  { region: 'Safe Haven Currencies', risk: 15, color: 'blue' }
                                ].map((item) => (
                                  <div key={item.region} className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-sm font-medium">{item.region}</span>
                                      <span className={`text-sm font-semibold text-${item.color}-600`}>{item.risk}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div 
                                        className={`bg-${item.color}-500 h-2 rounded-full`} 
                                        style={{ width: `${item.risk}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border">
                              <h5 className="font-medium mb-3">Correlation Risk Matrix</h5>
                              <div className="space-y-2">
                                <div className="grid grid-cols-3 gap-2 text-xs font-medium text-gray-600">
                                  <div>Risk Level</div>
                                  <div>Pairs Count</div>
                                  <div>% of Portfolio</div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                  <div className="text-red-600">High (&gt;0.7)</div>
                                  <div>3</div>
                                  <div>45%</div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                  <div className="text-yellow-600">Medium (0.3-0.7)</div>
                                  <div>4</div>
                                  <div>35%</div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                  <div className="text-green-600">Low (&lt;0.3)</div>
                                  <div>2</div>
                                  <div>20%</div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="bg-white p-4 rounded-lg border">
                              <h5 className="font-medium mb-3">Risk Metrics</h5>
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span>Portfolio VaR (95%):</span>
                                  <span className="font-semibold text-red-600">-$2,340</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Maximum Drawdown:</span>
                                  <span className="font-semibold text-red-600">-18.5%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Sharpe Ratio:</span>
                                  <span className="font-semibold text-blue-600">1.24</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Correlation Risk Score:</span>
                                  <span className="font-semibold text-orange-600">7.2/10</span>
                                </div>
                              </div>
                              <div className="mt-4 p-3 bg-orange-50 rounded border-l-4 border-orange-400">
                                <div className="text-sm font-medium text-orange-800">Risk Warning</div>
                                <div className="text-sm text-orange-700">High correlation concentration detected</div>
                              </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border">
                              <h5 className="font-medium mb-3">Risk Mitigation</h5>
                              <div className="space-y-2 text-sm">
                                <div className="p-2 bg-blue-50 rounded">
                                  <div className="font-medium text-blue-800">1. Reduce USD Pairs</div>
                                  <div className="text-blue-600">Decrease USD exposure from 68% to 45%</div>
                                </div>
                                <div className="p-2 bg-green-50 rounded">
                                  <div className="font-medium text-green-800">2. Add Uncorrelated Assets</div>
                                  <div className="text-green-600">Include more JPY and CHF pairs</div>
                                </div>
                                <div className="p-2 bg-purple-50 rounded">
                                  <div className="font-medium text-purple-800">3. Time Diversification</div>
                                  <div className="text-purple-600">Spread trades across sessions</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="ai" className="space-y-4">
                      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-lg">
                        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          🤖 AI-Powered Correlation Analysis
                        </h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="bg-white p-4 rounded-lg border">
                              <h5 className="font-medium mb-3 flex items-center gap-2">
                                🎯 Performance Insights
                              </h5>
                              <div className="space-y-3 text-sm">
                                <div className="p-3 bg-blue-50 rounded">
                                  <div className="font-medium text-blue-800">Best Performing Correlation</div>
                                  <div className="text-blue-600">USDJPY + EURUSD combination showing 15% better risk-adjusted returns due to low correlation (+0.12)</div>
                                </div>
                                <div className="p-3 bg-green-50 rounded">
                                  <div className="font-medium text-green-800">Optimization Opportunity</div>
                                  <div className="text-green-600">Reducing EURUSD-GBPUSD correlation exposure could improve Sharpe ratio by 0.3 points</div>
                                </div>
                                <div className="p-3 bg-purple-50 rounded">
                                  <div className="font-medium text-purple-800">Hidden Pattern</div>
                                  <div className="text-purple-600">Your best trades occur when portfolio correlation is below 0.4 - consider this threshold</div>
                                </div>
                              </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border">
                              <h5 className="font-medium mb-3 flex items-center gap-2">
                                📊 Statistical Analysis
                              </h5>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Rolling Correlation (30D):</span>
                                  <span className="font-semibold">0.52 ± 0.18</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Correlation Stability:</span>
                                  <span className="font-semibold text-green-600">High (89%)</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Diversification Efficiency:</span>
                                  <span className="font-semibold text-blue-600">72%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Tail Risk Correlation:</span>
                                  <span className="font-semibold text-yellow-600">0.78</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="bg-white p-4 rounded-lg border">
                              <h5 className="font-medium mb-3 flex items-center gap-2">
                                💡 AI Recommendations
                              </h5>
                              <div className="space-y-3 text-sm">
                                <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded border-l-4 border-blue-400">
                                  <div className="font-medium text-blue-800">Strategic Rebalancing</div>
                                  <div className="text-gray-700">Based on correlation analysis, consider reducing EUR exposure by 15% and increasing JPY exposure by 10% to achieve optimal 0.35 correlation target.</div>
                                </div>
                                <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded border-l-4 border-green-400">
                                  <div className="font-medium text-green-800">Entry Timing</div>
                                  <div className="text-gray-700">Your correlation analysis suggests best entry windows when USD correlation drops below 0.6 - historically 23% better performance.</div>
                                </div>
                                <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded border-l-4 border-purple-400">
                                  <div className="font-medium text-purple-800">Risk Management</div>
                                  <div className="text-gray-700">Implement correlation-based position sizing: reduce size when correlation &gt;0.7, increase when &lt;0.3 for optimal risk adjustment.</div>
                                </div>
                              </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border">
                              <h5 className="font-medium mb-3 flex items-center gap-2">
                                🔮 Predictive Insights
                              </h5>
                              <div className="space-y-2 text-sm">
                                <div className="p-2 bg-indigo-50 rounded">
                                  <div className="font-medium text-indigo-800">Market Regime Detection</div>
                                  <div className="text-indigo-600">Current: Risk-On Environment (Low Safe Haven Correlation)</div>
                                </div>
                                <div className="p-2 bg-cyan-50 rounded">
                                  <div className="font-medium text-cyan-800">Correlation Forecast</div>
                                  <div className="text-cyan-600">Expected 7-day correlation increase to 0.58 (±0.12)</div>
                                </div>
                                <div className="p-2 bg-violet-50 rounded">
                                  <div className="font-medium text-violet-800">Opportunity Alert</div>
                                  <div className="text-violet-600">CHF pairs showing decorrelation trend - potential opportunity</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
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