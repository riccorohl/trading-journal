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
  const [chartType, setChartType] = useState<'HTF' | 'LTF'>('HTF');

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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Overview & Charts
            </TabsTrigger>
            <TabsTrigger value="risk" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Risk & Targets
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Analysis
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab with Charts */}
          <TabsContent value="overview" className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Chart Section */}
              <div className="flex-1">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Chart Analysis
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant={chartType === 'LTF' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setChartType('LTF')}
                        >
                          LTF
                        </Button>
                        <Button
                          variant={chartType === 'HTF' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setChartType('HTF')}
                        >
                          HTF
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
                      <ImageIcon className="w-16 h-16 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {chartType} Chart - {editedTrade.symbol}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {chartType === 'HTF' 
                          ? 'Higher Time Frame chart for overall trend analysis'
                          : 'Lower Time Frame chart for entry/exit precision'
                        }
                      </p>
                      {isEditing && (
                        <Button variant="outline">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload {chartType} Chart
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Metrics Section - Vertical Layout */}
              <div className="w-full lg:w-80 space-y-4">
                {/* Performance Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="w-5 h-5" />
                      Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center border-b pb-3">
                      <div className={`text-2xl font-bold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                        {editedTrade.pnl !== undefined ? `${isProfitable ? '+' : ''}$${editedTrade.pnl.toFixed(2)}` : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">P&L</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          {rMultiple ? `${rMultiple.toFixed(2)}R` : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">R-Multiple</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          {editedTrade.exitPrice && editedTrade.entryPrice 
                            ? `${(((editedTrade.exitPrice - editedTrade.entryPrice) / editedTrade.entryPrice) * 100).toFixed(2)}%`
                            : 'N/A'
                          }
                        </div>
                        <div className="text-xs text-gray-500">Return %</div>
                      </div>
                    </div>
                    <div className="text-center border-t pt-3">
                      <div className="text-lg font-semibold text-gray-900">
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
                      <div className="text-xs text-gray-500">Duration</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Trade Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <DollarSign className="w-5 h-5" />
                      Trade Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Entry Price</span>
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editedTrade.entryPrice}
                          onChange={(e) => handleInputChange('entryPrice', parseFloat(e.target.value) || 0)}
                          className="w-24 h-8 text-sm"
                        />
                      ) : (
                        <span className="font-semibold">${editedTrade.entryPrice.toFixed(2)}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Exit Price</span>
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editedTrade.exitPrice || ''}
                          onChange={(e) => handleInputChange('exitPrice', parseFloat(e.target.value) || undefined)}
                          className="w-24 h-8 text-sm"
                        />
                      ) : (
                        <span className="font-semibold">
                          {editedTrade.exitPrice ? `$${editedTrade.exitPrice.toFixed(2)}` : 'N/A'}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Quantity</span>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editedTrade.quantity}
                          onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                          className="w-24 h-8 text-sm"
                        />
                      ) : (
                        <span className="font-semibold">{editedTrade.quantity}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Commission</span>
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editedTrade.commission || ''}
                          onChange={(e) => handleInputChange('commission', parseFloat(e.target.value) || 0)}
                          className="w-24 h-8 text-sm"
                        />
                      ) : (
                        <span className="font-semibold">${(editedTrade.commission || 0).toFixed(2)}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Timing Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Clock className="w-5 h-5" />
                      Timing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Date</span>
                      {isEditing ? (
                        <Input
                          type="date"
                          value={editedTrade.date}
                          onChange={(e) => handleInputChange('date', e.target.value)}
                          className="w-32 h-8 text-sm"
                        />
                      ) : (
                        <span className="font-semibold">{formatDateForTable(editedTrade.date)}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Time In</span>
                      {isEditing ? (
                        <Input
                          type="time"
                          value={editedTrade.timeIn}
                          onChange={(e) => handleInputChange('timeIn', e.target.value)}
                          className="w-24 h-8 text-sm"
                        />
                      ) : (
                        <span className="font-semibold">{editedTrade.timeIn}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Time Out</span>
                      {isEditing ? (
                        <Input
                          type="time"
                          value={editedTrade.timeOut || ''}
                          onChange={(e) => handleInputChange('timeOut', e.target.value || undefined)}
                          className="w-24 h-8 text-sm"
                        />
                      ) : (
                        <span className="font-semibold">{editedTrade.timeOut || 'N/A'}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Timeframe</span>
                      {isEditing ? (
                        <Select
                          value={editedTrade.timeframe || ''}
                          onValueChange={(value) => handleInputChange('timeframe', value)}
                        >
                          <SelectTrigger className="w-24 h-8 text-sm">
                            <SelectValue placeholder="TF" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1m">1m</SelectItem>
                            <SelectItem value="5m">5m</SelectItem>
                            <SelectItem value="15m">15m</SelectItem>
                            <SelectItem value="1h">1h</SelectItem>
                            <SelectItem value="4h">4h</SelectItem>
                            <SelectItem value="1d">1d</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="font-semibold">{editedTrade.timeframe || 'N/A'}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
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
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default TradeModal;