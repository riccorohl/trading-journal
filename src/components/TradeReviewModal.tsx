import React, { useState } from 'react';
import { X, Calendar, DollarSign, TrendingUp, Brain } from 'lucide-react';
import TradingViewLightweightChart from './TradingViewLightweightChart';
import TradingViewFallback from './TradingViewFallback';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Trade {
  id: string;
  symbol: string;
  date: string;
  timeIn: string;
  timeOut?: string;
  side: 'long' | 'short';
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  stopLoss?: number;
  takeProfit?: number;
  pnl?: number;
  commission?: number;
  strategy?: string;
  notes?: string;
  confidence?: number;
  emotions?: string;
  marketConditions?: string;
  lessons?: string;
  analysis?: string;
}

interface TradeReviewModalProps {
  trade: Trade | null;
  isOpen: boolean;
  onClose: () => void;
}

const TradeReviewModal: React.FC<TradeReviewModalProps> = ({
  trade,
  isOpen,
  onClose,
}) => {
  // Don't render if trade is null - MUST be before any hooks
  if (!trade) {
    return null;
  }

  const [notes, setNotes] = useState(trade.notes || '');
  const [analysis, setAnalysis] = useState(trade.analysis || '');
  const [lessons, setLessons] = useState(trade.lessons || '');

  const rMultiple = trade.pnl && trade.stopLoss 
    ? Math.abs(trade.pnl / (Math.abs(trade.entryPrice - trade.stopLoss) * trade.quantity))
    : 0;

  const handleSave = () => {
    // In a real app, you'd save the updated notes/analysis
    console.log('Saving trade review:', { notes, analysis, lessons });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold">{trade.symbol}</span>
              <Badge variant={trade.side === 'long' ? 'default' : 'destructive'}>
                {trade.side.toUpperCase()}
              </Badge>
              <Badge variant={trade.pnl && trade.pnl >= 0 ? 'default' : 'destructive'}>
                {trade.pnl ? `${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toFixed(2)}` : 'Open'}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-12 gap-6 h-[80vh]">
          {/* Chart Section */}
          <div className="col-span-8">
            <Tabs defaultValue="chart" className="h-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="chart">Chart</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chart" className="h-[calc(100%-3rem)] mt-4">
                <React.Suspense fallback={<TradingViewFallback trade={trade} className="h-full" />}>
                  <TradingViewLightweightChart 
                    trade={trade} 
                    className="h-full"
                  />
                </React.Suspense>
              </TabsContent>
              
              <TabsContent value="analysis" className="h-[calc(100%-3rem)] mt-4">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Trade Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[calc(100%-5rem)]">
                    <Textarea
                      placeholder="What worked? What didn't? Market conditions, entry timing, exit strategy..."
                      value={analysis}
                      onChange={(e) => setAnalysis(e.target.value)}
                      className="h-full resize-none"
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notes" className="h-[calc(100%-3rem)] mt-4">
                <div className="space-y-4 h-full">
                  <Card className="h-1/2">
                    <CardHeader>
                      <CardTitle>Trade Notes</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[calc(100%-4rem)]">
                      <Textarea
                        placeholder="General notes about this trade..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="h-full resize-none"
                      />
                    </CardContent>
                  </Card>
                  
                  <Card className="h-1/2">
                    <CardHeader>
                      <CardTitle>Lessons Learned</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[calc(100%-4rem)]">
                      <Textarea
                        placeholder="Key takeaways for future trades..."
                        value={lessons}
                        onChange={(e) => setLessons(e.target.value)}
                        className="h-full resize-none"
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Stats Sidebar */}
          <div className="col-span-4 space-y-4 overflow-y-auto">
            {/* Trade Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Trade Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-600">Date</div>
                    <div className="font-medium">{trade.date}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Quantity</div>
                    <div className="font-medium">{trade.quantity}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Time In</div>
                    <div className="font-medium">{trade.timeIn || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Time Out</div>
                    <div className="font-medium">{trade.timeOut || 'N/A'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* P&L Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  P&L Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-600">Entry Price</div>
                    <div className="font-medium">${trade.entryPrice}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Exit Price</div>
                    <div className="font-medium">{trade.exitPrice ? `$${trade.exitPrice}` : 'Open'}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Gross P&L</div>
                    <div className={`font-medium ${trade.pnl && trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {trade.pnl ? `${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toFixed(2)}` : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Commission</div>
                    <div className="font-medium">${trade.commission || 0}</div>
                  </div>
                  {rMultiple > 0 && (
                    <div className="col-span-2">
                      <div className="text-gray-600">R-Multiple</div>
                      <div className={`font-medium ${rMultiple >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                        {rMultiple.toFixed(2)}R
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Risk Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Risk Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-600">Stop Loss</div>
                    <div className="font-medium">{trade.stopLoss ? `$${trade.stopLoss}` : 'None'}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Take Profit</div>
                    <div className="font-medium">{trade.takeProfit ? `$${trade.takeProfit}` : 'None'}</div>
                  </div>
                  {trade.stopLoss && (
                    <>
                      <div>
                        <div className="text-gray-600">Risk Per Share</div>
                        <div className="font-medium">
                          ${Math.abs(trade.entryPrice - trade.stopLoss).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Total Risk</div>
                        <div className="font-medium">
                          ${(Math.abs(trade.entryPrice - trade.stopLoss) * trade.quantity).toFixed(2)}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Strategy & Psychology */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Strategy & Psychology
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <div className="text-gray-600 mb-1">Strategy</div>
                  <div className="font-medium">{trade.strategy || 'Not specified'}</div>
                </div>
                {trade.confidence && (
                  <div className="text-sm">
                    <div className="text-gray-600 mb-1">Confidence Level</div>
                    <div className="font-medium">{trade.confidence}/10</div>
                  </div>
                )}
                {trade.emotions && (
                  <div className="text-sm">
                    <div className="text-gray-600 mb-1">Emotions</div>
                    <div className="font-medium">{trade.emotions}</div>
                  </div>
                )}
                {trade.marketConditions && (
                  <div className="text-sm">
                    <div className="text-gray-600 mb-1">Market Conditions</div>
                    <div className="font-medium">{trade.marketConditions}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button onClick={handleSave} className="w-full">
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TradeReviewModal;