import React, { useState, useEffect } from 'react';
import { Calendar, Clock, TrendingUp, AlertCircle, BarChart3, Plus, FileText, ExternalLink, Save, X } from 'lucide-react';
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
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<NewsEvent>>({
    impact: 'Medium',
    date: new Date().toISOString().split('T')[0],
    time: '08:30'
  });

  // Load events from localStorage on component mount
  useEffect(() => {
    const savedEvents = localStorage.getItem('newsEvents');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    } else {
      // Load sample events for demonstration
      const sampleEvents: NewsEvent[] = [
        {
          id: '1',
          title: 'Core CPI m/m',
          date: new Date().toISOString().split('T')[0],
          time: '08:30',
          impact: 'High',
          actual: '0.3%',
          forecast: '0.2%',
          previous: '0.3%',
          marketImpact: 'USD Strengthened, indices dropped 0.5%',
          notes: 'Higher than expected inflation reading caused immediate USD buying',
          precautions: 'Avoid EUR/USD longs, watch for volatility spikes',
          tradingPlan: 'Wait for initial spike to settle, then look for USD strength continuation'
        },
        {
          id: '2',
          title: 'Initial Jobless Claims',
          date: new Date().toISOString().split('T')[0],
          time: '08:30',
          impact: 'Medium',
          forecast: '210K',
          previous: '219K',
          notes: 'Weekly unemployment measure - watch for labor market trends',
          precautions: 'Lower impact but can affect USD if significantly different from forecast'
        }
      ];
      setEvents(sampleEvents);
      localStorage.setItem('newsEvents', JSON.stringify(sampleEvents));
    }
  }, []);

  // Save events to localStorage whenever events change
  useEffect(() => {
    localStorage.setItem('newsEvents', JSON.stringify(events));
  }, [events]);

  const addEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      toast({
        title: "Missing Information",
        description: "Please fill in title, date, and time",
        variant: "destructive",
      });
      return;
    }

    const event: NewsEvent = {
      id: Date.now().toString(),
      title: newEvent.title!,
      date: newEvent.date!,
      time: newEvent.time!,
      impact: newEvent.impact as 'High' | 'Medium' | 'Low',
      actual: newEvent.actual,
      forecast: newEvent.forecast,
      previous: newEvent.previous,
      marketImpact: newEvent.marketImpact,
      notes: newEvent.notes,
      precautions: newEvent.precautions,
      tradingPlan: newEvent.tradingPlan
    };

    setEvents([...events, event]);
    setNewEvent({
      impact: 'Medium',
      date: new Date().toISOString().split('T')[0],
      time: '08:30'
    });
    setShowAddEvent(false);
    
    toast({
      title: "Event Added",
      description: "News event has been saved to your journal",
    });
  };

  const updateEvent = (id: string, updates: Partial<NewsEvent>) => {
    setEvents(events.map(event => 
      event.id === id ? { ...event, ...updates } : event
    ));
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter(event => event.id !== id));
    toast({
      title: "Event Deleted",
      description: "News event removed from your journal",
    });
  };

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

  const todaysEvents = events.filter(event => event.date === new Date().toISOString().split('T')[0]);
  const thisWeekEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    return eventDate >= weekStart && eventDate <= weekEnd;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">News & Market Events</h1>
          <p className="text-gray-600 mt-1">Track economic events and their market impact</p>
        </div>
        
        <Button onClick={() => setShowAddEvent(true)} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Event</span>
        </Button>
      </div>

      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="events">My Events</TabsTrigger>
          <TabsTrigger value="calendar">Economic Calendar</TabsTrigger>
          <TabsTrigger value="analysis">Market Analysis</TabsTrigger>
        </TabsList>

        {/* Economic Calendar Widget Tab */}
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Live Economic Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                    <h3 className="font-semibold text-green-900">Live Economic Calendar</h3>
                  </div>
                  <p className="text-green-700 text-sm">
                    Real-time economic events and market data from Investing.com. The calendar shows USD events with forecast vs actual data.
                  </p>
                </div>

                {/* Investing.com Economic Calendar Widget */}
                <div className="border rounded-lg overflow-hidden bg-white">
                  <iframe 
                    src="https://sslecal2.investing.com?columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&features=datepicker,timezone&countries=5&calType=week&timeZone=8&lang=1" 
                    width="100%" 
                    height="467" 
                    frameBorder="0" 
                    allowTransparency={true} 
                    marginWidth="0" 
                    marginHeight="0"
                    title="Investing.com Economic Calendar"
                    className="w-full"
                  />
                  <div className="text-center py-2 bg-gray-50 text-xs text-gray-600">
                    Real Time Economic Calendar provided by{' '}
                    <a 
                      href="https://www.investing.com/" 
                      target="_blank" 
                      rel="nofollow noopener noreferrer" 
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      Investing.com
                    </a>
                  </div>
                </div>

                {/* Backup: TradingView Widget */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Alternative: TradingView Economic Calendar</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <iframe
                      src="https://www.tradingview.com/embed-widget/events/?locale=en#%7B%22colorTheme%22%3A%22light%22%2C%22isTransparent%22%3Afalse%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22400%22%2C%22importanceFilter%22%3A%22-1%2C0%2C1%22%2C%22countryFilter%22%3A%22US%22%2C%22utm_source%22%3A%22localhost%22%2C%22utm_medium%22%3A%22widget_new%22%2C%22utm_campaign%22%3A%22events%22%7D"
                      width="100%"
                      height="400"
                      frameBorder="0"
                      title="TradingView Economic Calendar"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                  <div className="flex items-center mb-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                    <h3 className="font-semibold text-yellow-900">Widget Loading Issues?</h3>
                  </div>
                  <p className="text-yellow-700 text-sm mb-3">
                    If the economic calendar widgets aren't loading properly, you can access the full calendars directly:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://www.forexfactory.com/calendar" target="_blank" rel="noopener noreferrer">
                        Forex Factory
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://www.investing.com/economic-calendar/" target="_blank" rel="noopener noreferrer">
                        Investing.com
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://www.tradingview.com/economic-calendar/" target="_blank" rel="noopener noreferrer">
                        TradingView
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Recommended Approach</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>• Use external calendars for real-time data</p>
                      <p>• Track important events in "My Events" tab</p>
                      <p>• Log market reactions and patterns</p>
                      <p>• Build your personal event database</p>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">News Trading Tips</h3>
                    <ul className="text-green-700 text-sm space-y-1">
                      <li>• Focus on High impact USD events</li>
                      <li>• Check calendar before market open</li>
                      <li>• Note unusual market reactions</li>
                      <li>• Plan entries around major releases</li>
                      <li>• Wait for initial volatility to settle</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Events Tab */}
        <TabsContent value="events">
          <div className="space-y-4">
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
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">With Notes</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {events.filter(e => e.notes || e.marketImpact).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-green-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Today's Events</p>
                      <p className="text-2xl font-bold text-gray-900">{todaysEvents.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Events List */}
            <Card>
              <CardHeader>
                <CardTitle>Tracked Events</CardTitle>
              </CardHeader>
              <CardContent>
                {events.length > 0 ? (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <div key={event.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Badge className={getImpactColor(event.impact)}>
                              {getImpactIcon(event.impact)}
                              <span className="ml-1">{event.impact}</span>
                            </Badge>
                            <h3 className="font-semibold">{event.title}</h3>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            {new Date(event.date).toLocaleDateString()}
                            <Clock className="w-4 h-4 ml-2" />
                            {event.time}
                          </div>
                        </div>

                        {(event.actual || event.forecast || event.previous) && (
                          <div className="grid grid-cols-3 gap-4 text-sm bg-gray-50 p-3 rounded">
                            <div className="text-center">
                              <div className="text-gray-500 font-medium">Previous</div>
                              <div className="font-semibold text-gray-700">{event.previous || '-'}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-gray-500 font-medium">Forecast</div>
                              <div className="font-semibold text-blue-600">{event.forecast || '-'}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-gray-500 font-medium">Actual</div>
                              <div className={`font-semibold ${event.actual ? 'text-green-600' : 'text-gray-400'}`}>
                                {event.actual || 'Pending'}
                              </div>
                            </div>
                          </div>
                        )}

                        {event.marketImpact && (
                          <div className="bg-blue-50 p-3 rounded">
                            <div className="text-sm font-medium text-blue-900 mb-1">Market Impact</div>
                            <div className="text-blue-700">{event.marketImpact}</div>
                          </div>
                        )}

                        {event.notes && (
                          <div className="bg-yellow-50 p-3 rounded">
                            <div className="text-sm font-medium text-yellow-900 mb-1">Notes</div>
                            <div className="text-yellow-700">{event.notes}</div>
                          </div>
                        )}

                        {(event.precautions || event.tradingPlan) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {event.precautions && (
                              <div className="bg-red-50 p-3 rounded">
                                <div className="text-sm font-medium text-red-900 mb-1">Precautions</div>
                                <div className="text-red-700">{event.precautions}</div>
                              </div>
                            )}
                            {event.tradingPlan && (
                              <div className="bg-green-50 p-3 rounded">
                                <div className="text-sm font-medium text-green-900 mb-1">Trading Plan</div>
                                <div className="text-green-700">{event.tradingPlan}</div>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteEvent(event.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No events tracked yet. Add your first event to get started.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Market Analysis Tab */}
        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>Market Analysis Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Quick Analysis Template</h3>
                    <Textarea
                      placeholder="Event: &#10;Expected Impact: &#10;Market Reaction: &#10;Trading Opportunities: &#10;Lessons Learned: "
                      className="h-32"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Market Correlation Notes</h3>
                    <Textarea
                      placeholder="USD pairs reaction: &#10;Indices movement: &#10;Commodities impact: &#10;Volatility changes: &#10;Time-based patterns: "
                      className="h-32"
                    />
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Analysis Tips</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Track initial market reaction vs. sustained movement</li>
                    <li>• Note correlations between different currency pairs</li>
                    <li>• Record unusual market behavior during news releases</li>
                    <li>• Monitor volume spikes and volatility changes</li>
                    <li>• Document setup opportunities that emerge post-news</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Event Modal */}
      {showAddEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Add News Event</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    value={newEvent.title || ''}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    placeholder="e.g., Core CPI m/m"
                  />
                </div>
                <div>
                  <Label htmlFor="impact">Impact Level</Label>
                  <Select value={newEvent.impact} onValueChange={(value) => setNewEvent({...newEvent, impact: value as any})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEvent.date || ''}
                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newEvent.time || ''}
                    onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="previous">Previous</Label>
                  <Input
                    id="previous"
                    value={newEvent.previous || ''}
                    onChange={(e) => setNewEvent({...newEvent, previous: e.target.value})}
                    placeholder="e.g., 0.3%"
                  />
                </div>
                <div>
                  <Label htmlFor="forecast">Forecast</Label>
                  <Input
                    id="forecast"
                    value={newEvent.forecast || ''}
                    onChange={(e) => setNewEvent({...newEvent, forecast: e.target.value})}
                    placeholder="e.g., 0.2%"
                  />
                </div>
                <div>
                  <Label htmlFor="actual">Actual</Label>
                  <Input
                    id="actual"
                    value={newEvent.actual || ''}
                    onChange={(e) => setNewEvent({...newEvent, actual: e.target.value})}
                    placeholder="e.g., 0.4%"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newEvent.notes || ''}
                  onChange={(e) => setNewEvent({...newEvent, notes: e.target.value})}
                  placeholder="General notes about this event..."
                />
              </div>

              <div>
                <Label htmlFor="marketImpact">Market Impact</Label>
                <Textarea
                  id="marketImpact"
                  value={newEvent.marketImpact || ''}
                  onChange={(e) => setNewEvent({...newEvent, marketImpact: e.target.value})}
                  placeholder="How did the market react? USD strength, volatility changes, etc..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="precautions">Precautions</Label>
                  <Textarea
                    id="precautions"
                    value={newEvent.precautions || ''}
                    onChange={(e) => setNewEvent({...newEvent, precautions: e.target.value})}
                    placeholder="What to avoid during this event..."
                  />
                </div>
                <div>
                  <Label htmlFor="tradingPlan">Trading Plan</Label>
                  <Textarea
                    id="tradingPlan"
                    value={newEvent.tradingPlan || ''}
                    onChange={(e) => setNewEvent({...newEvent, tradingPlan: e.target.value})}
                    placeholder="Trading strategy for this event..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddEvent(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={addEvent}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Event
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default News;