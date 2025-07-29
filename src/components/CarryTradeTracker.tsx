import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle, 
  Activity,
  Clock,
  Target,
  Shield,
  RefreshCw,
  Info
} from 'lucide-react';
import { 
  carryTradeService,
  type InterestRate,
  type CarryTradeOpportunity,
  type CarryTradeAnalysis
} from '@/lib/carryTradeService';

const CarryTradeTracker: React.FC = () => {
  const [analysis, setAnalysis] = useState<CarryTradeAnalysis | null>(null);
  const [interestRates, setInterestRates] = useState<InterestRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [analysisData, ratesData] = await Promise.all([
        carryTradeService.getCarryTradeAnalysis(),
        carryTradeService.getInterestRates()
      ]);
      
      setAnalysis(analysisData);
      setInterestRates(ratesData);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error loading carry trade data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
        <span className="ml-2 text-gray-600">Loading carry trade analysis...</span>
      </div>
    );
  }

  if (!analysis) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Data Unavailable</AlertTitle>
        <AlertDescription>
          Unable to load carry trade analysis. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Carry Trade Tracker</h2>
          <p className="text-gray-600">Interest rate differential analysis and carry trade opportunities</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">Last updated: {lastUpdated}</span>
          <Button 
            onClick={loadData} 
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Market Conditions Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Market Conditions: {analysis.marketConditions.carryTradeViability.toUpperCase()}</AlertTitle>
        <AlertDescription>
          {analysis.marketConditions.description}
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="opportunities" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="rates">Interest Rates</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {analysis.currentOpportunities.map((opportunity, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{opportunity.pair}</CardTitle>
                    <Badge className={
                      opportunity.recommendation === 'buy' || opportunity.recommendation === 'strong_buy'
                        ? 'bg-green-100 text-green-800'
                        : opportunity.recommendation === 'hold'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }>
                      {opportunity.recommendation.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <CardDescription>{opportunity.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">Interest Differential</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {opportunity.interestDifferential > 0 ? '+' : ''}{opportunity.interestDifferential.toFixed(2)}%
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">Annualized Carry</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {opportunity.annualizedCarry.toFixed(0)} bps
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Risk/Reward Ratio</span>
                      <span className="font-medium">{opportunity.riskReward.toFixed(2)}</span>
                    </div>
                    <Progress value={Math.min(opportunity.riskReward * 100, 100)} className="h-2" />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Risk Level</span>
                    <Badge className={
                      opportunity.riskLevel === 'low' 
                        ? 'bg-green-100 text-green-800'
                        : opportunity.riskLevel === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }>
                      {opportunity.riskLevel.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Volatility</span>
                    <span className="font-medium">{opportunity.volatility.toFixed(1)}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Current Interest Rates
              </CardTitle>
              <CardDescription>Central bank interest rates for major currencies</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={interestRates.map(rate => ({
                  currency: rate.currency,
                  rate: rate.rate,
                  fill: rate.trend === 'up' ? '#10b981' : rate.trend === 'down' ? '#ef4444' : '#6b7280'
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="currency" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`${value}%`, 'Interest Rate']} />
                  <Bar dataKey="rate" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {interestRates.map((rate, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{rate.currency}</CardTitle>
                    {rate.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : rate.trend === 'down' ? (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    ) : (
                      <Activity className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                  <CardDescription>{rate.centralBank}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl font-bold">{rate.rate.toFixed(2)}%</div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Trend:</span>
                      <span className="capitalize font-medium">{rate.trend}</span>
                    </div>
                    {rate.nextMeetingDate && (
                      <div className="flex justify-between">
                        <span>Next Meeting:</span>
                        <span className="font-medium">
                          {new Date(rate.nextMeetingDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Performance Metrics
              </CardTitle>
              <CardDescription>Key statistics for carry trade analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">+0.12%</div>
                  <div className="text-sm text-gray-600">Average Daily Return</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold">68%</div>
                  <div className="text-sm text-gray-600">Win Rate</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">+2.1%</div>
                  <div className="text-sm text-gray-600">Best Day</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">-1.8%</div>
                  <div className="text-sm text-gray-600">Worst Day</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Performing Pairs</CardTitle>
              <CardDescription>Best carry trade opportunities by return</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.currentOpportunities
                  .filter(opp => opp.interestDifferential > 0)
                  .slice(0, 4)
                  .map((opp, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{opp.pair}</div>
                          <div className="text-sm text-gray-600">{opp.riskLevel} risk</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">+{opp.interestDifferential.toFixed(2)}%</div>
                        <div className="text-sm text-gray-600">{opp.annualizedCarry} bps</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Average Volatility</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysis.riskMetrics.averageVolatility}%</div>
                <p className="text-sm text-gray-500">Annualized volatility</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Max Drawdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{analysis.riskMetrics.maxDrawdown}%</div>
                <p className="text-sm text-gray-500">Worst period decline</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Sharpe Ratio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysis.riskMetrics.sharpeRatio}</div>
                <p className="text-sm text-gray-500">Risk-adjusted return</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Correlation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysis.riskMetrics.correlation}</div>
                <p className="text-sm text-gray-500">Market correlation</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Risk Recommendations
              </CardTitle>
              <CardDescription>Based on current market conditions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Position Sizing</AlertTitle>
                <AlertDescription>
                  Limit individual carry trade positions to 2-3% of portfolio during current volatility environment.
                </AlertDescription>
              </Alert>

              <Alert>
                <Clock className="h-4 w-4" />
                <AlertTitle>Monitoring</AlertTitle>
                <AlertDescription>
                  Review positions daily during high-impact economic events and central bank meetings.
                </AlertDescription>
              </Alert>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Diversification</AlertTitle>
                <AlertDescription>
                  Spread exposure across multiple currency pairs to reduce correlation risk.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CarryTradeTracker;
