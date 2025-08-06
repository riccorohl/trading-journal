import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, RefreshCw, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, BarChart, Bar } from 'recharts';
import currencyStrengthService, { CurrencyStrengthData, StrengthRanking } from '../lib/currencyStrengthService';

const CurrencyStrengthMeter: React.FC = () => {
  const [strengthData, setStrengthData] = useState<CurrencyStrengthData[]>([]);
  const [rankings, setRankings] = useState<StrengthRanking[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [trendData, setTrendData] = useState<Array<{ date: string; strength: number }>>([]);
  const [comparison, setComparison] = useState<{
    base: CurrencyStrengthData;
    quote: CurrencyStrengthData;
    strengthDiff: number;
    recommendation: string;
  } | null>(null);
  const [baseCurrency, setBaseCurrency] = useState<string>('USD');
  const [quoteCurrency, setQuoteCurrency] = useState<string>('EUR');

  // Load strength data
  const loadStrengthData = async () => {
    setLoading(true);
    try {
      const [strengthResponse, rankingsData] = await Promise.all([
        currencyStrengthService.getCurrencyStrengths(),
        currencyStrengthService.getCurrencyRankings()
      ]);
      
      setStrengthData(strengthResponse.currencies);
      setRankings(rankingsData);
      setLastUpdated(strengthResponse.timestamp);
    } catch (error) {
      console.error('Error loading currency strength data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load trend data for selected currency
  const loadTrendData = async (currency: string) => {
    try {
      const trend = await currencyStrengthService.getStrengthTrend(currency, 7);
      if (trend) {
        setTrendData(trend.data);
      }
    } catch (error) {
      console.error('Error loading trend data:', error);
    }
  };

  // Load comparison data
  const loadComparisonData = async (base: string, quote: string) => {
    try {
      const comparisonData = await currencyStrengthService.getCurrencyComparison(base, quote);
      setComparison(comparisonData);
    } catch (error) {
      console.error('Error loading comparison data:', error);
    }
  };

  // Initial load
  useEffect(() => {
    loadStrengthData();
  }, []);

  // Load trend data when selected currency changes
  useEffect(() => {
    if (selectedCurrency) {
      loadTrendData(selectedCurrency);
    }
  }, [selectedCurrency]);

  // Load comparison data when currencies change
  useEffect(() => {
    if (baseCurrency && quoteCurrency) {
      loadComparisonData(baseCurrency, quoteCurrency);
    }
  }, [baseCurrency, quoteCurrency]);

  // Get trend icon and color
  const getTrendIcon = (trend: 'bullish' | 'bearish' | 'neutral') => {
    switch (trend) {
      case 'bullish':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'bearish':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get strength color based on value
  const getStrengthColor = (strength: number): string => {
    if (strength >= 80) return 'bg-green-500';
    if (strength >= 65) return 'bg-green-400';
    if (strength >= 50) return 'bg-yellow-500';
    if (strength >= 35) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Get change color
  const getChangeColor = (change: number): string => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Currency Strength Meter</h2>
          <p className="text-gray-600">Real-time analysis of major currency strength</p>
        </div>
        <Button 
          onClick={loadStrengthData} 
          disabled={loading}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="text-sm text-gray-500">
          Last updated: {new Date(lastUpdated).toLocaleString()}
        </div>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rankings">Rankings</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {strengthData.map((currency) => (
              <Card key={currency.currency} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-bold">
                      {currency.currency}
                    </CardTitle>
                    {getTrendIcon(currency.trend)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Strength Meter */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Strength</span>
                      <span className="font-semibold">{currency.strength.toFixed(1)}</span>
                    </div>
                    <Progress 
                      value={currency.strength} 
                      className="h-2"
                    />
                  </div>

                  {/* 24h Change */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">24h Change</span>
                    <Badge 
                      variant={currency.change24h >= 0 ? "default" : "destructive"}
                      className={`${currency.change24h >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {currency.change24h >= 0 ? '+' : ''}{currency.change24h.toFixed(2)}%
                    </Badge>
                  </div>

                  {/* Volume */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Volume</span>
                    <span className="font-medium">
                      {(currency.volume / 1000000).toFixed(1)}M
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Rankings Tab */}
        <TabsContent value="rankings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span>Currency Strength Rankings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rankings.map((ranking, index) => (
                  <div 
                    key={ranking.currency}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold text-sm">
                        {ranking.rank}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{ranking.currency}</h3>
                        <p className="text-sm text-gray-600">{ranking.strengthLabel}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-bold text-lg" style={{ color: ranking.color }}>
                          {ranking.strength.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-500">Strength Score</div>
                      </div>
                      <div 
                        className="w-3 h-16 rounded-full"
                        style={{ backgroundColor: ranking.color }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Currency Strength Trends</CardTitle>
              <div className="flex space-x-2">
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {currencyStrengthService.getSupportedCurrencies().map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      domain={[0, 100]}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toFixed(1)}`, 'Strength']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="strength" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {/* Current strength info */}
              {strengthData.find(c => c.currency === selectedCurrency) && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-blue-900">
                        Current {selectedCurrency} Strength
                      </h4>
                      <p className="text-blue-700">
                        {strengthData.find(c => c.currency === selectedCurrency)?.strength.toFixed(1)} / 100
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getChangeColor(
                        strengthData.find(c => c.currency === selectedCurrency)?.change24h || 0
                      )}`}>
                        24h: {strengthData.find(c => c.currency === selectedCurrency)?.change24h >= 0 ? '+' : ''}
                        {strengthData.find(c => c.currency === selectedCurrency)?.change24h.toFixed(2)}%
                      </div>
                      <div className="text-sm text-blue-600">
                        {strengthData.find(c => c.currency === selectedCurrency)?.trend}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Currency Strength Comparison</CardTitle>
              <div className="flex space-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Currency
                  </label>
                  <select
                    value={baseCurrency}
                    onChange={(e) => setBaseCurrency(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {currencyStrengthService.getSupportedCurrencies().map(currency => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quote Currency
                  </label>
                  <select
                    value={quoteCurrency}
                    onChange={(e) => setQuoteCurrency(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {currencyStrengthService.getSupportedCurrencies().map(currency => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {comparison && (
                <div className="space-y-6">
                  {/* Strength Comparison Chart */}
                  <div style={{ height: '200px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { currency: comparison.base.currency, strength: comparison.base.strength },
                        { currency: comparison.quote.currency, strength: comparison.quote.strength }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="currency" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Bar 
                          dataKey="strength" 
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Comparison Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">{comparison.base.currency}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span>Strength</span>
                          <span className="font-semibold">{comparison.base.strength.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>24h Change</span>
                          <span className={getChangeColor(comparison.base.change24h)}>
                            {comparison.base.change24h >= 0 ? '+' : ''}{comparison.base.change24h.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Trend</span>
                          <div className="flex items-center space-x-1">
                            {getTrendIcon(comparison.base.trend)}
                            <span className="capitalize">{comparison.base.trend}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">{comparison.quote.currency}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span>Strength</span>
                          <span className="font-semibold">{comparison.quote.strength.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>24h Change</span>
                          <span className={getChangeColor(comparison.quote.change24h)}>
                            {comparison.quote.change24h >= 0 ? '+' : ''}{comparison.quote.change24h.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Trend</span>
                          <div className="flex items-center space-x-1">
                            {getTrendIcon(comparison.quote.trend)}
                            <span className="capitalize">{comparison.quote.trend}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Strength Difference */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Strength Difference</span>
                          <span className={`font-bold text-lg ${
                            comparison.strengthDiff > 0 ? 'text-green-600' : 
                            comparison.strengthDiff < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {comparison.strengthDiff > 0 ? '+' : ''}{comparison.strengthDiff.toFixed(1)} points
                          </span>
                        </div>
                        
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-semibold text-blue-900 mb-2">Trading Recommendation</h4>
                          <p className="text-blue-800">{comparison.recommendation}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CurrencyStrengthMeter;
