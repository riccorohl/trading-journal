
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { X, Calendar, Clock, TrendingUp, TrendingDown, Target, Shield, DollarSign, BarChart3 } from 'lucide-react';
import { Trade } from '../types/trade';
import { useTradeContext } from '../contexts/TradeContext';

interface TradeReviewModalProps {
  trade: Trade | null;
  isOpen: boolean;
  onClose: () => void;
}

const TradeReviewModal: React.FC<TradeReviewModalProps> = ({ trade, isOpen, onClose }) => {
  const { updateTrade } = useTradeContext();
  const [notes, setNotes] = useState(trade?.notes || '');
  const [analysis, setAnalysis] = useState('');
  const [lessons, setLessons] = useState('');

  if (!trade) return null;

  const isProfitable = (trade.pnl || 0) >= 0;
  const rMultiple = trade.rMultiple || (trade.riskAmount && trade.pnl ? trade.pnl / trade.riskAmount : undefined);

  const handleSave = () => {
    updateTrade(trade.id, { notes });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-white">
          <div className="flex items-center space-x-4">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{trade.symbol}</h1>
              <p className="text-gray-500">
                {new Date(trade.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} • {trade.timeIn}
              </p>
            </div>
            <div className="flex space-x-2">
              <Badge variant={trade.side === 'long' ? 'default' : 'destructive'}>
                {trade.side.toUpperCase()}
              </Badge>
              <Badge variant={trade.status === 'closed' ? 'secondary' : 'default'}>
                {trade.status.toUpperCase()}
              </Badge>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex h-full overflow-hidden">
          {/* Left Sidebar - Trade Stats */}
          <div className="w-80 border-r bg-gray-50 flex flex-col p-6 space-y-6">
            {/* P&L Overview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  P&L
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trade.pnl !== undefined ? (
                  <div className={`text-3xl font-bold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                    {isProfitable ? '+' : ''}${trade.pnl.toFixed(2)}
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-gray-500">--</div>
                )}
                {rMultiple && (
                  <p className={`text-sm mt-1 ${rMultiple >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {rMultiple.toFixed(2)}R
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Trade Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Trade Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Contracts</Label>
                    <p className="text-lg font-semibold">{trade.quantity}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Direction</Label>
                    <p className={`text-lg font-semibold ${trade.side === 'long' ? 'text-green-600' : 'text-red-600'}`}>
                      {trade.side === 'long' ? 'LONG' : 'SHORT'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Entry Price</Label>
                    <p className="text-lg font-semibold">${trade.entryPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Exit Price</Label>
                    <p className="text-lg font-semibold">
                      {trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : '--'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Timeframe</Label>
                    <p className="text-lg font-semibold">{trade.timeframe || '--'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Strategy</Label>
                    <p className="text-lg font-semibold">{trade.strategy || '--'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Management */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Risk Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Stop Loss</Label>
                  <p className="text-lg font-semibold">
                    {trade.stopLoss ? `$${trade.stopLoss.toFixed(2)}` : 'Not set'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Take Profit</Label>
                  <p className="text-lg font-semibold">
                    {trade.takeProfit ? `$${trade.takeProfit.toFixed(2)}` : 'Not set'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Risk Amount</Label>
                  <p className="text-lg font-semibold">
                    {trade.riskAmount ? `$${trade.riskAmount.toFixed(2)}` : 'Not specified'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Confidence</Label>
                  <p className="text-lg font-semibold">
                    {trade.confidence ? `${trade.confidence}/10` : 'Not rated'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Market Context */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Market Context</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Market Conditions</Label>
                  <p className="text-sm">{trade.marketConditions || 'Not specified'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Emotions</Label>
                  <p className="text-sm">{trade.emotions || 'Not specified'}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Main Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Tabs defaultValue="chart" className="flex flex-col h-full">
              <div className="border-b bg-white">
                <TabsList className="w-full justify-start h-12 bg-transparent border-0 rounded-none">
                  <TabsTrigger 
                    value="chart" 
                    className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
                  >
                    Chart & Analysis
                  </TabsTrigger>
                  <TabsTrigger 
                    value="notes" 
                    className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
                  >
                    Trade Notes
                  </TabsTrigger>
                  <TabsTrigger 
                    value="review" 
                    className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
                  >
                    Review & Analysis
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="chart" className="h-full m-0 p-6">
                  {/* TradingView Chart Placeholder */}
                  <div className="h-full bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center">
                    <BarChart3 className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">TradingView Chart Integration</h3>
                    <p className="text-gray-500 text-center max-w-md mb-4">
                      Chart will show {trade.symbol} with entry at ${trade.entryPrice.toFixed(2)} 
                      {trade.exitPrice && ` and exit at $${trade.exitPrice.toFixed(2)}`}
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Integration Guide:</strong> Add TradingView widget with the following configuration:
                      </p>
                      <ul className="text-xs text-blue-700 mt-2 list-disc list-inside">
                        <li>Symbol: {trade.symbol}</li>
                        <li>Entry level: ${trade.entryPrice.toFixed(2)}</li>
                        {trade.exitPrice && <li>Exit level: ${trade.exitPrice.toFixed(2)}</li>}
                        {trade.stopLoss && <li>Stop loss: ${trade.stopLoss.toFixed(2)}</li>}
                        {trade.takeProfit && <li>Take profit: ${trade.takeProfit.toFixed(2)}</li>}
                      </ul>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="h-full m-0 p-6">
                  <div className="h-full flex flex-col space-y-4">
                    <div>
                      <Label htmlFor="trade-notes" className="text-base font-semibold">Trade Notes & Observations</Label>
                      <Textarea
                        id="trade-notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Enter your detailed notes about this trade: setup, execution, market context, what you observed..."
                        className="mt-2 min-h-[300px] resize-none"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                        Save Notes
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="review" className="h-full m-0 p-6 overflow-y-auto">
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="trade-analysis" className="text-base font-semibold">Trade Analysis</Label>
                      <Textarea
                        id="trade-analysis"
                        value={analysis}
                        onChange={(e) => setAnalysis(e.target.value)}
                        placeholder="What worked well? What could have been done better? How did the setup play out vs expectations?"
                        className="mt-2 min-h-[150px] resize-none"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="lessons-learned" className="text-base font-semibold">Lessons Learned</Label>
                      <Textarea
                        id="lessons-learned"
                        value={lessons}
                        onChange={(e) => setLessons(e.target.value)}
                        placeholder="Key takeaways from this trade. What will you do differently next time?"
                        className="mt-2 min-h-[150px] resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            What Went Well
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Textarea
                            placeholder="Execution, timing, risk management, discipline..."
                            className="min-h-[100px] resize-none"
                          />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <TrendingDown className="w-4 h-4" />
                            Areas for Improvement
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Textarea
                            placeholder="Mistakes, missed signals, emotional reactions..."
                            className="min-h-[100px] resize-none"
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-white">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TradeReviewModal;
