import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  Globe, 
  Clock,
  ExternalLink,
  RefreshCw,
  Zap,
  Filter,
  BarChart3,
  Brain,
  Target,
  LineChart,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { 
  economicCalendarService, 
  EconomicEvent, 
  NewsItem, 
  MarketCorrelation,
  formatEventTime,
  getImpactColor,
  getCurrencyFlag
} from '../lib/economicCalendarService';
import { 
  newsImpactCorrelationService,
  NewsCorrelationData,
  TradingRecommendation,
  NewsImpactMetrics,
  PredictiveInsight,
  getCorrelationColor,
  getRecommendationColor,
  formatConfidence,
  getConfidenceColor
} from '../lib/newsImpactCorrelationService';
import { useTradeContext } from '../contexts/TradeContext';

const News: React.FC = () => {
  const { trades } = useTradeContext();
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [economicEvents, setEconomicEvents] = useState<EconomicEvent[]>([]);
  const [correlations, setCorrelations] = useState<MarketCorrelation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('all');
  const [selectedImpact, setSelectedImpact] = useState<string>('all');
  
  // News Impact Correlation state
  const [correlationData, setCorrelationData] = useState<NewsCorrelationData[]>([]);
  const [recommendations, setRecommendations] = useState<TradingRecommendation[]>([]);
  const [impactMetrics, setImpactMetrics] = useState<NewsImpactMetrics | null>(null);
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [correlationLoading, setCorrelationLoading] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load upcoming events (next 7 days)
      const events = await economicCalendarService.getUpcomingEvents(7);
      setEconomicEvents(events);

      // Load latest news
      const news = await economicCalendarService.getMarketNews(10);
      setNewsData(news);

      // Load market correlations for major pairs
      const eurUsdCorrelations = await economicCalendarService.getMarketCorrelations('EUR/USD');
      setCorrelations(eurUsdCorrelations);

    } catch (err) {
      setError('Failed to load economic data');
      console.error('Error loading economic data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load correlation analysis data
  const loadCorrelationData = async () => {
    if (!trades || trades.length === 0) return;
    
    setCorrelationLoading(true);
    try {
      // Load correlation analysis
      const correlations = await newsImpactCorrelationService.analyzeNewsCorrelations(trades);
      setCorrelationData(correlations);

      // Load trading recommendations
      const recs = await newsImpactCorrelationService.getTradingRecommendations(7);
      setRecommendations(recs);

      // Load impact metrics
      const metrics = await newsImpactCorrelationService.getNewsImpactMetrics(trades);
      setImpactMetrics(metrics);

      // Load predictive insights
      const insightsData = await newsImpactCorrelationService.generatePredictiveInsights(trades);
      setInsights(insightsData);

    } catch (err) {
      console.error('Error loading correlation data:', err);
    } finally {
      setCorrelationLoading(false);
    }
  };

  // Load correlation data when trades change
  useEffect(() => {
    if (trades && trades.length > 0) {
      loadCorrelationData();
    }
  }, [trades]); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshData = async () => {
    economicCalendarService.clearCache();
    newsImpactCorrelationService.clearCache();
    await loadInitialData();
    if (trades && trades.length > 0) {
      await loadCorrelationData();
    }
  };

  // Filter events based on selected criteria
  const filteredEvents = economicEvents.filter(event => {
    const currencyMatch = selectedCurrency === 'all' || event.currency === selectedCurrency;
    const impactMatch = selectedImpact === 'all' || event.impact === selectedImpact;
    return currencyMatch && impactMatch;
  });

  // Get unique currencies from events
  const availableCurrencies = Array.from(new Set(economicEvents.map(event => event.currency)));

  // Analyze trade risk for recent trades
  const analyzeRecentTrades = () => {
    if (!trades || trades.length === 0) return [];
    
    const recentTrades = trades.slice(0, 5); // Last 5 trades
    return recentTrades.map(trade => {
      const analysis = economicCalendarService.analyzeTradeRisk(trade.date, trade.currencyPair);
      return {
        trade,
        ...analysis
      };
    });
  };

  const tradeAnalysis = analyzeRecentTrades();

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <Zap className="w-3 h-3" />;
      case 'medium': return <AlertTriangle className="w-3 h-3" />;
      case 'low': return <TrendingUp className="w-3 h-3" />;
      default: return null;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Economic News & Calendar</h1>
          <p className="text-gray-600 mt-1">Stay informed with the latest market-moving news and events</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={refreshData} 
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!error && (
        <Alert>
          <Globe className="h-4 w-4" />
          <AlertDescription>
            <strong>Phase 4 Active:</strong> Economic calendar integration with real-time data caching. 
            API integrations ready for: Alpha Vantage, Financial Modeling Prep, and ForexFactory.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="calendar">Economic Calendar</TabsTrigger>
          <TabsTrigger value="news">Market News</TabsTrigger>
          <TabsTrigger value="analysis">Impact Analysis</TabsTrigger>
          <TabsTrigger value="trade-risk">Trade Risk</TabsTrigger>
          <TabsTrigger value="correlation">
            <Brain className="w-4 h-4 mr-1" />
            News Correlation
          </TabsTrigger>
        </TabsList>

        {/* Market News Tab */}
        <TabsContent value="news" className="space-y-4">
          <div className="grid gap-4">
            {newsData.map((news) => (
              <Card key={news.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight">{news.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className={getImpactColor(news.impact)}>
                          {getImpactIcon(news.impact)}
                          <span className="ml-1 capitalize">{news.impact} Impact</span>
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {news.source} • {formatTime(news.publishedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-3">{news.summary}</p>
                  <Button variant="outline" size="sm" className="gap-2">
                    <ExternalLink className="w-3 h-3" />
                    Read Full Article
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Economic Calendar Tab */}
        <TabsContent value="calendar" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <select 
              value={selectedCurrency} 
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Currencies</option>
              {availableCurrencies.map(currency => (
                <option key={currency} value={currency}>
                  {getCurrencyFlag(currency)} {currency}
                </option>
              ))}
            </select>

            <select 
              value={selectedImpact} 
              onChange={(e) => setSelectedImpact(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Impact Levels</option>
              <option value="high">High Impact</option>
              <option value="medium">Medium Impact</option>
              <option value="low">Low Impact</option>
            </select>

            <div className="ml-auto text-sm text-gray-500">
              {filteredEvents.length} events found
            </div>
          </div>

          {/* Events List */}
          <div className="grid gap-4">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className={getImpactColor(event.impact)}>
                          {getImpactIcon(event.impact)}
                          <span className="ml-1 capitalize">{event.impact}</span>
                        </Badge>
                        <div className="flex items-center gap-1">
                          <span className="text-lg">{getCurrencyFlag(event.currency)}</span>
                          <span className="text-sm font-medium text-gray-700">{event.currency}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {event.category.replace('-', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-lg">{event.name}</h3>
                      <p className="text-gray-600">{event.country}</p>
                      {event.description && (
                        <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(event.date)}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-3 h-3" />
                        {event.time}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Previous</span>
                      <p className="font-medium">{event.previous}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Forecast</span>
                      <p className="font-medium">{event.forecast}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Actual</span>
                      <p className="font-medium text-green-600">{event.actual || '—'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredEvents.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center text-gray-500">
                  No events found matching the selected filters.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Impact Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* High Impact Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-red-500" />
                  High Impact Events
                </CardTitle>
                <CardDescription>Events likely to cause significant market volatility</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {economicEvents.filter(event => event.impact === 'high').map(event => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{event.name}</p>
                        <p className="text-xs text-gray-600">{formatEventTime(event.date, event.time)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-lg">{getCurrencyFlag(event.currency)}</span>
                        <Badge className="bg-red-100 text-red-800">{event.currency}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Market Correlations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  Market Correlations
                </CardTitle>
                <CardDescription>Expected impact on major currency pairs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {correlations.map((correlation, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{correlation.currencyPair}</span>
                        <Badge variant="outline" className={getImpactColor(correlation.expectedVolatility)}>
                          {correlation.expectedVolatility.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        Historical Impact: {correlation.historicalImpact > 0 ? '+' : ''}{correlation.historicalImpact}%
                      </p>
                      <p className="text-xs text-gray-500">{correlation.tradingRecommendation}</p>
                    </div>
                  ))}
                  
                  {correlations.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No correlation data available for current events.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Volatility Forecast */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Volatility Forecast</CardTitle>
              <CardDescription>Expected market movements based on upcoming events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">Low</div>
                  <div className="text-sm text-gray-600">Monday - Tuesday</div>
                  <div className="text-xs text-gray-500 mt-1">Minimal economic releases</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">Medium</div>
                  <div className="text-sm text-gray-600">Wednesday</div>
                  <div className="text-xs text-gray-500 mt-1">Some employment data</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">High</div>
                  <div className="text-sm text-gray-600">Thursday - Friday</div>
                  <div className="text-xs text-gray-500 mt-1">Central bank decisions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trade Risk Analysis Tab */}
        <TabsContent value="trade-risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Trade Risk Analysis
              </CardTitle>
              <CardDescription>
                Analysis of how economic events might impact your recent trades
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tradeAnalysis.length > 0 ? (
                <div className="space-y-4">
                  {tradeAnalysis.map((analysis, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="font-medium">{analysis.trade.currencyPair}</span>
                          <span className="text-sm text-gray-500 ml-2">{analysis.trade.date}</span>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={
                            analysis.riskLevel === 'high' ? 'bg-red-100 text-red-800 border-red-200' :
                            analysis.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            'bg-green-100 text-green-800 border-green-200'
                          }
                        >
                          {analysis.riskLevel.toUpperCase()} RISK
                        </Badge>
                      </div>
                      
                      {analysis.events.length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Related Events:</h5>
                          {analysis.events.map(event => (
                            <div key={event.id} className="text-sm text-gray-600 mb-1">
                              • {event.name} ({event.currency}) - {formatEventTime(event.date, event.time)}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Recommendations:</h5>
                        {analysis.recommendations.map((rec, recIndex) => (
                          <div key={recIndex} className="text-sm text-gray-600 mb-1">
                            • {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No trades available for risk analysis</p>
                  <p className="text-sm mt-1">Add some trades to see how economic events might impact them</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* News Impact Correlation Tab */}
        <TabsContent value="correlation" className="space-y-4">
          {/* Header and Refresh */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">News Impact Correlation Analysis</h2>
              <p className="text-gray-600">Statistical correlation between news events and trading performance</p>
            </div>
            <Button 
              onClick={loadCorrelationData} 
              disabled={correlationLoading || !trades || trades.length === 0}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${correlationLoading ? 'animate-spin' : ''}`} />
              Refresh Analysis
            </Button>
          </div>

          {/* No trades message */}
          {(!trades || trades.length === 0) && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Add some trade data to unlock powerful correlation analysis between news events and your trading performance.
              </AlertDescription>
            </Alert>
          )}

          {/* Correlation Analysis Tabs */}
          {trades && trades.length > 0 && (
            <Tabs defaultValue="correlations" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="correlations">Historical Correlations</TabsTrigger>
                <TabsTrigger value="recommendations">Trading Recommendations</TabsTrigger>
                <TabsTrigger value="metrics">Impact Metrics</TabsTrigger>
                <TabsTrigger value="insights">Predictive Insights</TabsTrigger>
              </TabsList>

              {/* Historical Correlations */}
              <TabsContent value="correlations" className="space-y-4">
                <div className="grid gap-4">
                  {correlationData.map((correlation) => (
                    <Card key={correlation.eventId} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{correlation.eventName}</CardTitle>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className={getImpactColor(correlation.impact)}>
                                {correlation.impact.toUpperCase()} IMPACT
                              </Badge>
                              <Badge variant="outline" className={getCorrelationColor(correlation.correlationStrength)}>
                                {correlation.correlationStrength.toUpperCase()} CORRELATION
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {correlation.currency} • {correlation.category.replace('-', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {/* Performance Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900">{correlation.tradeCount}</div>
                            <div className="text-xs text-gray-500">Trades Analyzed</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className={`text-2xl font-bold ${correlation.winRate >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                              {correlation.winRate.toFixed(0)}%
                            </div>
                            <div className="text-xs text-gray-500">Win Rate</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className={`text-2xl font-bold ${correlation.avgPips >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {correlation.avgPips >= 0 ? '+' : ''}{correlation.avgPips.toFixed(1)}
                            </div>
                            <div className="text-xs text-gray-500">Avg Pips</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">
                              {correlation.volatilityIncrease.toFixed(0)}%
                            </div>
                            <div className="text-xs text-gray-500">Volatility Increase</div>
                          </div>
                        </div>

                        {/* Recommendation */}
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-1">Trading Recommendation</h4>
                          <p className="text-sm text-blue-700">{correlation.recommendation}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {correlationData.length === 0 && !correlationLoading && (
                    <Card>
                      <CardContent className="pt-6 text-center text-gray-500">
                        <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No correlation data available</p>
                        <p className="text-sm mt-1">Analysis requires more trading history with economic event overlap</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Trading Recommendations */}
              <TabsContent value="recommendations" className="space-y-4">
                <div className="grid gap-4">
                  {recommendations.map((rec) => (
                    <Card key={rec.eventId} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{rec.eventName}</CardTitle>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className={getRecommendationColor(rec.recommendation)}>
                                {rec.recommendation.replace('_', ' ').toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className={getImpactColor(rec.impact)}>
                                {rec.impact.toUpperCase()} IMPACT
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {rec.date} • {rec.currency}
                              </span>
                              <span className={`text-sm font-medium ${getConfidenceColor(rec.confidence)}`}>
                                {formatConfidence(rec.confidence)} Confidence
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {/* Reasoning */}
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Analysis</h4>
                          <p className="text-sm text-gray-600">{rec.reasoning}</p>
                        </div>

                        {/* Suggested Actions */}
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Suggested Actions</h4>
                          <div className="space-y-1">
                            {rec.suggestedActions.map((action, index) => (
                              <div key={index} className="flex items-start gap-2 text-sm text-gray-600">
                                <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                {action}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Affected Pairs */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Affected Currency Pairs</h4>
                          <div className="flex flex-wrap gap-1">
                            {rec.affectedPairs.map((pair, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {pair}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {recommendations.length === 0 && !correlationLoading && (
                    <Card>
                      <CardContent className="pt-6 text-center text-gray-500">
                        <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No trading recommendations available</p>
                        <p className="text-sm mt-1">Check back when high-impact economic events are scheduled</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Impact Metrics */}
              <TabsContent value="metrics" className="space-y-4">
                {impactMetrics ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Summary Metrics */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-blue-500" />
                          Analysis Summary
                        </CardTitle>
                        <CardDescription>Overall correlation analysis metrics</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Events Analyzed</span>
                            <span className="font-semibold">{impactMetrics.totalEventsAnalyzed}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Trades Analyzed</span>
                            <span className="font-semibold">{impactMetrics.tradesAnalyzed}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Strong Correlations</span>
                            <span className="font-semibold text-blue-600">{impactMetrics.highImpactCorrelations}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Avg Volatility Increase</span>
                            <span className="font-semibold text-orange-600">{impactMetrics.avgVolatilityIncrease.toFixed(0)}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Performance Categories */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-green-500" />
                          Category Performance
                        </CardTitle>
                        <CardDescription>Best and worst performing event categories</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-green-700 mb-2">Best Performing</h4>
                            <div className="space-y-1">
                              {impactMetrics.bestPerformingCategories.map((category, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                  <span className="text-sm text-gray-600 capitalize">
                                    {category.replace('-', ' ')}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-red-700 mb-2">Worst Performing</h4>
                            <div className="space-y-1">
                              {impactMetrics.worstPerformingCategories.map((category, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <XCircle className="w-3 h-3 text-red-500" />
                                  <span className="text-sm text-gray-600 capitalize">
                                    {category.replace('-', ' ')}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Optimal Trading Windows */}
                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-purple-500" />
                          Optimal Trading Windows
                        </CardTitle>
                        <CardDescription>Best time periods based on correlation analysis</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-3 gap-4">
                          {impactMetrics.optimalTradingWindows.map((window, index) => (
                            <div key={index} className="text-center p-3 bg-purple-50 rounded-lg">
                              <div className="font-medium text-purple-900">{window}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="pt-6 text-center text-gray-500">
                      <LineChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Loading impact metrics...</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Predictive Insights */}
              <TabsContent value="insights" className="space-y-4">
                <div className="grid gap-4">
                  {insights.map((insight, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge 
                                variant="outline" 
                                className={
                                  insight.type === 'performance' ? 'bg-green-100 text-green-800 border-green-200' :
                                  insight.type === 'risk' ? 'bg-red-100 text-red-800 border-red-200' :
                                  insight.type === 'opportunity' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                  'bg-yellow-100 text-yellow-800 border-yellow-200'
                                }
                              >
                                {insight.type.toUpperCase()}
                              </Badge>
                              <span className={`text-sm font-medium ${getConfidenceColor(insight.confidence)}`}>
                                {insight.confidence}% Confidence
                              </span>
                              {insight.actionable && (
                                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                                  ACTIONABLE
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-lg">{insight.title}</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-3">{insight.description}</p>
                        
                        {insight.recommendation && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-1">Recommendation</h4>
                            <p className="text-sm text-blue-700">{insight.recommendation}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {insights.length === 0 && !correlationLoading && (
                    <Card>
                      <CardContent className="pt-6 text-center text-gray-500">
                        <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No predictive insights available</p>
                        <p className="text-sm mt-1">More trading data needed to generate meaningful insights</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}

          {/* Loading State */}
          {correlationLoading && (
            <Card>
              <CardContent className="pt-6 text-center">
                <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-500" />
                <p className="text-gray-600">Analyzing news impact correlations...</p>
                <p className="text-sm text-gray-500 mt-1">This may take a moment</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default News;
