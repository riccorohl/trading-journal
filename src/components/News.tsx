import React, { useState, useEffect } from 'react';
import { Calendar, Clock, TrendingUp, AlertCircle, BarChart3, Plus, FileText, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from './ui/use-toast';

interface NewsEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  impact: 'High' | 'Medium' | 'Low';
  actual?: string;
  forecast?: string;
  previous?: string;
  marketImpact?: string;
  notes?: string;
  precautions?: string;
  tradingPlan?: string;
}

const News: React.FC = () => {
  const [events, setEvents] = useState<NewsEvent[]>([]);
  const [activeTab, setActiveTab] = useState('calendar');
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<NewsEvent>>({
    impact: 'Medium',
    date: new Date().toISOString().split('T')[0]
  });

  // Fetch economic events using the service
  const loadEconomicEvents = async (startDate: string, endDate: string) => {
    setLoading(true);
    try {
      const events = await fetchEconomicEvents(startDate, endDate, ['USD']);
      setEvents(events);
      
      // Log the MyFXBook URL for reference
      const xmlUrl = generateMyFXBookURL(startDate, endDate, ['USD']);
      console.log('MyFXBook XML URL:', xmlUrl);
      
      toast({
        title: "Economic Events Loaded",
        description: `Loaded ${events.length} USD economic events`,
      });
    } catch (error) {
      console.error('Error fetching economic events:', error);
      toast({
        title: "Error Loading Events",
        description: "Failed to load economic calendar data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // For testing, let's try a wider date range that's more likely to have events
    const dateRange = viewType === 'today' ? getWeekRange() : getWeekRange(); // Use week range for both for now
    loadEconomicEvents(dateRange.start, dateRange.end);
  }, [viewType]);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'High': return <AlertCircle className="w-4 h-4" />;
      case 'Medium': return <BarChart3 className="w-4 h-4" />;
      case 'Low': return <TrendingUp className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const formatTime = (time: string) => {
    return time || 'All Day';
  };

  const formatDate = (date: string) => {
    if (!date) return '';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return date;
    }
  };

  const EventCard: React.FC<{ event: EconomicEvent }> = ({ event }) => (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge className={getImpactColor(event.impact)}>
              {getImpactIcon(event.impact)}
              <span className="ml-1">{event.impact}</span>
            </Badge>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              {formatTime(event.time)}
            </div>
            {viewType === 'week' && event.date && (
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDate(event.date)}
              </div>
            )}
          </div>
          <Badge variant="outline">{event.currency}</Badge>
        </div>
        <CardTitle className="text-lg">{event.title}</CardTitle>
      </CardHeader>
      
      <CardContent>
        {event.description && (
          <p className="text-sm text-gray-600 mb-3">{event.description}</p>
        )}
        
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-gray-500 font-medium">Previous</div>
            <div className="text-lg font-semibold text-gray-700">
              {event.previous || '-'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-500 font-medium">Forecast</div>
            <div className="text-lg font-semibold text-blue-600">
              {event.forecast || '-'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-500 font-medium">Actual</div>
            <div className={`text-lg font-semibold ${
              event.actual ? 'text-green-600' : 'text-gray-400'
            }`}>
              {event.actual || 'Pending'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Economic Calendar</h1>
          <p className="text-gray-600 mt-1">USD economic events and announcements</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={viewType === 'today' ? 'default' : 'outline'}
            onClick={() => setViewType('today')}
            size="sm"
          >
            Today
          </Button>
          <Button
            variant={viewType === 'week' ? 'default' : 'outline'}
            onClick={() => setViewType('week')}
            size="sm"
          >
            This Week
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Impact</p>
                <p className="text-2xl font-bold text-gray-900">
                  {events.filter(e => e.impact === 'High').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Medium Impact</p>
                <p className="text-2xl font-bold text-gray-900">
                  {events.filter(e => e.impact === 'Medium').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Impact</p>
                <p className="text-2xl font-bold text-gray-900">
                  {events.filter(e => e.impact === 'Low').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{events.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            {viewType === 'today' ? "Today's Events" : "This Week's Events"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading economic events...</span>
            </div>
          ) : events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No economic events found for the selected period.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Integration Note */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            API Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-700 text-sm">
            This news section is configured to use MyFXBook's free economic calendar XML feed. 
            The data shown above is sample data. To enable live data fetching, a CORS proxy 
            or backend service will need to be implemented to access the MyFXBook API endpoint.
          </p>
          <p className="text-blue-600 text-xs mt-2">
            MyFXBook URL: http://www.myfxbook.com/calendar_statement.xml?filter=2-3_USD
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default News;