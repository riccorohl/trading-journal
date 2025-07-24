import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  Globe, 
  Clock,
  ExternalLink,
  RefreshCw,
  Zap
} from 'lucide-react';

// Types for news and economic data
interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
  source: string;
  impact: 'high' | 'medium' | 'low';
  category: 'central-bank' | 'employment' | 'inflation' | 'gdp' | 'trade' | 'general';
}

interface EconomicEvent {
  id: string;
  name: string;
  country: string;
  currency: string;
  date: string;
  time: string;
  impact: 'high' | 'medium' | 'low';
  forecast: string;
  previous: string;
  actual?: string;
}

const News: React.FC = () => {
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [economicEvents, setEconomicEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sample data for development
  const sampleNews: NewsItem[] = [
    {
      id: '1',
      title: 'Fed Signals Pause in Rate Hikes Amid Banking Concerns',
      summary: 'Federal Reserve officials hint at potential pause in aggressive rate hiking cycle as regional banking stress emerges.',
      url: '#',
      publishedAt: '2025-07-23T14:30:00Z',
      source: 'Reuters',
      impact: 'high',
      category: 'central-bank'
    },
    {
      id: '2',
      title: 'EUR/USD Volatility Expected Ahead of ECB Decision',
      summary: 'European Central Bank meeting expected to drive significant currency pair movements this week.',
      url: '#',
      publishedAt: '2025-07-23T12:15:00Z',
      source: 'Bloomberg',
      impact: 'high',
      category: 'central-bank'
    },
    {
      id: '3',
      title: 'U.S. Employment Data Shows Mixed Signals',
      summary: 'Latest job market indicators present conflicting views on economic strength.',
      url: '#',
      publishedAt: '2025-07-23T10:45:00Z',
      source: 'MarketWatch',
      impact: 'medium',
      category: 'employment'
    }
  ];

  const sampleEvents: EconomicEvent[] = [
    {
      id: '1',
      name: 'Federal Reserve Interest Rate Decision',
      country: 'United States',
      currency: 'USD',
      date: '2025-07-24',
      time: '18:00',
      impact: 'high',
      forecast: '5.50%',
      previous: '5.25%'
    },
    {
      id: '2',
      name: 'Eurozone CPI Flash Estimate y/y',
      country: 'Eurozone',
      currency: 'EUR',
      date: '2025-07-25',
      time: '09:00',
      impact: 'high',
      forecast: '2.8%',
      previous: '2.9%'
    },
    {
      id: '3',
      name: 'GDP Growth Rate q/q',
      country: 'United Kingdom',
      currency: 'GBP',
      date: '2025-07-25',
      time: '06:00',
      impact: 'medium',
      forecast: '0.3%',
      previous: '0.1%'
    }
  ];

  useEffect(() => {
    // Initialize with sample data
    setNewsData(sampleNews);
    setEconomicEvents(sampleEvents);
  }, []);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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
        <Button 
          onClick={() => setLoading(!loading)} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* API Research Alert */}
      <Alert>
        <Globe className="h-4 w-4" />
        <AlertDescription>
          <strong>Phase 4 Development:</strong> This section will integrate with economic news APIs. 
          Research in progress for: ForexFactory API, NewsAPI, Alpha Vantage, and Financial Modeling Prep.
        </AlertDescription>
      </Alert>

      {/* Main Content Tabs */}
      <Tabs defaultValue="news" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="news">Market News</TabsTrigger>
          <TabsTrigger value="calendar">Economic Calendar</TabsTrigger>
          <TabsTrigger value="analysis">Impact Analysis</TabsTrigger>
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
          <div className="grid gap-4">
            {economicEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className={getImpactColor(event.impact)}>
                          {getImpactIcon(event.impact)}
                          <span className="ml-1 capitalize">{event.impact}</span>
                        </Badge>
                        <span className="text-sm font-medium text-gray-700">{event.currency}</span>
                      </div>
                      <h3 className="font-semibold text-lg">{event.name}</h3>
                      <p className="text-gray-600">{event.country}</p>
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
                      <p className="font-medium">{event.actual || '—'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Impact Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Impact Analysis</CardTitle>
              <CardDescription>
                How economic events and news affect currency pairs and trading opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Coming Soon:</strong> AI-powered analysis of how news events correlate with your trading performance and currency pair movements.
                  </AlertDescription>
                </Alert>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">High Impact Events Today</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Fed Rate Decision</span>
                        <Badge className="bg-red-100 text-red-800">USD</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">ECB Press Conference</span>
                        <Badge className="bg-blue-100 text-blue-800">EUR</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Recommended Pairs to Watch</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">EUR/USD</span>
                        <Badge variant="outline">High Volatility Expected</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">GBP/USD</span>
                        <Badge variant="outline">Medium Volatility</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default News;