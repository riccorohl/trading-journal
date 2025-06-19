import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  X, 
  Edit3, 
  Save, 
  XCircle, 
  DollarSign, 
  Calendar, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Shield, 
  Brain, 
  FileText,
  BarChart3,
  ImageIcon,
  Upload
} from 'lucide-react';
import { Trade } from '../types/trade';
import { useTradeContext } from '../contexts/TradeContext';
import { formatDateForTable } from '../lib/dateUtils';

interface TradeModalProps {
  trade: Trade | null;
  isOpen: boolean;
  onClose: () => void;
}

const TradeModal: React.FC<TradeModalProps> = ({ trade, isOpen, onClose }) => {
  const { updateTrade } = useTradeContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTrade, setEditedTrade] = useState<Trade | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (trade) {
      setEditedTrade({ ...trade });
      setIsEditing(false);
    }
  }, [trade]);

  if (!trade || !editedTrade) return null;

  const isProfitable = (editedTrade.pnl || 0) >= 0;
  const rMultiple = editedTrade.rMultiple || 
    (editedTrade.riskAmount && editedTrade.pnl ? editedTrade.pnl / editedTrade.riskAmount : undefined);

  const handleSave = async () => {
    try {
      await updateTrade(editedTrade);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating trade:', error);
    }
  };

  const handleCancel = () => {
    setEditedTrade({ ...trade });
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof Trade, value: any) => {
    setEditedTrade(prev => prev ? { ...prev, [field]: value } : null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <span className="text-2xl font-bold">{editedTrade.symbol}</span>
              <Badge variant={editedTrade.side === 'long' ? 'default' : 'destructive'}>
                {editedTrade.side.toUpperCase()}
              </Badge>
              <Badge variant={editedTrade.status === 'closed' ? 'secondary' : 'default'}>
                {editedTrade.status.toUpperCase()}
              </Badge>
              {editedTrade.pnl !== undefined && (
                <Badge variant={isProfitable ? 'default' : 'destructive'} className="text-lg px-3 py-1">
                  {isProfitable ? '+' : ''}${editedTrade.pnl.toFixed(2)}
                </Badge>
              )}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Trade
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSave}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    className="flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancel
                  </Button>
                </div>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="risk" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Risk & Targets
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Charts
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trade Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Trade Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="entryPrice">Entry Price</Label>
                      {isEditing ? (
                        <Input
                          id="entryPrice"
                          type="number"
                          step="0.01"
                          value={editedTrade.entryPrice}
                          onChange={(e) => handleInputChange('entryPrice', parseFloat(e.target.value) || 0)}
                        />
                      ) : (
                        <p className="text-lg font-semibold">${editedTrade.entryPrice.toFixed(2)}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="exitPrice">Exit Price</Label>
                      {isEditing ? (
                        <Input
                          id="exitPrice"
                          type="number"
                          step="0.01"
                          value={editedTrade.exitPrice || ''}
                          onChange={(e) => handleInputChange('exitPrice', parseFloat(e.target.value) || undefined)}
                        />
                      ) : (
                        <p className="text-lg font-semibold">
                          {editedTrade.exitPrice ? `$${editedTrade.exitPrice.toFixed(2)}` : 'N/A'}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      {isEditing ? (
                        <Input
                          id="quantity"
                          type="number"
                          value={editedTrade.quantity}
                          onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                        />
                      ) : (
                        <p className="text-lg font-semibold">{editedTrade.quantity}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="commission">Commission</Label>
                      {isEditing ? (
                        <Input
                          id="commission"
                          type="number"
                          step="0.01"
                          value={editedTrade.commission || ''}
                          onChange={(e) => handleInputChange('commission', parseFloat(e.target.value) || 0)}
                        />
                      ) : (
                        <p className="text-lg font-semibold">${(editedTrade.commission || 0).toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timing Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Timing Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Date</Label>
                      {isEditing ? (
                        <Input
                          id="date"
                          type="date"
                          value={editedTrade.date}
                          onChange={(e) => handleInputChange('date', e.target.value)}
                        />
                      ) : (
                        <p className="text-lg font-semibold">{formatDateForTable(editedTrade.date)}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="timeIn">Time In</Label>
                      {isEditing ? (
                        <Input
                          id="timeIn"
                          type="time"
                          value={editedTrade.timeIn}
                          onChange={(e) => handleInputChange('timeIn', e.target.value)}
                        />
                      ) : (
                        <p className="text-lg font-semibold">{editedTrade.timeIn}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="timeOut">Time Out</Label>
                      {isEditing ? (
                        <Input
                          id="timeOut"
                          type="time"
                          value={editedTrade.timeOut || ''}
                          onChange={(e) => handleInputChange('timeOut', e.target.value || undefined)}
                        />
                      ) : (
                        <p className="text-lg font-semibold">{editedTrade.timeOut || 'N/A'}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="timeframe">Timeframe</Label>
                      {isEditing ? (
                        <Select
                          value={editedTrade.timeframe || ''}
                          onValueChange={(value) => handleInputChange('timeframe', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select timeframe" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1m">1 Minute</SelectItem>
                            <SelectItem value="5m">5 Minutes</SelectItem>
                            <SelectItem value="15m">15 Minutes</SelectItem>
                            <SelectItem value="1h">1 Hour</SelectItem>
                            <SelectItem value="4h">4 Hours</SelectItem>
                            <SelectItem value="1d">1 Day</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-lg font-semibold">{editedTrade.timeframe || 'Not specified'}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                      {editedTrade.pnl !== undefined ? `${isProfitable ? '+' : ''}$${editedTrade.pnl.toFixed(2)}` : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">P&L</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {rMultiple ? `${rMultiple.toFixed(2)}R` : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">R-Multiple</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {editedTrade.exitPrice && editedTrade.entryPrice 
                        ? `${(((editedTrade.exitPrice - editedTrade.entryPrice) / editedTrade.entryPrice) * 100).toFixed(2)}%`
                        : 'N/A'
                      }
                    </div>
                    <div className="text-sm text-gray-500 mt-1">Return %</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {editedTrade.timeOut && editedTrade.timeIn 
                        ? (() => {
                            const [inHour, inMin] = editedTrade.timeIn.split(':').map(Number);
                            const [outHour, outMin] = editedTrade.timeOut!.split(':').map(Number);
                            const inMinutes = inHour * 60 + inMin;
                            const outMinutes = outHour * 60 + outMin;
                            const diffMinutes = outMinutes - inMinutes;
                            return diffMinutes > 0 ? `${diffMinutes}m` : 'N/A';
                          })()
                        : 'N/A'
                      }
                    </div>
                    <div className="text-sm text-gray-500 mt-1">Duration</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risk & Targets Tab */}
          <TabsContent value="risk" className="space-y-6">
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
                    <Label htmlFor="stopLoss">Stop Loss</Label>
                    {isEditing ? (
                      <Input
                        id="stopLoss"
                        type="number"
                        step="0.01"
                        value={editedTrade.stopLoss || ''}
                        onChange={(e) => handleInputChange('stopLoss', parseFloat(e.target.value) || undefined)}
                      />
                    ) : (
                      <p className="text-lg font-semibold">
                        {editedTrade.stopLoss ? `$${editedTrade.stopLoss.toFixed(2)}` : 'Not set'}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="takeProfit">Take Profit</Label>
                    {isEditing ? (
                      <Input
                        id="takeProfit"
                        type="number"
                        step="0.01"
                        value={editedTrade.takeProfit || ''}
                        onChange={(e) => handleInputChange('takeProfit', parseFloat(e.target.value) || undefined)}
                      />
                    ) : (
                      <p className="text-lg font-semibold">
                        {editedTrade.takeProfit ? `$${editedTrade.takeProfit.toFixed(2)}` : 'Not set'}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="riskAmount">Risk Amount</Label>
                    {isEditing ? (
                      <Input
                        id="riskAmount"
                        type="number"
                        step="0.01"
                        value={editedTrade.riskAmount || ''}
                        onChange={(e) => handleInputChange('riskAmount', parseFloat(e.target.value) || undefined)}
                      />
                    ) : (
                      <p className="text-lg font-semibold">
                        {editedTrade.riskAmount ? `$${editedTrade.riskAmount.toFixed(2)}` : 'Not specified'}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="confidence">Confidence Level</Label>
                    {isEditing ? (
                      <Select
                        value={editedTrade.confidence?.toString() || ''}
                        onValueChange={(value) => handleInputChange('confidence', parseInt(value) || undefined)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select confidence" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - Very Low</SelectItem>
                          <SelectItem value="2">2 - Low</SelectItem>
                          <SelectItem value="3">3 - Medium</SelectItem>
                          <SelectItem value="4">4 - High</SelectItem>
                          <SelectItem value="5">5 - Very High</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-lg font-semibold">
                        {editedTrade.confidence ? `${editedTrade.confidence}/5` : 'Not rated'}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Strategy & Psychology
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="strategy">Strategy</Label>
                  {isEditing ? (
                    <Input
                      id="strategy"
                      value={editedTrade.strategy || ''}
                      onChange={(e) => handleInputChange('strategy', e.target.value)}
                      placeholder="e.g., Breakout, Moving Average Crossover"
                    />
                  ) : (
                    <p className="text-lg font-semibold">{editedTrade.strategy || 'Not specified'}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="marketConditions">Market Conditions</Label>
                  {isEditing ? (
                    <Input
                      id="marketConditions"
                      value={editedTrade.marketConditions || ''}
                      onChange={(e) => handleInputChange('marketConditions', e.target.value)}
                      placeholder="e.g., Trending, Ranging, Volatile"
                    />
                  ) : (
                    <p className="text-lg font-semibold">{editedTrade.marketConditions || 'Not specified'}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="emotions">Emotions</Label>
                  {isEditing ? (
                    <Input
                      id="emotions"
                      value={editedTrade.emotions || ''}
                      onChange={(e) => handleInputChange('emotions', e.target.value)}
                      placeholder="e.g., Confident, Anxious, Calm"
                    />
                  ) : (
                    <p className="text-lg font-semibold">{editedTrade.emotions || 'Not specified'}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Trade Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Label htmlFor="notes">Notes</Label>
                {isEditing ? (
                  <Textarea
                    id="notes"
                    value={editedTrade.notes || ''}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Add your trade notes, observations, and thoughts here..."
                    className="min-h-32"
                  />
                ) : (
                  <div className="min-h-32 p-3 border rounded-md bg-gray-50">
                    {editedTrade.notes || 'No notes added yet.'}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Chart Screenshots
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chart Screenshot Upload</h3>
                  <p className="text-gray-600 mb-4">
                    Drag and drop chart screenshots here, or click to browse
                  </p>
                  <Button variant="outline">
                    Browse Files
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default TradeModal;