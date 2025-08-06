import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  ArrowLeft,
  Edit3, 
  Save, 
  XCircle, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  Shield, 
  Brain, 
  BarChart3,
  ImageIcon,
  Upload,
  ChevronLeft,
  ChevronRight,
  Activity,
  CheckCircle2,
  ArrowUpCircle,
  ArrowDownCircle
} from 'lucide-react';
import { Trade } from '../types/trade';
import { useTradeContext } from '../contexts/TradeContext';

interface TradeOverviewProps {
  isEmbedded?: boolean;
}

const TradeOverview: React.FC<TradeOverviewProps> = () => {
  const { tradeId } = useParams<{ tradeId: string }>();
  const navigate = useNavigate();
  const { trades, updateTrade } = useTradeContext();
  
  const [trade, setTrade] = useState<Trade | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTrade, setEditedTrade] = useState<Trade | null>(null);
  const [chartType, setChartType] = useState<'HTF' | 'LTF'>('HTF');

  // Find current trade and get navigation info
  const currentTradeIndex = trades.findIndex(t => t.id === tradeId);
  const currentTrade = currentTradeIndex >= 0 ? trades[currentTradeIndex] : null;
  const prevTrade = currentTradeIndex > 0 ? trades[currentTradeIndex - 1] : null;
  const nextTrade = currentTradeIndex >= 0 && currentTradeIndex < trades.length - 1 ? trades[currentTradeIndex + 1] : null;

  useEffect(() => {
    if (currentTrade) {
      setTrade(currentTrade);
      setEditedTrade({ ...currentTrade });
      setIsEditing(false);
    } else if (tradeId) {
      navigate('/');
    }
  }, [currentTrade, tradeId, navigate]);

  if (!trade || !editedTrade) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Trade Not Found</h2>
          <p className="text-gray-600 mb-4">The requested trade could not be found.</p>
          <Button onClick={() => navigate('/', { state: { page: 'trades' } })}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Trades
          </Button>
        </div>
      </div>
    );
  }

  const isProfitable = (editedTrade.pnl || 0) >= 0;
  const rMultiple = editedTrade.rMultiple || 
    (editedTrade.riskAmount && editedTrade.pnl ? editedTrade.pnl / editedTrade.riskAmount : undefined);

  const handleSave = async () => {
    try {
      await updateTrade(editedTrade.id, editedTrade);
      setIsEditing(false);
      setTrade({ ...editedTrade });
    } catch (error) {
      console.error('Error updating trade:', error);
    }
  };

  const handleCancel = () => {
    setEditedTrade({ ...trade });
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof Trade, value: string | number | Date | undefined) => {
    setEditedTrade(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleNavigation = (tradeId: string) => {
    navigate(`/trade/${tradeId}`);
  };

  // Calculate trade duration
  const getDuration = () => {
    if (!editedTrade.timeOut || !editedTrade.timeIn) return 'Open';
    return 'Active'; // Simplified for now
  };

  // Calculate return percentage
  const getReturnPercentage = () => {
    if (!editedTrade.exitPrice || !editedTrade.entryPrice) return null;
    return ((editedTrade.exitPrice - editedTrade.entryPrice) / editedTrade.entryPrice) * 100;
  };

  const returnPercentage = getReturnPercentage();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/', { state: { page: 'trades' } })}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Trades
              </Button>
              
              <div className="h-8 w-px bg-gray-300" />
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{editedTrade.currencyPair}</h1>
                  <div className="flex items-center gap-2">
                    {editedTrade.side === 'long' ? (
                      <ArrowUpCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <ArrowDownCircle className="w-5 h-5 text-red-600" />
                    )}
                    <Badge variant={editedTrade.side === 'long' ? 'default' : 'destructive'} className="font-medium">
                      {editedTrade.side.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {editedTrade.status === 'closed' ? (
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Activity className="w-5 h-5 text-orange-500" />
                  )}
                  <Badge variant={editedTrade.status === 'closed' ? 'secondary' : 'default'} className="font-medium">
                    {editedTrade.status.toUpperCase()}
                  </Badge>
                </div>
                
                {editedTrade.pnl !== undefined && (
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={isProfitable ? 'default' : 'destructive'} 
                      className="text-lg px-4 py-2 font-bold"
                    >
                      {isProfitable ? '+' : ''}${editedTrade.pnl.toFixed(2)}
                    </Badge>
                    {returnPercentage && (
                      <Badge variant="outline" className="text-sm">
                        {returnPercentage > 0 ? '+' : ''}{returnPercentage.toFixed(2)}%
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Trade Navigation */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => prevTrade && handleNavigation(prevTrade.id)}
                  disabled={!prevTrade}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <span className="text-sm text-gray-500 px-3">
                  {currentTradeIndex + 1} of {trades.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => nextTrade && handleNavigation(nextTrade.id)}
                  disabled={!nextTrade}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="h-8 w-px bg-gray-300" />
              
              {/* Edit Controls */}
              {!isEditing ? (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Trade
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Unified Layout */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Left Column - Chart and Analysis */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            
            {/* Chart Section */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                    Chart Analysis - {editedTrade.currencyPair}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant={chartType === 'LTF' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChartType('LTF')}
                      className="px-4"
                    >
                      Lower TF
                    </Button>
                    <Button
                      variant={chartType === 'HTF' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChartType('HTF')}
                      className="px-4"
                    >
                      Higher TF
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border-2 border-dashed border-gray-200 bg-gray-50 p-16 text-center min-h-[500px] flex flex-col items-center justify-center">
                  <div className="bg-white rounded-full p-6 mb-6 shadow-sm">
                    <ImageIcon className="w-16 h-16 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {chartType} Chart Analysis
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md leading-relaxed">
                    {chartType === 'HTF' 
                      ? 'Higher timeframe analysis for market structure, trend confirmation, and key support/resistance levels'
                      : 'Lower timeframe precision for entry timing, exit points, and intraday price action patterns'
                    }
                  </p>
                  {isEditing && (
                    <Button variant="outline" size="lg" className="bg-white">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload {chartType} Chart
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Trade Analysis & Notes */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Brain className="w-6 h-6 text-purple-600" />
                  Trade Analysis & Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Strategy and Setup */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="strategy" className="text-sm font-semibold text-gray-700 mb-2 block">
                        Trading Strategy
                      </Label>
                      {isEditing ? (
                        <Input
                          id="strategy"
                          value={editedTrade.strategy || ''}
                          onChange={(e) => handleInputChange('strategy', e.target.value)}
                          placeholder="e.g., Breakout, Support/Resistance, MA Crossover"
                          className="h-10"
                        />
                      ) : (
                        <div className="bg-gray-50 p-3 rounded-md border min-h-[40px] flex items-center">
                          <span className="text-gray-900 font-medium">
                            {editedTrade.strategy || 'Strategy not specified'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="marketConditions" className="text-sm font-semibold text-gray-700 mb-2 block">
                        Market Conditions
                      </Label>
                      {isEditing ? (
                        <Input
                          id="marketConditions"
                          value={editedTrade.marketConditions || ''}
                          onChange={(e) => handleInputChange('marketConditions', e.target.value)}
                          placeholder="e.g., Trending Up, Range-bound, High Volatility"
                          className="h-10"
                        />
                      ) : (
                        <div className="bg-gray-50 p-3 rounded-md border min-h-[40px] flex items-center">
                          <span className="text-gray-900 font-medium">
                            {editedTrade.marketConditions || 'Conditions not specified'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Trade Notes */}
                  <div>
                    <Label htmlFor="notes" className="text-sm font-semibold text-gray-700 mb-2 block">
                      Detailed Trade Notes
                    </Label>
                    {isEditing ? (
                      <Textarea
                        id="notes"
                        value={editedTrade.notes || ''}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Document your analysis, reasoning, market observations, and post-trade reflections..."
                        className="min-h-[120px] resize-none"
                      />
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-md border min-h-[120px]">
                        <div className="text-gray-900 whitespace-pre-wrap">
                          {editedTrade.notes || 'No detailed notes available for this trade.'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Psychology and Emotions */}
                  <div>
                    <Label htmlFor="emotions" className="text-sm font-semibold text-gray-700 mb-2 block">
                      Psychology & Emotional State
                    </Label>
                    {isEditing ? (
                      <Input
                        id="emotions"
                        value={editedTrade.emotions || ''}
                        onChange={(e) => handleInputChange('emotions', e.target.value)}
                        placeholder="e.g., Confident, Anxious, FOMO, Patient, Disciplined"
                        className="h-10"
                      />
                    ) : (
                      <div className="bg-gray-50 p-3 rounded-md border min-h-[40px] flex items-center">
                        <span className="text-gray-900 font-medium">
                          {editedTrade.emotions || 'Emotional state not recorded'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Trade Details and Metrics */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            
            {/* Performance Overview */}
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Main P&L */}
                <div className="text-center bg-white p-4 rounded-lg border">
                  <div className={`text-3xl font-bold mb-1 ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                    {editedTrade.pnl !== undefined ? `${isProfitable ? '+' : ''}$${Math.abs(editedTrade.pnl).toFixed(2)}` : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">Net Profit/Loss</div>
                </div>
                
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-lg border text-center">
                    <div className="text-xl font-bold text-gray-900">
                      {rMultiple ? `${rMultiple.toFixed(2)}R` : 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">Risk Multiple</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border text-center">
                    <div className="text-xl font-bold text-gray-900">
                      {returnPercentage ? `${returnPercentage.toFixed(2)}%` : 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">Return %</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border text-center">
                    <div className="text-xl font-bold text-gray-900">
                      {getDuration()}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">Duration</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border text-center">
                    <div className="text-xl font-bold text-gray-900">
                      {editedTrade.confidence ? `${editedTrade.confidence}/5` : 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">Confidence</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trade Execution Details */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Execution Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Entry Price</span>
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.00001"
                        value={editedTrade.entryPrice}
                        onChange={(e) => handleInputChange('entryPrice', parseFloat(e.target.value) || 0)}
                        className="w-24 h-8 text-sm text-right"
                      />
                    ) : (
                      <span className="font-bold text-gray-900">{editedTrade.entryPrice?.toFixed(5) || 'N/A'}</span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Exit Price</span>
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.00001"
                        value={editedTrade.exitPrice || ''}
                        onChange={(e) => handleInputChange('exitPrice', parseFloat(e.target.value) || undefined)}
                        className="w-24 h-8 text-sm text-right"
                      />
                    ) : (
                      <span className="font-bold text-gray-900">
                        {editedTrade.exitPrice ? editedTrade.exitPrice.toFixed(5) : 'Open'}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Lot Size</span>
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={editedTrade.lotSize || ''}
                        onChange={(e) => handleInputChange('lotSize', parseFloat(e.target.value) || 0)}
                        className="w-24 h-8 text-sm text-right"
                      />
                    ) : (
                      <span className="font-bold text-gray-900">{editedTrade.lotSize || 'N/A'}</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Pips</span>
                    <span className={`font-bold ${(editedTrade.pips || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {editedTrade.pips !== undefined ? `${editedTrade.pips > 0 ? '+' : ''}${editedTrade.pips}` : 'N/A'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-gray-600">Commission</span>
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={editedTrade.commission || ''}
                        onChange={(e) => handleInputChange('commission', parseFloat(e.target.value) || 0)}
                        className="w-24 h-8 text-sm text-right"
                      />
                    ) : (
                      <span className="font-bold text-gray-900">${(editedTrade.commission || 0).toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Management */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Shield className="w-5 h-5 text-red-600" />
                  Risk Management
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Stop Loss</span>
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.00001"
                        value={editedTrade.stopLoss || ''}
                        onChange={(e) => handleInputChange('stopLoss', parseFloat(e.target.value) || undefined)}
                        className="w-24 h-8 text-sm text-right"
                      />
                    ) : (
                      <span className="font-bold text-red-600">
                        {editedTrade.stopLoss ? editedTrade.stopLoss.toFixed(5) : 'Not set'}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Take Profit</span>
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.00001"
                        value={editedTrade.takeProfit || ''}
                        onChange={(e) => handleInputChange('takeProfit', parseFloat(e.target.value) || undefined)}
                        className="w-24 h-8 text-sm text-right"
                      />
                    ) : (
                      <span className="font-bold text-green-600">
                        {editedTrade.takeProfit ? editedTrade.takeProfit.toFixed(5) : 'Not set'}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-gray-600">Risk Amount</span>
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={editedTrade.riskAmount || ''}
                        onChange={(e) => handleInputChange('riskAmount', parseFloat(e.target.value) || undefined)}
                        className="w-24 h-8 text-sm text-right"
                      />
                    ) : (
                      <span className="font-bold text-gray-900">
                        {editedTrade.riskAmount ? `$${editedTrade.riskAmount.toFixed(2)}` : 'Not set'}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timing Information */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Timing Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Date</span>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={editedTrade.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        className="w-32 h-8 text-sm"
                      />
                    ) : (
                      <span className="font-bold text-gray-900">
                        {new Date(editedTrade.date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Entry Time</span>
                    {isEditing ? (
                      <Input
                        type="time"
                        value={editedTrade.timeIn}
                        onChange={(e) => handleInputChange('timeIn', e.target.value)}
                        className="w-24 h-8 text-sm"
                      />
                    ) : (
                      <span className="font-bold text-gray-900">{editedTrade.timeIn}</span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Exit Time</span>
                    {isEditing ? (
                      <Input
                        type="time"
                        value={editedTrade.timeOut || ''}
                        onChange={(e) => handleInputChange('timeOut', e.target.value || undefined)}
                        className="w-24 h-8 text-sm"
                      />
                    ) : (
                      <span className="font-bold text-gray-900">{editedTrade.timeOut || 'Open'}</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-gray-600">Timeframe</span>
                    {isEditing ? (
                      <Select
                        value={editedTrade.timeframe || ''}
                        onValueChange={(value) => handleInputChange('timeframe', value)}
                      >
                        <SelectTrigger className="w-20 h-8 text-sm">
                          <SelectValue placeholder="TF" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1m">1m</SelectItem>
                          <SelectItem value="5m">5m</SelectItem>
                          <SelectItem value="15m">15m</SelectItem>
                          <SelectItem value="30m">30m</SelectItem>
                          <SelectItem value="1h">1h</SelectItem>
                          <SelectItem value="4h">4h</SelectItem>
                          <SelectItem value="1d">1d</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="font-bold text-gray-900">{editedTrade.timeframe || 'N/A'}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeOverview;
