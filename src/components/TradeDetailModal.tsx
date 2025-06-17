
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CalendarDays, Clock, TrendingUp, TrendingDown, Target, Shield, DollarSign } from 'lucide-react';
import { Trade } from '../types/trade';

interface TradeDetailModalProps {
  trade: Trade | null;
  isOpen: boolean;
  onClose: () => void;
}

const TradeDetailModal: React.FC<TradeDetailModalProps> = ({ trade, isOpen, onClose }) => {
  if (!trade) return null;

  const isProfitable = (trade.pnl || 0) >= 0;
  const rMultiple = trade.rMultiple || (trade.riskAmount && trade.pnl ? trade.pnl / trade.riskAmount : undefined);

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl font-bold">{trade.symbol}</span>
            <Badge variant={trade.side === 'long' ? 'default' : 'destructive'}>
              {trade.side.toUpperCase()}
            </Badge>
            <Badge variant={trade.status === 'closed' ? 'secondary' : 'default'}>
              {trade.status.toUpperCase()}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trade Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Trade Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Entry Price</label>
                  <p className="text-lg font-semibold">${trade.entryPrice.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Exit Price</label>
                  <p className="text-lg font-semibold">
                    {trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : 'Not closed'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Quantity</label>
                  <p className="text-lg font-semibold">{trade.quantity}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Commission</label>
                  <p className="text-lg font-semibold">${trade.commission.toFixed(2)}</p>
                </div>
              </div>
              
              {trade.pnl !== undefined && (
                <div className="pt-4 border-t">
                  <label className="text-sm font-medium text-gray-500">P&L</label>
                  <p className={`text-2xl font-bold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                    {isProfitable ? '+' : ''}${trade.pnl.toFixed(2)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Risk Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Risk Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Stop Loss</label>
                  <p className="text-lg font-semibold">
                    {trade.stopLoss ? `$${trade.stopLoss.toFixed(2)}` : 'Not set'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Take Profit</label>
                  <p className="text-lg font-semibold">
                    {trade.takeProfit ? `$${trade.takeProfit.toFixed(2)}` : 'Not set'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Risk Amount</label>
                  <p className="text-lg font-semibold">
                    {trade.riskAmount ? `$${trade.riskAmount.toFixed(2)}` : 'Not specified'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">R-Multiple</label>
                  <p className={`text-lg font-semibold ${rMultiple && rMultiple >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {rMultiple ? `${rMultiple.toFixed(2)}R` : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trade Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                Trade Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Date</label>
                  <p className="text-lg font-semibold">{new Date(trade.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Time In</label>
                  <p className="text-lg font-semibold">{trade.timeIn}</p>
                </div>
                {trade.timeOut && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Time Out</label>
                    <p className="text-lg font-semibold">{trade.timeOut}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Timeframe</label>
                  <p className="text-lg font-semibold">{trade.timeframe || 'Not specified'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strategy & Psychology */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Strategy & Psychology
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Strategy</label>
                <p className="text-lg font-semibold">{trade.strategy || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Market Conditions</label>
                <p className="text-lg font-semibold">{trade.marketConditions || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Confidence Level</label>
                <p className="text-lg font-semibold">
                  {trade.confidence ? `${trade.confidence}/10` : 'Not rated'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Emotions</label>
                <p className="text-lg font-semibold">{trade.emotions || 'Not specified'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Risk/Reward</p>
                  <p className="text-lg font-semibold">
                    {trade.pnl && trade.stopLoss 
                      ? `1:${Math.abs(trade.pnl / (Math.abs(trade.entryPrice - trade.stopLoss) * trade.quantity)).toFixed(2)}`
                      : 'N/A'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hold Duration</p>
                  <p className="text-lg font-semibold">
                    {trade.exitDate 
                      ? `${Math.round((new Date(trade.exitDate).getTime() - new Date(trade.date).getTime()) / (1000 * 60 * 60 * 24))} days`
                      : 'Open'
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {trade.notes && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Trade Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{trade.notes}</p>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TradeDetailModal;
